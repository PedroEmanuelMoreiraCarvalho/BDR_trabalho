import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, PieChart, BarChart3, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Visão Nacional' },
    { path: '/partidos', icon: <Users size={20} />, label: 'Visão Partidária' },
    { path: '/deputados', icon: <PieChart size={20} />, label: 'Perfil Deputado' },
    { path: '/analise', icon: <BarChart3 size={20} />, label: 'Análises Avançadas' },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2 className="text-gradient">BDR Analytics</h2>
        <p className="subtitle">Observatório Político</p>
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

      <div className="sidebar-footer">
        <div className="nav-item">
          <Settings size={20} />
          <span>Configurações</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
