import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../stores/useAuthStore';
import { canAccessRoute, Role, type Permission } from '@dc/shared';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }

  if (requiredPermission && !canAccessRoute(user.role as Role, requiredPermission)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export const PermissionGuard: React.FC<{ permission: Permission; children: React.ReactNode; fallback?: React.ReactNode }> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { user } = useAuthStore();

  if (!user || !canAccessRoute(user.role as Role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export const RoleGuard: React.FC<{ roles: Role[]; children: React.ReactNode; fallback?: React.ReactNode }> = ({
  roles,
  children,
  fallback = null,
}) => {
  const { user } = useAuthStore();

  if (!user || !roles.includes(user.role as Role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
