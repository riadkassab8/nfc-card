import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { PublicBusinessPage } from './pages/PublicBusinessPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { QRCodesPage } from './pages/QRCodesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardSettingsPage } from './pages/DashboardSettingsPage';
import { AdminShell } from './components/admin/AdminShell';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminBusinessesPage } from './pages/admin/AdminBusinessesPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminScanPage } from './pages/admin/AdminScanPage';
import { Button, LanguageSwitcher } from './components/ui';
import { useTranslation } from './i18n';
import { QrCode, ShieldAlert } from 'lucide-react';

const GlobalHeader: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Hide header completely on public customer routes for clean customer view
  if (location.pathname.startsWith('/q/')) {
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
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <GlobalHeader />

        {/* Main Route Body */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Dynamic Customer Route */}
            <Route path="/q/:publicCode" element={<PublicBusinessPage />} />

            {/* Merchant Prototype Routes (Hidden from Admin Workflow) */}
            <Route path="/dashboard" element={<DashboardOverviewPage />} />
            <Route path="/dashboard/business" element={<BusinessProfilePage />} />
            <Route path="/dashboard/qr-codes" element={<QRCodesPage />} />
            <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
            <Route path="/dashboard/settings" element={<DashboardSettingsPage />} />

            {/* Platform Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminShell title="Platform Overview">
                  <AdminOverviewPage />
                </AdminShell>
              }
            />
            <Route
              path="/admin/cards"
              element={
                <AdminShell title="Cards Inventory">
                  <AdminInventoryPage />
                </AdminShell>
              }
            />
            <Route
              path="/admin/qr-nfc"
              element={
                <AdminShell title="Cards Inventory">
                  <AdminInventoryPage />
                </AdminShell>
              }
            />
            <Route
              path="/admin/scan"
              element={
                <AdminShell title="Scan / Provision Card">
                  <AdminScanPage />
                </AdminShell>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminShell title="Analytics & Reports">
                  <AnalyticsPage />
                </AdminShell>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminShell title="Admin Settings">
                  <DashboardSettingsPage />
                </AdminShell>
              }
            />
            <Route
              path="/admin/businesses"
              element={
                <AdminShell title="Business Data">
                  <AdminBusinessesPage />
                </AdminShell>
              }
            />

            {/* Default Fallback Redirect to Admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

