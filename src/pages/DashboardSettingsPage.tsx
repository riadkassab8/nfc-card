import React, { useState } from 'react';
import { Card, Input, Button, Toast, ToastType } from '../components/ui';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';

export const DashboardSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setToast({ type: 'error', message: t('common.error') });
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast({ type: 'success', message: t('dashboard.settings.saveSuccess') });
    }, 500);
  };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', top: 'var(--space-2xl)', insetInlineEnd: 'var(--space-2xl)', zIndex: 1100 }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)', maxWidth: '600px' }}>
        {/* Account Identity Section */}
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Mail size={20} style={{ color: 'var(--text-primary)' }} />
              <h2 className="text-section">{t('dashboard.settings.title')}</h2>
            </div>

            <Input
              label={t('dashboard.profile.phone')}
              value="admin@dynamicqr.app"
              disabled
            />
          </div>
        </Card>

        {/* Change Password Form */}
        <Card padding="lg">
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <KeyRound size={20} style={{ color: 'var(--text-primary)' }} />
              <h2 className="text-section">{t('dashboard.settings.title')}</h2>
            </div>

            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
              <Button type="submit" variant="primary" isLoading={updating}>
                <ShieldCheck size={18} /> {t('common.save')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};
