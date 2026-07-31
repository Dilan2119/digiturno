import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SedesPage from './pages/SedesPage';
import SalasPage from './pages/SalasPage';
import VisoresPage from './pages/VisoresPage';
import ServiciosPage from './pages/ServiciosPage';
import ModulosPage from './pages/ModulosPage';
import UsuariosPage from './pages/UsuariosPage';
import MultimediaPage from './pages/MultimediaPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sedes" element={<SedesPage />} />
            <Route path="salas" element={<SalasPage />} />
            <Route path="visores" element={<VisoresPage />} />
            <Route path="servicios" element={<ServiciosPage />} />
            <Route path="modulos" element={<ModulosPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="multimedia" element={<MultimediaPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
