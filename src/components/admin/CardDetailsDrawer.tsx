import React, { useState, useEffect } from 'react';
import { Drawer, Badge, Button, Input } from '../ui';
import { CardItem } from '../../types';
import { Download, Cpu, Building2, Calendar, Edit, Copy, Check, ShieldCheck, RefreshCw, Save, Link as LinkIcon } from 'lucide-react';
import { generateRealQRCode, decodeQRCodeDataUrl, getCardPublicUrl } from '../../utils/qrGenerator';
import { cardService } from '../../services';

export interface CardDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardItem | null;
  onAssignRequest?: (card: CardItem) => void;
}

export const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({
  isOpen,
  onClose,
  card,
  onAssignRequest,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvgString, setQrSvgString] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [decodedResult, setDecodedResult] = useState<{ success: boolean; decodedPayload: string | null } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const generateAndVerifyQR = async (targetUrl: string) => {
    setIsVerifying(true);
    const result = await generateRealQRCode(targetUrl);
    setQrDataUrl(result.dataUrl);
    setQrSvgString(result.svgString);

    const decodeRes = await decodeQRCodeDataUrl(result.dataUrl);
    setDecodedResult(decodeRes);
    setIsVerifying(false);
  };

  useEffect(() => {
    if (card && isOpen) {
      const initialUrl = getCardPublicUrl(card);
      setPublicUrl(initialUrl);
      setDecodedResult(null);
      setSaveSuccessMsg(null);
      generateAndVerifyQR(initialUrl);
    }
  }, [card, isOpen]);

  if (!card) return null;

  const isActive = card.status === 'ACTIVE';
  const bizName = card.business_data?.name || card.business_name;

  const handleSavePublicUrl = async () => {
    if (!publicUrl.trim()) return;
    setIsSavingUrl(true);
    try {
      const updatedCard = await cardService.updateCardPublicUrl(card.id, publicUrl.trim());
      await generateAndVerifyQR(updatedCard.public_url || publicUrl.trim());
      setSaveSuccessMsg('🟢 تم حفظ الـ URL وتوليد الـ QR الجديد بنجاح!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update card URL:', err);
    } finally {
      setIsSavingUrl(false);
    }
  };

  const downloadHDQRCode = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-CODE-${card.public_code}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="تفاصيل هوية البطاقة والـ QR الفعلي" width="520px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Card Identity Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>ID: {card.id}</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{card.card_code}</h3>
            <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#64748b' }}>
              Public Code: <strong style={{ color: '#4f46e5' }}>{card.public_code}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <Badge variant={isActive ? 'active' : 'disabled'} showDot>
              {isActive ? 'نشطة ومتصلة' : 'معطلة'}
            </Badge>
            <Badge variant="neutral">
              <span>{
                {
                  GOOGLE_REVIEW: '🌟 Google Review',
                  INSTAPAY: '💳 InstaPay',
                  UNIFIED_SOCIAL: '🌐 السوشيال الموحدة',
                }[card.card_type || 'GOOGLE_REVIEW'] || '🌐 السوشيال الموحدة'
              }</span>
            </Badge>
          </div>
        </div>

        {/* DYNAMIC PUBLIC URL EDITABLE FIELD */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '0.875rem' }}>
            <LinkIcon size={18} style={{ color: '#4f46e5' }} />
            <span>Public URL (الرابط المشفر بالـ QR والـ NFC)</span>
          </div>

          <Input
            value={publicUrl}
            onChange={(e) => setPublicUrl(e.target.value)}
            placeholder="ادخل أي رابط مثل: https://example.com"
          />

          <Button
            variant="primary"
            fullWidth
            isLoading={isSavingUrl}
            onClick={handleSavePublicUrl}
          >
            <Save size={16} /> حفظ الرابط وتوليد QR جديد فوراً
          </Button>

          {saveSuccessMsg && (
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', backgroundColor: '#d1fae5', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
              {saveSuccessMsg}
            </div>
          )}
        </div>

        {/* REAL PROGRAMMATICALLY GENERATED QR CODE CONTAINER */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #6366f1',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.12)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
              رمز QR الفعلي توليد برمجي (Real Programmatic QR)
            </span>
            <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px' }}>
              qrcode v1.5
            </span>
          </div>

          {/* Rendered PNG DataURL Image from qrcode library */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: '220px',
              minHeight: '220px',
            }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${card.public_code}`}
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                <RefreshCw size={20} className="spin" />
                <span>جاري توليد الـ QR...</span>
              </div>
            )}
          </div>

          {/* Embedded Public URL */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>الرابط المشفر بالداخل:</span>
            <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr' }}>
              {publicUrl}
            </span>
          </div>

          {/* Live Decode Verification Test Result (jsQR) */}
          <div
            style={{
              width: '100%',
              backgroundColor: decodedResult?.success ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${decodedResult?.success ? '#a7f3d0' : '#fde68a'}`,
              borderRadius: '12px',
              padding: '12px 16px',
              textAlign: 'start',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={18} style={{ color: decodedResult?.success ? '#047857' : '#b45309' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: decodedResult?.success ? '#047857' : '#b45309' }}>
                {isVerifying
                  ? 'جاري فحص وتفكيك تشفير الـ QR...'
                  : decodedResult?.success
                  ? '✓ نتيجة الفك وتدقيق الـ QR (jsQR Decode Verification):'
                  : 'تعذر فك التشفير تلقائياً'}
              </span>
            </div>

            {decodedResult && (
              <div style={{ fontSize: '0.75rem', color: decodedResult.success ? '#065f46' : '#92400e', marginTop: '4px' }}>
                <div>القيمة المستخرجة فعلياً: <code style={{ fontWeight: 700, direction: 'ltr', display: 'inline-block' }}>{decodedResult.decodedPayload}</code></div>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>
                  {decodedResult.decodedPayload === publicUrl
                    ? '🎯 القيمة المشفرة تطابق رابط الكارت 100% بدون أي اختلاف!'
                    : '⚠️ يوجد اختلاف في القيمة!'}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button variant="primary" fullWidth onClick={downloadHDQRCode}>
              <Download size={16} /> تحميل رمز QR الأصلي HD (SVG)
            </Button>
            <Button variant="outline" fullWidth onClick={copyPublicLink}>
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              {copiedLink ? 'تم نسخ الرابط!' : 'نسخ رابط الكارت المباشر'}
            </Button>
          </div>
        </div>

        {/* Assigned Business Box */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Building2 size={16} />
            <span>النشاط التجاري المرتبط:</span>
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            {isActive && bizName ? bizName : 'غير معين حتى الآن'}
          </span>
          {card.updated_at && (
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Calendar size={12} /> تاريخ التفعيل: {new Date(card.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Paired Assets Breakdown (NFC Chip) */}
        <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '14px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px' }}>
            <Cpu size={22} style={{ color: '#0f172a' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>شريحة NFC المزدوجة</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>Identifier: {card.nfc.identifier}</span>
          </div>
        </div>

        {/* Actions */}
        {onAssignRequest && (
          <Button
            variant="gradient"
            fullWidth
            onClick={() => {
              onClose();
              onAssignRequest(card);
            }}
          >
            <Edit size={16} /> إدخال / تعيين البيانات
          </Button>
        )}
      </div>
    </Drawer>
  );
};
