const express = require('express');
const cors = require('cors');
const dbAdapter = require('./DatabaseAdapter'); // Importa a nossa nova classe

const app = express();
const port = process.env.PORT || 3000; // changed to avoid port conflict

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    // 1. Inicia a conexão usando a classe Adapter
    await dbAdapter.connect();

    // 2. Rota de teste
    app.get('/api/teste-conexao', async (req, res) => {
      try {
        // Agora chamamos os métodos do adapter em vez de fazer queries soltas aqui
        const horaAtual = await dbAdapter.getHoraAtual();

        res.json({
          status: 'sucesso',
          mensagem: 'A API está conectada ao banco usando a classe DatabaseAdapter!',
          data_do_banco: horaAtual
        });

        // Duplicate ranking-beneficio route removed (handled later correctly)

      } catch (error) {
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno no banco' });
      }
    });

    // 2.5 Rota POST para soma total de gastos (com filtros)
    app.post('/api/total-gastos', async (req, res) => {
      try {
        const { filtroPartido = 'Todos', filtroUF = 'Todos' } = req.body;
        const dados = await dbAdapter.getTotalGastosGeral({ filtroPartido, filtroUF });
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/total-gastos:', error);
        res.status(500).json({ erro: 'Falha ao buscar o total global de gastos' });
      }
    });

    // 3. Rota POST para Gastos com paginação e filtros
    app.post('/api/gastos', async (req, res) => {
      try {
        const page = parseInt(req.body.pagina) || 1;
        const limit = parseInt(req.body.itensPorPagina) || 10;
        const ordem = req.body.ordem || 'desc';
        const { filtroPartido = 'Todos', filtroUF = 'Todos' } = req.body;

        const dados = await dbAdapter.getVisaoGeralGastos(page, limit, ordem, filtroPartido, filtroUF);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/gastos:', error);
        res.status(500).json({ erro: 'Falha ao buscar os gastos no banco de dados' });
      }
    });

    // 4.2. Rota POST para o Ranking de Benefícios (paginação e filtros)
    app.post('/api/ranking-beneficio', async (req, res) => {
      try {
        const parametros = {
          pagina: req.body.pagina || 1,
          itensPorPagina: req.body.itensPorPagina || 10,
          ordem: req.body.ordem || 'desc',
          filtroPartido: req.body.filtroPartido || 'Todos',
          filtroUF: req.body.filtroUF || 'Todos'
        };
        const dados = await dbAdapter.getBeneficioRanking(parametros);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/ranking-beneficio:', error);
        res.status(500).json({ erro: 'Falha ao buscar o ranking de benefícios no banco de dados' });
      }
    });

    // 5. Rota GET para Escolaridade
    app.get('/api/escolaridade', async (req, res) => {
      try {
        const dados = await dbAdapter.getVisaoGeralEscolaridade();
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/escolaridade:', error);
        res.status(500).json({ erro: 'Falha ao buscar escolaridade no banco de dados' });
      }
    });

    // 5.1 Rota GET para Correlação de Escolaridade
    app.get('/api/correlacao-escolaridade', async (req, res) => {
      try {
        const dados = await dbAdapter.getCorrelacaoEscolaridade();
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/correlacao-escolaridade:', error);
        res.status(500).json({ erro: 'Falha ao buscar correlação de escolaridade no banco de dados' });
      }
    });

    // 6. Rota GET para Fornecedores
    app.get('/api/fornecedores', async (req, res) => {
      try {
        const dados = await dbAdapter.getVisaoGeralFornecedores();
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/fornecedores:', error);
        res.status(500).json({ erro: 'Falha ao buscar fornecedores no banco de dados' });
      }
    });

    // 7. Rota GET para Alinhamento Partidário
    app.get('/api/alinhamento-partidario', async (req, res) => {
      try {
        const dados = await dbAdapter.getVisaoPartidariaAlinhamento();
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/alinhamento-partidario:', error);
        res.status(500).json({ erro: 'Falha ao buscar alinhamento partidário' });
      }
    });

    // 8. Rota GET para Comparação Partidária
    app.get('/api/comparacao-partidaria', async (req, res) => {
      try {
        const dados = await dbAdapter.getVisaoPartidariaComparacao();
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/comparacao-partidaria:', error);
        res.status(500).json({ erro: 'Falha ao buscar comparação partidária' });
      }
    });

    // 8.1. Rota GET para Nuvem de Palavras do Partido
    app.get('/api/partidos/:sigla/nuvem', async (req, res) => {
      try {
        const dados = await dbAdapter.getVisaoPartidariaNuvem(req.params.sigla);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/partidos/:sigla/nuvem:', error);
        res.status(500).json({ erro: 'Falha ao buscar nuvem de palavras do partido' });
      }
    });

    // 9. Rota GET para o Perfil do Deputado
    app.get('/api/deputados/:id', async (req, res) => {
      try {
        const dados = await dbAdapter.getPerfilDeputado(req.params.id);
        if (!dados) {
          return res.status(404).json({ erro: 'Deputado não encontrado' });
        }
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/:id:', error);
        res.status(500).json({ erro: 'Falha ao buscar perfil do deputado' });
      }
    });

    // 9.5 Rota GET para o Desempenho e Presença do Deputado (dados crus)
    app.get('/api/deputados/:id/desempenho', async (req, res) => {
      try {
        const dados = await dbAdapter.getPerfilDesempenho(req.params.id);
        if (!dados) {
          return res.status(404).json({ erro: 'Desempenho não encontrado' });
        }
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/:id/desempenho:', error);
        res.status(500).json({ erro: 'Falha ao buscar desempenho do deputado' });
      }
    });

    // 9.5 Rota GET para a Posição no Ranking de Benefício
    app.get('/api/deputados/:id/ranking-position', async (req, res) => {
      try {
        const dados = await dbAdapter.getBeneficioRankingPosition(req.params.id);
        if (!dados) {
          return res.status(404).json({ erro: 'Posição no ranking não encontrada' });
        }
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/:id/ranking-position:', error);
        res.status(500).json({ erro: 'Falha ao buscar posição no ranking' });
      }
    });
    // 10. Rota GET para a Nuvem de Palavras do Deputado
    app.get('/api/deputados/:id/nuvem', async (req, res) => {
      try {
        const dados = await dbAdapter.getPerfilNuvemPalavras(req.params.id);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/:id/nuvem:', error);
        res.status(500).json({ erro: 'Falha ao buscar nuvem de palavras' });
      }
    });

    // 11. Rota GET para Gastos por Tipo do Deputado
    app.get('/api/deputados/:id/gastos-tipo', async (req, res) => {
      try {
        const dados = await dbAdapter.getPerfilGastosTipo(req.params.id);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/:id/gastos-tipo:', error);
        res.status(500).json({ erro: 'Falha ao buscar gastos por tipo' });
      }
    });

    // 12. Rota GET para Fornecedores do Deputado
    app.get('/api/deputados/:id/fornecedores', async (req, res) => {
      try {
        const dados = await dbAdapter.getPerfilFornecedores(req.params.id);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/:id/fornecedores:', error);
        res.status(500).json({ erro: 'Falha ao buscar fornecedores do deputado' });
      }
    });

    //13. Rota POST que retorna pesquisa de deputados por nome
    app.post('/api/deputados/pesquisa', async (req, res) => {
      try {
        const dados = await dbAdapter.getDeputadosPorNome(req.body.nome);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/pesquisa:', error);
        res.status(500).json({ erro: 'Falha ao buscar deputados por nome' });
      }
    });

    // 13.1. Rota POST para pesquisa de deputados por CPF
    app.post('/api/deputados/cpf', async (req, res) => {
      try {
        const cpf = req.body.cpf || '';
        const pagina = req.body.pagina || 1;
        const itensPorPagina = req.body.itensPorPagina || 10;
        const filtroPartido = req.body.filtroPartido || null;
        const filtroUF = req.body.filtroUF || null;

        // Construir opções de paginação e filtro
        const options = {
          partido: filtroPartido,
          uf: filtroUF,
          limit: itensPorPagina,
          offset: (pagina - 1) * itensPorPagina,
          exactMatch: false // busca por semelhança de prefixo
        };

        const dados = await dbAdapter.getDeputadosPorCPF(cpf, options);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/cpf:', error);
        res.status(500).json({ erro: 'Falha ao buscar deputados por CPF' });
      }
    });

    // 14. Rota POST para Votações do Deputado (com filtros e paginação)
    app.post('/api/deputados/:id/votacoes', async (req, res) => {
      try {
        const parametros = {
          pagina: req.body.pagina || 1,
          itensPorPagina: req.body.itensPorPagina || 5,
          filtroTema: req.body.filtroTema || 'Todos',
          busca: req.body.busca || ''
        };
        const dados = await dbAdapter.getPerfilVotacoes(req.params.id, parametros);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/deputados/:id/votacoes:', error);
        res.status(500).json({ erro: 'Falha ao buscar votações do deputado' });
      }
    });

    // 15. Inicia o servidor Express
    app.listen(port, () => {
      console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
      console.log(`👉 Teste a rota acessando no navegador: http://localhost:${port}/api/teste-conexao`);
    });

  } catch (error) {
    console.error('❌ Erro crítico ao iniciar o servidor:', error);
  }
}

startServer();
