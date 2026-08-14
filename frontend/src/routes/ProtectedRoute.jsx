import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Wrapper
 * Checks user authentication and allowed roles.
 * - Unauthenticated -> Redirects to /login
 * - Unauthorized Role -> Redirects to role default homepage
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading FarmConnect...</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Verifying authentication session</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to default home page based on actual role
    if (role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    if (role === 'consumer') return <Navigate to="/consumer/home" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
