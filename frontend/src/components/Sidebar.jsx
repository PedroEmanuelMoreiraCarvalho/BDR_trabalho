import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Search, BookOpen, Sun, Moon, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const location = useLocation();

  const metodologiaSubItems = [
    { id: 'visao_geral', label: 'Visão Geral do Projeto' },
    { id: 'score', label: 'Índice de Eficiência' },
    { id: 'dicionario', label: 'Dicionário de Dados' },
    { id: 'limpeza', label: 'Limpeza de Dados' },
    { id: 'anexos', label: 'Anexos & Scripts' },
  ];

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        // Ajustando para ficar um pouco abaixo do topo por causa do possível header
        const y = element.getBoundingClientRect().top + window.scrollY - 30;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 50);
      if (window.innerWidth <= 768) {
        onClose();
      }
    }
  };

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    if (!isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  };

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Visão Geral' },
    { path: '/partidos', icon: <Users size={20} />, label: 'Visão Partidária' },
    { path: '/parlamentares', icon: <Search size={20} />, label: 'Deputados' },
    { path: '/metodologia', icon: <BookOpen size={20} />, label: 'Metodologia' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      
      <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between' }}>
        <div>
          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 className="text-gradient">Observatório Político</h2>
              <p className="subtitle">Análise da Câmara dos Deputados</p>
            </div>
            <button className="mobile-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
              
              {/* Render sub-items if we are currently on the Metodologia route */}
              {item.path === '/metodologia' && location.pathname === '/metodologia' && (
                <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', marginBottom: '8px' }}>
                  {metodologiaSubItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleScrollTo(sub.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      • {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <Moon size={20} style={{ color: !isLightMode ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
          <div 
            onClick={toggleTheme}
            style={{
              width: '50px',
              height: '26px',
              background: isLightMode ? '#cbd5e1' : '#3b82f6',
              borderRadius: '13px',
              position: 'relative',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              transition: 'background 0.3s ease'
            }}
          >
            <div 
              style={{
                width: '20px',
                height: '20px',
                background: '#ffffff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isLightMode ? '26px' : '2px',
                transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          </div>
          <Sun size={20} style={{ color: isLightMode ? '#f59e0b' : 'var(--text-muted)' }} />
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
