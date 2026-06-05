const { Client } = require('pg');

class DatabaseAdapter {
  constructor() {
    this.client = new Client({
      user: 'admin',
      host: 'localhost',
      database: 'backend',
      password: 'admin123',
      port: 5432,
    });
  }

  // Método para iniciar a conexão
  async connect() {
    try {
      await this.client.connect();
      console.log('✅ DatabaseAdapter: Conectado ao banco de dados com sucesso!');
      // Ensure unaccent extension is available for accent-insensitive searches
      await this.client.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
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

  // Retorna os top 10 deputados que mais gastaram
  async getVisaoGeralGastos() {
    try {
      const query = `
        SELECT 
          nome_parlamentar AS name, 
          CAST(SUM(valor_liquido) AS FLOAT) AS gastos, 
          sigla_partido AS partido, 
          sigla_uf AS uf
        FROM despesas
        GROUP BY nome_parlamentar, sigla_partido, sigla_uf
        ORDER BY gastos DESC
        LIMIT 10
      `;
      const result = await this.client.query(query);
      return result.rows;
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

  // Retorna os dados da aba "Visão Geral" - Fornecedores (Top 10 fornecedores que mais receberam)
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
        LIMIT 10
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
          vv.deputado_sigla_partido AS partido,
          COUNT(*) AS total_considerado,
          SUM(CASE WHEN vv.voto = vo.orientacao THEN 1 ELSE 0 END) AS total_alinhado,
          ROUND(
            SUM(CASE WHEN vv.voto = vo.orientacao THEN 1 ELSE 0 END)::numeric / 
            NULLIF(COUNT(*), 0)::numeric * 100
          , 2) AS perc_alinhamento
        FROM votacoes_votos vv
        JOIN votacoes_orientacoes vo 
          ON vv.id_votacao = vo.id_votacao 
          AND vv.deputado_sigla_partido = vo.sigla_bancada
        WHERE vv.deputado_sigla_partido IS NOT NULL 
          AND vv.deputado_sigla_partido != ''
        GROUP BY vv.deputado_sigla_partido
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
            SELECT sigla_partido AS partido, SUM(valor_liquido) AS gastos
            FROM despesas
            WHERE sigla_partido IS NOT NULL AND sigla_partido != ''
            GROUP BY sigla_partido
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
          d.ultimo_status_sigla_partido AS partido,
          d.ultimo_status_sigla_uf AS uf,
          d.escolaridade_deputado AS escolaridade,
          TO_CHAR(d.data_nascimento_deputado, 'DD/MM/YYYY') AS data_nascimento,
          'Não cadastrado no BD' AS email,
          'Não cadastrado no BD' AS telefone,
          'Não cadastrado no BD' AS endereco,
          ROUND((RANDOM() * 10)::numeric, 2) AS indice_eficiencia,
          (SELECT COUNT(*) FROM deputados) AS total_deputados,
          (
            SELECT posicao FROM (
              SELECT id_deputado, RANK() OVER(ORDER BY total_gastos DESC) AS posicao
              FROM (
                SELECT dep.id_deputado, COALESCE(SUM(desp.valor_liquido), 0) AS total_gastos
                FROM deputados dep
                LEFT JOIN despesas desp ON dep.id_deputado = desp.id_deputado
                GROUP BY dep.id_deputado
              ) g
            ) r WHERE r.id_deputado = d.id_deputado
          ) AS posicao_ranking
        FROM deputados d
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
        whereExtra += ` AND (p.ementa ILIKE $${paramCount} OR p.ementa_detalhada ILIKE $${paramCount})`;
        values.push(`%${busca.trim()}%`);
        paramCount++;
      }

      const limit = parseInt(itensPorPagina);
      const offset = (parseInt(pagina) - 1) * limit;

      // Query de contagem total para paginação
      const countQuery = `
        SELECT COUNT(DISTINCT vv.id_votacao) AS total,
               array_agg(DISTINCT pt.tema) FILTER (WHERE pt.tema IS NOT NULL AND pt.tema != '') AS temas
        FROM votacoes_votos vv
        JOIN votacao v ON vv.id_votacao = v.id_votacao
        JOIN proposicoes p ON v.id_proposicao = p.id_proposicao
        LEFT JOIN proposicoes_temas pt ON p.id_proposicao = pt.id_proposicao
        WHERE vv.id_deputado = $1
        ${whereExtra}
      `;

      // Query principal de dados paginados
      const dataQuery = `
        SELECT 
          vv.id_votacao AS id,
          TO_CHAR(v.data_votacao, 'DD/MM/YYYY') AS data_votacao,
          p.ementa AS descricao,
          p.ementa_detalhada AS ementa,
          vv.voto,
          MAX(pt.tema) AS tema
        FROM votacoes_votos vv
        JOIN votacao v ON vv.id_votacao = v.id_votacao
        JOIN proposicoes p ON v.id_proposicao = p.id_proposicao
        LEFT JOIN proposicoes_temas pt ON p.id_proposicao = pt.id_proposicao
        WHERE vv.id_deputado = $1
        ${whereExtra}
        GROUP BY vv.id_votacao, v.data_votacao, p.ementa, p.ementa_detalhada, vv.voto
        ORDER BY v.data_votacao DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const [countResult, dataResult] = await Promise.all([
        this.client.query(countQuery, values),
        this.client.query(dataQuery, values)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const total_paginas = Math.ceil(total / limit);

      // Monta lista de temas disponíveis para o filtro (incluindo 'Todos' no topo)
      const temasRaw = countResult.rows[0].temas || [];
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
          AND d.ultimo_status_situacao = 'Exercício'  -- Filtra apenas deputados em exercício
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
          AND d.ultimo_status_situacao = 'Exercício'
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
  // Retorna ranking de benefícios dos deputados com paginação
  async getBeneficioRanking({ pagina = 1, itensPorPagina = 10, ordem = 'desc' } = {}) {
    try {
      const limit = parseInt(itensPorPagina);
      const offset = (parseInt(pagina) - 1) * limit;
      const query = `
WITH
pesos AS (
SELECT
7.0::numeric AS peso_proposicao,
1.5::numeric AS peso_plenario,
1.0::numeric AS peso_comissoes
),

gastos AS (
SELECT
d.id_deputado,
SUM(COALESCE(d.valor_liquido,0)) AS total_gasto
FROM despesas d
GROUP BY d.id_deputado
),

autoria AS (
SELECT
id_proposicao,
COUNT(*) AS qtd_autores
FROM proposicoes_autores
GROUP BY id_proposicao
),

proposicoes_score AS (
SELECT
pa.id_deputado,
COUNT(DISTINCT pa.id_proposicao) AS total_proposicoes,
SUM(
/* ==========================
   PESO DO TIPO
   ========================== */
(
    CASE
        /* Muito relevantes */
        WHEN p.sigla_tipo_proposicao = 'PEC'
            THEN 20.0
        WHEN p.sigla_tipo_proposicao = 'PL'
            THEN 15.0
        /* Relevantes */
        WHEN p.sigla_tipo_proposicao IN (
            'PLP',
            'MPV',
            'PDL',
            'PRC',
            'PLV',
            'PLN'
        )
            THEN 10.0
        /* Fiscalização */
        WHEN p.sigla_tipo_proposicao IN (
            'PFC',
            'RIC',
            'RCP',
            'INC',
            'SIT'
        )
            THEN 5.0
        /* Emendas */
        WHEN p.sigla_tipo_proposicao IN (
            'EMC',
            'EMP',
            'EMR',
            'EMS',
            'EMA',
            'EML',
            'EMO',
            'ESB',
            'SBE',
            'SBE-A',
            'SBT',
            'SBT-A',
            'SBR',
            'SSP',
            'ERD'
        )
            THEN 2.0
        /* Processuais */
        WHEN p.sigla_tipo_proposicao IN (
            'REQ',
            'REC',
            'RPD',
            'RPDR',
            'DTQ',
            'PPP',
            'PIN',
            'PRR',
            'RRC'
        )
            THEN 1.0
        /* Restante */
        ELSE 0.1
    END
)
*
/* ==========================
   SITUAÇÃO
   ========================== */
(
    CASE
        /* APROVADA */
        WHEN p.ultimo_status_id_situacao IN (
            1140
        )
            THEN 1.00
        /* AVANÇADA */
        WHEN p.ultimo_status_id_situacao IN (
            900,
            926,
            1150,
            1293,
            939
        )
            THEN 0.75
        /* REJEITADA */
        WHEN p.ultimo_status_id_situacao IN (
            923,
            941,
            950,
            1120,
            1222,
            1292
        )
            THEN 0.00
        /* EM TRAMITAÇÃO */
        ELSE 0.25
    END
)
*
/* ==========================
   AUTORIA
   ========================== */
(
    CASE
        /* Autor único */
        WHEN a.qtd_autores = 1
            THEN 1.0
        /* Autor principal */
        WHEN pa.ordem_assinatura = 1
            THEN 0.5
        /* Coautores dividem os 50% restantes */
        ELSE
            0.5 / NULLIF(a.qtd_autores - 1,0)
    END
)
) AS score_proposicoes
FROM proposicoes_autores pa
JOIN proposicoes p
    ON p.id_proposicao = pa.id_proposicao
JOIN autoria a
    ON a.id_proposicao = pa.id_proposicao
GROUP BY pa.id_deputado
),

presencas AS (
SELECT
    p.id_dep AS id_deputado,
    SUM(plenario_presencas) AS plenario_presencas,
    SUM(plenario_ausencias_justificadas) AS plenario_ausencias_justificadas,
    SUM(plenario_ausencias_nao_justificadas) AS plenario_ausencias_nao_justificadas,
    SUM(comissoes_presencas) AS comissoes_presencas,
    SUM(comissoes_ausencias_justificadas) AS comissoes_ausencias_justificadas,
    SUM(comissoes_ausencias_nao_justificadas) AS comissoes_ausencias_nao_justificadas
FROM presenca_deputados p
GROUP BY p.id_dep
),

presencas_score AS (
SELECT
    id_deputado,
    GREATEST(
        0,
        (
            plenario_presencas - (3 * plenario_ausencias_nao_justificadas)
        ) * (plenario_presencas::numeric / NULLIF((plenario_presencas + plenario_ausencias_justificadas + plenario_ausencias_nao_justificadas), 0))
    ) AS score_plenario,
    GREATEST(
        0,
        (
            comissoes_presencas - (3 * comissoes_ausencias_nao_justificadas)
        ) * (comissoes_presencas::numeric / NULLIF((comissoes_presencas + comissoes_ausencias_justificadas + comissoes_ausencias_nao_justificadas), 0))
    ) AS score_comissoes
FROM presencas
),

beneficios AS (
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    d.ultimo_status_sigla_partido AS partido,
    d.ultimo_status_sigla_uf AS uf,
    COALESCE(g.total_gasto,0) AS total_gasto,
    COALESCE(psc.total_proposicoes,0) AS total_proposicoes,
    COALESCE(psc.score_proposicoes,0) AS score_proposicoes,
    COALESCE(pr.score_plenario,0) AS score_plenario,
    COALESCE(pr.score_comissoes,0) AS score_comissoes,
    (
        (ps.peso_proposicao * COALESCE(psc.score_proposicoes,0)) +
        (ps.peso_plenario * COALESCE(pr.score_plenario,0)) +
        (ps.peso_comissoes * COALESCE(pr.score_comissoes,0))
    ) AS beneficio_score
FROM deputados d
LEFT JOIN gastos g ON g.id_deputado = d.id_deputado
LEFT JOIN proposicoes_score psc ON psc.id_deputado = d.id_deputado
LEFT JOIN presencas_score pr ON pr.id_deputado = d.id_deputado
CROSS JOIN pesos ps
),

p25 AS (
SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY beneficio_score) AS p25_beneficio
FROM beneficios
)
SELECT
b.id_deputado,
b.deputado,
b.partido,
b.uf,
ROUND(b.total_gasto,2) AS total_gasto,
b.total_proposicoes,
ROUND(b.score_proposicoes,2) AS score_proposicoes,
ROUND(b.score_plenario,2) AS score_plenario,
ROUND(b.score_comissoes,2) AS score_comissoes,
ROUND(b.beneficio_score,2) AS beneficio_score,
ROUND((b.beneficio_score / (b.beneficio_score + p.p25_beneficio))::numeric,4) AS fator_atividade,
ROUND((b.beneficio_score * (b.beneficio_score / (b.beneficio_score + p.p25_beneficio)) / (1 + (b.total_gasto / 1000.0)))::numeric,4) AS indice_eficiencia
FROM beneficios b
CROSS JOIN p25 p
ORDER BY indice_eficiencia ${ordem === 'asc' ? 'ASC' : 'DESC'}
LIMIT ${limit} OFFSET ${offset}
      `;
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro na query getBeneficioRanking:', error);
      throw error;
    }
  }
}


// Exportamos uma única instância (Padrão Singleton) para ser reaproveitada
module.exports = new DatabaseAdapter();
