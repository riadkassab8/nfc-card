import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastProps {
  id?: string;
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--success-bg)',
          color: 'var(--success-text)',
          border: 'var(--success-border)',
          Icon: CheckCircle2,
        };
      case 'warning':
        return {
          bg: 'var(--warning-bg)',
          color: 'var(--warning-text)',
          border: 'var(--warning-border)',
          Icon: AlertTriangle,
        };
      case 'error':
      default:
        return {
          bg: 'var(--error-bg)',
          color: 'var(--error-text)',
          border: 'var(--error-border)',
          Icon: XCircle,
        };
    }
  };

  const { bg, color, border, Icon } = getToastStyles();

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) var(--space-lg)',
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-elevated)',
        minWidth: '280px',
        maxWidth: '420px',
      }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      <span className="text-body-medium" style={{ flex: 1 }}>
        {message}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss toast"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
