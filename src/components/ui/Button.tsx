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
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [hovered, setHovered] = React.useState(false);

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: hovered ? '#1e293b' : '#0f172a',
          color: '#ffffff',
          border: '1.5px solid #0f172a',
          boxShadow: hovered ? '0 6px 18px rgba(15,23,42,0.22)' : '0 2px 8px rgba(15,23,42,0.12)',
        };
      case 'gradient':
        return {
          background: hovered
            ? 'linear-gradient(135deg,#4338ca 0%,#7c3aed 100%)'
            : 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: hovered ? '0 8px 20px rgba(79,70,229,0.38)' : '0 4px 14px rgba(79,70,229,0.25)',
        };
      case 'secondary':
        return {
          backgroundColor: hovered ? '#e2e8f0' : '#f1f5f9',
          color: '#0f172a',
          border: '1.5px solid #e2e8f0',
        };
      case 'outline':
        return {
          backgroundColor: hovered ? '#f8fafc' : 'transparent',
          color: '#334155',
          border: '1.5px solid #cbd5e1',
        };
      case 'danger':
        return {
          backgroundColor: hovered ? '#fee2e2' : '#fef2f2',
          color: '#dc2626',
          border: '1.5px solid #fca5a5',
        };
      case 'ghost':
        return {
          backgroundColor: hovered ? '#f1f5f9' : 'transparent',
          color: '#475569',
          border: '1.5px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 13px', fontSize: '0.8125rem', borderRadius: '8px', minHeight: '34px', gap: '5px' };
      case 'lg':
        return { padding: '13px 26px', fontSize: '1rem',     borderRadius: '12px', minHeight: '52px', gap: '9px' };
      case 'md':
      default:
        return { padding: '9px 18px', fontSize: '0.9rem',    borderRadius: '10px', minHeight: '42px', gap: '7px' };
    }
  };

  const combinedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 700,
    letterSpacing: '0.01em',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.55 : 1,
    transition: 'all 160ms cubic-bezier(0.4,0,0.2,1)',
    width: fullWidth ? '100%' : 'auto',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transform: hovered && !disabled && !isLoading ? 'translateY(-1px)' : 'translateY(0)',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...userStyle,
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={combinedStyle}
      className={`${className} glow-pill`}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e); }}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            display: 'inline-block',
            width: '15px', height: '15px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.65s linear infinite',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
