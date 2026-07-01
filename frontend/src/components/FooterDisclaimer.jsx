import React from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const FooterDisclaimer = () => {
  return (
    <footer style={{
      marginTop: '48px',
      padding: '24px 16px',
      borderTop: '1px solid var(--border-color)',
      textAlign: 'center',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Info size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <span>
          Este é um projeto estritamente acadêmico, sem fins lucrativos ou políticos, desenvolvido apenas com dados públicos.
        </span>
      </div>
      <div>
        Algumas informações podem apresentar inconsistências devido a inconformidades nas fontes de dados da Câmara dos Deputados.{' '}
        <Link to="/metodologia" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
          Saiba mais na nossa Metodologia
        </Link>.
      </div>
    </footer>
  );
};

export default FooterDisclaimer;
