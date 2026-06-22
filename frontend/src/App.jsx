import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardNacional from './pages/DashboardNacional';
import BuscaParlamentares from './pages/BuscaParlamentares';
import VisaoPartidaria from './pages/VisaoPartidaria';
import PerfilDeputado from './pages/PerfilDeputado';
import Metodologia from './pages/Metodologia';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Mobile Header */}
        <div className="mobile-header">
           <Link to="/" style={{ textDecoration: 'none' }}>
             <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.25rem' }}>Observatório Político</h2>
           </Link>
           <button onClick={() => setIsMobileMenuOpen(true)} className="mobile-menu-btn">
             <Menu size={24} />
           </button>
        </div>

        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        
        <main className="main-content" onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<DashboardNacional />} />
            <Route path="/partidos" element={<VisaoPartidaria />} />
            <Route path="/parlamentares" element={<BuscaParlamentares />} />
            <Route path="/parlamentares/:id" element={<PerfilDeputado />} />
            <Route path="/metodologia" element={<Metodologia />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
