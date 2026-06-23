const { Pool } = require('pg');

class DatabaseAdapter {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      this.client = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
      });
    } else {
      this.client = new Pool({
        user: 'admin',
        host: 'localhost',
        database: 'backend',
        password: 'admin123',
        port: 5432,
        max: 20, // limite de conexões simultâneas no pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
      });
    }
  }

  // Método para iniciar a conexão
  async connect() {
    try {
      const conn = await this.client.connect();
      console.log('✅ DatabaseAdapter: Conectado ao pool do banco de dados com sucesso!');
      // Ensure unaccent extension is available for accent-insensitive searches
      await conn.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
      conn.release(); // libera a conexão de volta ao pool
    } catch (error) {
      console.error('❌ DatabaseAdapter: Erro ao conectar ao banco.', error);
      throw error; // Lança o erro para quem chamou a função tratar
    }
  }

  // ==============================================================
  // AQUI FICARÃO AS FUNÇÕES QUE VÃO BUSCAR OS DADOS NO BANCO
  // ==============================================================

  // Exemplo: Retorna a hora do banco de dados (nossa rota de teste)
  async getHoraAtual() {
    try {
      const result = await this.client.query('SELECT NOW() as data_atual');
      return result.rows[0].data_atual;
    } catch (error) {
      console.error('Erro na query getHoraAtual:', error);
      throw error;
    }
  }

  // Retorna a soma total de gastos da Câmara
  async getTotalGastosGeral({ filtroPartido = 'Todos', filtroUF = 'Todos' } = {}) {
    try {
      const values = [];
      let paramCount = 1;
      let whereClause = "WHERE 1=1";
      
      if (filtroPartido !== 'Todos') {
        whereClause += ` AND d.ultimo_status_sigla_partido = $${paramCount++}`;
        values.push(filtroPartido);
      }
      if (filtroUF !== 'Todos') {
        whereClause += ` AND d.ultimo_status_sigla_uf = $${paramCount++}`;
        values.push(filtroUF);
      }

      const query = `
        SELECT CAST(SUM(COALESCE(des.valor_liquido, 0)) AS FLOAT) AS total_gasto
        FROM despesas des
        JOIN deputados d ON d.id_deputado = des.id_deputado
        ${whereClause}
      `;
      const result = await this.client.query(query, values);
      return { total: parseFloat(result.rows[0].total_gasto || 0) };
    } catch (error) {
      console.error('Erro na query getTotalGastosGeral:', error);
      throw error;
    }
  }

  // Retorna os deputados que mais gastaram com paginação
  async getVisaoGeralGastos(page = 1, limit = 10, ordem = 'desc', filtroPartido = 'Todos', filtroUF = 'Todos') {
    try {
      // Calcula o offset baseado na página e limite
      const offset = (page - 1) * limit;
      const orderDir = ordem === 'asc' ? 'ASC' : 'DESC';

      const values = [limit, offset];
      let paramCount = 3; // 1 e 2 já são o limit e o offset
      let whereClause = "WHERE 1=1";
      
      if (filtroPartido !== 'Todos') {
        whereClause += ` AND d.ultimo_status_sigla_partido = $${paramCount++}`;
        values.push(filtroPartido);
      }
      if (filtroUF !== 'Todos') {
        whereClause += ` AND d.ultimo_status_sigla_uf = $${paramCount++}`;
        values.push(filtroUF);
      }

      const query = `
        SELECT
            d.id_deputado AS id_deputado,
            d.ultimo_status_nome_eleitoral AS name,
            d.ultimo_status_sigla_partido AS partido,
            d.ultimo_status_sigla_uf AS uf,
            CAST(SUM(COALESCE(des.valor_liquido, 0)) AS FLOAT) AS gastos
        FROM despesas des
        JOIN deputados d ON d.id_deputado = des.id_deputado
        ${whereClause}
        GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, d.ultimo_status_sigla_partido, d.ultimo_status_sigla_uf
        ORDER BY gastos ${orderDir}
        LIMIT $1 OFFSET $2
      `;

      const result = await this.client.query(query, values);

      // Buscar total de registros e soma total de gastos
      const countValues = values.slice(2); // Remove limit e offset
      let countWhere = countValues.length > 0 ? "WHERE 1=1" : "WHERE 1=1";
      
      // Recriar o whereClause para a query de count usando placeholders começando no $1
      let countParamCount = 1;
      if (filtroPartido !== 'Todos') {
        countWhere += ` AND d.ultimo_status_sigla_partido = $${countParamCount++}`;
      }
      if (filtroUF !== 'Todos') {
        countWhere += ` AND d.ultimo_status_sigla_uf = $${countParamCount++}`;
      }

      const countQuery = `
        SELECT 
          COUNT(DISTINCT d.id_deputado) as total,
          CAST(SUM(COALESCE(des.valor_liquido, 0)) AS FLOAT) as total_gastos_global
        FROM despesas des
        JOIN deputados d ON d.id_deputado = des.id_deputado
        ${countWhere}
      `;
      const countResult = await this.client.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].total);
      const totalGastosGlobal = parseFloat(countResult.rows[0].total_gastos_global || 0);

      return {
        data: result.rows,
        pagination: {
          currentPage: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit),
          totalGastosGlobal: totalGastosGlobal,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Erro na query getVisaoGeralGastos:', error);
      throw error;
    }
  }

  // Ranking Geral (com paginação, filtros e ordenação direto no banco)
  async getVisaoGeralRanking({ pagina = 1, itensPorPagina = 10, filtroPartido = 'Todos', filtroUF = 'Todos', metrica = 'eficiencia', ordem = 'desc' } = {}) {
    try {
      const values = [];
      let paramCount = 1;

      // Constrói os filtros WHERE dinamicamente
      let whereClause = "WHERE 1=1";
      if (filtroPartido !== 'Todos') {
        whereClause += ` AND d.ultimo_status_sigla_partido = $${paramCount++}`;
        values.push(filtroPartido);
      }
      if (filtroUF !== 'Todos') {
        whereClause += ` AND d.ultimo_status_sigla_uf = $${paramCount++}`;
        values.push(filtroUF);
      }

      // Ordenação de forma segura
      const orderColumn = metrica === 'eficiencia' ? 'indice_eficiencia' : 'gastos';
      const orderDir = ordem === 'desc' ? 'DESC' : 'ASC';

      // 1. Conta o total (para a paginação) e soma os gastos filtrados
      const countQuery = `
        SELECT 
          COUNT(DISTINCT d.id_deputado) as total, 
          COALESCE(SUM(desp.valor_liquido), 0) as total_gastos
        FROM deputados d
        LEFT JOIN despesas desp ON d.id_deputado = desp.id_deputado
        ${whereClause}
      `;

      // 2. Query principal trazendo a página atual de deputados
      const limit = parseInt(itensPorPagina);
      const offset = (parseInt(pagina) - 1) * limit;

      const dataQuery = `
        SELECT 
          d.id_deputado,
          d.ultimo_status_nome_eleitoral AS name,
          d.ultimo_status_sigla_partido AS partido,
          d.ultimo_status_sigla_uf AS uf,
          COALESCE(SUM(desp.valor_liquido), 0) AS gastos,
          ROUND((RANDOM() * 10)::numeric, 2) AS indice_eficiencia 
        FROM deputados d
        LEFT JOIN despesas desp ON d.id_deputado = desp.id_deputado
        ${whereClause}
        GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, d.ultimo_status_sigla_partido, d.ultimo_status_sigla_uf
        ORDER BY ${orderColumn} ${orderDir}
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Executa as duas queries ao mesmo tempo para ficar mais rápido
      const [countResult, dataResult] = await Promise.all([
        this.client.query(countQuery, values),
        this.client.query(dataQuery, values)
      ]);

      const totalItens = parseInt(countResult.rows[0].total);
      const totalGastos = parseFloat(countResult.rows[0].total_gastos);
      const totalPaginas = Math.ceil(totalItens / limit);

      // Adiciona o "rank" (posição) exato baseado na página
      const data = dataResult.rows.map((row, index) => ({
        ...row,
        gastos: parseFloat(row.gastos),
        indice_eficiencia: parseFloat(row.indice_eficiencia),
        posicao_ranking: offset + index + 1
      }));

      return {
        data,
        total: totalItens,
        total_gastos: totalGastos,
        total_paginas: totalPaginas
      };

    } catch (error) {
      console.error('Erro na query getVisaoGeralRanking:', error);
      throw error;
    }
  }

  // Retorna os dados da aba "Visão Geral" - Escolaridade
  async getVisaoGeralEscolaridade() {
    try {
      const query = `
        SELECT 
          escolaridade_deputado AS escolaridade, 
          COUNT(*)::int AS total_deputados,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentual
        FROM deputados 
        WHERE escolaridade_deputado IS NOT NULL AND escolaridade_deputado != ''
        GROUP BY escolaridade_deputado 
        ORDER BY total_deputados DESC
      `;
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro na query getVisaoGeralEscolaridade:', error);
      throw error;
    }
  }

  // Retorna os dados da aba "Visão Geral" - Fornecedores (Top 50 fornecedores que mais receberam)
  async getVisaoGeralFornecedores() {
    try {
      const query = `
        SELECT 
          fornecedor_nome, 
          fornecedor_cnpj_cpf AS cnpj, 
          CAST(SUM(valor_liquido) AS FLOAT) AS total_contrato
        FROM despesas
        WHERE fornecedor_nome IS NOT NULL AND fornecedor_nome != ''
        GROUP BY fornecedor_nome, fornecedor_cnpj_cpf
        ORDER BY total_contrato DESC
        LIMIT 50
      `;
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro na query getVisaoGeralFornecedores:', error);
      throw error;
    }
  }

  // Retorna os dados da aba "Visão Partidária" - Alinhamento (Taxa de lealdade ao partido)
  async getVisaoPartidariaAlinhamento() {
    try {
      const query = `
        SELECT
            vo.sigla_bancada AS partido,
            COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução')) AS total_considerado,
            COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução') AND vv.voto = vo.orientacao) AS total_alinhado,
            ROUND(
                CASE
                    WHEN COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução')) = 0 THEN 0
                    ELSE 100.0 * COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução') AND vv.voto = vo.orientacao)
                         / COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução'))
                END,
                2
            ) AS perc_alinhamento
        FROM votacoes_orientacoes vo
        JOIN votacoes_votos vv
          ON vv.id_votacao = vo.id_votacao
         AND vv.deputado_sigla_partido = vo.sigla_bancada
        WHERE vo.sigla_bancada IS NOT NULL AND vo.sigla_bancada != ''
        GROUP BY vo.sigla_bancada
        ORDER BY perc_alinhamento DESC
      `;
      const result = await this.client.query(query);

      // Converte os tipos de string (retornados pelo banco) para Number
      return result.rows.map(row => ({
        partido: row.partido,
        total_considerado: parseInt(row.total_considerado),
        total_alinhado: parseInt(row.total_alinhado),
        perc_alinhamento: parseFloat(row.perc_alinhamento)
      }));
    } catch (error) {
      console.error('Erro na query getVisaoPartidariaAlinhamento:', error);
      throw error;
    }
  }

  // Retorna os dados da aba "Visão Partidária" - Comparação (Frequência, Proposições, Gastos)
  async getVisaoPartidariaComparacao() {
    try {
      const query = `
        WITH gastos_partido AS (
            SELECT d.ultimo_status_sigla_partido AS partido, SUM(des.valor_liquido) AS gastos
            FROM despesas des
            JOIN deputados d ON des.id_deputado = d.id_deputado
            WHERE d.ultimo_status_sigla_partido IS NOT NULL AND d.ultimo_status_sigla_partido != ''
            GROUP BY d.ultimo_status_sigla_partido
        ),
        presenca_partido AS (
            SELECT 
                d.ultimo_status_sigla_partido AS partido,
                SUM(pd.plenario_presencas) AS presencas,
                SUM(pd.plenario_presencas + pd.plenario_ausencias_justificadas + pd.plenario_ausencias_nao_justificadas) AS sessoes_total
            FROM presenca_deputados pd
            JOIN deputados d ON pd.id_dep = d.id_deputado
            WHERE d.ultimo_status_sigla_partido IS NOT NULL AND d.ultimo_status_sigla_partido != ''
            GROUP BY d.ultimo_status_sigla_partido
        ),
        proposicoes_partido AS (
            SELECT 
                d.ultimo_status_sigla_partido AS partido,
                COUNT(DISTINCT pa.id_proposicao) AS proposicoes
            FROM proposicoes_autores pa
            JOIN deputados d ON pa.id_deputado = d.id_deputado
            WHERE d.ultimo_status_sigla_partido IS NOT NULL AND d.ultimo_status_sigla_partido != ''
            GROUP BY d.ultimo_status_sigla_partido
        )
        SELECT 
            d.ultimo_status_sigla_partido AS partido,
            COALESCE(ROUND((pp.presencas::numeric / NULLIF(pp.sessoes_total, 0)::numeric) * 100, 2), 0) AS frequencia,
            COALESCE(pr.proposicoes, 0) AS proposicoes,
            COALESCE(gp.gastos, 0) AS gastos
        FROM (SELECT DISTINCT ultimo_status_sigla_partido FROM deputados WHERE ultimo_status_sigla_partido IS NOT NULL AND ultimo_status_sigla_partido != '') d
        LEFT JOIN presenca_partido pp ON d.ultimo_status_sigla_partido = pp.partido
        LEFT JOIN proposicoes_partido pr ON d.ultimo_status_sigla_partido = pr.partido
        LEFT JOIN gastos_partido gp ON d.ultimo_status_sigla_partido = gp.partido
        ORDER BY gastos DESC
      `;
      const result = await this.client.query(query);

      return result.rows.map(row => ({
        partido: row.partido,
        frequencia: parseFloat(row.frequencia),
        proposicoes: parseInt(row.proposicoes),
        gastos: parseFloat(row.gastos)
      }));
    } catch (error) {
      console.error('Erro na query getVisaoPartidariaComparacao:', error);
      throw error;
    }
  }

  // Retorna as palavras para a nuvem de palavras de um partido
  async getVisaoPartidariaNuvem(partido) {
    try {
      const query = `
        SELECT 
          pt.tema AS text,
          COUNT(*) AS value
        FROM proposicoes_autores pa
        JOIN proposicoes p ON pa.id_proposicao = p.id_proposicao
        JOIN proposicoes_temas pt ON p.id_proposicao = pt.id_proposicao
        JOIN deputados d ON pa.id_deputado = d.id_deputado
        WHERE d.ultimo_status_sigla_partido = $1
          AND pt.tema IS NOT NULL AND pt.tema != ''
        GROUP BY pt.tema
        ORDER BY value DESC
        LIMIT 30
      `;
      const result = await this.client.query(query, [partido]);
      return result.rows.map(row => ({
        text: row.text,
        value: parseInt(row.value)
      }));
    } catch (error) {
      console.error('Erro na query getVisaoPartidariaNuvem:', error);
      throw error;
    }
  }

  // ==========================================
  // Aba "Perfil do Deputado"
  // ==========================================

  // Retorna os dados principais de um deputado específico
  async getPerfilDeputado(id) {
    try {
      const query = `
        SELECT 
          d.id_deputado,
          d.ultimo_status_nome_eleitoral AS nome,
          d.nome_civil_deputado AS nome_civil,
          d.ultimo_status_sigla_partido AS partido,
          d.ultimo_status_sigla_uf AS uf,
          d.escolaridade_deputado AS escolaridade,
          d.ultimo_status_url_foto AS url_foto_perfil,
          d.ultimo_status_situacao AS situacao,
          TO_CHAR(d.data_nascimento_deputado, 'DD/MM/YYYY') AS data_nascimento,
          'Não cadastrado no BD' AS email,
          'Não cadastrado no BD' AS telefone,
          'Não cadastrado no BD' AS endereco,
          COALESCE(mv.indice_eficiencia, 0.0) AS indice_eficiencia,
          COALESCE(mv.total_deputados, (SELECT COUNT(*) FROM deputados)) AS total_deputados,
          COALESCE(mv.posicao_ranking_gastos, 1) AS posicao_ranking
        FROM deputados d
        LEFT JOIN mv_deputados_consolidado mv ON mv.id_deputado = d.id_deputado
        WHERE d.id_deputado = $1
      `;
      const result = await this.client.query(query, [id]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        ...row,
        indice_eficiencia: parseFloat(row.indice_eficiencia),
        posicao_ranking: parseInt(row.posicao_ranking),
        total_deputados: parseInt(row.total_deputados)
      };
    } catch (error) {
      console.error('Erro na query getPerfilDeputado:', error);
      throw error;
    }
  }

  // Retorna as palavras para a nuvem de palavras (baseado nos temas das proposições do deputado)
  async getPerfilNuvemPalavras(id) {
    try {
      const query = `
        SELECT 
          pt.tema AS text,
          COUNT(*) AS value
        FROM proposicoes_autores pa
        JOIN proposicoes p ON pa.id_proposicao = p.id_proposicao
        JOIN proposicoes_temas pt ON p.id_proposicao = pt.id_proposicao
        WHERE pa.id_deputado = $1
          AND pt.tema IS NOT NULL AND pt.tema != ''
        GROUP BY pt.tema
        ORDER BY value DESC
        LIMIT 30
      `;
      const result = await this.client.query(query, [id]);
      return result.rows.map(row => ({
        text: row.text,
        value: parseInt(row.value)
      }));
    } catch (error) {
      console.error('Erro na query getPerfilNuvemPalavras:', error);
      throw error;
    }
  }

  // Retorna os gastos por tipo de despesa de um deputado específico
  async getPerfilGastosTipo(id) {
    try {
      const query = `
        SELECT 
          desc_subcota AS tipo_gasto,
          CAST(SUM(valor_liquido) AS FLOAT) AS total_gasto
        FROM despesas
        WHERE id_deputado = $1
          AND desc_subcota IS NOT NULL AND desc_subcota != ''
        GROUP BY desc_subcota
        ORDER BY total_gasto DESC
      `;
      const result = await this.client.query(query, [id]);
      return result.rows;
    } catch (error) {
      console.error('Erro na query getPerfilGastosTipo:', error);
      throw error;
    }
  }

  // Retorna os fornecedores que mais receberam pagamentos de um deputado específico
  async getPerfilFornecedores(id) {
    try {
      const query = `
        SELECT 
          fornecedor_nome,
          CAST(SUM(valor_liquido) AS FLOAT) AS total_gasto
        FROM despesas
        WHERE id_deputado = $1
          AND fornecedor_nome IS NOT NULL AND fornecedor_nome != ''
        GROUP BY fornecedor_nome
        ORDER BY total_gasto DESC
        LIMIT 10
      `;
      const result = await this.client.query(query, [id]);
      return result.rows;
    } catch (error) {
      console.error('Erro na query getPerfilFornecedores:', error);
      throw error;
    }
  }

  // Retorna as votações de um deputado (com paginação, filtro de tema e busca por texto)
  async getPerfilVotacoes(id, { pagina = 1, itensPorPagina = 5, filtroTema = 'Todos', busca = '' } = {}) {
    try {
      const values = [id];
      let paramCount = 2;

      // Filtros dinâmicos
      let whereExtra = '';
      if (filtroTema !== 'Todos') {
        whereExtra += ` AND pt.tema = $${paramCount++}`;
        values.push(filtroTema);
      }
      if (busca.trim() !== '') {
        whereExtra += ` AND (
          p.ementa ILIKE $${paramCount} 
          OR p.ementa_detalhada ILIKE $${paramCount}
          OR p.sigla_tipo_proposicao ILIKE $${paramCount}
          OR CAST(p.numero_proposicao AS TEXT) ILIKE $${paramCount}
          OR CONCAT(p.sigla_tipo_proposicao, ' ', p.numero_proposicao) ILIKE $${paramCount}
          OR CONCAT(p.sigla_tipo_proposicao, p.numero_proposicao) ILIKE $${paramCount}
        )`;
        values.push(`%${busca.trim()}%`);
        paramCount++;
      }

      const limit = parseInt(itensPorPagina);
      const offset = (parseInt(pagina) - 1) * limit;

      // Query de contagem total para paginação
      const countQuery = `
        SELECT COUNT(DISTINCT vv.id_votacao) AS total
        FROM votacoes_votos vv
        JOIN votacao v ON vv.id_votacao = v.id_votacao
        JOIN proposicoes p ON v.id_proposicao = p.id_proposicao
        LEFT JOIN proposicoes_temas pt ON p.id_proposicao = pt.id_proposicao
        WHERE vv.id_deputado = $1
        ${whereExtra}
      `;

      // Query separada para buscar TODOS os temas desse deputado independentemente da busca atual
      const temasQuery = `
        SELECT array_agg(DISTINCT pt.tema) FILTER (WHERE pt.tema IS NOT NULL AND pt.tema != '') AS temas
        FROM votacoes_votos vv
        JOIN votacao v ON vv.id_votacao = v.id_votacao
        JOIN proposicoes p ON v.id_proposicao = p.id_proposicao
        LEFT JOIN proposicoes_temas pt ON p.id_proposicao = pt.id_proposicao
        WHERE vv.id_deputado = $1
      `;

      // Query principal de dados paginados
      const dataQuery = `
        SELECT 
          vv.id_votacao AS id,
          TO_CHAR(v.data_votacao, 'DD/MM/YYYY') AS data_votacao,
          p.ementa AS descricao,
          p.ementa_detalhada AS ementa,
          p.sigla_tipo_proposicao AS sigla,
          p.numero_proposicao AS numero,
          vv.voto,
          MAX(pt.tema) AS tema
        FROM votacoes_votos vv
        JOIN votacao v ON vv.id_votacao = v.id_votacao
        JOIN proposicoes p ON v.id_proposicao = p.id_proposicao
        LEFT JOIN proposicoes_temas pt ON p.id_proposicao = pt.id_proposicao
        WHERE vv.id_deputado = $1
        ${whereExtra}
        GROUP BY vv.id_votacao, v.data_votacao, p.ementa, p.ementa_detalhada, p.sigla_tipo_proposicao, p.numero_proposicao, vv.voto
        ORDER BY v.data_votacao DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const [countResult, dataResult, temasResult] = await Promise.all([
        this.client.query(countQuery, values),
        this.client.query(dataQuery, values),
        this.client.query(temasQuery, [id])
      ]);

      const total = parseInt(countResult.rows[0].total);
      const total_paginas = Math.ceil(total / limit);

      // Monta lista de temas disponíveis para o filtro (incluindo 'Todos' no topo)
      const temasRaw = temasResult.rows[0].temas || [];
      const temas_disponiveis = ['Todos', ...temasRaw.sort()];

      return {
        data: dataResult.rows,
        total,
        total_paginas,
        temas_disponiveis
      };
    } catch (error) {
      console.error('Erro na query getPerfilVotacoes:', error);
      throw error;
    }
  }

  // Retorna pesqusia de deputados pelo nome:
  async getDeputadosPorNome(nomePesquisa, options = {}) {
    try {
      const {
        partido = null,
        uf = null,
        limit = 50,
        offset = 0,
        exactMatch = false
      } = options;

      let whereClause = '';
      const params = [];
      let paramIndex = 1;

      // Condição para busca por nome (accent-insensitive)
      const searchPattern = `%${nomePesquisa}%`;
      if (exactMatch) {
        whereClause = `(
            unaccent(d.ultimo_status_nome_eleitoral) ILIKE unaccent($${paramIndex})
            OR unaccent(d.nome_civil_deputado) ILIKE unaccent($${paramIndex})
          )`;
        params.push(searchPattern);
      } else {
        whereClause = `(
            unaccent(d.ultimo_status_nome_eleitoral) ILIKE unaccent($${paramIndex})
            OR unaccent(d.nome_civil_deputado) ILIKE unaccent($${paramIndex})
          )`;
        params.push(searchPattern);
      }
      paramIndex++;

      // Filtro por partido
      if (partido) {
        whereClause += ` AND d.ultimo_status_sigla_partido = $${paramIndex}`;
        params.push(partido.toUpperCase());
        paramIndex++;
      }

      // Filtro por UF
      if (uf) {
        whereClause += ` AND d.ultimo_status_sigla_uf = $${paramIndex}`;
        params.push(uf.toUpperCase());
        paramIndex++;
      }

      const query = `
        SELECT 
          d.ultimo_status_nome_eleitoral AS nome,
          d.nome_civil_deputado AS nome_civil,
          d.ultimo_status_sigla_partido AS partido,
          d.ultimo_status_sigla_uf AS uf,
          d.ultimo_status_url_foto AS url_perfil,
          d.id_deputado,
          d.ultimo_status_situacao AS situacao,
          d.ultimo_status_condicao_eleitoral AS condicao_eleitoral
        FROM deputados d
        WHERE ${whereClause}
        ORDER BY d.ultimo_status_nome_eleitoral
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limit, offset);
      const result = await this.client.query(query, params);

      // Query para contar total de resultados (para paginação)
      const countQuery = `
        SELECT COUNT(*) as total
        FROM deputados d
        WHERE ${whereClause}
      `;

      const countResult = await this.client.query(countQuery, params.slice(0, -2));

      return {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
        results: result.rows.map(row => ({
          id: row.id_deputado,
          nome: row.nome,
          nome_civil: row.nome_civil,
          partido: row.partido,
          uf: row.uf,
          url_perfil: row.url_perfil,
          situacao: row.situacao,
          condicao_eleitoral: row.condicao_eleitoral
        }))
      };
    } catch (error) {
      console.error('Erro na query getDeputadosPorNome:', error);
      throw error;
    }
  }

  //retorna deputado por pesquisa de cpf
  async getDeputadosPorCPF(cpfPesquisa, options = {}) {
    try {
      const {
        partido = null,
        uf = null,
        limit = 50,
        offset = 0,
        exactMatch = false // Busca por semelhança (prefixo) por padrão
      } = options;

      // Remove caracteres não numéricos do CPF
      const cpfLimpo = String(cpfPesquisa).replace(/\D/g, '');

      if (!cpfLimpo) {
        // If no CPF provided, return empty result set
        return {
          total: 0,
          limit,
          offset,
          cpf_pesquisado: '',
          results: []
        };
      }

      let whereClause = '';
      const params = [];
      let paramIndex = 1;

      // Condição para busca por CPF (sempre usando LIKE para prefixo)
      if (exactMatch) {
        // Caso o usuário queira correspondência exata
        whereClause = `d.cpf_deputado = $${paramIndex}`;
        params.push(cpfLimpo);
      } else {
        // Busca por prefixo: qualquer CPF que comece com os dígitos fornecidos
        whereClause = `d.cpf_deputado LIKE $${paramIndex}`;
        params.push(`${cpfLimpo}%`);
      }
      paramIndex++;

      // Filtro por partido
      if (partido) {
        whereClause += ` AND d.ultimo_status_sigla_partido = $${paramIndex}`;
        params.push(partido.toUpperCase());
        paramIndex++;
      }

      // Filtro por UF
      if (uf) {
        whereClause += ` AND d.ultimo_status_sigla_uf = $${paramIndex}`;
        params.push(uf.toUpperCase());
        paramIndex++;
      }

      const query = `
        SELECT 
          d.id_deputado,
          d.cpf_deputado AS cpf,
          d.ultimo_status_nome_eleitoral AS nome,
          d.nome_civil_deputado AS nome_civil,
          d.ultimo_status_sigla_partido AS partido,
          d.ultimo_status_sigla_uf AS uf,
          d.ultimo_status_url_foto AS url_perfil,
          d.sexo_deputado AS sexo,
          d.data_nascimento_deputado AS data_nascimento,
          d.escolaridade_deputado AS escolaridade,
          d.ultimo_status_situacao AS situacao,
          d.ultimo_status_condicao_eleitoral AS condicao_eleitoral,
          d.uri_deputado AS uri
        FROM deputados d
        WHERE ${whereClause}
        ORDER BY d.ultimo_status_nome_eleitoral
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(limit, offset);
      const result = await this.client.query(query, params);

      // Query para contar total de resultados (para paginação)
      const countQuery = `
        SELECT COUNT(*) as total
        FROM deputados d
        WHERE ${whereClause}
      `;

      const countResult = await this.client.query(countQuery, params.slice(0, -2));

      // Formata o CPF para exibição (opcional)
      const formatarCPF = (cpf) => {
        if (!cpf || cpf.length !== 11) return cpf;
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      };

      return {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
        cpf_pesquisado: formatarCPF(cpfLimpo),
        results: result.rows.map(row => ({
          id: row.id_deputado,
          cpf: formatarCPF(row.cpf),
          cpf_numerico: row.cpf, // CPF sem formatação para uso em outras consultas
          nome: row.nome,
          nome_civil: row.nome_civil,
          partido: row.partido,
          uf: row.uf,
          url_perfil: row.url_perfil,
          sexo: row.sexo,
          data_nascimento: row.data_nascimento,
          escolaridade: row.escolaridade,
          situacao: row.situacao,
          condicao_eleitoral: row.condicao_eleitoral,
          uri: row.uri
        }))
      };
    } catch (error) {
      console.error('Erro na query getDeputadosPorCPF:', error);
      throw error;
    }
  }

  async getBeneficioRanking({ pagina = 1, itensPorPagina = 10, ordem = 'desc', filtroPartido = 'Todos', filtroUF = 'Todos' } = {}) {
    try {
      const limit = parseInt(itensPorPagina);
      const offset = (parseInt(pagina) - 1) * limit;
      
      const values = [limit, offset];
      let paramCount = 3;
      let whereClause = "WHERE 1=1";

      if (filtroPartido !== 'Todos') {
        whereClause += ` AND partido = $${paramCount++}`;
        values.push(filtroPartido);
      }
      if (filtroUF !== 'Todos') {
        whereClause += ` AND uf = $${paramCount++}`;
        values.push(filtroUF);
      }

      const query = `
        SELECT
          id_deputado,
          deputado,
          partido,
          uf,
          ROUND(total_gasto, 2) AS total_gasto,
          total_proposicoes,
          ROUND(score_proposicoes, 2) AS score_proposicoes,
          ROUND(score_plenario, 2) AS score_plenario,
          ROUND(score_comissoes, 2) AS score_comissoes,
          ROUND(beneficio_score, 2) AS beneficio_score,
          ROUND(fator_atividade, 4) AS fator_atividade,
          ROUND(indice_eficiencia, 4) AS indice_eficiencia,
          posicao_ranking
        FROM mv_deputados_consolidado
        ${whereClause}
        ORDER BY indice_eficiencia ${ordem === 'asc' ? 'ASC' : 'DESC'}
        LIMIT $1 OFFSET $2
      `;
      const result = await this.client.query(query, values);

      const countValues = values.slice(2);
      let countWhere = "WHERE 1=1";
      let countParamCount = 1;
      if (filtroPartido !== 'Todos') {
        countWhere += ` AND partido = $${countParamCount++}`;
      }
      if (filtroUF !== 'Todos') {
        countWhere += ` AND uf = $${countParamCount++}`;
      }

      const countQuery = `
        SELECT COUNT(*) as total 
        FROM mv_deputados_consolidado
        ${countWhere}
      `;
      const countResult = await this.client.query(countQuery, countValues);

      return {
        data: result.rows,
        pagination: {
           total: parseInt(countResult.rows[0].total)
        }
      };
    } catch (error) {
      console.error('Erro na query getBeneficioRanking:', error);
      throw error;
    }
  }

  async getVisaoGeralEscolaridade() {
    try {
      const query = `
        SELECT 
          escolaridade_deputado AS escolaridade, 
          COUNT(*)::int AS total_deputados,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentual
        FROM deputados 
        WHERE escolaridade_deputado IS NOT NULL AND escolaridade_deputado != ''
        GROUP BY escolaridade_deputado 
        ORDER BY total_deputados DESC
      `;
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro na query getVisaoGeralEscolaridade:', error);
      throw error;
    }
  }

  // Retorna a correlação complexa de escolaridade com Gastos, Fidelidade, Proposições e Presenças
  async getCorrelacaoEscolaridade() {
    try {
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
              SUM(COALESCE(des.valor_liquido, 0)) / NULLIF(COUNT(DISTINCT d.id_deputado), 0) AS gasto_medio
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
        ORDER BY 
          CASE e.escolaridade
            WHEN 'Sem informação' THEN 0
            WHEN 'Primário Incompleto' THEN 1
            WHEN 'Ensino Fundamental' THEN 2
            WHEN 'Secundário Incompleto' THEN 3
            WHEN 'Ensino Médio Incompleto' THEN 4
            WHEN 'Secundário' THEN 5
            WHEN 'Ensino Médio' THEN 6
            WHEN 'Superior Incompleto' THEN 7
            WHEN 'Superior' THEN 8
            WHEN 'Pós-Graduação' THEN 9
            WHEN 'Mestrado Incompleto' THEN 10
            WHEN 'Mestrado' THEN 11
            WHEN 'Doutorado Incompleto' THEN 12
            WHEN 'Doutorado' THEN 13
            ELSE 99
          END ASC
      `;
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro na query getCorrelacaoEscolaridade:', error);
      throw error;
    }
  }

  // Retorna os dados detalhados e crus de desempenho do deputado (presenças, fator de atividade, score cru)
  async getPerfilDesempenho(id_deputado) {
    try {
      const query = `
        SELECT
          id_deputado,
          deputado,
          partido,
          uf,
          ROUND(total_gasto, 2) AS total_gasto,
          total_proposicoes,
          proposicoes_aprovadas,
          proposicoes_avancadas,
          tipos_aprovadas_lista,
          tipos_avancadas_lista,
          ROUND(score_proposicoes, 2) AS score_proposicoes,
          ROUND(score_plenario, 2) AS score_plenario,
          ROUND(score_comissoes, 2) AS score_comissoes,
          ROUND(beneficio_score, 2) AS beneficio_score,
          ROUND(fator_atividade, 4) AS fator_atividade,
          ROUND(indice_eficiencia, 4) AS indice_eficiencia,
          plenario_presencas,
          plenario_ausencias_justificadas,
          plenario_ausencias_nao_justificadas,
          ROUND((plenario_presencas::numeric / NULLIF(plenario_presencas + plenario_ausencias_justificadas + plenario_ausencias_nao_justificadas, 0) * 100), 2) AS plenario_pct_presenca,
          comissoes_presencas,
          comissoes_ausencias_justificadas,
          comissoes_ausencias_nao_justificadas,
          ROUND((comissoes_presencas::numeric / NULLIF(comissoes_presencas + comissoes_ausencias_justificadas + comissoes_ausencias_nao_justificadas, 0) * 100), 2) AS comissoes_pct_presenca
        FROM mv_deputados_consolidado
        WHERE id_deputado = $1
      `;
      const result = await this.client.query(query, [id_deputado]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro na query getPerfilDesempenho:', error);
      throw error;
    }
  }

  async getBeneficioRankingPosition(id_deputado) {
    try {
      const query = `
        SELECT
          posicao_ranking AS posicao,
          total_deputados AS total
        FROM mv_deputados_consolidado
        WHERE id_deputado = $1
      `;

      const result = await this.client.query(query, [id_deputado]);
      if (result.rows.length === 0) {
        return null; // deputado não encontrado
      }
      return {
        posicao: parseInt(result.rows[0].posicao, 10),
        total: parseInt(result.rows[0].total, 10)
      };
    } catch (error) {
      console.error('Erro na query getBeneficioRankingPosition:', error);
      throw error;
    }
  }
}




// Exportamos uma única instância (Padrão Singleton) para ser reaproveitada
module.exports = new DatabaseAdapter();
