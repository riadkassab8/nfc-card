import React from 'react';
import { Card } from '../components/ui';

export interface PlaceholderRouteProps {
  title: string;
  section: string;
  description: string;
}

export const PlaceholderRoute: React.FC<PlaceholderRouteProps> = ({
  title,
  section,
  description,
}) => {
  return (
    <div style={{ padding: 'var(--space-2xl)', maxWidth: '800px', margin: '0 auto' }}>
      <Card elevated>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <span className="text-caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            [{section} Phase Placeholder]
          </span>
          <h1 className="text-title">{title}</h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
      </Card>
    </div>
  );
};
