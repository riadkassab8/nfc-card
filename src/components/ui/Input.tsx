import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', style, disabled, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.8125rem',
              fontFamily: 'Cairo, sans-serif',
              letterSpacing: '0.01em',
            }}
          >
            {label}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={className}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            border: `1.5px solid ${error ? '#fca5a5' : '#cbd5e1'}`,
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            color: disabled ? '#94a3b8' : '#0f172a',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 500,
            minHeight: '44px',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxSizing: 'border-box',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'text',
            ...style,
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {error && (
          <span
            id={`${inputId}-error`}
            style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            role="alert"
          >
            ⚠ {error}
          </span>
        )}

        {!error && helperText && (
          <span id={`${inputId}-helper`} style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
