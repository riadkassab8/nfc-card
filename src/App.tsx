import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { PublicCardLandingPage } from './pages/PublicCardLandingPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { QRCodesPage } from './pages/QRCodesPage';
import { DashboardSettingsPage } from './pages/DashboardSettingsPage';
import { AdminShell } from './components/admin/AdminShell';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminBusinessesPage } from './pages/admin/AdminBusinessesPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminScanPage } from './pages/admin/AdminScanPage';
import { Button, LanguageSwitcher } from './components/ui';
import { useTranslation } from './i18n';
import { QrCode, ShieldAlert } from 'lucide-react';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

const GlobalHeader: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Hide header completely on public customer routes for clean customer view
  if (
    location.pathname.startsWith('/card/') ||
    location.pathname.startsWith('/c/') ||
    location.pathname.startsWith('/q/') ||
    location.pathname.startsWith('/r/') ||
    location.pathname === '/login'
  ) {
    return null;
  }

  // Hide header inside dashboard routes since DashboardShell renders its own header
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  // Hide header inside admin routes since AdminShell renders its own header
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'var(--space-md) var(--space-2xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <QrCode size={22} style={{ color: 'var(--text-primary)' }} />
        <span className="text-section">{t('common.appName')}</span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <Link to="/admin">
          <Button variant="ghost" size="sm">
            <ShieldAlert size={16} /> {t('common.adminDashboard')}
          </Button>
        </Link>
        <LanguageSwitcher variant="outline" size="sm" />
      </nav>
    </header>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <GlobalHeader />

          {/* Main Route Body */}
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Unauthenticated Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Public Dynamic Customer Card Landing Page Routes */}
              <Route path="/card/:cardId" element={<PublicCardLandingPage />} />
              <Route path="/c/:publicCode" element={<PublicCardLandingPage />} />
              <Route path="/q/:publicCode" element={<PublicCardLandingPage />} />
              <Route path="/r/:publicCode" element={<PublicCardLandingPage />} />

              {/* Merchant Prototype Routes */}
              <Route path="/dashboard" element={<DashboardOverviewPage />} />
              <Route path="/dashboard/business" element={<BusinessProfilePage />} />
              <Route path="/dashboard/qr-codes" element={<QRCodesPage />} />
              <Route path="/dashboard/settings" element={<DashboardSettingsPage />} />

              {/* Platform Admin Routes (Protected by JWT Auth) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminShell title="Platform Overview">
                      <AdminOverviewPage />
                    </AdminShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/cards"
                element={
                  <ProtectedRoute>
                    <AdminShell title="Cards Inventory">
                      <AdminInventoryPage />
                    </AdminShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/qr-nfc"
                element={
                  <ProtectedRoute>
                    <AdminShell title="Cards Inventory">
                      <AdminInventoryPage />
                    </AdminShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/scan"
                element={
                  <ProtectedRoute>
                    <AdminShell title="Scan / Provision Card">
                      <AdminScanPage />
                    </AdminShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <AdminShell title="Admin Settings">
                      <DashboardSettingsPage />
                    </AdminShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/businesses"
                element={
                  <ProtectedRoute>
                    <AdminShell title="Business Data">
                      <AdminBusinessesPage />
                    </AdminShell>
                  </ProtectedRoute>
                }
              />

              {/* Default Fallback Redirect to Admin */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

