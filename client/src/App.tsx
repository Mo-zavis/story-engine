import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectPage } from './pages/ProjectPage';
import { SystemFlowPage } from './pages/SystemFlowPage';
import { ProductionTeamPage } from './pages/ProductionTeamPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/system-flow" element={<SystemFlowPage />} />
        <Route path="/production-team" element={<ProductionTeamPage />} />
      </Routes>
    </BrowserRouter>
  );
}
