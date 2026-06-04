import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Filter } from 'lucide-react';

const AnalisesAvancadas = () => {
  // ==========================================
  // ESTADOS DOS DADOS
  // ==========================================
  const [dadosEscolaridade, setDadosEscolaridade] = useState([]);
  const [dadosDispersao, setDadosDispersao] = useState([]);
  
  // Controle do filtro do gráfico de escolaridade
  const [metricaEscolaridade, setMetricaEscolaridade] = useState('gastos'); // 'gastos', 'fidelidade', 'proposicoes'

  // ==========================================
  // SIMULAÇÃO DE CHAMADA À API (useEffect)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        /*
         * FUTURO: Integração com o Backend
         * const resEscolaridade = await axios.get('/api/analises/escolaridade');
         * setDadosEscolaridade(resEscolaridade.data);
         * 
         * const resCustoBeneficio = await axios.get('/api/analises/custo-beneficio');
         * setDadosDispersao(resCustoBeneficio.data);
         */

        // MOCK: Pergunta 6 - Escolaridade vs Métricas
        setDadosEscolaridade([
          { escolaridade: 'Pós-Graduação', gastos: 1200000, fidelidade: 88.0, proposicoes: 600 },
          { escolaridade: 'Superior Completo', gastos: 4500000, fidelidade: 85.0, proposicoes: 1200 },
          { escolaridade: 'Superior Incompleto', gastos: 800000, fidelidade: 75.0, proposicoes: 150 },
          { escolaridade: 'Ensino Médio', gastos: 2500000, fidelidade: 80.0, proposicoes: 450 },
          { escolaridade: 'Sem informação', gastos: 300000, fidelidade: 60.0, proposicoes: 50 },
        ]);

        // MOCK: Pergunta 7 - Custo x Benefício (Dispersão)
        // Custo Benefício ideal = Alto score de benefício, Baixo Custo (Superior Esquerdo)
        setDadosDispersao([
          { id: 1, nome: 'Nikolas Ferreira', partido: 'PL', uf: 'MG', total_gasto: 85000, beneficio_score: 95 },
          { id: 2, nome: 'Guilherme Boulos', partido: 'PSOL', uf: 'SP', total_gasto: 140000, beneficio_score: 92 },
          { id: 3, nome: 'Dep. Genérico C', partido: 'PP', uf: 'RJ', total_gasto: 180000, beneficio_score: 60 },
          { id: 4, nome: 'Dep. Genérico D', partido: 'UNIÃO', uf: 'BA', total_gasto: 190000, beneficio_score: 30 },
          { id: 5, nome: 'Dep. Genérico E', partido: 'MDB', uf: 'RS', total_gasto: 160000, beneficio_score: 45 },
          { id: 6, nome: 'Dep. Genérico F', partido: 'PT', uf: 'PE', total_gasto: 60000, beneficio_score: 80 },
          { id: 7, nome: 'Dep. Genérico G', partido: 'PL', uf: 'SP', total_gasto: 210000, beneficio_score: 25 },
          { id: 8, nome: 'Dep. Genérico H', partido: 'PSB', uf: 'CE', total_gasto: 110000, beneficio_score: 75 },
          { id: 9, nome: 'Dep. Genérico I', partido: 'PDT', uf: 'AM', total_gasto: 130000, beneficio_score: 65 },
          { id: 10, nome: 'Dep. Genérico J', partido: 'NOVO', uf: 'MG', total_gasto: 40000, beneficio_score: 85 },
        ]);

      } catch (error) {
        console.error("Erro ao buscar dados das análises:", error);
      }
    };

    fetchData();
  }, []);

  // Cores dinâmicas para o gráfico de barras
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  // Tooltip customizado do ScatterPlot (Dispersão)
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#1f2937', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
            {data.nome} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({data.partido}-{data.uf})</span>
          </p>
          <p style={{ fontSize: '0.875rem', color: '#10b981' }}>Score Benefício: {data.beneficio_score}</p>
          <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>Gasto: R$ {(data.total_gasto / 1000).toLocaleString('pt-BR')}k</p>
        </div>
      );
    }
    return null;
  };

  // Tooltip customizado do Gráfico de Escolaridade
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let valLabel = '';
      let valFormat = payload[0].value;
      
      if (metricaEscolaridade === 'gastos') {
        valLabel = 'Gasto Total';
        valFormat = `R$ ${(payload[0].value / 1000).toLocaleString('pt-BR')}k`;
      } else if (metricaEscolaridade === 'fidelidade') {
        valLabel = 'Alinhamento Médio';
        valFormat = `${payload[0].value}%`;
      } else {
        valLabel = 'Total Proposições';
        valFormat = payload[0].value;
      }

      return (
        <div style={{ backgroundColor: '#1f2937', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>{data.escolaridade}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--accent-primary)' }}>{valLabel}: {valFormat}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Análises Avançadas</h1>
          <p className="text-secondary">Cruzamento de dados, correlações estatísticas e custo-benefício.</p>
        </div>
      </header>

      {/* Pergunta 7: Custo x Benefício */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Custo x Benefício do Deputado</h2>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '24px' }}>
          O eixo horizontal (X) indica o total gasto, enquanto o eixo vertical (Y) indica a produção do deputado (Score baseado em presenças e proposições aprovadas).<br/>
          <strong>Quadrante ideal:</strong> Canto superior esquerdo (Alto benefício, baixo custo).
        </p>
        
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                type="number" 
                dataKey="total_gasto" 
                name="Gasto Total" 
                stroke="#9ca3af" 
                tickFormatter={(val) => `${val / 1000}k`}
                domain={['auto', 'auto']}
              />
              <YAxis 
                type="number" 
                dataKey="beneficio_score" 
                name="Score de Benefício" 
                stroke="#9ca3af"
                domain={[0, 100]}
              />
              <ZAxis range={[100, 100]} /> {/* Fixa o tamanho das bolinhas */}
              <RechartsTooltip cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} content={<CustomScatterTooltip />} />
              <Scatter data={dadosDispersao} fill="#8b5cf6" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pergunta 6: Correlacionar Escolaridade */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Correlação por Escolaridade</h2>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
              Descubra se o nível de instrução afeta os gastos, o alinhamento com o partido ou a produção legislativa.
            </p>
          </div>
          
          {/* Menu Dropdown de Métrica */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <select 
              value={metricaEscolaridade} 
              onChange={e => setMetricaEscolaridade(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <option value="gastos" style={{ background: 'var(--bg-surface)' }}>vs. Gastos Totais</option>
              <option value="fidelidade" style={{ background: 'var(--bg-surface)' }}>vs. Fidelidade Partidária</option>
              <option value="proposicoes" style={{ background: 'var(--bg-surface)' }}>vs. Qtd. de Proposições</option>
            </select>
          </div>
        </div>
        
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart 
              data={dadosEscolaridade} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="escolaridade" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis 
                stroke="#9ca3af" 
                tick={{fill: '#9ca3af', fontSize: 12}} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(val) => metricaEscolaridade === 'gastos' ? `${val / 1000}k` : val}
              />
              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomBarTooltip />} />
              <Bar dataKey={metricaEscolaridade} radius={[4, 4, 0, 0]}>
                {dadosEscolaridade.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AnalisesAvancadas;
