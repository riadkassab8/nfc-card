import React from 'react';


export const PublicCardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
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
