import React from 'react';
import { useTranslation } from '../../i18n';

export interface BadgeProps {
  variant?: 'active' | 'disabled' | 'archived' | 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'amber';
  children: React.ReactNode;
  showDot?: boolean;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, showDot = false, style }) => {
  const { formatStatus } = useTranslation();

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'active':
      case 'success':
        return {
          backgroundColor: '#ecfdf5',
          color: '#047857',
          border: '1px solid #a7f3d0',
        };
      case 'warning':
      case 'amber':
        return {
          backgroundColor: '#fffbeb',
          color: '#b45309',
          border: '1px solid #fde68a',
        };
      case 'disabled':
      case 'error':
        return {
          backgroundColor: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
        };
      case 'info':
        return {
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe',
        };
      case 'purple':
        return {
          backgroundColor: '#f3e8ff',
          color: '#6b21a8',
          border: '1px solid #d8b4fe',
        };
      case 'archived':
      case 'neutral':
      default:
        return {
          backgroundColor: '#f1f5f9',
          color: '#475569',
          border: '1px solid #e2e8f0',
        };
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'active':
      case 'success':
        return '#10b981';
      case 'warning':
      case 'amber':
        return '#f59e0b';
      case 'disabled':
      case 'error':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
      case 'purple':
        return '#a855f7';
      default:
        return '#64748b';
    }
  };

  const content = typeof children === 'string' ? formatStatus(children) : children;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...getVariantStyles(),
        ...style,
      }}
    >
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: getDotColor(),
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {content}
    </span>
  );
};
