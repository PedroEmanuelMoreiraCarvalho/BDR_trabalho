-- Consultas para responder perguntas: 1,2,3,4,5,10,12,13
-- Ajuste filtros opcionais (ex.: :ano, :uf, :partido, :deputado_id, :tema)

-- 1) Deputados ordenados por gastos
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    d.ultimo_status_sigla_partido AS partido,
    d.ultimo_status_sigla_uf AS uf,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_cadastro_deputado
-- WHERE des.ano = :ano
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, d.ultimo_status_sigla_partido, d.ultimo_status_sigla_uf
ORDER BY total_gasto DESC;

-- 2) Agrupar deputados por eixo de atuação (Nuvem de Palavras)
-- 2a) Usando temas (proposicoes_temas)
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    pt.tema,
    COUNT(*) AS total_proposicoes
FROM proposicoes_autores pa
JOIN proposicoes_temas pt ON pt.id_proposicao = pa.id_proposicao
LEFT JOIN deputados d ON d.id_deputado = pa.id_deputado
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, pt.tema
ORDER BY total_proposicoes DESC;

-- 2b) Usando palavras-chave/ementa (para base de texto)
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    p.keywords,
    p.ementa
FROM proposicoes_autores pa
JOIN proposicoes p ON p.id_proposicao = pa.id_proposicao
LEFT JOIN deputados d ON d.id_deputado = pa.id_deputado
WHERE p.keywords IS NOT NULL OR p.ementa IS NOT NULL;

-- 3) Como um deputado votou em um tema/eixo específico
-- Filtre por tema (proposicoes_temas.tema) ou por texto na ementa.
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    v.id_votacao,
    v.data_votacao,
    v.descricao_votacao,
    vv.voto,
    p.id_proposicao,
    p.sigla_tipo_proposicao,
    p.numero_proposicao,
    p.ano_proposicao,
    pt.tema
FROM votacoes_votos vv
JOIN deputados d ON d.id_deputado = vv.id_deputado
JOIN votacao v ON v.id_votacao = vv.id_votacao
LEFT JOIN proposicoes p ON p.id_proposicao = v.id_proposicao
LEFT JOIN proposicoes_temas pt ON pt.id_proposicao = p.id_proposicao
WHERE d.id_deputado = :deputado_id
  AND (
        pt.tema ILIKE '%' || :tema || '%'
        OR p.ementa ILIKE '%' || :tema || '%'
      )
ORDER BY v.data_votacao DESC;

-- 4) Agrupar deputados por escolaridade
SELECT
    COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
    COUNT(*) AS total_deputados
FROM deputados d
GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
ORDER BY total_deputados DESC;

-- 5) Ordenar fornecedores (despesas) por valores de contrato
SELECT
    des.fornecedor_nome,
    des.fornecedor_cnpj_cpf,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_contrato
FROM despesas des
-- WHERE des.ano = :ano
GROUP BY des.fornecedor_nome, des.fornecedor_cnpj_cpf
ORDER BY total_contrato DESC;

-- 10) Ordenar partidos conforme alinhamento interno
-- Alinhamento = % de votos iguais à orientação do partido (quando orientação é Sim/Não)
SELECT
    vo.sigla_bancada AS partido,
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
JOIN votacoes_votos vv
  ON vv.id_votacao = vo.id_votacao
 AND vv.deputado_sigla_partido = vo.sigla_bancada
GROUP BY vo.sigla_bancada
ORDER BY perc_alinhamento DESC;

-- 12) Correlacionar deputado com fornecedor PROBLEMA
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    des.fornecedor_nome,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_cadastro_deputado
-- WHERE d.id_deputado = :deputado_id
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, des.fornecedor_nome
ORDER BY total_gasto DESC;

-- 13) Com o que o deputado mais gasta?
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    des.desc_subcota AS tipo_gasto,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_cadastro_deputado
-- WHERE d.id_deputado = :deputado_id
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, des.desc_subcota
ORDER BY total_gasto DESC;
