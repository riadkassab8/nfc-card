import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Badge, Skeleton, Toast, ToastType, EmptyState, ErrorState, ConfirmDialog, Toggle } from '../../components/ui';
import { BatchGenerateCardsModal } from '../../components/admin/BatchGenerateCardsModal';
import { CardDetailsDrawer } from '../../components/admin/CardDetailsDrawer';
import { cardService } from '../../services';
import { CardItem, CardInventoryStats, CardProductType } from '../../types';
import { useTranslation } from '../../i18n';
import { Plus, CreditCard, Eye, Download, Building2, Edit, Trash2, Power, Layers, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateRealQRCode } from '../../utils/qrGenerator';

export const AdminInventoryPage: React.FC = () => {
  const { t, formatNumber } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [stats, setStats] = useState<CardInventoryStats>({ total_cards: 0, active_cards: 0, inactive_cards: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | CardProductType>('ALL');
  
  // Selection State for Bulk Batch Actions
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  // Modals & Drawers
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [cardToDelete, setCardToDelete] = useState<CardItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState<boolean>(false);

  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleStatus = async (card: CardItem) => {
    try {
      const updated = await cardService.toggleCardStatus(card.id);
      setToast({
        type: 'success',
        message: updated.status === 'ACTIVE' ? `🟢 تم تفعيل البطاقة (${card.card_code})` : `🔴 تم تعطيل البطاقة (${card.card_code})`,
      });
      fetchInventory();
    } catch (err) {
      setToast({ type: 'error', message: 'فشل تغيير حالة البطاقة' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    try {
      await cardService.deleteCard(cardToDelete.id);
      setToast({ type: 'success', message: `🗑️ تم حذف البطاقة (${cardToDelete.card_code}) بنجاح` });
      setCardToDelete(null);
      fetchInventory();
    } catch (err) {
      setToast({ type: 'error', message: 'فشل حذف البطاقة' });
    }
  };

  const handleBulkStatusChange = async (targetStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      await Promise.all(
        selectedCardIds.map((id) => {
          const c = cards.find((item) => item.id === id);
          if (c && c.status !== targetStatus) {
            return cardService.toggleCardStatus(id);
          }
          return Promise.resolve();
        })
      );
      setToast({
        type: 'success',
        message: `تم تحديث حالة (${selectedCardIds.length}) بطاقة بنجاح`,
      });
      setSelectedCardIds([]);
      fetchInventory();
    } catch (err) {
      setToast({ type: 'error', message: 'فشل تنفيذ التغيير الجماعي' });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedCardIds.map((id) => cardService.deleteCard(id)));
      setToast({
        type: 'success',
        message: `🗑️ تم حذف (${selectedCardIds.length}) بطاقة بنجاح`,
      });
      setSelectedCardIds([]);
      setIsBulkDeleteOpen(false);
      fetchInventory();
    } catch (err) {
      setToast({ type: 'error', message: 'فشل تنفيذ الحذف الجماعي' });
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [cardsData, statsData] = await Promise.all([
        cardService.getAllCards(),
        cardService.getCardStats(),
      ]);
      setCards(cardsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const downloadPNG = async (card: CardItem) => {
    try {
      const result = await generateRealQRCode(card);
      const blob = new Blob([result.svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-CODE-${card.public_code}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating QR code for download:', err);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToast({ type: 'info', message: `📋 تم نسخ ${label}: ${text}` });
  };

  const filteredCards = cards.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    const bizName = c.business_data?.name || c.business_name || '';
    const matchesSearch =
      !query ||
      c.card_code.toLowerCase().includes(query) ||
      c.public_code.toLowerCase().includes(query) ||
      c.qr.id.toLowerCase().includes(query) ||
      c.nfc.id.toLowerCase().includes(query) ||
      c.nfc.identifier.toLowerCase().includes(query) ||
      bizName.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'ALL' || c.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'ALL' || c.card_type === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCategoryCount = (type: string) => {
    if (type === 'ALL') return cards.length;
    return cards.filter((c) => c.card_type === type).length;
  };

  const isAllSelected = filteredCards.length > 0 && filteredCards.every((c) => selectedCardIds.includes(c.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(filteredCards.map((c) => c.id));
    }
  };

  const toggleSelectCard = (id: string) => {
    if (selectedCardIds.includes(id)) {
      setSelectedCardIds(selectedCardIds.filter((item) => item !== id));
    } else {
      setSelectedCardIds([...selectedCardIds, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '24px', insetInlineEnd: '24px', zIndex: 1100 }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Hero Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ zIndex: 1, maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.25)', color: '#818cf8', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              إدارة المخزون والمنتجات
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em', color: '#ffffff' }}>
            بطاقات NFC & QR الفائقة 💳
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.5 }}>
            تحكم كامل في كروت تقييمات Google Review وInstaPay وتطبيقات التواصل الموحدة مع إمكانية التفعيل الفوري والربط المباشر.
          </p>
        </div>

        <div style={{ zIndex: 1 }}>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => setIsBatchOpen(true)}
          >
            <Plus size={20} /> إنشاء مجموعة بطاقات جديدة
          </Button>
        </div>
      </div>

      {/* Interactive Stat Cards Grid (Click to filter) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        <div onClick={() => { setStatusFilter('ALL'); setCategoryFilter('ALL'); }} style={{ cursor: 'pointer' }}>
          <Card hoverable padding="lg" style={{ border: statusFilter === 'ALL' ? '2px solid #6366f1' : '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <span className="text-caption" style={{ fontWeight: 600, color: '#64748b' }}>إجمالي البطاقات (انقر للإظهار)</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: '2px' }}>
                  {formatNumber(stats.total_cards)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        <div onClick={() => setStatusFilter('ACTIVE')} style={{ cursor: 'pointer' }}>
          <Card hoverable padding="lg" style={{ border: statusFilter === 'ACTIVE' ? '2px solid #10b981' : '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#d1fae5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="text-caption" style={{ fontWeight: 600, color: '#64748b' }}>البطاقات النشطة (انقر للفلترة)</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#047857', lineHeight: 1.1, marginTop: '2px' }}>
                  {formatNumber(stats.active_cards)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        <div onClick={() => setStatusFilter('INACTIVE')} style={{ cursor: 'pointer' }}>
          <Card hoverable padding="lg" style={{ border: statusFilter === 'INACTIVE' ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <span className="text-caption" style={{ fontWeight: 600, color: '#64748b' }}>البطاقات المعطلة (انقر للفلترة)</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309', lineHeight: 1.1, marginTop: '2px' }}>
                  {formatNumber(stats.inactive_cards)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        <Card hoverable padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={24} />
            </div>
            <div>
              <span className="text-caption" style={{ fontWeight: 600, color: '#64748b' }}>أقسام المنتجات</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7e22ce', lineHeight: 1.1, marginTop: '2px' }}>
                3 تصنيفات
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Bulk Action Bar (When cards are selected) */}
      {selectedCardIds.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: '80px',
            zIndex: 70,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.3)',
            animation: 'fadeIn 200ms ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#6366f1', color: '#ffffff', padding: '2px 10px', borderRadius: '9999px', fontWeight: 800, fontSize: '0.875rem' }}>
              {selectedCardIds.length}
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>تم تحديد بطاقات للإجراء المجمع</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button size="sm" variant="secondary" onClick={() => handleBulkStatusChange('ACTIVE')}>
              🟢 تفعيل الكل
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkStatusChange('INACTIVE')}>
              🔴 تعطيل الكل
            </Button>
            <Button size="sm" variant="danger" onClick={() => setIsBulkDeleteOpen(true)}>
              🗑️ حذف المحددة
            </Button>
            <Button size="sm" variant="ghost" style={{ color: '#94a3b8' }} onClick={() => setSelectedCardIds([])}>
              إلغاء التحديد
            </Button>
          </div>
        </div>
      )}

      {/* Filter & Search Controls */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Category Pills Bar */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
            {(
              [
                { key: 'ALL', label: 'الكل', icon: '📦' },
                { key: 'GOOGLE_REVIEW', label: 'Google Review', icon: '🌟' },
                { key: 'INSTAPAY', label: 'InstaPay', icon: '💳' },
                { key: 'UNIFIED_SOCIAL', label: 'السوشيال الموحدة', icon: '🌐' },
              ] as const
            ).map((cat) => {
              const isSelected = categoryFilter === cat.key;
              const count = getCategoryCount(cat.key);
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategoryFilter(cat.key as any)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? '#0f172a' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 150ms ease-out',
                    boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span style={{
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <Input
                placeholder="بحث برقم البطاقة، الكود العام، QR، أو اسم النشاط..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filterKey) => {
                const isSelected = statusFilter === filterKey;
                return (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setStatusFilter(filterKey)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? '#0f172a' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    {filterKey === 'ALL'
                      ? t('cards.filterAll')
                      : filterKey === 'ACTIVE'
                      ? `🟢 ${t('cards.statusActive')}`
                      : `🔴 ${t('cards.statusInactive')}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Cards Inventory Table */}
      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : loading ? (
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton height="48px" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
          </div>
        </Card>
      ) : filteredCards.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={48} />}
          title={t('cards.emptyTitle')}
          description={t('cards.emptyDesc')}
          action={
            <Button variant="primary" onClick={() => setIsBatchOpen(true)}>
              <Plus size={16} /> {t('cards.generateBatchBtn')}
            </Button>
          }
        />
      ) : (
        <Card padding="none" style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ width: '40px', padding: '14px 16px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#6366f1' }}
                      title="تحديد الكل"
                    />
                  </th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    حالة البطاقة
                  </th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    نوع المنتج
                  </th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    كود البطاقة
                  </th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    رمز QR
                  </th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    معرف NFC
                  </th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    الكود العام
                  </th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    النشاط التجاري المرتبط
                  </th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'end' }}>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => {
                  const isActive = card.status === 'ACTIVE';
                  const isSelected = selectedCardIds.includes(card.id);
                  const bizName = card.business_data?.name || card.business_name;
                  const catMeta = {
                    GOOGLE_REVIEW: { label: 'Google Review', icon: '🌟', badgeVariant: 'amber' as const },
                    INSTAPAY: { label: 'InstaPay', icon: '💳', badgeVariant: 'purple' as const },
                    UNIFIED_SOCIAL: { label: 'السوشيال الموحدة', icon: '🌐', badgeVariant: 'info' as const },
                  }[card.card_type || 'GOOGLE_REVIEW'] || { label: 'السوشيال الموحدة', icon: '🌐', badgeVariant: 'info' as const };

                  return (
                    <tr
                      key={card.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                        transition: 'background-color 150ms ease-out',
                      }}
                    >
                      {/* Checkbox Select */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCard(card.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#6366f1' }}
                        />
                      </td>

                      {/* Status & Toggle */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Toggle
                            checked={isActive}
                            onChange={() => handleToggleStatus(card)}
                          />
                          <Badge variant={isActive ? 'active' : 'disabled'} showDot>
                            {isActive ? 'نشطة' : 'معطلة'}
                          </Badge>
                        </div>
                      </td>

                      {/* Product Type Category */}
                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant={catMeta.badgeVariant}>
                          <span style={{ marginInlineEnd: '4px' }}>{catMeta.icon}</span> {catMeta.label}
                        </Badge>
                      </td>

                      {/* Card Code */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                            {card.card_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(card.card_code, 'كود البطاقة')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                            title="نسخ كود البطاقة"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* QR Code */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#64748b' }}>
                          {card.qr.id}
                        </span>
                      </td>

                      {/* NFC Identifier */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#64748b' }}>
                          {card.nfc.identifier}
                        </span>
                      </td>

                      {/* Public Code */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '6px' }}>
                            {card.public_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => window.open(`/q/${card.public_code}`, '_blank')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: '2px' }}
                            title="فتح صفحة العميل العامة"
                          >
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Business */}
                      <td style={{ padding: '14px 20px' }}>
                        {bizName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isActive ? 1 : 0.6 }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Building2 size={13} />
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{bizName}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>غير معين</span>
                        )}
                      </td>

                      {/* Actions Group */}
                      <td style={{ padding: '14px 20px', textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(card)}
                            title={isActive ? 'تعطيل البطاقة' : 'تفعيل البطاقة'}
                          >
                            <Power size={15} style={{ color: isActive ? '#10b981' : '#94a3b8' }} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCard(card);
                              setIsDrawerOpen(true);
                            }}
                            title="عرض التفاصيل"
                          >
                            <Eye size={15} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/scan?payload=${card.public_code}`)}
                            title="تعيين / ربط البطاقة"
                          >
                            <Edit size={15} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPNG(card)}
                            title="تحميل رمز QR"
                          >
                            <Download size={15} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCardToDelete(card)}
                            title="حذف البطاقة"
                          >
                            <Trash2 size={15} style={{ color: '#ef4444' }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modals & Drawers */}
      <BatchGenerateCardsModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onSuccess={(newCards) => {
          fetchInventory();
          setToast({
            type: 'success',
            message: t('cards.batchModal.toastSuccess', { count: newCards.length }),
          });
        }}
      />

      <CardDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        card={selectedCard}
        onAssignRequest={(cardToAssign) => {
          navigate(`/admin/scan?payload=${cardToAssign.public_code}`);
        }}
        onCardUpdated={(updated) => {
          setSelectedCard(updated);
          fetchInventory();
        }}
      />

      {/* Single Delete Dialog */}
      {cardToDelete && (
        <ConfirmDialog
          isOpen={!!cardToDelete}
          onClose={() => setCardToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="تأكيد حذف البطاقة"
          message={`هل أنت تأكد من رغبتك في حذف البطاقة (${cardToDelete.card_code}) ذات الكود العام [${cardToDelete.public_code}]؟ هذا الإجراء سيقوم بإزالة البطاقة نهائياً من النظام.`}
          confirmLabel="حذف البطاقة"
          cancelLabel="إلغاء"
          isDanger
        />
      )}

      {/* Bulk Delete Dialog */}
      {isBulkDeleteOpen && (
        <ConfirmDialog
          isOpen={isBulkDeleteOpen}
          onClose={() => setIsBulkDeleteOpen(false)}
          onConfirm={handleBulkDelete}
          title="تأكيد الحذف الجماعي"
          message={`هل أنت تأكد من رغبتك في حذف (${selectedCardIds.length}) بطاقات دفعة واحدة؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel={`حذف (${selectedCardIds.length}) بطاقات`}
          cancelLabel="إلغاء"
          isDanger
        />
      )}
    </div>
  );
};
