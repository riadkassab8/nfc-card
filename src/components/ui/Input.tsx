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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.8125rem' }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={className}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            border: `1px solid ${error ? '#fecaca' : '#cbd5e1'}`,
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            minHeight: '42px',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
            outline: 'none',
            ...style,
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            style={{ color: '#dc2626', fontWeight: 500, fontSize: '0.75rem' }}
            role="alert"
          >
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${inputId}-helper`} style={{ color: '#64748b', fontSize: '0.75rem' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
