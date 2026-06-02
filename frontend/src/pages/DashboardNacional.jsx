import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardNacional = () => {
  // Dados mockados para visualização inicial
  const data = [
    { name: 'Dep. A', gastos: 4000 },
    { name: 'Dep. B', gastos: 3000 },
    { name: 'Dep. C', gastos: 2000 },
    { name: 'Dep. D', gastos: 2780 },
    { name: 'Dep. E', gastos: 1890 },
    { name: 'Dep. F', gastos: 2390 },
    { name: 'Dep. G', gastos: 3490 },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Visão Nacional</h1>
          <p className="text-secondary">Visão geral dos dados dos deputados (Custos, Proposições e Alinhamento)</p>
        </div>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card">
          <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Total de Gastos</h3>
          <p className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>R$ 14.5M</p>
        </div>
        <div className="glass-card">
          <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Proposições Aprovadas</h3>
          <p className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,284</p>
        </div>
        <div className="glass-card">
          <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Média de Presença</h3>
          <p className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>87.5%</p>
        </div>
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="glass-card">
          <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Maiores Gastos por Deputado</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="gastos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNacional;
