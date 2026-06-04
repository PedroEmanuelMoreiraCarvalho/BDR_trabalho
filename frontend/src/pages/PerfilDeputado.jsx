import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, MapPin, BookOpen, CheckCircle, XCircle, MinusCircle, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const PerfilDeputado = () => {
  const { id } = useParams();

  // ==========================================
  // ESTADOS DOS DADOS
  // ==========================================
  const [perfil, setPerfil] = useState(null);
  const [nuvemPalavras, setNuvemPalavras] = useState([]);
  const [gastosTipo, setGastosTipo] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [votacoes, setVotacoes] = useState([]);
  
  // Estado para filtro de votações
  const [filtroTema, setFiltroTema] = useState('Todos');

  // ==========================================
  // SIMULAÇÃO DE CHAMADA À API (useEffect)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        /*
         * FUTURO: Integração com o Backend
         * const resPerfil = await axios.get(`/api/deputados/${id}`);
         * setPerfil(resPerfil.data);
         * 
         * const resNuvem = await axios.get(`/api/deputados/${id}/temas`);
         * setNuvemPalavras(resNuvem.data);
         * 
         * const resGastos = await axios.get(`/api/deputados/${id}/gastos-por-tipo`);
         * setGastosTipo(resGastos.data);
         * 
         * const resForn = await axios.get(`/api/deputados/${id}/fornecedores`);
         * setFornecedores(resForn.data);
         * 
         * const resVotos = await axios.get(`/api/deputados/${id}/votacoes`);
         * setVotacoes(resVotos.data);
         */

        // MOCK: Perfil Básico
        setPerfil({
          id_deputado: id,
          nome: id === '12345' ? 'Nikolas Ferreira' : 'Guilherme Boulos',
          partido: id === '12345' ? 'PL' : 'PSOL',
          uf: id === '12345' ? 'MG' : 'SP',
          escolaridade: 'Superior Completo'
        });

        // MOCK: Pergunta 2 - Eixo de Atuação (Nuvem de Palavras)
        setNuvemPalavras([
          { text: 'Educação', value: 85 },
          { text: 'Saúde Pública', value: 65 },
          { text: 'Economia', value: 45 },
          { text: 'Segurança', value: 40 },
          { text: 'Tributário', value: 35 },
          { text: 'Meio Ambiente', value: 25 },
          { text: 'Infraestrutura', value: 20 },
          { text: 'Tecnologia', value: 15 },
          { text: 'Cultura', value: 10 },
        ]);

        // MOCK: Pergunta 13 - Com o que o deputado mais gasta?
        setGastosTipo([
          { tipo_gasto: 'Divulgação Parlamentar', total_gasto: 154000 },
          { tipo_gasto: 'Passagens Aéreas', total_gasto: 86000 },
          { tipo_gasto: 'Manutenção de Escritório', total_gasto: 45000 },
          { tipo_gasto: 'Combustíveis', total_gasto: 25000 },
          { tipo_gasto: 'Consultorias', total_gasto: 18000 },
        ]);

        // MOCK: Pergunta 12 - Principais Fornecedores
        setFornecedores([
          { fornecedor_nome: 'POSTO DA TORRE LTDA', total_gasto: 45000 },
          { fornecedor_nome: 'TAM LINHAS AEREAS S/A.', total_gasto: 32000 },
          { fornecedor_nome: 'GOL LINHAS AEREAS S.A.', total_gasto: 28000 },
          { fornecedor_nome: 'GRAFICA E EDITORA ALFA', total_gasto: 15000 },
          { fornecedor_nome: 'LOCALIZA RENT A CAR', total_gasto: 12000 },
        ]);

        // MOCK: Pergunta 3 - Votações Recentes
        setVotacoes([
          { id: 1, data_votacao: '12/05/2024', descricao: 'PL 1234/2024 - Nova lei de diretrizes educacionais', voto: 'Sim', tema: 'Educação' },
          { id: 2, data_votacao: '20/04/2024', descricao: 'PEC 45/2023 - Reforma Tributária', voto: 'Não', tema: 'Tributário' },
          { id: 3, data_votacao: '15/03/2024', descricao: 'MPV 1150/2023 - Alterações no código florestal', voto: 'Abstenção', tema: 'Meio Ambiente' },
          { id: 4, data_votacao: '28/02/2024', descricao: 'PL 567/2024 - Piso salarial dos professores', voto: 'Sim', tema: 'Educação' },
          { id: 5, data_votacao: '10/01/2024', descricao: 'PLP 99/2023 - Arcabouço Fiscal', voto: 'Sim', tema: 'Economia' },
        ]);

      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };

    fetchData();
  }, [id]);

  const COLORS_PIE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const renderMockWordCloud = () => {
    if (nuvemPalavras.length === 0) return null;
    const maxVal = Math.max(...nuvemPalavras.map(w => w.value));
    const minVal = Math.min(...nuvemPalavras.map(w => w.value));
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
        {nuvemPalavras.map((word, i) => {
          const size = 14 + ((word.value - minVal) / (maxVal - minVal)) * 36;
          return (
            <span 
              key={i} 
              style={{ 
                fontSize: `${size}px`, 
                fontWeight: 'bold', 
                color: COLORS_PIE[i % COLORS_PIE.length],
                transition: 'transform 0.2s',
                cursor: 'default',
                opacity: 0.9
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.opacity = '1'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.9'; }}
              title={`Relevância do Tema: ${word.value}`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    );
  };

  // Filtragem da Timeline
  const votacoesFiltradas = useMemo(() => {
    if (filtroTema === 'Todos') return votacoes;
    return votacoes.filter(v => v.tema === filtroTema);
  }, [votacoes, filtroTema]);

  const temasDisponiveis = ['Todos', ...new Set(votacoes.map(v => v.tema))];

  const getVotoIcon = (voto) => {
    if (voto === 'Sim') return <CheckCircle size={18} style={{ color: '#10b981' }} />;
    if (voto === 'Não') return <XCircle size={18} style={{ color: '#ef4444' }} />;
    return <MinusCircle size={18} style={{ color: '#f59e0b' }} />;
  };

  if (!perfil) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Carregando perfil...</div>;

  return (
    <div className="dashboard-container">
      {/* Botão Voltar e Cabeçalho do Perfil */}
      <Link to="/parlamentares" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={18} />
        <span>Voltar para Busca</span>
      </Link>

      <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserIcon size={48} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{perfil.nome}</h1>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>
                {perfil.partido}
              </span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> {perfil.uf}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} /> {perfil.escolaridade}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', opacity: 0.6 }}>
              ID: {perfil.id_deputado}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal (Palavras e Gastos) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Pergunta 2: Eixo de Atuação */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Eixo de Atuação (Temas)</h2>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            Baseado na quantidade de proposições que o deputado foi autor.
          </p>
          <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%' }}>
              {renderMockWordCloud()}
            </div>
          </div>
        </div>

        {/* Pergunta 13: Com o que o deputado mais gasta? */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Distribuição de Gastos</h2>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            Valor líquido total gasto pelo parlamentar dividido por categoria.
          </p>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gastosTipo}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total_gasto"
                  nameKey="tipo_gasto"
                >
                  {gastosTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Secundário (Fornecedores e Votações) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Pergunta 12: Principais Fornecedores */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Principais Fornecedores</h2>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            Top 5 empresas/pessoas que mais receberam verba do deputado.
          </p>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {fornecedores.map((fornecedor, index) => {
              const maxVal = fornecedores[0]?.total_gasto || 1;
              const percent = (fornecedor.total_gasto / maxVal) * 100;
              return (
                <div key={index} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {index + 1}. {fornecedor.fornecedor_nome}
                    </span>
                    <span className="text-gradient" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      R$ {(fornecedor.total_gasto / 1000).toLocaleString('pt-BR')}k
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pergunta 3: Timeline de Votações */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Histórico de Votações</h2>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Como o deputado votou recentemente.</p>
            </div>
            {/* Filtro por Tema */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px' }}>
              <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
              <select 
                value={filtroTema} 
                onChange={e => setFiltroTema(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                {temasDisponiveis.map(tema => (
                  <option key={tema} value={tema} style={{ background: 'var(--bg-surface)' }}>{tema}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '350px', paddingRight: '8px' }} className="custom-scrollbar">
            {votacoesFiltradas.length > 0 ? votacoesFiltradas.map(voto => (
              <div key={voto.id} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '60px' }}>
                  {getVotoIcon(voto.voto)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: voto.voto === 'Sim' ? '#10b981' : voto.voto === 'Não' ? '#ef4444' : '#f59e0b' }}>
                    {voto.voto.toUpperCase()}
                  </span>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{voto.data_votacao}</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{voto.tema}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {voto.descricao}
                  </p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>Nenhuma votação encontrada para o tema selecionado.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerfilDeputado;
