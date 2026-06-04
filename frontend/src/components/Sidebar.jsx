import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, PieChart, BarChart3, Search } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Visão Geral' },
    { path: '/partidos', icon: <Users size={20} />, label: 'Visão Partidária' },
    { path: '/parlamentares', icon: <Search size={20} />, label: 'Deputados' },
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

    </aside>
  );
};

export default Sidebar;
