import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', style, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-label"
            style={{ color: 'var(--text-primary)', fontWeight: 500 }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`text-body ${className}`}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${error ? 'var(--error-border)' : 'var(--border-subtle)'}`,
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family-base)',
            minHeight: '44px',
            transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
            ...style,
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-caption"
            style={{ color: 'var(--error-text)', fontWeight: 500 }}
            role="alert"
          >
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${inputId}-helper`} className="text-caption">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
