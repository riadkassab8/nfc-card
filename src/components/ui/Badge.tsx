import React from 'react';
import { useTranslation } from '../../i18n';

export interface BadgeProps {
  variant?: 'active' | 'disabled' | 'archived' | 'neutral' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, style }) => {
  const { formatStatus } = useTranslation();

  const getVariantStyles = () => {
    switch (variant) {
      case 'active':
      case 'success':
        return {
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success-text)',
          border: '1px solid var(--success-border)',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--warning-bg)',
          color: 'var(--warning-text)',
          border: '1px solid var(--warning-border)',
        };
      case 'disabled':
      case 'error':
        return {
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-text)',
          border: '1px solid var(--error-border)',
        };
      case 'archived':
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--bg-surface-hover)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
        };
    }
  };

  const content = typeof children === 'string' ? formatStatus(children) : children;

  return (
    <span
      className="text-caption"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontWeight: 500,
        ...getVariantStyles(),
        ...style,
      }}
    >
      {content}
    </span>
  );
};
