import React from 'react';
import { Business } from '../../types';
import { MapPin } from 'lucide-react';

export interface PublicBusinessHeaderProps {
  business: Business;
}

export const PublicBusinessHeader: React.FC<PublicBusinessHeaderProps> = ({ business }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-2xl)',
      }}
    >
      {/* Business Logo or Initials Avatar */}
      {business.logo_url ? (
        <img
          src={business.logo_url}
          alt={`${business.name} Logo`}
          style={{
            width: '84px',
            height: '84px',
            borderRadius: 'var(--radius-xl)',
            objectFit: 'cover',
            boxShadow: 'var(--shadow-subtle)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
          }}
        />
      ) : (
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--text-on-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-title)',
            fontWeight: 700,
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          {getInitials(business.name)}
        </div>
      )}

      {/* Business Identity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        <h1 className="text-title" style={{ color: 'var(--text-primary)', fontSize: '1.75rem' }}>
          {business.name}
        </h1>

        {business.description && (
          <p className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            {business.description}
          </p>
        )}

        {business.address && (
          <div
            className="text-caption"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              marginTop: 'var(--space-xs)',
            }}
          >
            <MapPin size={14} style={{ flexShrink: 0 }} />
            <span>{business.address}</span>
          </div>
        )}
      </div>
    </header>
  );
};
