import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./index.css";   
import './styles/theme.css';
import './styles/login.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Logout from './components/Logout';
import TramiteNuevo from './components/TramiteNuevo';
import TramiteEditar from './components/TramiteEditar';
import InstanciaForm from './components/InstanciaForm';
import TramiteInstancias from './components/TramiteInstancias';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida */}
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} />}
        />

        {/* Ruta para logout */}
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/tramites/nuevo" element={<TramiteNuevo />} />
        <Route path="/tramites/:id/editar" element={<TramiteEditar />} />
        <Route path="/instancias/:id" element={<InstanciaForm />} />
        <Route path="/tramites/:id/instancias" element={<TramiteInstancias />} />
      </Routes>
    </Router>
  );
}

export default App;
