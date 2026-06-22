import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';

import VisaoGeral from './Metodologia/VisaoGeral';
import Score from './Metodologia/Score';
import Dicionario from './Metodologia/Dicionario';
import Limpeza from './Metodologia/Limpeza';

const Metodologia = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-container" style={{ padding: isMobile ? '16px' : '24px' }}>
      <header className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Metodologia</h1>
          <p className="text-secondary">Documentação completa da extração, limpeza e modelagem dos dados.</p>
        </div>
      </header>

      <div className="glass-card" style={{ 
        width: '100%',
        padding: isMobile ? '20px' : '40px',
        overflowX: 'hidden'
      }}>
        <div style={{
          color: 'var(--text-primary)', 
          lineHeight: '1.6',
          fontSize: '1rem',
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '64px'
        }}>
          <div id="visao_geral" style={{ scrollMarginTop: '80px' }}><VisaoGeral /></div>
          
          <div id="score" style={{ scrollMarginTop: '80px' }}><Score /></div>
          
          <div id="dicionario" style={{ scrollMarginTop: '80px' }}><Dicionario /></div>
          
          <div id="limpeza" style={{ scrollMarginTop: '80px' }}><Limpeza /></div>
          
          <div id="anexos" style={{ scrollMarginTop: '80px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text-primary)' }}>Anexos e Scripts de Coleta</h2>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              Abaixo estão os scripts utilizados para extrair e processar os dados da Câmara dos Deputados.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <a href="/docs/script_deputados.py" download className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', color: '#10b981' }}>
                  <FileText size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Script API Deputados</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>script_deputados.py</span>
                </div>
                <Download size={20} style={{ color: 'var(--text-secondary)' }} />
              </a>

              <a href="/docs/camera_scraper_presencas.py" download className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '8px', color: '#f59e0b' }}>
                  <FileText size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Scraper de Presenças</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>camera_scraper_presencas.py</span>
                </div>
                <Download size={20} style={{ color: 'var(--text-secondary)' }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metodologia;
