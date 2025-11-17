/**
 * ProtectedRoute component
 * Ensures user is authenticated before accessing a route
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
