import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminShell } from './components/admin/AdminShell';

import { LoginPage }               from './pages/LoginPage';
import { ForgotPasswordPage }       from './pages/ForgotPasswordPage';
import { ResetPasswordPage }        from './pages/ResetPasswordPage';
import { AdminOverviewPage }        from './pages/admin/AdminOverviewPage';
import { AdminCustomersPage }       from './pages/admin/AdminCustomersPage';
import { CustomerDetailsPage }      from './pages/admin/CustomerDetailsPage';
import { AdminInventoryPage }       from './pages/admin/AdminInventoryPage';
import { AdminAddCardPage }         from './pages/admin/AdminAddCardPage';
import { AdminCategoriesPage }      from './pages/admin/AdminCategoriesPage';
import { AdminScanPage }            from './pages/admin/AdminScanPage';
import { AdminAnalyticsPage }       from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage }        from './pages/admin/AdminSettingsPage';
import { PublicCardLandingPage }    from './pages/PublicCardLandingPage';
import { SocialPage }               from './pages/SocialPage';

export const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* ── Auth (Public - no token required) ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/forgot-password" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/admin/reset-password" element={<Navigate to="/reset-password" replace />} />

        {/* ── Public card routes (no auth) ── */}
        <Route path="/social/:publicCode"  element={<SocialPage />} />
        <Route path="/r/:publicCode"       element={<PublicCardLandingPage />} />

        {/* ── Admin routes (protected) ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminShell title="نظرة عامة">
                <AdminOverviewPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute>
              <AdminShell title="إدارة العملاء">
                <AdminCustomersPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers/:id"
          element={
            <ProtectedRoute>
              <AdminShell title="تفاصيل العميل">
                <CustomerDetailsPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cards"
          element={
            <ProtectedRoute>
              <AdminShell title="إدارة البطاقات">
                <AdminInventoryPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <AdminShell title="التصنيفات">
                <AdminCategoriesPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/scan"
          element={
            <ProtectedRoute>
              <AdminShell title="فحص وتجهيز">
                <AdminScanPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminShell title="الإحصائيات">
                <AdminAnalyticsPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={<Navigate to="/admin/profile" replace />}
        />

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <AdminShell title="الملف الشخصي">
                <AdminSettingsPage initialTab="profile" />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-card"
          element={
            <ProtectedRoute>
              <AdminShell title="إضافة بطاقة">
                <AdminAddCardPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        {/* Fallback — go to login for unauthenticated, admin guards handle redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
