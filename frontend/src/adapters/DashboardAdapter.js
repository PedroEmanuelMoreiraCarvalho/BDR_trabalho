class DashboardAdapter {
  // Retorna os dados da aba "Visão Geral" - Gastos
  static async getVisaoGeralGastos() {
    // Simula um delay de API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { name: 'Dep. A', gastos: 45000, partido: 'PL', uf: 'SP' },
          { name: 'Dep. B', gastos: 42000, partido: 'PT', uf: 'MG' },
          { name: 'Dep. C', gastos: 39000, partido: 'PSOL', uf: 'RJ' },
          { name: 'Dep. D', gastos: 35000, partido: 'UNIÃO', uf: 'SP' },
          { name: 'Dep. E', gastos: 32000, partido: 'PL', uf: 'SC' },
          { name: 'Dep. F', gastos: 29000, partido: 'PP', uf: 'PR' },
          { name: 'Dep. G', gastos: 27000, partido: 'PT', uf: 'BA' },
          { name: 'Dep. H', gastos: 24000, partido: 'MDB', uf: 'RS' },
          { name: 'Dep. I', gastos: 21000, partido: 'PSB', uf: 'PE' },
          { name: 'Dep. J', gastos: 19000, partido: 'PDT', uf: 'CE' },
          { name: 'Dep. K', gastos: 16000, partido: 'PL', uf: 'RJ' },
          { name: 'Dep. L', gastos: 14000, partido: 'PT', uf: 'SP' },
          { name: 'Dep. M', gastos: 12000, partido: 'PSOL', uf: 'MG' },
          { name: 'Dep. N', gastos: 10500, partido: 'UNIÃO', uf: 'BA' },
          { name: 'Dep. O', gastos: 9000, partido: 'PP', uf: 'RS' },
          { name: 'Dep. P', gastos: 7500, partido: 'MDB', uf: 'SC' },
          { name: 'Dep. Q', gastos: 6000, partido: 'PSB', uf: 'PR' },
          { name: 'Dep. R', gastos: 4500, partido: 'PDT', uf: 'PE' },
          { name: 'Dep. S', gastos: 3000, partido: 'PL', uf: 'CE' },
          { name: 'Dep. T', gastos: 1500, partido: 'PT', uf: 'SP' },
        ]);
      }, 300);
    });
  }

  // Retorna os dados da aba "Visão Geral" - Escolaridade
  static async getVisaoGeralEscolaridade() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { escolaridade: 'Superior Completo', total_deputados: 405 },
          { escolaridade: 'Pós-Graduação', total_deputados: 52 },
          { escolaridade: 'Ensino Médio', total_deputados: 45 },
          { escolaridade: 'Superior Incompleto', total_deputados: 11 },
        ]);
      }, 300);
    });
  }

  // Retorna os dados da aba "Visão Geral" - Fornecedores
  static async getVisaoGeralFornecedores() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { fornecedor_nome: 'TAM LINHAS AEREAS S/A', cnpj: '02.012.862/0001-60', total_contrato: 1250400 },
          { fornecedor_nome: 'GOL LINHAS AEREAS S.A.', cnpj: '07.575.651/0001-59', total_contrato: 980300 },
          { fornecedor_nome: 'AZUL LINHAS AEREAS', cnpj: '09.296.295/0001-60', total_contrato: 850100 },
          { fornecedor_nome: 'TELEFONICA BRASIL S.A.', cnpj: '02.558.157/0001-62', total_contrato: 450000 },
          { fornecedor_nome: 'CORREIOS', cnpj: '34.028.316/0001-03', total_contrato: 320000 },
          { fornecedor_nome: 'POSTO DA TORRE LTDA', cnpj: '03.746.488/0001-00', total_contrato: 150000 },
          { fornecedor_nome: 'LOCALIZA RENT A CAR S/A', cnpj: '16.670.085/0001-55', total_contrato: 120000 },
        ]);
      }, 300);
    });
  }

  // ==========================================
  // Aba "Visão Partidária"
  // ==========================================

  static async getVisaoPartidariaAlinhamento() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { partido: 'PT', total_considerado: 2500, total_alinhado: 2450, perc_alinhamento: 98.0 },
          { partido: 'PL', total_considerado: 3200, total_alinhado: 3040, perc_alinhamento: 95.0 },
          { partido: 'PSOL', total_considerado: 600, total_alinhado: 564, perc_alinhamento: 94.0 },
          { partido: 'PCdoB', total_considerado: 300, total_alinhado: 279, perc_alinhamento: 93.0 },
          { partido: 'NOVO', total_considerado: 150, total_alinhado: 135, perc_alinhamento: 90.0 },
          { partido: 'PP', total_considerado: 2100, total_alinhado: 1785, perc_alinhamento: 85.0 },
          { partido: 'MDB', total_considerado: 1800, total_alinhado: 1440, perc_alinhamento: 80.0 },
          { partido: 'UNIÃO', total_considerado: 2400, total_alinhado: 1800, perc_alinhamento: 75.0 },
          { partido: 'PSDB', total_considerado: 1100, total_alinhado: 770, perc_alinhamento: 70.0 },
          { partido: 'PDT', total_considerado: 950, total_alinhado: 617, perc_alinhamento: 65.0 },
          { partido: 'REPUBLICANOS', total_considerado: 1600, total_alinhado: 960, perc_alinhamento: 60.0 }
        ]);
      }, 300);
    });
  }

  static async getVisaoPartidariaComparacao() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { partido: 'PL', frequencia: 91.5, proposicoes: 4500, gastos: 125000000 },
          { partido: 'PT', frequencia: 93.2, proposicoes: 4100, gastos: 118000000 },
          { partido: 'UNIÃO', frequencia: 88.5, proposicoes: 3200, gastos: 95000000 },
          { partido: 'PP', frequencia: 89.0, proposicoes: 2800, gastos: 82000000 },
          { partido: 'MDB', frequencia: 87.5, proposicoes: 2500, gastos: 75000000 },
          { partido: 'PSD', frequencia: 86.0, proposicoes: 2100, gastos: 70000000 },
          { partido: 'REPUBLICANOS', frequencia: 88.2, proposicoes: 1900, gastos: 65000000 },
          { partido: 'PSB', frequencia: 90.1, proposicoes: 1500, gastos: 45000000 },
          { partido: 'PSOL', frequencia: 95.5, proposicoes: 1800, gastos: 35000000 },
          { partido: 'PDT', frequencia: 89.8, proposicoes: 1200, gastos: 30000000 },
        ]);
      }, 300);
    });
  }

  static async getVisaoPartidariaNuvem(partido) {
    return new Promise((resolve) => {
      setTimeout(() => {
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

        const fallbackNuvem = [
          { text: 'Orçamento Público', value: 70 }, { text: 'Reforma Administrativa', value: 60 }, { text: 'Teto de Gastos', value: 50 }, { text: 'Obras Públicas', value: 45 }, { text: 'Emendas', value: 30 }
        ];

        resolve(MOCK_NUVEM_PARTIDOS[partido] || fallbackNuvem);
      }, 300);
    });
  }

  // ==========================================
  // Aba "Perfil do Deputado"
  // ==========================================

  static async getPerfilDeputado(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id_deputado: id,
          nome: id === '12345' ? 'Nikolas Ferreira' : 'Guilherme Boulos',
          partido: id === '12345' ? 'PL' : 'PSOL',
          uf: id === '12345' ? 'MG' : 'SP',
          escolaridade: 'Superior Completo',
          data_nascimento: id === '12345' ? '30/05/1996' : '19/06/1982',
          email: id === '12345' ? 'dep.nikolasferreira@camara.leg.br' : 'dep.guilhermeboulos@camara.leg.br',
          telefone: '(61) 3215-5000',
          endereco: 'Câmara dos Deputados, Anexo IV, Gabinete 123 - Brasília, DF',
          custo_beneficio: id === '12345' ? 8.5 : 7.2
        });
      }, 300);
    });
  }

  static async getPerfilNuvemPalavras(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { text: 'Educação Básica', value: 85 },
          { text: 'Piso Salarial', value: 75 },
          { text: 'Isenção Fiscal', value: 65 },
          { text: 'Saúde Pública', value: 60 },
          { text: 'Segurança', value: 55 },
          { text: 'Reforma Tributária', value: 45 },
          { text: 'Agricultura Familiar', value: 40 },
          { text: 'Armas de Fogo', value: 35 },
          { text: 'Tecnologia', value: 30 },
          { text: 'Violência Doméstica', value: 25 },
          { text: 'Energia Solar', value: 20 },
          { text: 'Meio Ambiente', value: 15 },
        ]);
      }, 300);
    });
  }

  static async getPerfilGastosTipo(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { tipo_gasto: 'Divulgação Parlamentar', total_gasto: 154000 },
          { tipo_gasto: 'Passagens Aéreas', total_gasto: 86000 },
          { tipo_gasto: 'Manutenção de Escritório', total_gasto: 45000 },
          { tipo_gasto: 'Combustíveis', total_gasto: 25000 },
          { tipo_gasto: 'Consultorias', total_gasto: 18000 },
          { tipo_gasto: 'Alimentação', total_gasto: 12500 },
          { tipo_gasto: 'Serviços de Táxi e Pedágio', total_gasto: 5200 },
          { tipo_gasto: 'Assinatura de Publicações', total_gasto: 1800 },
        ]);
      }, 300);
    });
  }

  static async getPerfilFornecedores(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { fornecedor_nome: 'POSTO DA TORRE LTDA', total_gasto: 45000 },
          { fornecedor_nome: 'TAM LINHAS AEREAS S/A.', total_gasto: 32000 },
          { fornecedor_nome: 'GOL LINHAS AEREAS S.A.', total_gasto: 28000 },
          { fornecedor_nome: 'GRAFICA E EDITORA ALFA', total_gasto: 15000 },
          { fornecedor_nome: 'LOCALIZA RENT A CAR', total_gasto: 12000 },
        ]);
      }, 300);
    });
  }

  static async getPerfilVotacoes(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, data_votacao: '12/05/2024', descricao: 'PL 1234/2024 - Nova lei de diretrizes educacionais', voto: 'Sim', tema: 'Educação', ementa: 'Altera as diretrizes e bases da educação nacional para incluir novas tecnologias no currículo básico do ensino fundamental.' },
          { id: 2, data_votacao: '20/04/2024', descricao: 'PEC 45/2023 - Reforma Tributária', voto: 'Não', tema: 'Tributário', ementa: 'Altera o Sistema Tributário Nacional para simplificar impostos sobre o consumo e criar o Imposto sobre Bens e Serviços (IBS).' },
          { id: 3, data_votacao: '15/03/2024', descricao: 'MPV 1150/2023 - Alterações no código florestal', voto: 'Abstenção', tema: 'Meio Ambiente', ementa: 'Dispõe sobre prazos e regras do Programa de Regularização Ambiental (PRA) e alterações em áreas de preservação permanente.' },
          { id: 4, data_votacao: '28/02/2024', descricao: 'PL 567/2024 - Piso salarial dos professores', voto: 'Sim', tema: 'Educação', ementa: 'Estabelece o novo piso salarial profissional nacional para os profissionais do magistério público da educação básica.' },
          { id: 5, data_votacao: '10/01/2024', descricao: 'PLP 99/2023 - Arcabouço Fiscal', voto: 'Sim', tema: 'Economia', ementa: 'Institui o regime fiscal sustentável para garantir a estabilidade macroeconômica e criar condições para o desenvolvimento socioeconômico.' },
          { id: 6, data_votacao: '05/12/2023', descricao: 'PL 890/2023 - Incentivo à Energia Solar', voto: 'Sim', tema: 'Meio Ambiente', ementa: 'Cria subsídios para a instalação de painéis solares em residências de baixa renda.' },
          { id: 7, data_votacao: '20/11/2023', descricao: 'PEC 10/2023 - Imunidade Parlamentar', voto: 'Não', tema: 'Direito', ementa: 'Altera as regras sobre prisão em flagrante e foro privilegiado para deputados.' },
          { id: 8, data_votacao: '15/10/2023', descricao: 'MPV 1000/2023 - Auxílio Emergencial', voto: 'Sim', tema: 'Economia', ementa: 'Prorroga o auxílio emergencial para famílias em situação de vulnerabilidade.' },
          { id: 9, data_votacao: '02/09/2023', descricao: 'PL 345/2023 - Privatização dos Correios', voto: 'Não', tema: 'Economia', ementa: 'Autoriza a desestatização da Empresa Brasileira de Correios e Telégrafos (ECT).' },
          { id: 10, data_votacao: '10/08/2023', descricao: 'PL 111/2023 - Câmeras Policiais', voto: 'Sim', tema: 'Segurança', ementa: 'Obriga o uso de câmeras corporais por policiais em serviço.' },
          { id: 11, data_votacao: '05/07/2023', descricao: 'PEC 20/2023 - Fundo Partidário', voto: 'Abstenção', tema: 'Política', ementa: 'Aumenta o repasse de verbas públicas para o Fundo Eleitoral.' },
          { id: 12, data_votacao: '18/06/2023', descricao: 'PL 789/2023 - Demarcação de Terras', voto: 'Não', tema: 'Meio Ambiente', ementa: 'Estabelece o marco temporal para a demarcação de terras indígenas no Brasil.' },
        ]);
      }, 300);
    });
  }
}

export default DashboardAdapter;
