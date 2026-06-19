const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK = false; // Mude para false para voltar a usar o backend (PostgreSQL)

const MOCK_DEPUTADOS = [
  { id: 1, name: 'João Silva', partido: 'PL', uf: 'SP', gastos: 450000, indice_eficiencia: 8.5 },
  { id: 2, name: 'Maria Santos', partido: 'PT', uf: 'MG', gastos: 320000, indice_eficiencia: 9.2 },
  { id: 3, name: 'Pedro Costa', partido: 'PSOL', uf: 'RJ', gastos: 150000, indice_eficiencia: 7.8 },
  { id: 4, name: 'Ana Oliveira', partido: 'UNIÃO', uf: 'BA', gastos: 580000, indice_eficiencia: 6.5 },
  { id: 5, name: 'Carlos Souza', partido: 'PP', uf: 'RS', gastos: 410000, indice_eficiencia: 8.0 },
  { id: 6, name: 'Lucas Ferreira', partido: 'MDB', uf: 'PR', gastos: 600000, indice_eficiencia: 5.4 },
  { id: 7, name: 'Juliana Lima', partido: 'PSB', uf: 'PE', gastos: 280000, indice_eficiencia: 9.0 },
  { id: 8, name: 'Marcos Gomes', partido: 'PDT', uf: 'CE', gastos: 350000, indice_eficiencia: 7.5 },
  { id: 9, name: 'Fernanda Rocha', partido: 'PL', uf: 'SC', gastos: 490000, indice_eficiencia: 8.1 },
  { id: 10, name: 'Rafael Alves', partido: 'PT', uf: 'SP', gastos: 310000, indice_eficiencia: 8.8 }
];

const MOCK_NUVEM_PARTIDOS = {
  'PT': [
    { text: 'Trabalhadores', value: 90 }, { text: 'Bolsa Família', value: 85 }, { text: 'Ensino Público', value: 70 }, { text: 'Saúde da Família', value: 60 }, { text: 'Agricultura Familiar', value: 50 }, { text: 'Minorias', value: 45 }, { text: 'Cotas', value: 30 }
  ],
  'PL': [
    { text: 'Segurança Pública', value: 95 }, { text: 'Isenção Fiscal', value: 80 }, { text: 'Agronegócio', value: 75 }, { text: 'Liberdade Econômica', value: 60 }, { text: 'Armas de Fogo', value: 50 }, { text: 'Redução de Impostos', value: 40 }, { text: 'Defesa Nacional', value: 35 }
  ],
  'PSOL': [
    { text: 'Direitos Humanos', value: 95 }, { text: 'Demarcação de Terras', value: 85 }, { text: 'LGBTQIAP+', value: 80 }, { text: 'Escolas Públicas', value: 70 }, { text: 'Moradia Popular', value: 65 }, { text: 'Estatização', value: 55 }
  ]
};

class DashboardAdapter {
  static async _fetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar dados de ${url}:`, error);
      throw error;
    }
  }

  // ==========================================
  // Aba "Visão Geral"
  // ==========================================

  static async getVisaoGeralRanking({ pagina = 1, itensPorPagina = 10, filtroPartido = 'Todos', filtroUF = 'Todos', metrica = 'eficiencia', ordem = 'desc' } = {}) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let dadosFiltrados = MOCK_DEPUTADOS.filter(dep => {
            if (filtroPartido !== 'Todos' && dep.partido !== filtroPartido) return false;
            if (filtroUF !== 'Todos' && dep.uf !== filtroUF) return false;
            return true;
          });

          dadosFiltrados.sort((a, b) => {
            const valA = metrica === 'eficiencia' ? a.indice_eficiencia : a.gastos;
            const valB = metrica === 'eficiencia' ? b.indice_eficiencia : b.gastos;
            return ordem === 'desc' ? valB - valA : valA - valB;
          });

          const totalItens = dadosFiltrados.length;
          const totalGastos = dadosFiltrados.reduce((acc, curr) => acc + curr.gastos, 0);

          const indexInicio = (pagina - 1) * itensPorPagina;
          const dadosPaginados = dadosFiltrados.slice(indexInicio, indexInicio + itensPorPagina).map((d, i) => ({
            ...d,
            posicao_ranking: indexInicio + i + 1
          }));

          resolve({
            data: dadosPaginados,
            total: totalItens,
            total_gastos: totalGastos,
            total_paginas: Math.ceil(totalItens / itensPorPagina)
          });
        }, 300);
      });
    }

    return this._fetch('/ranking', {
      method: 'POST',
      body: JSON.stringify({ pagina, itensPorPagina, filtroPartido, filtroUF, metrica, ordem })
    });
  }

  static async getTotalGastosGeral({ filtroPartido = 'Todos', filtroUF = 'Todos' } = {}) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve({ total: 20080000 }); // mock de 20.08M
      }, 300));
    }
    return this._fetch('/total-gastos', {
      method: 'POST',
      body: JSON.stringify({ filtroPartido, filtroUF })
    });
  }

  static async getVisaoGeralGastos({ pagina = 1, itensPorPagina = 10, ordem = 'desc', filtroPartido = 'Todos', filtroUF = 'Todos' } = {}) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          data: MOCK_DEPUTADOS.slice(0, 10).map((d, i) => ({
            name: d.name,
            gastos: d.gastos,
            partido: d.partido,
            uf: d.uf,
            posicao_ranking: i + 1
          })),
          pagination: {
            currentPage: 1,
            limit: 10,
            total: 10,
            totalPages: 1
          }
        });
      }, 300));
    }
    return this._fetch('/gastos', {
      method: 'POST',
      body: JSON.stringify({ pagina, itensPorPagina, ordem, filtroPartido, filtroUF })
    });
  }

  static async getRankingBeneficio({ pagina = 1, itensPorPagina = 10, ordem = 'desc', filtroPartido = 'Todos', filtroUF = 'Todos' } = {}) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let dadosFiltrados = [...MOCK_DEPUTADOS].sort((a, b) => {
            return ordem === 'desc' ? b.indice_eficiencia - a.indice_eficiencia : a.indice_eficiencia - b.indice_eficiencia;
          });
          const indexInicio = (pagina - 1) * itensPorPagina;
          const paginados = dadosFiltrados.slice(indexInicio, indexInicio + itensPorPagina).map(d => ({
            id_deputado: d.id,
            deputado: d.name,
            partido: d.partido,
            uf: d.uf,
            total_gasto: d.gastos,
            indice_eficiencia: d.indice_eficiencia
          }));
          resolve({
            data: paginados,
            pagination: { total: MOCK_DEPUTADOS.length }
          });
        }, 300);
      });
    }

    return this._fetch('/ranking-beneficio', {
      method: 'POST',
      body: JSON.stringify({ pagina, itensPorPagina, ordem, filtroPartido, filtroUF })
    });
  }

  static async getVisaoGeralEscolaridade() {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve([
          { escolaridade: 'Superior Completo', total_deputados: 405, percentual: 85.0 },
          { escolaridade: 'Ensino Médio', total_deputados: 56, percentual: 90.0 },
        ]);
      }, 300));
    }
    return this._fetch('/escolaridade');
  }

  static async getCorrelacaoEscolaridade() {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve([
          { escolaridade: 'Superior Completo', gasto_medio: 4500, perc_alinhamento: 85.0, total_proposicoes: 120, media_presencas_comissoes: 10, media_presencas_plenario: 35 },
        ]);
      }, 300));
    }
    return this._fetch('/correlacao-escolaridade');
  }

  static async getVisaoGeralFornecedores() {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve([
          { fornecedor_nome: 'Localiza Rent a Car', cnpj: '12.345.678/0001-90', total_contrato: 2500000 },
          { fornecedor_nome: 'TAM Linhas Aéreas', cnpj: '02.012.862/0001-60', total_contrato: 1800000 },
          { fornecedor_nome: 'Gol Linhas Aéreas', cnpj: '07.575.651/0001-59', total_contrato: 1500000 },
          { fornecedor_nome: 'Telefônica Brasil SA', cnpj: '02.558.157/0001-62', total_contrato: 800000 },
          { fornecedor_nome: 'Correios e Telégrafos', cnpj: '34.028.316/0001-03', total_contrato: 600000 },
        ]);
      }, 300));
    }
    return this._fetch('/fornecedores');
  }

  // ==========================================
  // Aba "Visão Partidária"
  // ==========================================

  static async getVisaoPartidariaAlinhamento() {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve([
          { partido: 'PT', total_considerado: 500, total_alinhado: 480, perc_alinhamento: 96.0 },
          { partido: 'PL', total_considerado: 600, total_alinhado: 550, perc_alinhamento: 91.6 },
          { partido: 'PSOL', total_considerado: 120, total_alinhado: 115, perc_alinhamento: 95.8 },
          { partido: 'UNIÃO', total_considerado: 400, total_alinhado: 320, perc_alinhamento: 80.0 },
          { partido: 'PP', total_considerado: 350, total_alinhado: 290, perc_alinhamento: 82.8 }
        ]);
      }, 300));
    }
    return this._fetch('/alinhamento-partidario');
  }

  static async getVisaoPartidariaComparacao() {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve([
          { partido: 'PT', frequencia: 92.5, proposicoes: 850, gastos: 12000000 },
          { partido: 'PL', frequencia: 88.0, proposicoes: 920, gastos: 15000000 },
          { partido: 'PSOL', frequencia: 95.0, proposicoes: 450, gastos: 3000000 },
          { partido: 'UNIÃO', frequencia: 85.5, proposicoes: 600, gastos: 18000000 },
          { partido: 'MDB', frequencia: 89.0, proposicoes: 700, gastos: 14000000 }
        ]);
      }, 300));
    }
    return this._fetch('/comparacao-partidaria');
  }

  static async getVisaoPartidariaNuvem(partido) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const fallbackNuvem = [
            { text: 'Orçamento Público', value: 70 }, { text: 'Reforma Administrativa', value: 60 }, { text: 'Teto de Gastos', value: 50 }, { text: 'Obras Públicas', value: 45 }, { text: 'Emendas', value: 30 }
          ];
          resolve(MOCK_NUVEM_PARTIDOS[partido] || fallbackNuvem);
        }, 300);
      });
    }
    return this._fetch(`/partidos/${partido}/nuvem`);
  }

  // ==========================================
  // Aba "Perfil do Deputado"
  // ==========================================

  static async pesquisarDeputados(nome) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          total: 2,
          limit: 50,
          offset: 0,
          results: [
            { id: 178854, nome: "Elmar Nascimento", partido: "UNIÃO", uf: "BA", url_perfil: "https://www.camara.leg.br/internet/deputado/bandep/178854.jpg", situacao: "Exercício", condicao_eleitoral: "Titular" },
            { id: 204517, nome: "Zé Vitor", partido: "PL", uf: "MG", url_perfil: "https://www.camara.leg.br/internet/deputado/bandep/204517.jpg", situacao: "Exercício", condicao_eleitoral: "Titular" }
          ]
        });
      }, 300));
    }
    return this._fetch('/deputados/pesquisa', {
      method: 'POST',
      body: JSON.stringify({ nome })
    });
  }

  static async getPerfilDeputado(id) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          id_deputado: id,
          nome: 'João Silva',
          partido: 'PL',
          uf: 'SP',
          escolaridade: 'Superior Completo',
          data_nascimento: '15/03/1975',
          email: 'dep.joaosilva@camara.leg.br',
          telefone: '(61) 3215-0000',
          endereco: 'Gabinete 123 - Anexo IV',
          indice_eficiencia: 8.5,
          total_deputados: 513,
          posicao_ranking: 42
        });
      }, 300));
    }
    return this._fetch(`/deputados/${id}`);
  }

  static async getPerfilDesempenho(id) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          id_deputado: id,
          indice_eficiencia: 626.7745,
          beneficio_score: 185.3,
          score_proposicoes: 120.5,
          total_proposicoes: 15,
          score_plenario: 40.0,
          score_comissoes: 35.0,
          fator_atividade: 1.25,
          plenario_pct_presenca: 95.5,
          plenario_presencas: 100,
          plenario_ausencias_justificadas: 2,
          plenario_ausencias_nao_justificadas: 3,
          comissoes_pct_presenca: 88.0,
          comissoes_presencas: 50,
          comissoes_ausencias_justificadas: 5,
          comissoes_ausencias_nao_justificadas: 2
        });
      }, 300));
    }
    return this._fetch(`/deputados/${id}/desempenho`);
  }

  static async getBeneficioRankingPosition(id) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve({ posicao: 42, total: 513 });
      }, 300));
    }
    return this._fetch(`/deputados/${id}/ranking-position`);
  }

  static async getPerfilNuvemPalavras(id) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve([
          { text: 'Segurança', value: 100 },
          { text: 'Educação', value: 80 },
          { text: 'Saúde', value: 60 },
          { text: 'Economia', value: 50 },
          { text: 'Infraestrutura', value: 40 }
        ]);
      }, 300));
    }
    return this._fetch(`/deputados/${id}/nuvem`);
  }

  static async getPerfilGastosTipo(id) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve([
          { tipo_gasto: 'Passagens Aéreas', total_gasto: 150000 },
          { tipo_gasto: 'Divulgação da Atividade Parlamentar', total_gasto: 80000 },
          { tipo_gasto: 'Manutenção de Escritório', total_gasto: 45000 },
          { tipo_gasto: 'Combustível', total_gasto: 20000 },
          { tipo_gasto: 'Telefonia', total_gasto: 5000 }
        ]);
      }, 300));
    }
    return this._fetch(`/deputados/${id}/gastos-tipo`);
  }

  static async getPerfilFornecedores(id) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        resolve([
          { fornecedor_nome: 'TAM LINHAS AEREAS S/A', total_gasto: 85000 },
          { fornecedor_nome: 'GOL LINHAS AEREAS S.A.', total_gasto: 65000 },
          { fornecedor_nome: 'Grafica Brasil LTDA', total_gasto: 40000 },
          { fornecedor_nome: 'Posto Estrela', total_gasto: 15000 },
          { fornecedor_nome: 'Imobiliaria Centro', total_gasto: 12000 }
        ]);
      }, 300));
    }
    return this._fetch(`/deputados/${id}/fornecedores`);
  }

  static async getPerfilVotacoes(id, { pagina = 1, itensPorPagina = 5, filtroTema = 'Todos', busca = '' } = {}) {
    if (USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => {
        const MOCK_VOTACOES = [
          { id: 101, data_votacao: '15/10/2023', sigla: 'PL', numero: 1234, descricao: 'PL 1234/2023 - Reforma Tributária', ementa: 'Altera o sistema tributário nacional...', voto: 'Sim', tema: 'Economia' },
          { id: 102, data_votacao: '22/09/2023', sigla: 'PEC', numero: 45, descricao: 'PEC 45/2019 - Teto de Gastos', ementa: 'Modifica regras fiscais...', voto: 'Não', tema: 'Economia' },
          { id: 103, data_votacao: '05/08/2023', sigla: 'PL', numero: 567, descricao: 'PL 567/2023 - Educação Básica', ementa: 'Aumenta repasses para estados...', voto: 'Sim', tema: 'Educação' },
          { id: 104, data_votacao: '12/07/2023', sigla: 'PL', numero: 890, descricao: 'PL 890/2023 - Segurança nas Fronteiras', ementa: 'Aumenta efetivo nas fronteiras...', voto: 'Sim', tema: 'Segurança' },
          { id: 105, data_votacao: '30/06/2023', sigla: 'MP', numero: 1150, descricao: 'MP 1150/2023 - Meio Ambiente', ementa: 'Altera o código florestal...', voto: 'Não', tema: 'Meio Ambiente' }
        ];

        let filtradas = MOCK_VOTACOES.filter(v => {
          if (filtroTema !== 'Todos' && v.tema !== filtroTema) return false;
          if (busca && !v.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
          return true;
        });

        resolve({
          data: filtradas,
          total: filtradas.length,
          total_paginas: 1,
          temas_disponiveis: ['Todos', 'Economia', 'Educação', 'Segurança', 'Meio Ambiente']
        });
      }, 300));
    }

    return this._fetch(`/deputados/${id}/votacoes`, {
      method: 'POST',
      body: JSON.stringify({ pagina, itensPorPagina, filtroTema, busca })
    });
  }
}

export default DashboardAdapter;
