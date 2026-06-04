const express = require('express');
const cors = require('cors');
const dbAdapter = require('./DatabaseAdapter'); // Importa a nossa nova classe

const app = express();
const port = 3000;

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
      } catch (error) {
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno no banco' });
      }
    });

    // 3. Rota de exemplo para Gastos
    app.get('/api/gastos', async (req, res) => {
      try {
        const dados = await dbAdapter.getVisaoGeralGastos();
        res.json(dados);
      } catch (error) {
        res.status(500).json({ erro: 'Falha ao buscar os gastos no banco de dados' });
      }
    });

    // 4. Rota POST para o Ranking Geral (Recebe os filtros no body)
    app.post('/api/ranking', async (req, res) => {
      try {
        // Os parâmetros virão do frontend através do req.body
        const parametros = {
          pagina: req.body.pagina || 1,
          itensPorPagina: req.body.itensPorPagina || 10,
          filtroPartido: req.body.filtroPartido || 'Todos',
          filtroUF: req.body.filtroUF || 'Todos',
          metrica: req.body.metrica || 'eficiencia',
          ordem: req.body.ordem || 'desc'
        };

        const dados = await dbAdapter.getVisaoGeralRanking(parametros);
        res.json(dados);
      } catch (error) {
        console.error('Erro na rota /api/ranking:', error);
        res.status(500).json({ erro: 'Falha ao buscar o ranking no banco de dados' });
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

    // 13. Rota POST para Votações do Deputado (com filtros e paginação)
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

    // 14. Inicia o servidor Express
    app.listen(port, () => {
      console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
      console.log(`👉 Teste a rota acessando no navegador: http://localhost:${port}/api/teste-conexao`);
    });

  } catch (error) {
    console.error('❌ Erro crítico ao iniciar o servidor:', error);
  }
}

startServer();
