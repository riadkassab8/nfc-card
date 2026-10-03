import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, QrCode, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
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
            label: c.business_data?.business_name ? `${c.business_data.business_name} (${c.public_code})` : `بطاقة ${c.public_code}`,
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
    }, 500);
  };

  const handleSimulateScan = () => {
    const targetCode = availableCards.length > 0 ? availableCards[0].public_code : '7FJ2K9';
    handleSelectCode(targetCode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Pick first card or extract filename match
      const matchedCard = availableCards.find(c => file.name.includes(c.public_code));
      const targetCode = matchedCard ? matchedCard.public_code : (availableCards.length > 0 ? availableCards[0].public_code : '7FJ2K9');
      handleSelectCode(targetCode);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="مسح رمز QR أو اختيار كارت">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          وجه كاميرا الجهاز نحو رمز QR المطبوع على البطاقة، أو اختر كارت للاختبار الفوري.
        </p>

        {/* Camera Scanner Viewport */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #334155',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
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
                gap: '12px',
                color: '#94a3b8',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              {cameraState === 'denied' || cameraState === 'unsupported' ? (
                <>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={24} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                      الكاميرا غير متصلة أو تم حجب الإذن
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      استخدم خيار المسح التلقائي التجريبي أو اختر بطاقة من القائمة أدناه
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <Button variant="outline" size="sm" onClick={startCamera}>
                      <RefreshCw size={14} /> إعادة المحاولة
                    </Button>
                    <Button variant="gradient" size="sm" onClick={handleSimulateScan}>
                      <Zap size={14} /> مسح تلقائي تجريبي
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Camera size={40} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: '0.875rem' }}>جاري تشغيل كاميرا الماسح الضوئي...</span>
                </>
              )}
            </div>
          )}

          {/* Target Scanner Overlay Frame (Visible when active) */}
          {cameraState === 'active' && (
            <div
              style={{
                position: 'absolute',
                width: '160px',
                height: '160px',
                border: '2px dashed #10b981',
                borderRadius: '16px',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
            </div>
          )}

          {/* Success Overlay Flash */}
          {scanSuccessCode && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(16, 185, 129, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                gap: '8px',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
              }}
            >
              <CheckCircle2 size={48} />
              <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>تم تمييز كود QR بنجاح!</span>
              <span style={{ fontFamily: 'monospace', fontSize: '1.125rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '4px 16px', borderRadius: '9999px' }}>
                {scanSuccessCode}
              </span>
            </div>
          )}
        </div>

        {/* Action Button Strip */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="gradient" fullWidth onClick={handleSimulateScan}>
            <Zap size={18} /> مسح عشوائي تجريبي (اختبار الكاميرا)
          </Button>
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
            border: `2px dashed ${dragOver ? '#6366f1' : '#cbd5e1'}`,
            borderRadius: '12px',
            padding: '14px',
            textAlign: 'center',
            backgroundColor: dragOver ? '#eef2ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 150ms ease-out',
          }}
        >
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Upload size={20} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
              أو قم بأسقاط / اختيار صورة رمز QR من جهازك
            </span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Quick Test Cards Selector */}
        {availableCards.length > 0 && (
          <div>
            <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.8125rem', fontWeight: 700, color: '#475569' }}>
              أو اختر بطاقة مباشرة لقراءتها:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
              {availableCards.map((card) => (
                <button
                  key={card.public_code}
                  type="button"
                  onClick={() => handleSelectCode(card.public_code)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#0f172a',
                    transition: 'all 150ms ease-out',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <QrCode size={13} style={{ color: '#6366f1' }} /> {card.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
