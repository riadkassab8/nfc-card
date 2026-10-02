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
    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
        {label && (
          <label
            htmlFor={selectId}
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

        <div style={{ position: 'relative', width: '100%' }}>
          <select
            id={selectId}
            ref={ref}
            className={className}
            style={{
              width: '100%',
              padding: '10px 40px 10px 14px',
              borderRadius: '10px',
              border: `1.5px solid ${error ? '#fca5a5' : '#cbd5e1'}`,
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 500,
              minHeight: '44px',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              outline: 'none',
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
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

          {/* custom chevron */}
          <span
            style={{
              position: 'absolute',
              insetInlineEnd: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
            }}
          >
            ▾
          </span>
        </div>

        {error && (
          <span
            style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}
            role="alert"
          >
            ⚠ {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
