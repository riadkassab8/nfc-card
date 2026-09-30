import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  elevated = false,
  className = '',
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return 'var(--space-md)';
      case 'lg':
        return 'var(--space-2xl)';
      case 'md':
      default:
        return 'var(--space-lg)';
    }
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: elevated ? 'var(--shadow-elevated)' : 'var(--shadow-subtle)',
        padding: getPadding(),
        transition: 'all 150ms ease-out',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
