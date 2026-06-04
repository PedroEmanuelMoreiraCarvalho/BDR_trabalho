import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import DashboardAdapter from '../adapters/DashboardAdapter';

const DashboardNacional = () => {
  // ==========================================
  // ESTADOS DA INTERFACE (Filtros e UI)
  // ==========================================
  const [isExpanded, setIsExpanded] = useState(false);
  const [filtroPartido, setFiltroPartido] = useState('Todos');
  const [filtroUF, setFiltroUF] = useState('Todos');
  const [ordem, setOrdem] = useState('desc');

  // ==========================================
  // ESTADOS DOS DADOS (Pronto para a API real)
  // ==========================================
  const [baseData, setBaseData] = useState([]);
  const [dataEscolaridade, setDataEscolaridade] = useState([]);
  const [dataFornecedores, setDataFornecedores] = useState([]);

  // ==========================================
  // SIMULAÇÃO DE CHAMADA À API (useEffect)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        /* 
         * FUTURO: Integração com o Backend
         * Quando o FastAPI estiver rodando, basta substituir os blocos abaixo por:
         * 
         * const resGastos = await axios.get('/api/gastos-nacionais');
         * setBaseData(resGastos.data);
         * 
         * const resEscolaridade = await axios.get('/api/escolaridade');
         * setDataEscolaridade(resEscolaridade.data);
         * 
         * const resFornecedores = await axios.get('/api/fornecedores');
         * setDataFornecedores(resFornecedores.data);
         */

        // MOCK via Adapter
        const gastos = await DashboardAdapter.getVisaoGeralGastos();
        setBaseData(gastos);

        const escolaridade = await DashboardAdapter.getVisaoGeralEscolaridade();
        setDataEscolaridade(escolaridade);

        const fornecedores = await DashboardAdapter.getVisaoGeralFornecedores();
        setDataFornecedores(fornecedores);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  // ==========================================
  // LÓGICA DE FILTRAGEM (Aplicada sobre os dados no State)
  // ==========================================
  const filteredData = baseData
    .filter(d => filtroPartido === 'Todos' || d.partido === filtroPartido)
    .filter(d => filtroUF === 'Todos' || d.uf === filtroUF)
    .sort((a, b) => ordem === 'desc' ? b.gastos - a.gastos : a.gastos - b.gastos);

  const top10 = filteredData.slice(0, 10);
  const restantes = filteredData.slice(10);
  const COLORS_PIE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

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
            onChange={(e) => setFiltroPartido(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="Todos" style={{ background: 'var(--bg-surface)' }}>Todos</option>
            <option value="PL" style={{ background: 'var(--bg-surface)' }}>PL</option>
            <option value="PT" style={{ background: 'var(--bg-surface)' }}>PT</option>
            <option value="PSOL" style={{ background: 'var(--bg-surface)' }}>PSOL</option>
            <option value="UNIÃO" style={{ background: 'var(--bg-surface)' }}>UNIÃO</option>
            <option value="PP" style={{ background: 'var(--bg-surface)' }}>PP</option>
            <option value="MDB" style={{ background: 'var(--bg-surface)' }}>MDB</option>
            <option value="PSB" style={{ background: 'var(--bg-surface)' }}>PSB</option>
            <option value="PDT" style={{ background: 'var(--bg-surface)' }}>PDT</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Estado (UF)</label>
          <select
            value={filtroUF}
            onChange={(e) => setFiltroUF(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="Todos" style={{ background: 'var(--bg-surface)' }}>Todos</option>
            <option value="SP" style={{ background: 'var(--bg-surface)' }}>SP</option>
            <option value="MG" style={{ background: 'var(--bg-surface)' }}>MG</option>
            <option value="RJ" style={{ background: 'var(--bg-surface)' }}>RJ</option>
            <option value="BA" style={{ background: 'var(--bg-surface)' }}>BA</option>
            <option value="RS" style={{ background: 'var(--bg-surface)' }}>RS</option>
            <option value="PR" style={{ background: 'var(--bg-surface)' }}>PR</option>
            <option value="SC" style={{ background: 'var(--bg-surface)' }}>SC</option>
            <option value="PE" style={{ background: 'var(--bg-surface)' }}>PE</option>
            <option value="CE" style={{ background: 'var(--bg-surface)' }}>CE</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ordenar por Gastos</label>
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            <option value="desc" style={{ background: 'var(--bg-surface)' }}>Maiores Gastos</option>
            <option value="asc" style={{ background: 'var(--bg-surface)' }}>Menores Gastos</option>
          </select>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 24px' }}>
          <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Total de Gastos (Filtrado)</h3>
          <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            R$ {(filteredData.reduce((acc, curr) => acc + curr.gastos, 0) / 1000).toFixed(1)}k
          </p>
        </div>
      </div>

      {/* Grid Principal de Gráficos */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 24px' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '1.125rem' }}>
            {ordem === 'desc' ? 'Maiores' : 'Menores'} Gastos por Deputado
          </h2>

          <div style={{ width: '100%', height: 220 }}>
            {top10.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={top10} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}
                    itemStyle={{ color: '#3b82f6' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="gastos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Nenhum deputado encontrado com estes filtros.
              </div>
            )}
          </div>

          {restantes.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 0',
                  userSelect: 'none'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Ver o restante da lista ({restantes.length} deputados)
                </h3>
                <div style={{ color: 'var(--text-secondary)', transition: 'transform 0.3s' }}>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  {restantes.map((dep, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>#{index + 11}</span>
                          {dep.name}
                        </span>
                      </div>
                      <span className="text-gradient" style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        R$ {dep.gastos.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid Secundário: Escolaridade e Fornecedores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>

        {/* Gráfico de Escolaridade */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Agrupamento por Escolaridade</h2>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Total de Deputados
            </span>
            <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {dataEscolaridade.reduce((acc, curr) => acc + curr.total_deputados, 0)}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, minHeight: '250px', alignItems: 'center', gap: '24px' }}>
            {/* Gráfico na Esquerda */}
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
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda na Direita */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: '1 1 180px', overflowY: 'auto', maxHeight: '250px', paddingRight: '8px' }} className="custom-scrollbar">
              {dataEscolaridade.map((item, index) => {
                const total = dataEscolaridade.reduce((acc, curr) => acc + curr.total_deputados, 0);
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
                      R$ {(fornecedor.total_contrato / 1000).toLocaleString('pt-BR')}k
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

    </div>
  );
};

export default DashboardNacional;
