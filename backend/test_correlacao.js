const dbAdapter = require('./DatabaseAdapter');

async function run() {
  try {
    await dbAdapter.connect();
    const query = `
      WITH escolaridades AS (
          SELECT DISTINCT COALESCE(escolaridade_deputado, 'Sem informação') AS escolaridade
          FROM deputados
          WHERE escolaridade_deputado IS NOT NULL AND escolaridade_deputado != ''
      ),
      gastos_cte AS (
        SELECT
            COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
            SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto,
            AVG(COALESCE(des.valor_liquido, 0)) AS gasto_medio
        FROM despesas des
        JOIN deputados d ON d.id_deputado = des.id_deputado
        GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
      ),
      fidelidade_cte AS (
        SELECT
            COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
            COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não')) AS total_considerado,
            COUNT(*) FILTER (WHERE vo.orientacao = vv.voto AND vo.orientacao IN ('Sim', 'Não')) AS total_alinhado,
            ROUND(
                CASE
                    WHEN COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não')) = 0 THEN 0
                    ELSE 100.0 * COUNT(*) FILTER (WHERE vo.orientacao = vv.voto AND vo.orientacao IN ('Sim', 'Não'))
                         / COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não'))
                END,
                2
            ) AS perc_alinhamento
        FROM votacoes_orientacoes vo
        JOIN votacoes_votos vv ON vv.id_votacao = vo.id_votacao AND vv.deputado_sigla_partido = vo.sigla_bancada
        JOIN deputados d ON d.id_deputado = vv.id_deputado
        GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
      ),
      proposicoes_cte AS (
        SELECT
            COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
            COUNT(DISTINCT pa.id_proposicao)::numeric / NULLIF(COUNT(DISTINCT d.id_deputado), 0) AS total_proposicoes
        FROM deputados d
        LEFT JOIN proposicoes_autores pa ON d.id_deputado = pa.id_deputado
        GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
      ),
      presencas_comissoes_cte AS (
        SELECT
            COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
            SUM(COALESCE(p.comissoes_presencas, 0)) AS total_presencas_comissoes,
            AVG(COALESCE(p.comissoes_presencas, 0)) AS media_presencas_comissoes
        FROM presenca_deputados p
        JOIN deputados d ON d.id_deputado = p.id_dep
        GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
      ),
      presencas_plenario_cte AS (
        SELECT
            COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
            SUM(COALESCE(p.plenario_presencas, 0)) AS total_presencas_plenario,
            AVG(COALESCE(p.plenario_presencas, 0)) AS media_presencas_plenario
        FROM presenca_deputados p
        JOIN deputados d ON d.id_deputado = p.id_dep
        GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
      )
      SELECT 
        e.escolaridade, 
        ROUND(COALESCE(g.gasto_medio, 0)::numeric, 2) AS gasto_medio,
        ROUND(COALESCE(f.perc_alinhamento, 0)::numeric, 2) AS perc_alinhamento,
        COALESCE(p.total_proposicoes, 0)::int AS total_proposicoes,
        ROUND(COALESCE(c.media_presencas_comissoes, 0)::numeric, 2) AS media_presencas_comissoes,
        ROUND(COALESCE(pl.media_presencas_plenario, 0)::numeric, 2) AS media_presencas_plenario
      FROM escolaridades e
      LEFT JOIN gastos_cte g ON g.escolaridade = e.escolaridade
      LEFT JOIN fidelidade_cte f ON f.escolaridade = e.escolaridade
      LEFT JOIN proposicoes_cte p ON p.escolaridade = e.escolaridade
      LEFT JOIN presencas_comissoes_cte c ON c.escolaridade = e.escolaridade
      LEFT JOIN presencas_plenario_cte pl ON pl.escolaridade = e.escolaridade
      ORDER BY e.escolaridade ASC;
    `;
    const res = await dbAdapter.client.query(query);
    console.log(res.rows);
  } catch (err) {
    console.error("SQL ERROR:", err.message);
  } finally {
    process.exit();
  }
}
run();
