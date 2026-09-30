import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Badge, Skeleton, Toast, ToastType, EmptyState, ErrorState } from '../../components/ui';
import { BatchGenerateCardsModal } from '../../components/admin/BatchGenerateCardsModal';
import { CardDetailsDrawer } from '../../components/admin/CardDetailsDrawer';
import { cardService } from '../../services';
import { CardItem, CardInventoryStats, CardProductType } from '../../types';
import { useTranslation } from '../../i18n';
import { Plus, CreditCard, Eye, Download, Building2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminInventoryPage: React.FC = () => {
  const { t, formatNumber } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [stats, setStats] = useState<CardInventoryStats>({ total_cards: 0, active_cards: 0, inactive_cards: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | CardProductType>('ALL');
  
  // Modals & Drawers
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const downloadPNG = (publicCode: string) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#ffffff"/>
      <rect x="30" y="30" width="80" height="80" fill="#18181b"/>
      <rect x="50" y="50" width="40" height="40" fill="#ffffff"/>
      <rect x="190" y="30" width="80" height="80" fill="#18181b"/>
      <rect x="210" y="50" width="40" height="40" fill="#ffffff"/>
      <rect x="30" y="190" width="80" height="80" fill="#18181b"/>
      <rect x="50" y="210" width="40" height="40" fill="#ffffff"/>
      <text x="150" y="280" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#18181b">${publicCode}</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CARD-${publicCode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 'var(--space-2xl)', insetInlineEnd: 'var(--space-2xl)', zIndex: 1100 }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h2 className="text-title">{t('cards.title')}</h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t('cards.subtitle')}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsBatchOpen(true)}>
          <Plus size={18} /> {t('cards.generateBatchBtn')}
        </Button>
      </div>

      {/* Inventory Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-lg)',
        }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
              <CreditCard size={24} style={{ color: 'var(--text-primary)' }} />
            </div>
            <div>
              <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('cards.totalCards')}</span>
              <h3 className="text-title" style={{ fontSize: '1.5rem' }}>{formatNumber(stats.total_cards)}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)' }}>
              <span style={{ fontSize: '20px' }}>🟢</span>
            </div>
            <div>
              <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('cards.statusActive')}</span>
              <h3 className="text-title" style={{ fontSize: '1.5rem' }}>{formatNumber(stats.active_cards)}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--warning-bg)' }}>
              <span style={{ fontSize: '20px' }}>🔴</span>
            </div>
            <div>
              <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('cards.statusInactive')}</span>
              <h3 className="text-title" style={{ fontSize: '1.5rem' }}>{formatNumber(stats.inactive_cards)}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Controls */}
      <Card padding="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Category Tabs Row */}
          <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-xs)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', alignSelf: 'center', marginInlineEnd: 'var(--space-xs)' }}>
              قسم المنتجات:
            </span>
            {(
              [
                { key: 'ALL', label: 'الكل', icon: '📦' },
                { key: 'GOOGLE_REVIEW', label: 'Google Review', icon: '🌟' },
                { key: 'INSTAPAY', label: 'InstaPay', icon: '💳' },
                { key: 'TIKTOK', label: 'TikTok', icon: '🎵' },
                { key: 'INSTAGRAM', label: 'Instagram', icon: '📸' },
                { key: 'FACEBOOK', label: 'Facebook', icon: '📘' },
                { key: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
                { key: 'UNIFIED_SOCIAL', label: 'السوشيال الموحدة', icon: '🌐' },
              ] as const
            ).map((cat) => (
              <Button
                key={cat.key}
                variant={categoryFilter === cat.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCategoryFilter(cat.key as any)}
              >
                <span>{cat.icon}</span> {cat.label}
              </Button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                placeholder={t('cards.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filterKey) => (
                <Button
                  key={filterKey}
                  variant={statusFilter === filterKey ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(filterKey)}
                >
                  {filterKey === 'ALL'
                    ? t('cards.filterAll')
                    : filterKey === 'ACTIVE'
                    ? `🟢 ${t('cards.statusActive')}`
                    : `🔴 ${t('cards.statusInactive')}`}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Cards Inventory Table */}
      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : loading ? (
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Skeleton height="44px" />
            <Skeleton height="44px" />
            <Skeleton height="44px" />
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
        <Card padding="none" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('cards.colStatus')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>نوع المنتج</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('cards.colCard')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('cards.colQR')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('cards.colNFC')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('cards.colPublicCode')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('cards.colBiz')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)', textAlign: 'end' }}>{t('cards.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => {
                  const isActive = card.status === 'ACTIVE';
                  const bizName = card.business_data?.name || card.business_name;
                  const catMeta = {
                    GOOGLE_REVIEW: { label: 'Google Review', icon: '🌟' },
                    INSTAPAY: { label: 'InstaPay', icon: '💳' },
                    TIKTOK: { label: 'TikTok', icon: '🎵' },
                    INSTAGRAM: { label: 'Instagram', icon: '📸' },
                    FACEBOOK: { label: 'Facebook', icon: '📘' },
                    WHATSAPP: { label: 'WhatsApp', icon: '💬' },
                    UNIFIED_SOCIAL: { label: 'السوشيال الموحدة', icon: '🌐' },
                  }[card.card_type || 'GOOGLE_REVIEW'];

                  return (
                    <tr key={card.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 150ms ease-out' }}>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                          <span style={{ fontSize: '14px' }}>{isActive ? '🟢' : '🔴'}</span>
                          <Badge variant={isActive ? 'active' : 'warning'}>
                            {isActive ? t('cards.statusActive') : t('cards.statusInactive')}
                          </Badge>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                        <Badge variant="neutral">
                          <span style={{ marginInlineEnd: '4px' }}>{catMeta.icon}</span> {catMeta.label}
                        </Badge>
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }} className="text-body-medium">
                        {card.card_code}
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                        <span className="text-caption" style={{ fontFamily: 'monospace' }}>
                          {card.qr.id}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                        <span className="text-caption" style={{ fontFamily: 'monospace' }}>
                          {card.nfc.identifier}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                        <span className="text-caption" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {card.public_code}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }} className="text-body">
                        {isActive && bizName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                            <Building2 size={14} style={{ color: 'var(--text-secondary)' }} />
                            <span>{bizName}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>لا توجد</span>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--space-xs)' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCard(card);
                              setIsDrawerOpen(true);
                            }}
                            title={t('cards.viewDetails')}
                          >
                            <Eye size={16} />
                          </Button>

                          <Button
                            variant={isActive ? 'ghost' : 'outline'}
                            size="sm"
                            onClick={() => {
                              navigate(`/admin/scan?payload=${card.public_code}`);
                            }}
                            title={t('cards.assignCard')}
                          >
                            <Edit size={14} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPNG(card.public_code)}
                            title={t('common.download')}
                          >
                            <Download size={16} />
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
      />
    </div>
  );
};
