import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary-bg)',
          color: 'var(--text-on-primary)',
          border: '1px solid var(--primary-bg)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-surface-hover)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-strong)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-text)',
          border: '1px solid var(--error-border)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: 'var(--space-xs) var(--space-md)', fontSize: 'var(--font-size-label)', minHeight: '36px' };
      case 'lg':
        return { padding: 'var(--space-md) var(--space-2xl)', fontSize: 'var(--font-size-card)', minHeight: '54px' };
      case 'md':
      default:
        return { padding: 'var(--space-sm) var(--space-lg)', fontSize: 'var(--font-size-body)', minHeight: '44px' };
    }
  };

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all 150ms ease-out',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-family-base)',
    ...getVariantStyles(),
    ...getSizeStyles(),
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={style}
      className={className}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
