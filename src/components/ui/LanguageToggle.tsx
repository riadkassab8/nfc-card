import React from 'react';
import { useTranslation } from '../../i18n';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage, t } = useTranslation();
  const isEn = language === 'en';

  const ariaLabel = isEn
    ? t('common.languageToggle') || 'تغيير اللغة إلى العربية'
    : 'Switch language to English';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEn}
      aria-label={ariaLabel}
      onClick={toggleLanguage}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '108px',
        height: '34px',
        padding: '3px',
        backgroundColor: 'var(--bg-surface-hover)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        userSelect: 'none',
        outline: 'none',
        transition: 'all 200ms ease',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
        direction: 'ltr', // Fixed internal geometry for deterministic toggle sliding
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 2px var(--primary-bg)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Animated Sliding Pill Thumb */}
      <div
        style={{
          position: 'absolute',
          top: '3px',
          left: '3px',
          width: '50px',
          height: '26px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-subtle), 0 1px 3px rgba(0,0,0,0.1)',
          transform: isEn ? 'translateX(50px)' : 'translateX(0px)',
          transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1,
          border: '1px solid var(--border-subtle)',
        }}
      />

      {/* AR Option */}
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          fontSize: 'var(--font-size-xs)',
          fontWeight: !isEn ? 700 : 500,
          color: !isEn ? 'var(--text-primary)' : 'var(--text-tertiary)',
          transition: 'color 200ms ease',
          fontFamily: 'var(--font-family-base)',
        }}
      >
        <span>AR</span>
        <span style={{ fontSize: '11px' }}>🇪🇬</span>
      </span>

      {/* EN Option */}
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          fontSize: 'var(--font-size-xs)',
          fontWeight: isEn ? 700 : 500,
          color: isEn ? 'var(--text-primary)' : 'var(--text-tertiary)',
          transition: 'color 200ms ease',
          fontFamily: 'var(--font-family-base)',
        }}
      >
        <span>EN</span>
        <span style={{ fontSize: '11px' }}>🇬🇧</span>
      </span>
    </button>
  );
};
