import React, { useState, useEffect } from 'react';
import { Search, MapPin, User as UserIcon, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardAdapter from '../adapters/DashboardAdapter';
import FooterDisclaimer from '../components/FooterDisclaimer';

const BuscaParlamentares = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Debounce na busca para evitar múltiplas requisições ao banco
    const timer = setTimeout(async () => {
      if (searchTerm.trim().length < 3) {
        setResultados([]); 
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const res = await DashboardAdapter.pesquisarDeputados(searchTerm);
        if (res && res.results) {
          setResultados(res.results);
        } else if (Array.isArray(res)) {
          setResultados(res); // Caso a API retorne um array direto em algum fallback
        } else {
          setResultados([]);
        }
      } catch (err) {
        console.error(err);
        setError('Falha ao buscar parlamentares. Verifique se o servidor está rodando.');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1>Explorar Parlamentares</h1>
          <p className="text-secondary">Busque por nome do deputado na base de dados real</p>
        </div>
      </header>

      {/* Barra de Busca */}
      <div className="glass-card" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
        <Search size={24} style={{ color: 'var(--text-secondary)' }} />
        <input 
          type="text"
          placeholder="Digite pelo menos 3 letras (Ex: Silva, Elmar, Zé Vitor...)"
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
        {loading && <Loader size={24} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />}
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Grid de Resultados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: '24px' }}>
        {resultados.map(dep => (
          <Link 
            key={dep.id} 
            to={`/parlamentares/${dep.id}`} 
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px', transition: 'transform 0.2s' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
                background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {dep.url_perfil ? (
                  <img src={dep.url_perfil} alt={dep.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                ) : (
                  <UserIcon size={32} style={{ color: 'var(--text-secondary)' }} />
                )}
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
                  {dep.situacao} • ID: {dep.id}
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        {!loading && searchTerm.trim().length >= 3 && resultados.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            Nenhum parlamentar encontrado com esse nome.
          </div>
        )}
        
        {!loading && searchTerm.trim().length < 3 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            Digite pelo menos 3 caracteres para iniciar a busca.
          </div>
        )}
      </div>
      <FooterDisclaimer />
    </div>
  );
};

export default BuscaParlamentares;
