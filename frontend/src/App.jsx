import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardNacional from './pages/DashboardNacional';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardNacional />} />
            {/* Outras rotas entrarão aqui */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
