import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Upload,
} from 'lucide-react';
import { websiteApi } from '../../services';
import { WebsiteProduct } from '../../services/api/websiteApi';

export const AdminWebsiteProductsPage: React.FC = () => {
  const [products, setProducts] = useState<WebsiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WebsiteProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<WebsiteProduct>>({
    productId: '',
    name: '',
    description: '',
    basePrice: 450,
    currency: 'جنيه',
    features: [],
    options: [],
    defaultImage: '',
    gallery: [],
    isAvailable: true,
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      showToast('جاري رفع صورة المنتج إلى السحابة Cloudinary...', 'success');
      const res = await websiteApi.uploadMedia(file);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, defaultImage: res.url }));
        showToast('تم رفع صورة المنتج بنجاح وتحديث الرابط!', 'success');
      }
    } catch (err: any) {
      showToast('فشل رفع الصورة: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await websiteApi.getProducts();
      setProducts(data);
    } catch (err: any) {
      showToast('تعذر تحميل المنتجات: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      productId: 'item-' + Math.floor(Math.random() * 9000 + 1000),
      name: '',
      description: '',
      basePrice: 450,
      currency: 'جنيه',
      features: ['يعمل بتقنية NFC وQR معًا', 'بدون تطبيق — أي هاتف حديث يكفي', 'مقاوم للاستخدام اليومي'],
      options: [
        {
          id: 'color',
          label: 'اللون',
          required: true,
          choices: [
            { value: 'white', label: 'أبيض', priceModifier: 0, image: 'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525351/k2rty/k2rty_sticker_white.png' },
            { value: 'black', label: 'أسود', priceModifier: 0, image: 'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525357/k2rty/k2rty_sticker_black.png' },
            { value: 'sage', label: 'زيتي', priceModifier: 0, image: 'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525358/k2rty/k2rty_sticker_sage.jpg' },
          ],
        },
      ],
      defaultImage: 'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525351/k2rty/k2rty_sticker_white.png',
      gallery: [],
      isAvailable: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (product: WebsiteProduct) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.productId) {
      showToast('يرجى ملء اسم المنتج والمعرف الفريد', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingProduct) {
        await websiteApi.updateProduct(editingProduct.productId, formData);
        showToast('تم تحديث بيانات المنتج بنجاح', 'success');
      } else {
        await websiteApi.createProduct(formData);
        showToast('تم إضافة المنتج الجديد بنجاح', 'success');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err: any) {
      showToast('حدث خطأ أثناء الحفظ: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟')) {
      return;
    }
    try {
      await websiteApi.deleteProduct(productId);
      showToast('تم حذف المنتج بنجاح', 'success');
      loadProducts();
    } catch (err: any) {
      showToast('تعذر حذف المنتج: ' + err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
            borderRight: toast.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444',
            direction: 'rtl',
            fontFamily: 'inherit',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} color="#10b981" /> : <AlertCircle size={20} color="#ef4444" />}
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{toast.msg}</span>
        </div>
      )}

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px -10px rgba(49, 46, 129, 0.4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={28} style={{ color: '#a5b4fc' }} />
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              إدارة منتجات المتجر
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.92rem', opacity: 0.9, color: '#e0e7ff' }}>
            تحكم في بطاقات ومنتجات الموقع، الأسعار، الألوان، خيارات التخصيص، وصور المنتجات.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: '12px',
            border: 'none',
            background: '#6366f1',
            color: '#ffffff',
            fontSize: '0.92rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          <Plus size={18} />
          إضافة منتج جديد
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
          <Loader2 size={32} className="spin" style={{ color: '#4f46e5' }} />
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>جاري تحميل المنتجات...</span>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <ShoppingBag size={48} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: 0 }}>لا توجد منتجات حالياً</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>قم بإضافة أول منتج لمتجرك الآن.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {products.map((prod) => (
            <div
              key={prod.productId}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={prod.defaultImage || 'assets/images/product/sticker-white.png'}
                  alt={prod.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '4px',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'assets/images/product/sticker-white.png';
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: prod.isAvailable ? '#dcfce7' : '#fee2e2',
                        color: prod.isAvailable ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {prod.isAvailable ? 'نشط ومتاح' : 'معطل'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
                      ID: {prod.productId}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {prod.name}
                  </h3>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#4f46e5', marginTop: '4px' }}>
                    {prod.basePrice} {prod.currency || 'جنيه'}
                  </div>
                </div>
              </div>

              {prod.description && (
                <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, lineHeight: 1.5, maxHeight: '42px', overflow: 'hidden' }}>
                  {prod.description}
                </p>
              )}

              {/* Options & Variants summary */}
              {prod.options && prod.options.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', fontSize: '0.82rem', color: '#475569' }}>
                  <span style={{ fontWeight: 700 }}>الخيارات المتاحة: </span>
                  {prod.options.map((opt) => opt.choices.map((c) => c.label).join('، ')).join(' | ')}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => openEditModal(prod)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#334155',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={14} /> تعديل
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(prod.productId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              direction: 'rtl',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    معرف المنتج (Product ID)
                  </label>
                  <input
                    type="text"
                    value={formData.productId || ''}
                    disabled={!!editingProduct}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    placeholder="sticker"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    اسم المنتج
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="كوستر K2rty الذكي"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    السعر الأساسي
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice ?? 450}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    العملة
                  </label>
                  <input
                    type="text"
                    value={formData.currency || 'جنيه'}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  وصف المنتج
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    رابط صورة المنتج الافتراضية
                  </label>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: '#eef2ff',
                      color: '#4f46e5',
                      border: '1px solid #c7d2fe',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Upload size={13} />
                    {uploadingImage ? 'جاري الرفع...' : 'رفع صورة'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingImage}
                      onChange={handleUploadProductImage}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.defaultImage || ''}
                  onChange={(e) => setFormData({ ...formData, defaultImage: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formData.isAvailable ?? true}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }}
                />
                <label htmlFor="availCheck" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  المنتج متاح ونشط للطلب على الموقع
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '9px 24px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
