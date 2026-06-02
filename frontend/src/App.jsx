import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardNacional from './pages/DashboardNacional';
import BuscaParlamentares from './pages/BuscaParlamentares';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardNacional />} />
            <Route path="/parlamentares" element={<BuscaParlamentares />} />
            {/* Outras rotas entrarão aqui */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
