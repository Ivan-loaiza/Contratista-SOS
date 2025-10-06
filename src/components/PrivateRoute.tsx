// src/components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { JSX } from 'react';

interface PrivateRouteProps {
  children: JSX.Element;
  requiredRole?: 'client' | 'contractor';
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.email && requiredRole !== getRoleFromEmail(user.email)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 💡 Solo ejemplo: podrías extraer rol real desde un JWT
const getRoleFromEmail = (email: string): 'client' | 'contractor' => {
  return email.includes('client') ? 'client' : 'contractor';
};
