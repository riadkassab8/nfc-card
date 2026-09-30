import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gradient';
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
  style: userStyle,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: '1px solid #0f172a',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
        };
      case 'secondary':
        return {
          backgroundColor: '#f1f5f9',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#334155',
          border: '1px solid #cbd5e1',
        };
      case 'danger':
        return {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#475569',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.8125rem', borderRadius: '8px', minHeight: '34px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '1rem', borderRadius: '12px', minHeight: '50px' };
      case 'md':
      default:
        return { padding: '8px 16px', fontSize: '0.875rem', borderRadius: '10px', minHeight: '40px' };
    }
  };

  const combinedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...userStyle,
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={combinedStyle}
      className={`${className} glow-pill`}
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
