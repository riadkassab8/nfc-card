/* ==========================================================================
   PROTECTED ROUTE COMPONENT (src/components/admin/ProtectedRoute.tsx)
   ========================================================================== */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton, Card } from '../ui';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '24px' }}>
        <Card padding="lg" style={{ backgroundColor: '#1e293b', border: 'none', color: '#ffffff', width: '320px', textAlign: 'center' }}>
          <Skeleton height="32px" style={{ marginBottom: '16px' }} />
          <Skeleton height="20px" width="70%" style={{ margin: '0 auto 12px' }} />
          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>جاري التحقق من جلسة المسؤول...</span>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
