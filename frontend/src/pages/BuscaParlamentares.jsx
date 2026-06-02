import React, { useState, useMemo } from 'react';
import { Search, MapPin, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuscaParlamentares = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock de deputados incluindo ID
  const allDeputados = [
    { id: '12345', nome: 'Nikolas Ferreira', partido: 'PL', uf: 'MG', foto: 'https://via.placeholder.com/64' },
    { id: '54321', nome: 'Guilherme Boulos', partido: 'PSOL', uf: 'SP', foto: 'https://via.placeholder.com/64' },
    { id: '98765', nome: 'Erika Hilton', partido: 'PSOL', uf: 'SP', foto: 'https://via.placeholder.com/64' },
    { id: '11223', nome: 'Kim Kataguiri', partido: 'UNIÃO', uf: 'SP', foto: 'https://via.placeholder.com/64' },
    { id: '44556', nome: 'Eduardo Bolsonaro', partido: 'PL', uf: 'SP', foto: 'https://via.placeholder.com/64' },
    { id: '77889', nome: 'Tabata Amaral', partido: 'PSB', uf: 'SP', foto: 'https://via.placeholder.com/64' },
  ];

  const filtrados = useMemo(() => {
    if (!searchTerm) return allDeputados;
    const lowerTerm = searchTerm.toLowerCase();
    return allDeputados.filter(dep => 
      dep.nome.toLowerCase().includes(lowerTerm) || 
      dep.id.includes(lowerTerm) ||
      dep.partido.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, allDeputados]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1>Explorar Parlamentares</h1>
          <p className="text-secondary">Busque por nome, partido ou ID do deputado</p>
        </div>
      </header>

      {/* Barra de Busca */}
      <div className="glass-card" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
        <Search size={24} style={{ color: 'var(--text-secondary)' }} />
        <input 
          type="text"
          placeholder="Ex: 12345, Boulos, Nikolas, PL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.1rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Grid de Resultados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filtrados.map(dep => (
          <Link 
            key={dep.id} 
            to={`/parlamentares/${dep.id}`} 
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <UserIcon size={32} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{dep.nome}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>
                    {dep.partido}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {dep.uf}
                  </span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ID: {dep.id}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filtrados.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            Nenhum parlamentar encontrado com esse termo.
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscaParlamentares;
