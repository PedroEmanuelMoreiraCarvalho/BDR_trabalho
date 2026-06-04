import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VisaoPartidaria = () => {
  // ==========================================
  // ESTADOS DOS DADOS (Pronto para a API real)
  // ==========================================
  const [dataAlinhamento, setDataAlinhamento] = useState([]);
  const [dataComparacao, setDataComparacao] = useState([]);
  const [comparacaoMetric, setComparacaoMetric] = useState('gastos'); // 'frequencia', 'proposicoes', 'gastos'
  const [partidoSelecionado, setPartidoSelecionado] = useState('PL');

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

        // MOCK: Comparação entre Partidos
        setDataComparacao([
          { partido: 'PL', frequencia: 91.5, proposicoes: 4500, gastos: 125000000 },
          { partido: 'PT', frequencia: 93.2, proposicoes: 4100, gastos: 118000000 },
          { partido: 'UNIÃO', frequencia: 88.5, proposicoes: 3200, gastos: 95000000 },
          { partido: 'PP', frequencia: 89.0, proposicoes: 2800, gastos: 82000000 },
          { partido: 'MDB', frequencia: 87.5, proposicoes: 2500, gastos: 75000000 },
          { partido: 'PSD', frequencia: 86.0, proposicoes: 2100, gastos: 70000000 },
          { partido: 'REPUBLICANOS', frequencia: 88.2, proposicoes: 1900, gastos: 65000000 },
          { partido: 'PSB', frequencia: 90.1, proposicoes: 1500, gastos: 45000000 },
          { partido: 'PSOL', frequencia: 95.5, proposicoes: 1800, gastos: 35000000 },
          { partido: 'PDT', frequencia: 89.8, proposicoes: 1200, gastos: 30000000 },
        ]);

      } catch (error) {
        console.error("Erro ao buscar dados do alinhamento:", error);
      }
    };

    fetchData();
  }, []);

  const dataComparacaoSorted = useMemo(() => {
    return [...dataComparacao].sort((a, b) => b[comparacaoMetric] - a[comparacaoMetric]);
  }, [dataComparacao, comparacaoMetric]);

  const COLORS_COMPARACAO = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#84cc16'];

  const formatComparacaoYAxis = (val) => {
    if (comparacaoMetric === 'gastos') return `${(val / 1000000).toFixed(0)}M`;
    if (comparacaoMetric === 'frequencia') return `${val}%`;
    return val;
  };

  const CustomComparacaoTooltip = ({ active, payload, metric }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let valDisplay = data[metric];
      if (metric === 'gastos') valDisplay = `R$ ${(data[metric]/1000000).toFixed(1)} Milhões`;
      if (metric === 'frequencia') valDisplay = `${data[metric].toFixed(1)}%`;

      const metricLabel = {
        gastos: 'Total de Gastos',
        proposicoes: 'Proposições',
        frequencia: 'Frequência Média'
      }[metric];

      return (
        <div style={{ backgroundColor: '#1f2937', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>Partido: {data.partido}</p>
          <p style={{ fontSize: '0.875rem', color: payload[0].fill }}>{metricLabel}: {valDisplay}</p>
        </div>
      );
    }
    return null;
  };

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

  const MOCK_NUVEM_PARTIDOS = {
    'PT': [
      { text: 'Trabalhadores', value: 90 }, { text: 'Bolsa Família', value: 85 }, { text: 'Ensino Público', value: 70 }, { text: 'Saúde da Família', value: 60 }, { text: 'Agricultura Familiar', value: 50 }, { text: 'Minorias', value: 45 }, { text: 'Cotas', value: 30 }
    ],
    'PL': [
      { text: 'Segurança Pública', value: 95 }, { text: 'Isenção Fiscal', value: 80 }, { text: 'Agronegócio', value: 75 }, { text: 'Liberdade Econômica', value: 60 }, { text: 'Armas de Fogo', value: 50 }, { text: 'Redução de Impostos', value: 40 }, { text: 'Defesa Nacional', value: 35 }
    ],
    'PSOL': [
      { text: 'Direitos Humanos', value: 95 }, { text: 'Demarcação de Terras', value: 85 }, { text: 'LGBTQIAP+', value: 80 }, { text: 'Escolas Públicas', value: 70 }, { text: 'Moradia Popular', value: 65 }, { text: 'Estatização', value: 55 }
    ]
  };

  const fallbackNuvem = [
    { text: 'Orçamento Público', value: 70 }, { text: 'Reforma Administrativa', value: 60 }, { text: 'Teto de Gastos', value: 50 }, { text: 'Obras Públicas', value: 45 }, { text: 'Emendas', value: 30 }
  ];

  const renderWordCloud = () => {
    const palavras = MOCK_NUVEM_PARTIDOS[partidoSelecionado] || fallbackNuvem;
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
                color: COLORS_COMPARACAO[i % COLORS_COMPARACAO.length],
                transition: 'transform 0.2s',
                cursor: 'default',
                opacity: 0.9
              }}
              title={`Relevância: ${word.value}`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Visão Partidária</h1>
          <p className="text-secondary">Análise do comportamento das bancadas e coesão partidária</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Alinhamento Interno dos Partidos */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Alinhamento Interno</h2>
          <p className="text-secondary" style={{ marginBottom: '24px', fontSize: '0.875rem' }}>
            Qual porcentagem dos votos seguiu a orientação oficial.
          </p>
          
          <div style={{ flex: 1, width: '100%', minHeight: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
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
                    let color = '#ef4444';
                    if (entry.perc_alinhamento >= 90) color = '#10b981';
                    else if (entry.perc_alinhamento >= 75) color = '#f59e0b';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nuvem de Palavras por Partido */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Eixo de Atuação (Palavras-chave)</h2>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                Baseado em palavras-chave das ementas das proposições da bancada.
              </p>
            </div>
            <div style={{ minWidth: '150px' }}>
              <select
                value={partidoSelecionado}
                onChange={(e) => setPartidoSelecionado(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none', cursor: 'pointer' }}
              >
                {dataAlinhamento.length > 0 ? dataAlinhamento.map(d => (
                  <option key={d.partido} value={d.partido} style={{ background: 'var(--bg-surface)' }}>{d.partido}</option>
                )) : (
                  <option value="PL" style={{ background: 'var(--bg-surface)' }}>PL</option>
                )}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderWordCloud()}
          </div>
        </div>
      </div>

      {/* Novo Card: Comparação entre Partidos */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Comparação entre Partidos</h2>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
              Compare o desempenho geral das bancadas em diferentes métricas.
            </p>
          </div>
          <div style={{ minWidth: '200px' }}>
            <select
              value={comparacaoMetric}
              onChange={(e) => setComparacaoMetric(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="gastos" style={{ background: 'var(--bg-surface)' }}>Total de Gastos</option>
              <option value="proposicoes" style={{ background: 'var(--bg-surface)' }}>Total de Proposições</option>
              <option value="frequencia" style={{ background: 'var(--bg-surface)' }}>Frequência Média (%)</option>
            </select>
          </div>
        </div>

        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart 
              data={dataComparacaoSorted} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="partido" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={formatComparacaoYAxis} />
              <Tooltip content={<CustomComparacaoTooltip metric={comparacaoMetric} />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey={comparacaoMetric} radius={[4, 4, 0, 0]}>
                {dataComparacaoSorted.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_COMPARACAO[index % COLORS_COMPARACAO.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VisaoPartidaria;
