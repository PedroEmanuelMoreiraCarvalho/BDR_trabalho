import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, MapPin, BookOpen, CheckCircle, XCircle, MinusCircle, Filter, Calendar, Mail, Phone, Building, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import DashboardAdapter from '../adapters/DashboardAdapter';

const PerfilDeputado = () => {
  const { id } = useParams();

  const [perfil, setPerfil] = useState(null);
  const [desempenho, setDesempenho] = useState(null);
  const [rankingPosition, setRankingPosition] = useState(null);
  const [nuvemPalavras, setNuvemPalavras] = useState([]);

  // Embaralha as 15 principais palavras para a nuvem de palavras
  const palavrasEmbaralhadas = useMemo(() => {
    return [...nuvemPalavras.slice(0, 10)].sort(() => Math.random() - 0.5);
  }, [nuvemPalavras]);
  const [gastosTipo, setGastosTipo] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [votacoes, setVotacoes] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [filtroTema, setFiltroTema] = useState('Todos');
  const [buscaVotacao, setBuscaVotacao] = useState('');
  const [ementaExpandida, setEmentaExpandida] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalVotacoes, setTotalVotacoes] = useState(0);
  const [temasDisponiveis, setTemasDisponiveis] = useState(['Todos']);
  const itensPorPagina = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const perfilData = await DashboardAdapter.getPerfilDeputado(id);
        setPerfil(perfilData);

        const desempenhoData = await DashboardAdapter.getPerfilDesempenho(id);
        setDesempenho(desempenhoData);

        const rankingData = await DashboardAdapter.getBeneficioRankingPosition(id);
        setRankingPosition(rankingData);

        const nuvemData = await DashboardAdapter.getPerfilNuvemPalavras(id);
        setNuvemPalavras(nuvemData);

        const gastosData = await DashboardAdapter.getPerfilGastosTipo(id);
        setGastosTipo(gastosData);

        const fornecedoresData = await DashboardAdapter.getPerfilFornecedores(id);
        setFornecedores(fornecedoresData);
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    let ignore = false;
    const fetchVotacoes = async () => {
      try {
        const votacoesData = await DashboardAdapter.getPerfilVotacoes(id, {
          pagina: paginaAtual,
          itensPorPagina,
          filtroTema,
          busca: buscaVotacao
        });
        if (!ignore) {
          setVotacoes(votacoesData.data);
          setTotalVotacoes(votacoesData.total);
          if (votacoesData.temas_disponiveis) {
            setTemasDisponiveis(votacoesData.temas_disponiveis);
          }
        }
      } catch (error) {
        if (!ignore) console.error("Erro ao buscar votações:", error);
      }
    };

    fetchVotacoes();
    
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    return () => { 
      ignore = true; 
      window.removeEventListener('resize', handleResize);
    };
  }, [id, paginaAtual, filtroTema, buscaVotacao]);

  const calcularPercentualRanking = (posicao, total) => {
    if (!posicao || !total) return '';
    const percentil = (posicao / total) * 100;
    if (percentil <= 50) {
      return `Entre os ${Math.ceil(percentil)}% mais eficientes da câmara`;
    } else {
      return `Entre os ${Math.floor(100 - percentil)}% menos eficientes da câmara`;
    }
  };

  const COLORS_PIE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const renderMockWordCloud = () => {
    const palavras = palavrasEmbaralhadas;
    if (palavras.length === 0) return null;
    const maxVal = Math.max(...palavras.map(w => w.value));
    const minVal = Math.min(...palavras.map(w => w.value));

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
        {palavras.map((word, i) => {
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

  const { gastosProcessados, valorTotalGastos } = useMemo(() => {
    if (!gastosTipo || gastosTipo.length === 0) return { gastosProcessados: [], valorTotalGastos: 0 };

    const total = gastosTipo.reduce((acc, curr) => acc + curr.total_gasto, 0);
    const sorted = [...gastosTipo].sort((a, b) => b.total_gasto - a.total_gasto);

    let processed = [];
    if (sorted.length > 5) {
      processed = sorted.slice(0, 5);
      const outrosTotal = sorted.slice(5).reduce((acc, curr) => acc + curr.total_gasto, 0);
      processed.push({ tipo_gasto: 'Outros', total_gasto: outrosTotal });
    } else {
      processed = sorted;
    }

    return { gastosProcessados: processed, valorTotalGastos: total };
  }, [gastosTipo]);



  const totalPaginas = Math.ceil(totalVotacoes / itensPorPagina);

  const getVotoIcon = (voto) => {
    if (voto === 'Sim') return <CheckCircle size={18} style={{ color: '#10b981' }} />;
    if (voto === 'Não') return <XCircle size={18} style={{ color: '#ef4444' }} />;
    return <MinusCircle size={18} style={{ color: '#f59e0b' }} />;
  };

  if (!perfil) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Carregando perfil...</div>;

  return (
    <div className="dashboard-container">
      <Link to="/parlamentares" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={18} />
        <span>Voltar para Busca</span>
      </Link>

      <div className="glass-card" style={{ padding: isMobile ? '24px 16px' : '32px', marginBottom: '24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '24px', textAlign: isMobile ? 'center' : 'left' }}>
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '4px solid var(--border-color)' }}>
          {perfil.url_foto_perfil ? (
            <img src={perfil.url_foto_perfil} alt={`Foto de ${perfil.nome}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          ) : (
            <UserIcon size={80} style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
        <div style={{ flex: 1, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', gap: isMobile ? '16px' : '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: isMobile ? 'center' : 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>{perfil.nome}</h1>
                {perfil.nome_civil && (
                  <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', textTransform: 'capitalize' }}>
                    {perfil.nome_civil.toLowerCase()}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '2px 10px', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>
                      {perfil.partido}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                      <MapPin size={16} /> {perfil.uf}
                    </span>
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={14} /> {perfil.escolaridade}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> Nascido em {perfil.data_nascimento}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {perfil.indice_eficiencia !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end', textAlign: isMobile ? 'center' : 'right', marginTop: isMobile ? '16px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Score de Eficiência</span>
                  <div onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Info size={18} />
                  </div>
                  {showInfo && (
                    <div style={{ position: 'absolute', top: '100%', right: '0px', marginTop: '8px', zIndex: 50, width: '360px', padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: '1.5', textAlign: 'left' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>Score de Eficiência Absoluto</strong><br />
                      Avalia o Custo-Benefício do deputado baseando-se em:
                      <ul style={{ paddingLeft: '20px', margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li><strong>Projetos de Lei:</strong> Maior peso para PECs, projetos aprovados e autoria principal.</li>
                        <li><strong>Assiduidade:</strong> Presença em Plenário e Comissões.</li>
                        <li><strong>Gastos:</strong> Deputados com alta produção e baixo custo recebem os melhores scores.</li>
                      </ul>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', lineHeight: '1', textShadow: '0 2px 10px rgba(16, 185, 129, 0.2)' }}>
                    {desempenho ? Number(desempenho.indice_eficiencia).toLocaleString('pt-BR', { maximumFractionDigits: 4 }) : 'Carregando...'}
                  </span>
                </div>
                <div style={{ fontSize: '1rem', color: (rankingPosition && (rankingPosition.posicao / rankingPosition.total) <= 0.5) ? '#10b981' : '#ef4444', marginTop: '6px', fontWeight: '600' }}>
                  {rankingPosition ? calcularPercentualRanking(rankingPosition.posicao, rankingPosition.total) : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {desempenho && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Métricas de Desempenho e Presença</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>

            {/* Proposições Apresentadas */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Proposições Apresentadas</span>
              <span className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>
                {desempenho.total_proposicoes ? desempenho.total_proposicoes.toLocaleString('pt-BR') : '0'}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Projetos, emendas, requerimentos, etc.
              </span>
            </div>

            {/* Efetividade Legislativa */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Efetividade Legislativa</span>
              <span className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>
                {desempenho.proposicoes_aprovadas !== undefined ? (Number(desempenho.proposicoes_aprovadas) + Number(desempenho.proposicoes_avancadas)).toLocaleString('pt-BR') : '0'}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Aprovadas em Definitivo:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{Number(desempenho.proposicoes_aprovadas || 0)}</span>
                  </div>
                  {desempenho.tipos_aprovadas_lista && desempenho.tipos_aprovadas_lista.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {desempenho.tipos_aprovadas_lista.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--bg-surface)', color: 'var(--text-primary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          {item.tipo}: {item.qtd}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Tramitação Avançada:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{Number(desempenho.proposicoes_avancadas || 0)}</span>
                  </div>
                  {desempenho.tipos_avancadas_lista && desempenho.tipos_avancadas_lista.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {desempenho.tipos_avancadas_lista.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--bg-surface)', color: 'var(--text-primary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          {item.tipo}: {item.qtd}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Presença em Plenário */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Presença no Plenário</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: desempenho.plenario_pct_presenca >= 80 ? '#10b981' : (desempenho.plenario_pct_presenca >= 50 ? '#f59e0b' : '#ef4444') }}>
                  {Number(desempenho.plenario_pct_presenca).toFixed(1)}%
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>({desempenho.plenario_presencas} sessões)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ausências Justificadas:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{desempenho.plenario_ausencias_justificadas}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ausências Não Justificadas:</span>
                  <span style={{ color: desempenho.plenario_ausencias_nao_justificadas > 0 ? '#ef4444' : 'var(--text-primary)', fontWeight: 500 }}>{desempenho.plenario_ausencias_nao_justificadas}</span>
                </div>
              </div>
            </div>

            {/* Presença em Comissões */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Presença em Comissões</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: desempenho.comissoes_pct_presenca >= 80 ? '#10b981' : (desempenho.comissoes_pct_presenca >= 50 ? '#f59e0b' : '#ef4444') }}>
                  {Number(desempenho.comissoes_pct_presenca).toFixed(1)}%
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>({desempenho.comissoes_presencas} sessões)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ausências Justificadas:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{desempenho.comissoes_ausencias_justificadas}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ausências Não Justificadas:</span>
                  <span style={{ color: desempenho.comissoes_ausencias_nao_justificadas > 0 ? '#ef4444' : 'var(--text-primary)', fontWeight: 500 }}>{desempenho.comissoes_ausencias_nao_justificadas}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Com o que o deputado mais gasta?</h2>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Valor líquido total gasto
            </span>
            <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              R$ {valorTotalGastos.toLocaleString('pt-BR')}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, minHeight: '250px', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: '1 1 200px', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gastosProcessados}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="total_gasto"
                    nameKey="tipo_gasto"
                  >
                    {gastosProcessados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']}
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: '1 1 200px', overflowY: 'auto', maxHeight: '250px', paddingRight: '8px' }} className="custom-scrollbar">
              {gastosProcessados.map((item, index) => {
                const percent = valorTotalGastos ? ((item.total_gasto / valorTotalGastos) * 100).toFixed(1) : 0;
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS_PIE[index % COLORS_PIE.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.tipo_gasto}>
                        {item.tipo_gasto}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        R$ {item.total_gasto.toLocaleString('pt-BR')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Eixo de Atuação (Palavras-chave)</h2>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            Baseado nos temas e palavras-chave extraídas das ementas das proposições de autoria do deputado.
          </p>
          <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%' }}>
              {renderMockWordCloud()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Principais Fornecedores</h2>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            Top 10 empresas/pessoas que mais receberam verba do deputado.
          </p>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {fornecedores.map((fornecedor, index) => {
              const maxVal = fornecedores[0]?.total_gasto || 1;
              const percent = (fornecedor.total_gasto / maxVal) * 100;
              return (
                <div key={index} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '6px', gap: isMobile ? '4px' : '0' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {index + 1}. {fornecedor.fornecedor_nome}
                    </span>
                    <span className="text-gradient" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      R$ {fornecedor.total_gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Como o deputado vota?</h2>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Como o deputado votou recentemente.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Buscar (ex: PL 1234)"
                value={buscaVotacao}
                onChange={e => { setBuscaVotacao(e.target.value); setPaginaAtual(1); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', minWidth: '150px' }}
              />
              {/* Filtro por Tema */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px' }}>
                <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                <select
                  value={filtroTema}
                  onChange={e => { setFiltroTema(e.target.value); setPaginaAtual(1); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem', cursor: 'pointer', minWidth: '120px', maxWidth: '200px' }}
                >
                  {temasDisponiveis.map(tema => (
                    <option key={tema} value={tema} style={{ background: 'var(--bg-surface)' }}>{tema}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '400px', paddingRight: '8px' }} className="custom-scrollbar">
            {votacoes.length > 0 ? votacoes.map(voto => (
              <div key={voto.id} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '60px' }}>
                  {getVotoIcon(voto.voto)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: voto.voto === 'Sim' ? '#10b981' : voto.voto === 'Não' ? '#ef4444' : '#f59e0b' }}>
                    {voto.voto.toUpperCase()}
                  </span>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{voto.data_votacao}</span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '12px' }}>
                      {voto.tema}
                    </span>
                  </div>
                  {voto.sigla && voto.numero && (
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                      {voto.sigla} {voto.numero}
                    </p>
                  )}
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{voto.descricao}</p>

                  {voto.ementa && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        onClick={() => setEmentaExpandida(ementaExpandida === voto.id ? null : voto.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                      >
                        {ementaExpandida === voto.id ? 'Ocultar Ementa' : 'Ver Ementa'}
                      </button>
                      {ementaExpandida === voto.id && (
                        <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--accent-primary)', lineHeight: 1.4 }}>
                          {voto.ementa}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhuma votação encontrada com os filtros selecionados.</p>
            )}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                style={{ padding: '6px 12px', borderRadius: '6px', background: paginaAtual === 1 ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)', color: paginaAtual === 1 ? 'var(--text-secondary)' : '#fff', border: 'none', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
              >
                Anterior
              </button>

              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Página {paginaAtual} de {totalPaginas}
              </span>

              <button
                onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
                style={{ padding: '6px 12px', borderRadius: '6px', background: paginaAtual === totalPaginas ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)', color: paginaAtual === totalPaginas ? 'var(--text-secondary)' : '#fff', border: 'none', cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
              >
                Próxima
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PerfilDeputado;
