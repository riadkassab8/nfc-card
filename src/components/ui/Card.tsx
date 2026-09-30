import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  elevated?: boolean;
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  elevated = false,
  hoverable = false,
  glass = false,
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
      className={`${className} ${hoverable ? 'card-hover-effect' : ''}`}
      style={{
        backgroundColor: glass ? 'rgba(255, 255, 255, 0.85)' : 'var(--bg-surface)',
        backdropFilter: glass ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(12px)' : 'none',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: elevated ? 'var(--shadow-elevated)' : 'var(--shadow-subtle)',
        padding: getPadding(),
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
