import React from 'react';


export const PublicCardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: 'auto' }}>
      <a
        href="https://wa.me/201098277229"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="احجز دلوقتي كارتك أنت كمان على واتساب"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'min(100%, 360px)',
          minHeight: '48px',
          boxSizing: 'border-box',
          padding: '12px 20px',
          borderRadius: '999px',
          background: '#16a34a',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 800,
          textDecoration: 'none',
          boxShadow: '0 6px 18px rgba(22, 163, 74, 0.2)',
          marginBottom: '12px',
        }}
      >
        احجز دلوقتي كارتك أنت كمان
      </a>
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        opacity: 0.6,
        direction: 'ltr'
      }}>
        &copy; {currentYear} k2rty. All rights reserved.
      </div>
    </footer>
  );
};
