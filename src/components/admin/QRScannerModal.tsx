import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, QrCode, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Modal } from '../ui';
import { useTranslation } from '../../i18n';
import { cardService } from '../../services';

export interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scannedPayload: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'active' | 'denied' | 'unsupported'>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [scanSuccessCode, setScanSuccessCode] = useState<string | null>(null);

  // Quick test cards list for instant desktop selection
  const [availableCards, setAvailableCards] = useState<Array<{ public_code: string; label: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      cardService.getAllCards().then((cards) => {
        setAvailableCards(
          cards.map((c) => ({
            public_code: c.public_code,
            label: c.business_data?.name ? `${c.business_data.name} (${c.public_code})` : `Card ${c.public_code}`,
          }))
        );
      });
      startCamera();
    } else {
      stopCamera();
      setScanSuccessCode(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState('unsupported');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraState('active');
    } catch (err) {
      console.warn('Camera access error or denied:', err);
      setCameraState('denied');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraState('idle');
  };

  const handleSelectCode = (code: string) => {
    setScanSuccessCode(code);
    setTimeout(() => {
      onScanComplete(code);
      onClose();
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Pick first available card or simulate image payload reading
      const targetCode = availableCards.length > 0 ? availableCards[0].public_code : '7FJ2K9';
      handleSelectCode(targetCode);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('admin.scan.scanQRModalTitle')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <p className="text-body-secondary" style={{ fontSize: '0.875rem' }}>
          {t('admin.scan.scanQRModalDesc')}
        </p>

        {/* Camera Scanner Viewport */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            backgroundColor: '#09090b',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border-subtle)',
          }}
        >
          {cameraState === 'active' ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                color: 'var(--text-muted)',
                padding: 'var(--space-md)',
                textAlign: 'center',
              }}
            >
              {cameraState === 'denied' ? (
                <>
                  <AlertCircle size={36} style={{ color: 'var(--warning-text)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {t('admin.scan.cameraPermissionDenied')}
                  </span>
                  <Button variant="outline" size="sm" onClick={startCamera}>
                    <RefreshCw size={14} /> {t('admin.scan.startCamera')}
                  </Button>
                </>
              ) : (
                <>
                  <Camera size={40} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: '0.875rem' }}>{t('admin.scan.cameraActive')}</span>
                </>
              )}
            </div>
          )}

          {/* Target Scanner Overlay Frame */}
          <div
            style={{
              position: 'absolute',
              width: '160px',
              height: '160px',
              border: '2px dashed #22c55e',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            {/* Animated Laser Scanning Line */}
            <div
              style={{
                width: '100%',
                height: '2px',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          </div>

          {/* Success Overlay Flash */}
          {scanSuccessCode && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(34, 197, 94, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                gap: 'var(--space-xs)',
              }}
            >
              <CheckCircle2 size={48} />
              <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>QR Code Scanned!</span>
              <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{scanSuccessCode}</span>
            </div>
          )}
        </div>

        {/* File Upload Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) {
              const targetCode = availableCards.length > 0 ? availableCards[0].public_code : '7FJ2K9';
              handleSelectCode(targetCode);
            }
          }}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            textAlign: 'center',
            backgroundColor: dragOver ? 'var(--bg-surface-hover)' : 'var(--bg-app)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <Upload size={20} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {t('admin.scan.uploadQRImage')}
            </span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Quick Test Cards Selector */}
        {availableCards.length > 0 && (
          <div>
            <span className="text-label" style={{ display: 'block', marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
              {t('admin.scan.mockQRPicker')}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', maxHeight: '120px', overflowY: 'auto' }}>
              {availableCards.map((card) => (
                <button
                  key={card.public_code}
                  type="button"
                  onClick={() => handleSelectCode(card.public_code)}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--text-primary)',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <QrCode size={12} /> {card.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-sm)' }}>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
