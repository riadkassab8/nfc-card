import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-3xl) var(--space-xl)',
        backgroundColor: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--error-text)',
        gap: 'var(--space-md)',
      }}
    >
      <AlertCircle size={32} />
      <div>
        <h4 className="text-section" style={{ color: 'var(--error-text)', marginBottom: 'var(--space-xs)' }}>
          {title}
        </h4>
        <p className="text-body" style={{ color: 'var(--error-text)', opacity: 0.9 }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-body-medium"
          style={{
            padding: 'var(--space-sm) var(--space-lg)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--error-text)',
            border: '1px solid var(--error-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};
