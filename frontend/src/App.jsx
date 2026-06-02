import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardNacional from './pages/DashboardNacional';
import BuscaParlamentares from './pages/BuscaParlamentares';
import VisaoPartidaria from './pages/VisaoPartidaria';
import PerfilDeputado from './pages/PerfilDeputado';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardNacional />} />
            <Route path="/partidos" element={<VisaoPartidaria />} />
            <Route path="/parlamentares" element={<BuscaParlamentares />} />
            <Route path="/parlamentares/:id" element={<PerfilDeputado />} />
            {/* Outras rotas entrarão aqui */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
