import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, Scan, LayoutDashboard, BarChart3, Settings, Plus, ArrowRight, ExternalLink } from 'lucide-react';
import { Modal } from '../ui';
import { cardService } from '../../services';
import { CardItem } from '../../types';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBatchModal?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenBatchModal,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cards, setCards] = useState<CardItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      cardService.getAllCards().then(setCards);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger can be controlled by parent or toggle
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCards = cards.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    const bizName = c.business_data?.name || c.business_name || '';
    return (
      c.card_code.toLowerCase().includes(q) ||
      c.public_code.toLowerCase().includes(q) ||
      c.qr.id.toLowerCase().includes(q) ||
      bizName.toLowerCase().includes(q)
    );
  }).slice(0, 5);

  const quickNavLinks = [
    { label: 'بطاقات NFC & QR المخزون', path: '/admin/cards', icon: <CreditCard size={16} /> },
    { label: 'قارئ ومجهّز الكروت (الماسح)', path: '/admin/scan', icon: <Scan size={16} /> },
    { label: 'نظرة عامة على المنصة', path: '/admin', icon: <LayoutDashboard size={16} /> },
    { label: 'التقارير والإحصائيات', path: '/admin/analytics', icon: <BarChart3 size={16} /> },
    { label: 'إعدادات النظام', path: '/admin/settings', icon: <Settings size={16} /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="البحث السريع والأوامر الفورية ⌘K">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#f8fafc',
            border: '2px solid #6366f1',
            borderRadius: '12px',
            padding: '10px 16px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)',
          }}
        >
          <Search size={18} style={{ color: '#6366f1' }} />
          <input
            autoFocus
            type="text"
            placeholder="ابحث عن بطاقة، كود، أو اختر أمراً سريعا..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8125rem' }}
            >
              إلغاء
            </button>
          )}
        </div>

        {/* Results List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
          {/* Action Triggers */}
          {!query && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                إجراءات سريعة
              </span>
              {onOpenBatchModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBatchModal();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e0e7ff',
                    backgroundColor: '#eef2ff',
                    color: '#4338ca',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'start',
                    transition: 'all 150ms ease-out',
                  }}
                >
                  <Plus size={16} />
                  <span>+ إنشاء مجموعة بطاقات جديدة</span>
                  <ArrowRight size={14} style={{ marginInlineStart: 'auto', opacity: 0.7 }} />
                </button>
              )}
            </div>
          )}

          {/* Matching Cards Results */}
          {query && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                نتائج البطاقات ({filteredCards.length})
              </span>
              {filteredCards.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                  لا توجد بطاقات تطابق "{query}"
                </div>
              ) : (
                filteredCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/admin/scan?payload=${card.public_code}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'start',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CreditCard size={16} style={{ color: '#6366f1' }} />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', display: 'block' }}>
                          {card.card_code} ({card.public_code})
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {card.business_data?.name || card.business_name || 'غير معين'}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '6px' }}>
                      فتح وتجهيز ⚡
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              التنقل المباشر
            </span>
            {quickNavLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => {
                  onClose();
                  navigate(link.path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'start',
                  transition: 'all 150ms ease-out',
                }}
              >
                <span style={{ color: '#64748b' }}>{link.icon}</span>
                <span>{link.label}</span>
                <ExternalLink size={14} style={{ marginInlineStart: 'auto', opacity: 0.4 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Shortcut Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>اضغط <kbd style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontWeight: 700 }}>Esc</kbd> للإغلاق</span>
          <span>لوحة التحكم الفائقة v2.5</span>
        </div>
      </div>
    </Modal>
  );
};
