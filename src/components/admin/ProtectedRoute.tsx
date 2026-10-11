import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* Full-screen branded loader shown while the session is being verified */
export const FullPageLoader: React.FC<{ label?: string }> = ({ label = 'جاري التحقق من الجلسة...' }) => (
  <div className="page-loader" dir="rtl">
    <div className="page-loader-logo">
      <span className="page-loader-ring" />
      <span className="page-loader-dot" />
    </div>
    <p className="page-loader-label">{label}</p>
  </div>
);

/* Admin-only routes: no token → /login (remembering where the user wanted to go) */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) return <FullPageLoader />;

  return <>{children}</>;
};

/* Guest-only routes (login / forgot password): a valid token → straight to the dashboard */
export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = (location.state as any)?.from;
    const target = from?.pathname && from.pathname.startsWith('/admin')
      ? `${from.pathname}${from.search || ''}${from.hash || ''}`
      : '/admin';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

/* Unknown URLs: dashboard if signed in, otherwise login */
export const FallbackRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/admin' : '/login'} replace />;
};
