import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Search, Sun, Moon } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

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
  ];

  return (
    <aside className="sidebar glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between' }}>
      <div>
        <div className="sidebar-header">
          <h2 className="text-gradient">Observatório Político</h2>
          <p className="subtitle">Análise da Câmara dos Deputados</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
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
  );
};

export default Sidebar;
