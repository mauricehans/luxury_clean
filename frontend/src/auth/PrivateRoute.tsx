import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

/**
 * Tâche 5.1 — Route protégée :
 *  - Redirige vers /admin/login si non authentifié
 *  - Si requireSuperAdmin, refuse l'accès aux admins simples
 */
const PrivateRoute = ({ children, requireSuperAdmin = false }: PrivateRouteProps) => {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Chargement…</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && user.role !== 'super_admin') {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Accès refusé</h2>
        <p className="text-gray-600">
          Cette section est réservée au Super Admin.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
