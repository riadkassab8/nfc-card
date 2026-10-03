import React, { useState, useEffect } from 'react';
import { CardItem } from '../../types';
import { generateRealQRCode, getCardPublicUrl } from '../../utils/qrGenerator';
import { Radio, QrCode, Sparkles, Printer, Cpu, Eye } from 'lucide-react';
import { Button } from '../ui';
import { DigitalProfilePreview } from '../digital-profile';

export interface PhysicalCardPreviewProps {
  card: CardItem;
  showPrintControls?: boolean;
}

export const PhysicalCardPreview: React.FC<PhysicalCardPreviewProps> = ({
  card,
  showPrintControls = true,
}) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadQr = async () => {
      try {
        const targetUrl = getCardPublicUrl(card);
        const res = await generateRealQRCode(targetUrl);
        if (isMounted) {
          setQrDataUrl(res.dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate preview QR:', err);
      }
    };

    loadQr();
    return () => {
      isMounted = false;
    };
  }, [card]);

  const ownerName = card.business_data?.business_name || card.business_name || 'VIP Client';
  const cardTypeDisplay = (card.card_type || 'Google Review').toUpperCase();
  const publicCodeDisplay = card.card_code || `CARD-${card.public_code}`;
  const nfcIdentifier = card.nfc?.identifier || `NFC-0000${card.public_code}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="physical-card-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Controls Bar */}
      {showPrintControls && (
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: '#0f172a',
            padding: '12px 16px',
            borderRadius: '12px',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} style={{ color: '#dfb75c' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#dfb75c' }}>معاينة كارت NFC الذكي (CR80)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* View Switcher Pills */}
            <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '3px', borderRadius: '8px', border: '1px solid #334155' }}>
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: activeSide === 'front' ? '#dfb75c' : 'transparent',
                  color: activeSide === 'front' ? '#0f172a' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                الأمامي (Front)
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: activeSide === 'back' ? '#dfb75c' : 'transparent',
                  color: activeSide === 'back' ? '#0f172a' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                الخلفي (Back)
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('both')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: activeSide === 'both' ? '#dfb75c' : 'transparent',
                  color: activeSide === 'both' ? '#0f172a' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                الوجهين (Both)
              </button>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setIsProfilePreviewOpen(true)} style={{ backgroundColor: '#1e293b', color: '#dfb75c', border: '1px solid #dfb75c', fontWeight: 700 }}>
              <Eye size={14} /> معاينة الملف الرقمي
            </Button>

            <Button variant="primary" size="sm" onClick={handlePrint} style={{ backgroundColor: '#dfb75c', color: '#0f172a', fontWeight: 800 }}>
              <Printer size={14} /> طباعة (Print)
            </Button>
          </div>
        </div>
      )}

      {/* Digital Profile Preview Shell Modal */}
      <DigitalProfilePreview
        card={card}
        isOpen={isProfilePreviewOpen}
        onClose={() => setIsProfilePreviewOpen(false)}
      />

      {/* Screen Render Container */}
      <div
        className="card-preview-viewport"
        style={{
          display: 'flex',
          flexDirection: activeSide === 'both' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          width: '100%',
          padding: '16px 0',
        }}
      >
        {/* FRONT SIDE CARD */}
        {(activeSide === 'front' || activeSide === 'both') && (
          <div
            className="cr80-card cr80-card-front"
            style={{
              width: '100%',
              maxWidth: '440px',
              aspectRatio: '85.60 / 53.98',
              backgroundColor: '#090d16',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(223, 183, 92, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '22px 24px',
              color: '#ffffff',
              boxSizing: 'border-box',
              userSelect: 'none',
            }}
          >
            {/* Metallic Gold Curved Background Accents */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                insetInlineEnd: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.85,
              }}
              viewBox="0 0 440 277"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 320 0 C 370 80, 420 160, 440 277 L 440 0 Z"
                fill="url(#goldGradient1)"
                opacity="0.12"
              />
              <path
                d="M 280 0 C 350 100, 400 200, 440 277"
                stroke="url(#goldGradient1)"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <defs>
                <linearGradient id="goldGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fce09b" />
                  <stop offset="50%" stopColor="#dfb75c" />
                  <stop offset="100%" stopColor="#9a7320" />
                </linearGradient>
              </defs>
            </svg>

            {/* Top Row: Brand Logo & Tagline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #fce09b 0%, #dfb75c 60%, #9a7320 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#090d16',
                    boxShadow: '0 2px 8px rgba(223, 183, 92, 0.3)',
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 900,
                      letterSpacing: '0.15em',
                      color: '#ffffff',
                      display: 'block',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    NFC CARD
                  </span>
                  <span
                    style={{
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: '#dfb75c',
                      display: 'block',
                    }}
                  >
                    CONNECT YOUR WORLD
                  </span>
                </div>
              </div>

              {/* NFC Sensor Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(223, 183, 92, 0.3)' }}>
                <Radio size={12} style={{ color: '#dfb75c' }} />
                <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em', color: '#e2e8f0' }}>NFC TAP</span>
              </div>
            </div>

            {/* Middle & Bottom Row: Owner Info (Left) + Integrated QR Code (Right) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2, marginTop: 'auto' }}>
              {/* Left Column: Owner & Product Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '62%' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#dfb75c',
                    textTransform: 'uppercase',
                  }}
                >
                  {cardTypeDisplay}
                </span>

                <h2
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1.15,
                    margin: 0,
                    fontFamily: 'var(--font-family-arabic), sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={ownerName}
                >
                  {ownerName}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.05em' }}>
                    {publicCodeDisplay}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', opacity: 0.85 }}>
                  <Radio size={11} style={{ color: '#dfb75c' }} />
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', color: '#cbd5e1' }}>
                    TAP OR SCAN TO CONNECT
                  </span>
                </div>
              </div>

              {/* Right Column: Premium QR Area with Metallic Frame */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    padding: '6px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1.5px solid #dfb75c',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px rgba(223, 183, 92, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '94px',
                    height: '94px',
                    boxSizing: 'border-box',
                  }}
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Card QR"
                      style={{ width: '82px', height: '82px', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '82px', height: '82px', backgroundColor: '#e2e8f0', borderRadius: '6px' }} />
                  )}
                </div>
                <span style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.1em', color: '#dfb75c' }}>
                  SCAN ME
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BACK SIDE CARD */}
        {(activeSide === 'back' || activeSide === 'both') && (
          <div
            className="cr80-card cr80-card-back"
            style={{
              width: '100%',
              maxWidth: '440px',
              aspectRatio: '85.60 / 53.98',
              backgroundColor: '#090d16',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(223, 183, 92, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '22px 24px',
              color: '#ffffff',
              boxSizing: 'border-box',
              userSelect: 'none',
            }}
          >
            {/* Curved Background Line */}
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.4,
              }}
              viewBox="0 0 440 277"
              fill="none"
            >
              <path
                d="M 0 140 C 140 240, 300 40, 440 140"
                stroke="url(#goldGradient2)"
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fce09b" />
                  <stop offset="50%" stopColor="#dfb75c" />
                  <stop offset="100%" stopColor="#9a7320" />
                </linearGradient>
              </defs>
            </svg>

            {/* Back Header: Brand Centered */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: '#dfb75c' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.15em', color: '#ffffff' }}>
                  NFC CARD
                </span>
              </div>
              <span style={{ fontSize: '0.55rem', color: '#dfb75c', letterSpacing: '0.12em', fontWeight: 700 }}>
                YOUR DIGITAL PROFILE · IN YOUR HANDS
              </span>
            </div>

            {/* Middle Feature Triad */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 2, margin: 'auto 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(223, 183, 92, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dfb75c' }}>
                  <QrCode size={16} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>SCAN</span>
                <span style={{ fontSize: '0.5rem', color: '#94a3b8' }}>QR Code</span>
              </div>

              <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(223, 183, 92, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dfb75c' }}>
                  <Radio size={16} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>TAP</span>
                <span style={{ fontSize: '0.5rem', color: '#94a3b8' }}>NFC Chip</span>
              </div>

              <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(223, 183, 92, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dfb75c' }}>
                  <Sparkles size={16} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>CONNECT</span>
                <span style={{ fontSize: '0.5rem', color: '#94a3b8' }}>Instantly</span>
              </div>
            </div>

            {/* Back Footer Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.55rem', color: '#64748b', fontFamily: 'monospace' }}>
                  UID: {nfcIdentifier}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={12} style={{ color: '#dfb75c' }} />
                <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  CR80 COMPLIANT
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINT MEDIA DEDICATED STYLESHEET */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          .physical-card-container,
          .card-preview-viewport,
          .cr80-card,
          .cr80-card * {
            visibility: visible !important;
          }
          .card-preview-viewport {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 20mm !important;
          }
          .cr80-card {
            width: 85.60mm !important;
            height: 53.98mm !important;
            max-width: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};
