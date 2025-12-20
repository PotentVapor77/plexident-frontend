/**
 * ============================================================================
 * COMPONENT: ProtectedRoute
 * ============================================================================
 * Protege rutas que requieren autenticación
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  // Si NO está autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Si está autenticado, renderizar las rutas protegidas
  return <Outlet />;
}
