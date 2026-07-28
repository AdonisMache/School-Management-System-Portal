import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredRole 
}) => {
  const { user, loading, hasPermission, hasRole, mustChangePassword, status } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0b10]">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <p className="text-gray-400 text-sm animate-pulse">Loading VLCSMS session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and preserve original path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Prevent suspended or archived users
  if (status === 'suspended' || status === 'archived') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Force password change on first login
  if (mustChangePassword && location.pathname !== '/force-change-password') {
    return <Navigate to="/force-change-password" replace />;
  }

  // Enforce role-based access if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Enforce permission-based access if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
