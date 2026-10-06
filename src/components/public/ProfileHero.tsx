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
      <div className="hero-img-wrap" style={{
        width: '110px',
        height: '110px',
        borderRadius: '28px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03)',
        position: 'relative'
      }}>
        {biz?.logo ? (
          <img
            src={biz.logo}
            alt={bizName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '6px',
              borderRadius: '24px',
              imageRendering: 'crisp-edges',
            }}
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
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          {initials}
        </div>
      </div>

      <div style={{ color: '#A68250', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
        أهلاً بكم في
      </div>

      <h1 style={{
        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
        fontWeight: 800,
        margin: '0 0 12px',
        color: 'var(--text-primary)',
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
      }}>
        {bizName}
      </h1>

      {biz?.description && (
        <p style={{
          fontSize: '1.0625rem',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: 1.6,
          fontWeight: 400,
          maxWidth: '500px'
        }}>
          {biz.description}
        </p>
      )}
    </header>
  );
};
