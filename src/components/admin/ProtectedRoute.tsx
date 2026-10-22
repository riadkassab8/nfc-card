import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { UserRole } from '../../types';

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

export const getDefaultAdminPath = (admin: any): string => {
  if (!admin) return '/login';
  if (admin.role === 'super_admin') return '/admin';
  if (admin.role === 'merchant') return '/merchant';

  const pages: string[] = admin.permissions?.pages || [];
  if (pages.includes('overview')) return '/admin';

  const pagePathMap: Record<string, string> = {
    cards: '/admin/cards',
    orders: '/admin/orders',
    website_content: '/admin/website-content',
    website_products: '/admin/website-products',
    website_links: '/admin/website-links',
    customers: '/admin/customers',
    categories: '/admin/categories',
    scan: '/admin/scan',
    analytics: '/admin/analytics',
    notifications: '/admin/notifications',
  };

  if (pages.includes('orders')) return '/admin/orders';

  for (const page of pages) {
    if (pagePathMap[page]) return pagePathMap[page];
  }

  return '/admin/profile';
};

/* Admin-only routes with granular role and page access checks */
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPage?: string;
  requiredAction?: string;
}> = ({ children, requiredRole, requiredPage, requiredAction }) => {
  const { isAuthenticated, loading, admin, isSuperAdmin, canAccessPage, can } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) return <FullPageLoader />;

  // Merchants must strictly stay inside /merchant portal and never access /admin routes
  if (admin?.role === 'merchant' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/merchant" replace />;
  }

  // Super Admin has unrestricted access to everything
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const fallbackPath = getDefaultAdminPath(admin);

  // Non-merchants (e.g. staff) should not access merchant portal
  if (admin?.role !== 'merchant' && location.pathname.startsWith('/merchant')) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check required role if specified (e.g. only super_admin or only merchant)
  if (requiredRole && admin?.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check required page if specified
  if (requiredPage && !canAccessPage(requiredPage)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check required action if specified
  if (requiredAction && !can(requiredAction)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

/* Guest-only routes (login / forgot password): a valid token → straight to the dashboard */
export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, admin } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    if (admin?.role === 'merchant') {
      return <Navigate to="/merchant" replace />;
    }
    const from = (location.state as any)?.from;
    const target = from?.pathname && from.pathname.startsWith('/admin')
      ? `${from.pathname}${from.search || ''}${from.hash || ''}`
      : getDefaultAdminPath(admin);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

/* Unknown URLs: dashboard if signed in, otherwise login */
export const FallbackRoute: React.FC = () => {
  const { isAuthenticated, admin } = useAuth();
  return <Navigate to={isAuthenticated ? getDefaultAdminPath(admin) : '/login'} replace />;
};
