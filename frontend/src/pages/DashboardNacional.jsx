import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

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

        // MOCK: Pergunta 1 - Gastos
        setBaseData([
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

        // MOCK: Pergunta 4 - Escolaridade
        setDataEscolaridade([
          { escolaridade: 'Superior Completo', total_deputados: 405 },
          { escolaridade: 'Pós-Graduação', total_deputados: 52 },
          { escolaridade: 'Ensino Médio', total_deputados: 45 },
          { escolaridade: 'Superior Incompleto', total_deputados: 11 },
        ]);

        // MOCK: Pergunta 5 - Fornecedores
        setDataFornecedores([
          { fornecedor_nome: 'TAM LINHAS AEREAS S/A', cnpj: '02.012.862/0001-60', total_contrato: 1250400 },
          { fornecedor_nome: 'GOL LINHAS AEREAS S.A.', cnpj: '07.575.651/0001-59', total_contrato: 980300 },
          { fornecedor_nome: 'AZUL LINHAS AEREAS', cnpj: '09.296.295/0001-60', total_contrato: 850100 },
          { fornecedor_nome: 'TELEFONICA BRASIL S.A.', cnpj: '02.558.157/0001-62', total_contrato: 450000 },
          { fornecedor_nome: 'CORREIOS', cnpj: '34.028.316/0001-03', total_contrato: 320000 },
          { fornecedor_nome: 'POSTO DA TORRE LTDA', cnpj: '03.746.488/0001-00', total_contrato: 150000 },
          { fornecedor_nome: 'LOCALIZA RENT A CAR S/A', cnpj: '16.670.085/0001-55', total_contrato: 120000 },
        ]);

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
        <div className="glass-card" style={{ padding: '16px 24px' }}>
          <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Proposições Aprovadas</h3>
          <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1,284</p>
        </div>
        <div className="glass-card" style={{ padding: '16px 24px' }}>
          <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Média de Presença</h3>
          <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>87.5%</p>
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
        <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '1.125rem' }}>Agrupamento por Escolaridade</h2>
          <div style={{ flex: 1, width: '100%', minHeight: '250px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataEscolaridade}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
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
