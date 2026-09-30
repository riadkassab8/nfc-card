import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) onChange(!checked);
        }}
        style={{
          position: 'relative',
          width: '42px',
          height: '24px',
          borderRadius: '9999px',
          backgroundColor: checked ? '#22c55e' : 'var(--bg-surface-active)',
          border: `1.5px solid ${checked ? '#22c55e' : 'var(--border-strong)'}`,
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 200ms ease',
          boxSizing: 'border-box',
          flexShrink: 0,
          outline: 'none',
        }}
      >
        <span
          style={{
            display: 'block',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            transition: 'all 200ms ease',
            flexShrink: 0,
          }}
        />
      </button>
      {label && <span className="text-body-medium" style={{ whiteSpace: 'nowrap' }}>{label}</span>}
    </label>
  );
};
