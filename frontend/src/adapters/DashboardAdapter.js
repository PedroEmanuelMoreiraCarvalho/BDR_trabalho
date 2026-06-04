const API_BASE = 'http://localhost:3000/api';

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

  // Retorna os dados da aba "Visão Geral" - Ranking
  static async getVisaoGeralRanking({ pagina = 1, itensPorPagina = 10, filtroPartido = 'Todos', filtroUF = 'Todos', metrica = 'eficiencia', ordem = 'desc' } = {}) {
    return this._fetch('/ranking', {
      method: 'POST',
      body: JSON.stringify({ pagina, itensPorPagina, filtroPartido, filtroUF, metrica, ordem })
    });
  }

  // Retorna os dados da aba "Visão Geral" - Escolaridade
  static async getVisaoGeralEscolaridade() {
    return this._fetch('/escolaridade');
  }

  // Retorna os dados da aba "Visão Geral" - Fornecedores
  static async getVisaoGeralFornecedores() {
    return this._fetch('/fornecedores');
  }

  // ==========================================
  // Aba "Visão Partidária"
  // ==========================================

  static async getVisaoPartidariaAlinhamento() {
    return this._fetch('/alinhamento-partidario');
  }

  static async getVisaoPartidariaComparacao() {
    return this._fetch('/comparacao-partidaria');
  }

  static async getVisaoPartidariaNuvem(partido) {
    return this._fetch(`/partidos/${partido}/nuvem`);
  }

  // ==========================================
  // Aba "Perfil do Deputado"
  // ==========================================

  static async getPerfilDeputado(id) {
    return this._fetch(`/deputados/${id}`);
  }

  static async getPerfilNuvemPalavras(id) {
    return this._fetch(`/deputados/${id}/nuvem`);
  }

  static async getPerfilGastosTipo(id) {
    return this._fetch(`/deputados/${id}/gastos-tipo`);
  }

  static async getPerfilFornecedores(id) {
    return this._fetch(`/deputados/${id}/fornecedores`);
  }

  static async getPerfilVotacoes(id, { pagina = 1, itensPorPagina = 5, filtroTema = 'Todos', busca = '' } = {}) {
    return this._fetch(`/deputados/${id}/votacoes`, {
      method: 'POST',
      body: JSON.stringify({ pagina, itensPorPagina, filtroTema, busca })
    });
  }
}

export default DashboardAdapter;
