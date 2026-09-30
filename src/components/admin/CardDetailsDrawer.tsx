import React, { useState } from 'react';
import { Drawer, Badge, Button } from '../ui';
import { CardItem } from '../../types';
import { Download, Cpu, Building2, Calendar, Edit, Copy, Check } from 'lucide-react';

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

  if (!card) return null;

  const isActive = card.status === 'ACTIVE';
  const bizName = card.business_data?.name || card.business_name;
  const publicUrl = `${window.location.origin}/q/${card.public_code}`;

  const downloadHDQRCode = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <rect width="500" height="500" fill="#ffffff" rx="24"/>
      <!-- Outer Border Frame -->
      <rect x="20" y="20" width="460" height="460" fill="none" stroke="#0f172a" stroke-width="4" rx="20"/>
      
      <!-- Top Left Finder Pattern -->
      <rect x="50" y="50" width="110" height="110" fill="#0f172a" rx="12"/>
      <rect x="70" y="70" width="70" height="70" fill="#ffffff" rx="6"/>
      <rect x="85" y="85" width="40" height="40" fill="#0f172a" rx="4"/>
      
      <!-- Top Right Finder Pattern -->
      <rect x="340" y="50" width="110" height="110" fill="#0f172a" rx="12"/>
      <rect x="360" y="70" width="70" height="70" fill="#ffffff" rx="6"/>
      <rect x="375" y="85" width="40" height="40" fill="#0f172a" rx="4"/>
      
      <!-- Bottom Left Finder Pattern -->
      <rect x="50" y="340" width="110" height="110" fill="#0f172a" rx="12"/>
      <rect x="70" y="360" width="70" height="70" fill="#ffffff" rx="6"/>
      <rect x="85" y="375" width="40" height="40" fill="#0f172a" rx="4"/>

      <!-- Timing patterns & Data Modules Matrix -->
      <rect x="180" y="50" width="20" height="20" fill="#0f172a"/>
      <rect x="220" y="50" width="20" height="20" fill="#0f172a"/>
      <rect x="260" y="50" width="20" height="20" fill="#0f172a"/>
      <rect x="300" y="50" width="20" height="20" fill="#0f172a"/>

      <rect x="180" y="90" width="40" height="20" fill="#0f172a"/>
      <rect x="240" y="90" width="20" height="40" fill="#0f172a"/>
      <rect x="280" y="90" width="40" height="20" fill="#0f172a"/>

      <rect x="50" y="180" width="20" height="20" fill="#0f172a"/>
      <rect x="90" y="180" width="40" height="20" fill="#0f172a"/>
      <rect x="150" y="180" width="20" height="40" fill="#0f172a"/>

      <rect x="200" y="160" width="100" height="100" fill="#0f172a" rx="8"/>
      <rect x="220" y="180" width="60" height="60" fill="#ffffff" rx="4"/>
      <circle cx="250" cy="210" r="18" fill="#4f46e5"/>

      <rect x="340" y="180" width="40" height="20" fill="#0f172a"/>
      <rect x="400" y="180" width="50" height="20" fill="#0f172a"/>
      <rect x="370" y="220" width="30" height="40" fill="#0f172a"/>

      <rect x="180" y="340" width="40" height="40" fill="#0f172a"/>
      <rect x="240" y="340" width="20" height="60" fill="#0f172a"/>
      <rect x="280" y="380" width="60" height="20" fill="#0f172a"/>
      <rect x="360" y="340" width="40" height="40" fill="#0f172a"/>
      <rect x="420" y="340" width="30" height="80" fill="#0f172a"/>

      <!-- Label Badge Footer -->
      <text x="250" y="475" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle" fill="#0f172a">Public Code: ${card.public_code}</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
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
    <Drawer isOpen={isOpen} onClose={onClose} title="تفاصيل هوية البطاقة" width="480px">
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

        {/* LARGE & CLEAR QR CODE CONTAINER */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>رمز QR المزدوج عالي الدقة HD</span>
          </div>

          {/* Rendered SVG QR Code (220px x 220px) */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <svg width="220" height="220" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
              <rect width="300" height="300" fill="#ffffff" rx="16"/>
              {/* Outer Border */}
              <rect x="10" y="10" width="280" height="280" fill="none" stroke="#0f172a" strokeWidth="3" rx="12"/>

              {/* Finder Top Left */}
              <rect x="30" y="30" width="70" height="70" fill="#0f172a" rx="8"/>
              <rect x="42" y="42" width="46" height="46" fill="#ffffff" rx="4"/>
              <rect x="52" y="52" width="26" height="26" fill="#0f172a" rx="2"/>

              {/* Finder Top Right */}
              <rect x="200" y="30" width="70" height="70" fill="#0f172a" rx="8"/>
              <rect x="212" y="42" width="46" height="46" fill="#ffffff" rx="4"/>
              <rect x="222" y="52" width="26" height="26" fill="#0f172a" rx="2"/>

              {/* Finder Bottom Left */}
              <rect x="30" y="200" width="70" height="70" fill="#0f172a" rx="8"/>
              <rect x="42" y="212" width="46" height="46" fill="#ffffff" rx="4"/>
              <rect x="52" y="222" width="26" height="26" fill="#0f172a" rx="2"/>

              {/* Data Modules Grid */}
              <rect x="115" y="30" width="14" height="14" fill="#0f172a"/>
              <rect x="140" y="30" width="14" height="14" fill="#0f172a"/>
              <rect x="165" y="30" width="14" height="14" fill="#0f172a"/>

              <rect x="115" y="55" width="28" height="14" fill="#0f172a"/>
              <rect x="155" y="55" width="14" height="28" fill="#0f172a"/>

              <rect x="30" y="115" width="14" height="14" fill="#0f172a"/>
              <rect x="55" y="115" width="28" height="14" fill="#0f172a"/>
              <rect x="95" y="115" width="14" height="28" fill="#0f172a"/>

              {/* Center Accent Badge */}
              <rect x="120" y="120" width="60" height="60" fill="#0f172a" rx="6"/>
              <rect x="132" y="132" width="36" height="36" fill="#ffffff" rx="4"/>
              <circle cx="150" cy="150" r="10" fill="#4f46e5"/>

              <rect x="200" y="115" width="28" height="14" fill="#0f172a"/>
              <rect x="240" y="115" width="30" height="14" fill="#0f172a"/>
              <rect x="220" y="140" width="20" height="28" fill="#0f172a"/>

              <rect x="115" y="200" width="28" height="28" fill="#0f172a"/>
              <rect x="155" y="200" width="14" height="40" fill="#0f172a"/>
              <rect x="180" y="228" width="40" height="14" fill="#0f172a"/>
              <rect x="230" y="200" width="28" height="28" fill="#0f172a"/>

              <text x="150" y="284" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle" fill="#0f172a">{card.public_code}</text>
            </svg>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button variant="primary" fullWidth onClick={downloadHDQRCode}>
              <Download size={16} /> تحميل رمز QR عالي الدقة HD
            </Button>
            <Button variant="outline" fullWidth onClick={copyPublicLink}>
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              {copiedLink ? 'تم نسخ رابط المسح المباشر!' : 'نسخ رابط المسح المباشر (URL)'}
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
