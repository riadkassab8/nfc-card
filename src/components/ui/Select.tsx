import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, className = '', style, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', width: '100%' }}>
        {label && (
          <label htmlFor={selectId} className="text-label" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <select
          id={selectId}
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
            cursor: 'pointer',
            ...style,
          }}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-caption" style={{ color: 'var(--error-text)', fontWeight: 500 }} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
