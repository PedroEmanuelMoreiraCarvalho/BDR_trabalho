import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronDown, ChevronUp, Filter, Info } from 'lucide-react';
import DashboardAdapter from '../adapters/DashboardAdapter';

const DashboardNacional = () => {
  // ==========================================
  // ESTADOS DA INTERFACE (Filtros e UI)
  // ==========================================
  const [isExpanded, setIsExpanded] = useState(false);
  const [filtroPartido, setFiltroPartido] = useState('Todos');
  const [filtroUF, setFiltroUF] = useState('Todos');
  const [ordem, setOrdem] = useState('desc');
  const [metrica, setMetrica] = useState('eficiencia');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const itensPorPagina = 10;

  const [baseData, setBaseData] = useState([]);
  const [totalItens, setTotalItens] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [dataEscolaridade, setDataEscolaridade] = useState([]);
  const [dataCorrelacao, setDataCorrelacao] = useState([]);
  const [dataFornecedores, setDataFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para travar a renderização do gráfico até o dado chegar
  const [appliedMetrica, setAppliedMetrica] = useState(metrica);

  const [metricaEscolaridade, setMetricaEscolaridade] = useState('gasto_medio'); // 'gasto_medio', 'perc_alinhamento', 'total_proposicoes', etc.


  // ==========================================
  // SIMULAÇÃO DE CHAMADA À API (useEffect)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let rankingResponse;

        if (metrica === 'eficiencia') {
          const res = await DashboardAdapter.getRankingBeneficio({ pagina: paginaAtual, itensPorPagina, ordem, filtroPartido, filtroUF });

          const offset = (paginaAtual - 1) * itensPorPagina;
          const dataMapped = res.data.map((item, index) => ({
            id_deputado: item.id_deputado,
            name: item.deputado,
            partido: item.partido,
            uf: item.uf,
            gastos: parseFloat(item.total_gasto || 0),
            indice_eficiencia: parseFloat(item.indice_eficiencia || 0),
            posicao_ranking: offset + index + 1
          }));

          rankingResponse = {
            data: dataMapped,
            total: res.pagination ? res.pagination.total : 513
          };
        } else {
          // Quando a métrica for 'gastos', usa a rota específica de gastos
          const resGastos = await DashboardAdapter.getVisaoGeralGastos({ pagina: paginaAtual, itensPorPagina, ordem, filtroPartido, filtroUF });

          const offset = (paginaAtual - 1) * itensPorPagina;

          let dataMapped = (resGastos.data || []).map((item, index) => ({
            name: item.name,
            partido: item.partido,
            uf: item.uf,
            gastos: parseFloat(item.gastos || 0),
            posicao_ranking: offset + index + 1
          }));

          rankingResponse = {
            data: dataMapped,
            total: resGastos.pagination ? resGastos.pagination.total : dataMapped.length
          };
        }

        setBaseData(rankingResponse.data);
        setTotalItens(rankingResponse.total);
        setAppliedMetrica(metrica); // Atualiza a métrica visual apenas quando os novos dados chegam

        // Busca o Total de Gastos Independente da Métrica (com os mesmos filtros)
        const resTotalGastos = await DashboardAdapter.getTotalGastosGeral({ filtroPartido, filtroUF });
        setTotalGastos(resTotalGastos.total);

        const escolaridade = await DashboardAdapter.getVisaoGeralEscolaridade();
        setDataEscolaridade(escolaridade);

        const correlacao = await DashboardAdapter.getCorrelacaoEscolaridade();
        setDataCorrelacao(correlacao);

        const fornecedores = await DashboardAdapter.getVisaoGeralFornecedores();
        setDataFornecedores(fornecedores);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paginaAtual, filtroPartido, filtroUF, metrica, ordem]);



  // Paginação - Agora gerenciada pela API (temos totalItens)
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);

  const COLORS_PIE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let valLabel = '';
      let valFormat = payload[0].value;

      if (metricaEscolaridade === 'gasto_medio') {
        valLabel = 'Gasto Médio';
        valFormat = `R$ ${Number(payload[0].value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (metricaEscolaridade === 'perc_alinhamento') {
        valLabel = 'Fidelidade Média';
        valFormat = `${payload[0].value}%`;
      } else if (metricaEscolaridade === 'total_proposicoes') {
        valLabel = 'Total Proposições';
        valFormat = payload[0].value;
      } else if (metricaEscolaridade === 'media_presencas_comissoes') {
        valLabel = 'Presenças Médias Comissões';
        valFormat = payload[0].value;
      } else if (metricaEscolaridade === 'media_presencas_plenario') {
        valLabel = 'Presenças Médias Plenário';
        valFormat = payload[0].value;
      }

      return (
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ margin: 0, fontWeight: 600, marginBottom: '8px' }}>{data.escolaridade}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--accent-primary)' }}>{valLabel}: {valFormat}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1>Visão Geral</h1>
          <p className="text-secondary">Visão geral dos dados dos deputados (Custos, Proposições e Alinhamento)</p>
        </div>
      </header>

      {/* Seção de Filtros */}
      <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', color: 'var(--text-secondary)' }}>
          <Filter size={20} />
          <span style={{ fontWeight: 500 }}>Filtros:</span>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Partido</label>
          <select
            value={filtroPartido}
            onChange={(e) => { setFiltroPartido(e.target.value); setPaginaAtual(1); }}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="Todos" style={{ background: 'var(--bg-surface)' }}>Todos</option>
            <option value="AVANTE" style={{ background: 'var(--bg-surface)' }}>AVANTE</option>
            <option value="CIDADANIA" style={{ background: 'var(--bg-surface)' }}>CIDADANIA</option>
            <option value="MDB" style={{ background: 'var(--bg-surface)' }}>MDB</option>
            <option value="MISSÃO" style={{ background: 'var(--bg-surface)' }}>MISSÃO</option>
            <option value="NOVO" style={{ background: 'var(--bg-surface)' }}>NOVO</option>
            <option value="PCdoB" style={{ background: 'var(--bg-surface)' }}>PCdoB</option>
            <option value="PDT" style={{ background: 'var(--bg-surface)' }}>PDT</option>
            <option value="PL" style={{ background: 'var(--bg-surface)' }}>PL</option>
            <option value="PODE" style={{ background: 'var(--bg-surface)' }}>PODE (Podemos)</option>
            <option value="PP" style={{ background: 'var(--bg-surface)' }}>PP</option>
            <option value="PRD" style={{ background: 'var(--bg-surface)' }}>PRD</option>
            <option value="PSB" style={{ background: 'var(--bg-surface)' }}>PSB</option>
            <option value="PSD" style={{ background: 'var(--bg-surface)' }}>PSD</option>
            <option value="PSDB" style={{ background: 'var(--bg-surface)' }}>PSDB</option>
            <option value="PSOL" style={{ background: 'var(--bg-surface)' }}>PSOL</option>
            <option value="PT" style={{ background: 'var(--bg-surface)' }}>PT</option>
            <option value="PV" style={{ background: 'var(--bg-surface)' }}>PV</option>
            <option value="REDE" style={{ background: 'var(--bg-surface)' }}>REDE</option>
            <option value="REPUBLICANOS" style={{ background: 'var(--bg-surface)' }}>REPUBLICANOS</option>
            <option value="S.PART." style={{ background: 'var(--bg-surface)' }}>S.PART.</option>
            <option value="SOLIDARIEDADE" style={{ background: 'var(--bg-surface)' }}>SOLIDARIEDADE</option>
            <option value="UNIÃO" style={{ background: 'var(--bg-surface)' }}>UNIÃO</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Estado (UF)</label>
          <select
            value={filtroUF}
            onChange={(e) => { setFiltroUF(e.target.value); setPaginaAtual(1); }}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="Todos" style={{ background: 'var(--bg-surface)' }}>Todos</option>
            <option value="AC" style={{ background: 'var(--bg-surface)' }}>AC</option>
            <option value="AL" style={{ background: 'var(--bg-surface)' }}>AL</option>
            <option value="AP" style={{ background: 'var(--bg-surface)' }}>AP</option>
            <option value="AM" style={{ background: 'var(--bg-surface)' }}>AM</option>
            <option value="BA" style={{ background: 'var(--bg-surface)' }}>BA</option>
            <option value="CE" style={{ background: 'var(--bg-surface)' }}>CE</option>
            <option value="DF" style={{ background: 'var(--bg-surface)' }}>DF</option>
            <option value="ES" style={{ background: 'var(--bg-surface)' }}>ES</option>
            <option value="GO" style={{ background: 'var(--bg-surface)' }}>GO</option>
            <option value="MA" style={{ background: 'var(--bg-surface)' }}>MA</option>
            <option value="MT" style={{ background: 'var(--bg-surface)' }}>MT</option>
            <option value="MS" style={{ background: 'var(--bg-surface)' }}>MS</option>
            <option value="MG" style={{ background: 'var(--bg-surface)' }}>MG</option>
            <option value="PA" style={{ background: 'var(--bg-surface)' }}>PA</option>
            <option value="PB" style={{ background: 'var(--bg-surface)' }}>PB</option>
            <option value="PR" style={{ background: 'var(--bg-surface)' }}>PR</option>
            <option value="PE" style={{ background: 'var(--bg-surface)' }}>PE</option>
            <option value="PI" style={{ background: 'var(--bg-surface)' }}>PI</option>
            <option value="RJ" style={{ background: 'var(--bg-surface)' }}>RJ</option>
            <option value="RN" style={{ background: 'var(--bg-surface)' }}>RN</option>
            <option value="RS" style={{ background: 'var(--bg-surface)' }}>RS</option>
            <option value="RO" style={{ background: 'var(--bg-surface)' }}>RO</option>
            <option value="RR" style={{ background: 'var(--bg-surface)' }}>RR</option>
            <option value="SC" style={{ background: 'var(--bg-surface)' }}>SC</option>
            <option value="SP" style={{ background: 'var(--bg-surface)' }}>SP</option>
            <option value="SE" style={{ background: 'var(--bg-surface)' }}>SE</option>
            <option value="TO" style={{ background: 'var(--bg-surface)' }}>TO</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Métrica</label>
          <select
            value={metrica}
            onChange={(e) => { setMetrica(e.target.value); setPaginaAtual(1); }}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="eficiencia" style={{ background: 'var(--bg-surface)' }}>Índice de Eficiência</option>
            <option value="gastos" style={{ background: 'var(--bg-surface)' }}>Total de Gastos</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Ordem
          </label>
          <select
            value={ordem}
            onChange={(e) => { setOrdem(e.target.value); setPaginaAtual(1); }}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="desc" style={{ background: 'var(--bg-surface)' }}>
              {metrica === 'eficiencia' ? 'Melhores Scores' : 'Maiores Gastos'}
            </option>
            <option value="asc" style={{ background: 'var(--bg-surface)' }}>
              {metrica === 'eficiencia' ? 'Piores Scores' : 'Menores Gastos'}
            </option>
          </select>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 24px' }}>
          <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Deputados Listados (Filtrado)</h3>
          <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {totalItens}
          </p>
        </div>
        <div className="glass-card" style={{ padding: '16px 24px' }}>
          <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Total de Gastos (Filtrado)</h3>
          <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            R$ {(totalGastos / 1000000).toFixed(2)}M
          </p>
        </div>
      </div>

      {/* Grid Principal de Gráficos */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>
              Ranking de Deputados ({appliedMetrica === 'eficiencia' ? 'Índice de Eficiência' : 'Total de Gastos'})
            </h2>
            {appliedMetrica === 'eficiencia' && (
              <div
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Info size={18} />
              </div>
            )}

            {showInfo && (
              <div style={{
                position: 'absolute', top: '100%', right: '0px', marginTop: '8px', zIndex: 50, width: '360px',
                padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: '1.5', textAlign: 'left'
              }}>
                <strong>Índice de Eficiência</strong><br />
                Avalia o Custo-Benefício do deputado baseando-se em:
                <ul style={{ paddingLeft: '16px', margin: '8px 0 0 0' }}>
                  <li><strong>Projetos de Lei:</strong> Maior peso para PECs, projetos aprovados e autoria principal.</li>
                  <li><strong>Assiduidade:</strong> Presença em Plenário e Comissões.</li>
                  <li><strong>Gastos:</strong> Deputados com alta produção e baixo custo recebem os melhores scores.</li>
                </ul>
              </div>
            )}
          </div>

          <div style={{ width: '100%', height: 400 }}>
            {baseData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={baseData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                  <XAxis
                    type="number"
                    domain={[0, appliedMetrica === 'eficiencia' ? 10 : 800000]}
                    stroke="var(--text-primary)"
                    tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    width={220}
                    dataKey={(data) => {
                      return `${data.posicao_ranking}º - ${data.name} (${data.partido})`;
                    }}
                    stroke="var(--text-primary)"
                    tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: appliedMetrica === 'eficiencia' ? '#10b981' : '#3b82f6' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(value) => [
                      appliedMetrica === 'eficiencia' ? value : `R$ ${value.toLocaleString('pt-BR')}`,
                      appliedMetrica === 'eficiencia' ? 'Score' : 'Gastos'
                    ]}
                  />
                  <Bar
                    dataKey={appliedMetrica === 'eficiencia' ? 'indice_eficiencia' : 'gastos'}
                    fill={appliedMetrica === 'eficiencia' ? '#10b981' : '#3b82f6'}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Nenhum deputado encontrado com estes filtros.
              </div>
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

      {/* Grid Secundário: Agrupamento de Escolaridade e Fornecedores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>

        {/* Gráfico de Agrupamento por Escolaridade (PieChart) */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Agrupamento por Escolaridade</h2>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Total de Deputados
            </span>
            <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {dataEscolaridade.reduce((acc, curr) => acc + (curr.total_deputados || 0), 0)}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, minHeight: '250px', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: '1 1 180px', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataEscolaridade}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total_deputados"
                    nameKey="escolaridade"
                  >
                    {dataEscolaridade.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: '#10b981' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: '1 1 180px', overflowY: 'auto', maxHeight: '250px', paddingRight: '8px' }} className="custom-scrollbar">
              {dataEscolaridade.map((item, index) => {
                const total = dataEscolaridade.reduce((acc, curr) => acc + (curr.total_deputados || 0), 0);
                const percent = total ? ((item.total_deputados / total) * 100).toFixed(1) : 0;
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS_PIE[index % COLORS_PIE.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.escolaridade}>
                        {item.escolaridade}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.total_deputados}
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

        {/* Tabela de Maiores Fornecedores */}
        <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.125rem' }}>Maiores Fornecedores (Contratos)</h2>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', maxHeight: '280px' }} className="custom-scrollbar">
            {dataFornecedores.map((fornecedor, index) => {
              const maxVal = dataFornecedores[0]?.total_contrato || 1;
              const percent = (fornecedor.total_contrato / maxVal) * 100;

              return (
                <div key={index} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {fornecedor.fornecedor_nome}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        CNPJ: {fornecedor.cnpj}
                      </span>
                    </div>
                    <span className="text-gradient" style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      R$ {Number(fornecedor.total_contrato).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Barra de Progresso embutida */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: 'var(--accent-primary)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid Terciário: Correlação por Escolaridade */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Correlação por Escolaridade</h2>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                Impacto do nível de instrução nas métricas (Média por deputado em cada nível).
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={metricaEscolaridade}
                onChange={e => setMetricaEscolaridade(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                <option value="gasto_medio" style={{ background: 'var(--bg-surface)' }}>vs. Gasto Médio</option>
                <option value="perc_alinhamento" style={{ background: 'var(--bg-surface)' }}>vs. Fidelidade</option>
                <option value="total_proposicoes" style={{ background: 'var(--bg-surface)' }}>vs. Proposições</option>
                <option value="media_presencas_comissoes" style={{ background: 'var(--bg-surface)' }}>vs. Presença Comissões</option>
                <option value="media_presencas_plenario" style={{ background: 'var(--bg-surface)' }}>vs. Presença Plenário</option>
              </select>
            </div>
          </div>

          <div style={{ width: '100%', flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer>
              <BarChart
                data={dataCorrelacao}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="escolaridade" stroke="var(--text-primary)" tick={{ fill: 'var(--text-primary)', fontSize: 9 }} interval={0} axisLine={false} tickLine={false} />
                <YAxis
                  stroke="var(--text-primary)"
                  tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (metricaEscolaridade === 'gasto_medio') {
                      if (val >= 1000000) return `R$ ${(val / 1000000).toLocaleString('pt-BR', {maximumFractionDigits:1})}M`;
                      if (val >= 1000) return `R$ ${(val / 1000).toLocaleString('pt-BR', {maximumFractionDigits:1})}k`;
                      return `R$ ${val}`;
                    }
                    return val;
                  }}
                />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomBarTooltip />} />
                <Bar dataKey={metricaEscolaridade} radius={[4, 4, 0, 0]}>
                  {dataCorrelacao.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardNacional;
