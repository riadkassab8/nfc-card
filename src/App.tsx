import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute, FallbackRoute } from './components/admin/ProtectedRoute';
import { AdminShell } from './components/admin/AdminShell';

import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { CustomerDetailsPage } from './pages/admin/CustomerDetailsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminAddCardPage } from './pages/admin/AdminAddCardPage';
import { AdminEditCardPage } from './pages/admin/AdminEditCardPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminScanPage } from './pages/admin/AdminScanPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { PublicCardLandingPage } from './pages/PublicCardLandingPage';
import { SocialPage } from './pages/SocialPage';

export const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* ── Auth (Public - no token required) ── */}
        <Route path="/" element={<FallbackRoute />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/forgot-password" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/admin/reset-password" element={<Navigate to="/reset-password" replace />} />

        {/* ── Public card routes (no auth) ── */}
        <Route path="/social/:publicCode" element={<SocialPage />} />
        <Route path="/r/:publicCode" element={<PublicCardLandingPage />} />

        {/* ── Admin routes (protected) ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredPage="overview">
              <AdminShell title="نظرة عامة">
                <AdminOverviewPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute requiredPage="customers">
              <AdminShell title="إدارة العملاء">
                <AdminCustomersPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers/:id"
          element={
            <ProtectedRoute requiredPage="customers">
              <AdminShell title="تفاصيل العميل">
                <CustomerDetailsPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cards"
          element={
            <ProtectedRoute requiredPage="cards">
              <AdminShell title="إدارة البطاقات">
                <AdminInventoryPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requiredPage="categories">
              <AdminShell title="التصنيفات">
                <AdminCategoriesPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/scan"
          element={
            <ProtectedRoute requiredPage="scan">
              <AdminShell title="فحص وتجهيز">
                <AdminScanPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredPage="analytics">
              <AdminShell title="الإحصائيات">
                <AdminAnalyticsPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute requiredPage="notifications">
              <AdminShell title="مركز الإشعارات">
                <AdminNotificationsPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <AdminShell title="المستخدمين والصلاحيات">
                <AdminUsersPage />
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
            <ProtectedRoute requiredPage="cards" requiredAction="cards:create">
              <AdminShell title="إضافة بطاقة">
                <AdminAddCardPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cards/:id/edit"
          element={
            <ProtectedRoute requiredPage="cards" requiredAction="cards:edit">
              <AdminShell title="تعديل البطاقة">
                <AdminEditCardPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />

        {/* Fallback — dashboard when signed in, login otherwise */}
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
