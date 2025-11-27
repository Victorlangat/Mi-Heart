// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requiredRole = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/signin" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Redirect away from auth pages if already authenticated
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.userType !== requiredRole) {
    return (
      <div className="access-denied">
        <div className="denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;