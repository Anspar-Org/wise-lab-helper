/**
 * RoleGuard component
 * Ensures user has the correct role to access a route
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import type { UserRole } from '@/types/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on role
    const redirectPath = user?.role === 'coach' ? '/coach/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
