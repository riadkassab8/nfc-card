import React, { useState } from 'react';
import { CardItem } from '../../types';
import { DigitalProfile } from './DigitalProfile';
import { Smartphone, Monitor, ExternalLink, X, Eye } from 'lucide-react';

export interface DigitalProfilePreviewProps {
  card: CardItem;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalProfilePreview: React.FC<DigitalProfilePreviewProps> = ({ card, isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  if (!isOpen) return null;

  // Construct real dynamic public redirect URL from card identifier
  const publicUrl = `https://smart-card-qr-api.koyeb.app/r/${card.card_code}`;

  const handleOpenPublicPage = () => {
    window.open(publicUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Admin Shell Header Controls */}
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px 16px 0 0',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Eye size={20} style={{ color: '#dfb75c' }} />
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              معاينة الملف الرقمي للعميل (Digital Profile Preview)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              الكارت: <strong style={{ color: '#dfb75c' }}>{card.card_code}</strong> ({card.card_type})
            </span>
          </div>
        </div>

        {/* Viewport Mode Toggles & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mobile / Desktop Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#1e293b',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #334155',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'mobile' ? '#dfb75c' : 'transparent',
                color: viewMode === 'mobile' ? '#090d16' : '#94a3b8',
                transition: 'all 150ms ease',
              }}
            >
              <Smartphone size={15} />
              <span>هاتف (375px)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'desktop' ? '#dfb75c' : 'transparent',
                color: viewMode === 'desktop' ? '#090d16' : '#94a3b8',
                transition: 'all 150ms ease',
              }}
            >
              <Monitor size={15} />
              <span>كمبيوتر</span>
            </button>
          </div>

          {/* Open Public Page Action */}
          <button
            type="button"
            onClick={handleOpenPublicPage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <ExternalLink size={15} />
            <span>فتح الصفحة العامة</span>
          </button>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#334155',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Frame Body Area */}
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
          height: 'calc(100vh - 120px)',
          maxHeight: '760px',
          backgroundColor: '#020617',
          border: '1px solid #1e293b',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {viewMode === 'mobile' ? (
          /* Device Shell Frame (375px width simulated phone) */
          <div
            style={{
              width: '375px',
              height: '100%',
              maxHeight: '680px',
              backgroundColor: '#090d16',
              borderRadius: '36px',
              border: '10px solid #1e293b',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Phone Notch Bar */}
            <div
              style={{
                width: '120px',
                height: '18px',
                backgroundColor: '#1e293b',
                borderRadius: '0 0 12px 12px',
                alignSelf: 'center',
                zIndex: 10,
              }}
            />

            {/* Scrollable Public Digital Profile Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <DigitalProfile card={card} />
            </div>
          </div>
        ) : (
          /* Desktop Simulated Viewport */
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              height: '100%',
              maxHeight: '680px',
              backgroundColor: '#090d16',
              borderRadius: '16px',
              border: '1px solid #334155',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              overflowY: 'auto',
            }}
          >
            <DigitalProfile card={card} />
          </div>
        )}
      </div>
    </div>
  );
};
