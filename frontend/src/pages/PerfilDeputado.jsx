import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, MapPin, BookOpen, CheckCircle, XCircle, MinusCircle, Filter, Calendar, Mail, Phone, Building, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardAdapter from '../adapters/DashboardAdapter';

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
  const [buscaVotacao, setBuscaVotacao] = useState('');
  const [ementaExpandida, setEmentaExpandida] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  // ==========================================
  // SIMULAÇÃO DE CHAMADA À API (useEffect)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const perfilData = await DashboardAdapter.getPerfilDeputado(id);
        setPerfil(perfilData);

        const nuvemData = await DashboardAdapter.getPerfilNuvemPalavras(id);
        setNuvemPalavras(nuvemData);

        const gastosData = await DashboardAdapter.getPerfilGastosTipo(id);
        setGastosTipo(gastosData);

        const fornecedoresData = await DashboardAdapter.getPerfilFornecedores(id);
        setFornecedores(fornecedoresData);

        const votacoesData = await DashboardAdapter.getPerfilVotacoes(id);
        setVotacoes(votacoesData);
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

  // Processamento de Gastos (Top 5 + Outros e Total)
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

  const temasDisponiveis = ['Todos', ...new Set(votacoes.map(v => v.tema))];
  const votacoesFiltradas = votacoes.filter(v => {
    const matchesTema = filtroTema === 'Todos' || v.tema === filtroTema;
    const searchLower = buscaVotacao.toLowerCase();
    const matchesBusca = v.descricao.toLowerCase().includes(searchLower) || (v.ementa && v.ementa.toLowerCase().includes(searchLower));
    return matchesTema && matchesBusca;
  });

  // Reseta para página 1 sempre que os filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroTema, buscaVotacao]);

  // Paginação
  const totalPaginas = Math.ceil(votacoesFiltradas.length / itensPorPagina);
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const votacoesPaginadas = votacoesFiltradas.slice(indexPrimeiroItem, indexUltimoItem);

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

      <div className="glass-card" style={{ padding: '40px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {perfil.foto ? (
            <img src={perfil.foto} alt={`Foto de ${perfil.nome}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <UserIcon size={64} style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1.2 }}>{perfil.nome}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {perfil.custo_beneficio && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px 16px', borderRadius: '16px', fontWeight: '600' }}>
                  <span>Índice de Eficiência: {perfil.custo_beneficio}/10</span>
                  <div title="O Índice de Eficiência (Custo-Benefício) divide o Benefício Gerado (Proposições ponderadas por tipo, aprovação e autoria + Presenças em plenário e comissões) pelo Custo do mandato (gastos). O resultado é ajustado por um Fator de Atividade para evitar distorções." style={{ display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <Info size={16} />
                  </div>
                </div>
              )}
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                ID: {perfil.id_deputado}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '12px', fontWeight: '600', fontSize: '1rem' }}>
                  {perfil.partido}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem' }}>
                  <MapPin size={18} /> {perfil.uf}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} /> {perfil.endereco}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} /> {perfil.escolaridade}
              </span>
            </div>
            
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', display: 'block' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} /> Nascido em {perfil.data_nascimento}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} /> {perfil.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} /> {perfil.telefone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal (Palavras e Gastos) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>

        {/* Pergunta 2: Eixo de Atuação */}
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

        {/* Pergunta 13: Com o que o deputado mais gasta? */}
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
            {/* Gráfico na Esquerda */}
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
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda na Direita */}
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
                onChange={e => setBuscaVotacao(e.target.value)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', minWidth: '150px' }}
              />
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '400px', paddingRight: '8px' }} className="custom-scrollbar">
            {votacoesPaginadas.length > 0 ? votacoesPaginadas.map(voto => (
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
