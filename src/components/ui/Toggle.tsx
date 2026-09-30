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
        verticalAlign: 'middle',
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
          direction: 'ltr',
          position: 'relative',
          width: '44px',
          height: '24px',
          borderRadius: '9999px',
          backgroundColor: checked ? '#10b981' : '#d4d4d8',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          flexShrink: 0,
          outline: 'none',
          overflow: 'hidden',
          appearance: 'none',
          WebkitAppearance: 'none',
          boxShadow: checked ? '0 0 0 1px rgba(16, 185, 129, 0.2)' : 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 1px rgba(0, 0, 0, 0.1)',
            transform: checked ? 'translateX(20px)' : 'translateX(0px)',
            transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform',
            display: 'block',
          }}
        />
      </button>
      {label && <span className="text-body-medium" style={{ whiteSpace: 'nowrap' }}>{label}</span>}
    </label>
  );
};

