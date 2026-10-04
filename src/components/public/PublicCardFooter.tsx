import React from 'react';
import { Zap } from 'lucide-react';

export const PublicCardFooter: React.FC = () => {
  return (
    <footer style={{ textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        opacity: 0.7
      }}>
        <Zap size={14} style={{ color: 'var(--text-secondary)' }} />
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          NFC Smart Card
        </span>
      </div>
    </footer>
  );
};
