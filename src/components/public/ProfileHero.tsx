import React from 'react';
import { ApiCard } from '../../types';

export const ProfileHero: React.FC<{ card: ApiCard }> = ({ card }) => {
  const biz = card.business_data;
  const bizName = biz?.business_name || card.card_code;

  const initials = bizName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NC';

  return (
    <header style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <div style={{
        width: '96px',
        height: '96px',
        borderRadius: '16px',
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {biz?.logo ? (
          <img
            src={biz.logo}
            alt={bizName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        <div style={{
          display: biz?.logo ? 'none' : 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          {initials}
        </div>
      </div>

      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        margin: '0 0 8px',
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        lineHeight: 1.2
      }}>
        {bizName}
      </h1>

      {biz?.description && (
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: 1.5,
          fontWeight: 400,
          maxWidth: '90%'
        }}>
          {biz.description}
        </p>
      )}
    </header>
  );
};
