// src/routes.tsx
import { Route, Routes, Navigate } from 'react-router-dom';
import { WelcomeScreen } from './components/WelcomeScreen';
import ClientDashboard from './components/ClientDashboard';
import { ContractorDashboard } from './components/ContractorDashboard'; // 👈 asegúrate del nombre del archivo
import { useAuth } from './context/AuthContext';

export default function AppRoutes() {
  const { isAuthenticated, hasRole, user, logout } = useAuth();

  // Usa helpers robustos (case-insensitive y compatibles con 'ROLE_CONTRACTOR')
  const isContractor = hasRole('contractor') || user?.role === 'contractor';
  // Evita que un contractor entre por la ruta de client
  const isClient = hasRole('client') && !isContractor;

  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen initialTab="login" />} />
      <Route path="/login" element={<WelcomeScreen initialTab="login" />} />
      <Route path="/register" element={<WelcomeScreen initialTab="register" />} />

      <Route
        path="/client"
        element={
          isAuthenticated && isClient
            ? <ClientDashboard onLogout={logout} />
            : <Navigate to={isAuthenticated ? (isContractor ? '/contractor' : '/login') : '/login'} replace />
        }
      />

      <Route
        path="/contractor"
        element={
          isAuthenticated && isContractor
            ? <ContractorDashboard onLogout={logout} />
            : <Navigate to={isAuthenticated ? (isClient ? '/client' : '/login') : '/login'} replace />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
