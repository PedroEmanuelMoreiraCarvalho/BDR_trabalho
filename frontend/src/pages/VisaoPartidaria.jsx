import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VisaoPartidaria = () => {
  // ==========================================
  // ESTADOS DOS DADOS (Pronto para a API real)
  // ==========================================
  const [dataAlinhamento, setDataAlinhamento] = useState([]);

  // ==========================================
  // SIMULAÇÃO DE CHAMADA À API (useEffect)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        /* 
         * FUTURO: Integração com o Backend
         * Quando o FastAPI estiver rodando, substitua o bloco abaixo por:
         * 
         * const res = await axios.get('/api/partidos/alinhamento');
         * setDataAlinhamento(res.data);
         */

        // MOCK: Pergunta 10 - Alinhamento Interno
        setDataAlinhamento([
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

      } catch (error) {
        console.error("Erro ao buscar dados do alinhamento:", error);
      }
    };

    fetchData();
  }, []);

  // Custom Tooltip para exibir Votos Alinhados vs Rebeldes
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const naoAlinhados = data.total_considerado - data.total_alinhado;
      
      return (
        <div style={{ backgroundColor: '#1f2937', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>Partido: {data.partido}</p>
          <p style={{ fontSize: '0.875rem', color: '#10b981' }}>Alinhados: {data.total_alinhado.toLocaleString()}</p>
          <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>Não Alinhados: {naoAlinhados.toLocaleString()}</p>
          <p style={{ fontSize: '0.875rem', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
            Alinhamento: <strong style={{ color: payload[0].fill }}>{data.perc_alinhamento}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Visão Partidária</h1>
          <p className="text-secondary">Análise do comportamento das bancadas e coesão partidária</p>
        </div>
      </header>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Alinhamento Interno dos Partidos</h2>
        <p className="text-secondary" style={{ marginBottom: '24px', fontSize: '0.875rem' }}>
          Qual porcentagem dos votos dos deputados seguiu a orientação oficial de seu respectivo partido. (Verde = Alta Coesão, Vermelho = Baixa Coesão)
        </p>
        
        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer>
            <BarChart 
              data={dataAlinhamento} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} unit="%" />
              <YAxis dataKey="partido" type="category" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 500}} width={100} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              
              <Bar dataKey="perc_alinhamento" radius={[0, 4, 4, 0]}>
                {dataAlinhamento.map((entry, index) => {
                  let color = '#ef4444'; // Red para baixo alinhamento (< 75%)
                  if (entry.perc_alinhamento >= 90) color = '#10b981'; // Green para alto alinhamento
                  else if (entry.perc_alinhamento >= 75) color = '#f59e0b'; // Yellow para médio alinhamento

                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VisaoPartidaria;
