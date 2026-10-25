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
  Image as ImageIcon,
  Palette,
} from 'lucide-react';
import { websiteApi } from '../../services';
import { WebsiteProduct, ProductChoice } from '../../services/api/websiteApi';

export const AdminWebsiteProductsPage: React.FC = () => {
  const [products, setProducts] = useState<WebsiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WebsiteProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingChoiceKey, setUploadingChoiceKey] = useState<string | null>(null);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<WebsiteProduct>>({
    productId: '',
    name: '',
    description: '',
    basePrice: 650,
    currency: 'جنيه',
    features: [],
    options: [],
    visualType: 'sticker',
    order: 1,
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

  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingGallery(true);
      showToast('جاري رفع صورة للمعرض...', 'success');
      const res = await websiteApi.uploadMedia(file);
      if (res?.url) {
        setFormData((prev) => ({
          ...prev,
          gallery: [...(prev.gallery || []), res.url],
        }));
        showToast('تمت إضافة الصورة إلى معرض المنتج بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast('فشل رفع صورة المعرض: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleAddGalleryUrl = () => {
    const url = newGalleryUrl.trim();
    if (!url) return;
    setFormData((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), url],
    }));
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateChoice = (optId: string, choiceIndex: number, field: keyof ProductChoice, value: any) => {
    setFormData((prev) => {
      const opts = (prev.options || []).map((opt) => {
        if (opt.id === optId) {
          const newChoices = [...opt.choices];
          newChoices[choiceIndex] = {
            ...newChoices[choiceIndex],
            [field]: value,
          };
          return { ...opt, choices: newChoices };
        }
        return opt;
      });
      return { ...prev, options: opts };
    });
  };

  const handleAddChoice = (optId: string) => {
    setFormData((prev) => {
      const opts = (prev.options || []).map((opt) => {
        if (opt.id === optId) {
          const newChoice: ProductChoice = {
            label: 'لون جديد',
            value: 'color-' + (opt.choices.length + 1),
            priceModifier: 0,
            image: prev.defaultImage || '',
          };
          return { ...opt, choices: [...opt.choices, newChoice] };
        }
        return opt;
      });
      return { ...prev, options: opts };
    });
  };

  const handleRemoveChoice = (optId: string, choiceIndex: number) => {
    setFormData((prev) => {
      const opts = (prev.options || []).map((opt) => {
        if (opt.id === optId) {
          return {
            ...opt,
            choices: opt.choices.filter((_, idx) => idx !== choiceIndex),
          };
        }
        return opt;
      });
      return { ...prev, options: opts };
    });
  };

  const handleUploadChoiceImage = async (optId: string, choiceIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = `${optId}-${choiceIndex}`;
    try {
      setUploadingChoiceKey(key);
      showToast('جاري رفع صورة الخيار/اللون...', 'success');
      const res = await websiteApi.uploadMedia(file);
      if (res?.url) {
        handleUpdateChoice(optId, choiceIndex, 'image', res.url);
        showToast('تم تحديث صورة الخيار بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast('فشل رفع صورة الخيار: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setUploadingChoiceKey(null);
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
    setNewGalleryUrl('');
    setFormData({
      productId: 'item-' + Math.floor(Math.random() * 9000 + 1000),
      name: '',
      description: '',
      basePrice: 650,
      currency: 'جنيه',
      visualType: 'sticker',
      order: (products.length || 0) + 1,
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
        {
          id: 'custom_print',
          label: 'هل تريد طباعة مخصصة؟',
          required: true,
          choices: [
            { value: 'no', label: 'لا، التصميم الافتراضي', priceModifier: 0 },
            { value: 'yes', label: 'نعم، طباعة مخصصة', priceModifier: 150 },
          ],
        },
      ],
      defaultImage: 'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525351/k2rty/k2rty_sticker_white.png',
      gallery: [
        'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525351/k2rty/k2rty_sticker_white.png',
        'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525357/k2rty/k2rty_sticker_black.png',
        'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525358/k2rty/k2rty_sticker_sage.jpg',
      ],
      isAvailable: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (product: WebsiteProduct) => {
    setEditingProduct(product);
    setNewGalleryUrl('');
    setFormData({
      ...product,
      gallery: product.gallery ? [...product.gallery] : [],
      options: product.options ? JSON.parse(JSON.stringify(product.options)) : [],
      features: product.features ? [...product.features] : [],
      order: product.order ?? 1,
      visualType: product.visualType || 'sticker',
    });
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

              {/* Options & Variants & Gallery badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
                <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  🖼️ {prod.gallery?.length || 0} صور بالمعرض
                </span>
                <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  🔢 ترتيب: {prod.order ?? 1}
                </span>
                {prod.visualType && (
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    🏷️ {prod.visualType}
                  </span>
                )}
              </div>

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
              maxWidth: '740px',
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
                    value={formData.basePrice ?? 650}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    ترتيب العرض (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={formData.order ?? 1}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    النوع البصري للمنتج (Visual Type)
                  </label>
                  <input
                    type="text"
                    value={formData.visualType || 'sticker'}
                    onChange={(e) => setFormData({ ...formData, visualType: e.target.value })}
                    placeholder="sticker"
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
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  مميزات المنتج (سطر لكل ميزة تظهر في صفحة المنتج)
                </label>
                <textarea
                  rows={4}
                  value={(formData.features || []).join('\n')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: e.target.value.split('\n').filter((line) => line.trim().length > 0),
                    })
                  }
                  placeholder="يعمل بتقنية NFC وQR معًا&#10;بدون تطبيق — أي هاتف حديث يكفي&#10;مقاوم للاستخدام اليومي"
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

              {/* Gallery Section */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={18} style={{ color: '#4f46e5' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                      معرض صور المنتج (Gallery)
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>({(formData.gallery || []).length} صور)</span>
                  </div>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      background: '#4f46e5',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: uploadingGallery ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Upload size={13} />
                    {uploadingGallery ? 'جاري رفع صورة...' : 'رفع صورة للمعرض'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingGallery}
                      onChange={handleUploadGalleryImage}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="أو أدخل رابط صورة مباشرة ثم اضغط إضافة..."
                    style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#e0e7ff',
                      color: '#4338ca',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    إضافة
                  </button>
                </div>

                {formData.gallery && formData.gallery.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', marginTop: '6px' }}>
                    {formData.gallery.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#ffffff',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'assets/images/product/sticker-white.png';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          title="حذف الصورة"
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Color & Variant Options Manager */}
              {(formData.options || [])
                .filter((opt) => opt.id !== 'custom_print')
                .map((opt) => (
                  <div
                    key={opt.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Palette size={18} style={{ color: '#0284c7' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                          خيارات {opt.label} ({opt.choices.length} خيارات متاحة)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddChoice(opt.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: '1px solid #bae6fd',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={13} /> إضافة خيار / لون جديد
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {opt.choices.map((choice, cIdx) => {
                        const uploadKey = `${opt.id}-${cIdx}`;
                        const isThisUploading = uploadingChoiceKey === uploadKey;

                        return (
                          <div
                            key={cIdx}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '10px',
                              padding: '10px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                overflow: 'hidden',
                                background: '#f1f5f9',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <img
                                src={choice.image || 'assets/images/product/sticker-white.png'}
                                alt={choice.label}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'assets/images/product/sticker-white.png';
                                }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '100px', flex: 1 }}>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>اسم اللون / الخيار</span>
                              <input
                                type="text"
                                value={choice.label}
                                onChange={(e) => handleUpdateChoice(opt.id, cIdx, 'label', e.target.value)}
                                placeholder="أبيض"
                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '90px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>كود المعرف (Value)</span>
                              <input
                                type="text"
                                value={choice.value}
                                onChange={(e) => handleUpdateChoice(opt.id, cIdx, 'value', e.target.value)}
                                placeholder="white"
                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '70px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>فرق السعر</span>
                              <input
                                type="number"
                                value={choice.priceModifier ?? 0}
                                onChange={(e) => handleUpdateChoice(opt.id, cIdx, 'priceModifier', Number(e.target.value))}
                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', width: '70px' }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '130px', flex: 1 }}>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>رابط الصورة</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                  type="text"
                                  value={choice.image || ''}
                                  onChange={(e) => handleUpdateChoice(opt.id, cIdx, 'image', e.target.value)}
                                  placeholder="https://..."
                                  style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                                />
                                <label
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    cursor: isThisUploading ? 'not-allowed' : 'pointer',
                                  }}
                                  title="رفع صورة خاصة بهذا اللون"
                                >
                                  <Upload size={12} color="#475569" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    disabled={isThisUploading}
                                    onChange={(e) => handleUploadChoiceImage(opt.id, cIdx, e)}
                                  />
                                </label>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveChoice(opt.id, cIdx)}
                              title="حذف هذا الخيار"
                              style={{
                                background: '#fee2e2',
                                color: '#ef4444',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                marginTop: '16px',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

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

              {/* Custom Print Option Card */}
              {(() => {
                const cpOpt = formData.options?.find((o) => o.id === 'custom_print');
                const hasCp = !!cpOpt;
                const cpModifier = cpOpt?.choices?.find((c) => c.value === 'yes')?.priceModifier ?? 150;

                return (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          id="customPrintEnable"
                          checked={hasCp}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            let newOpts = [...(formData.options || [])];
                            if (checked) {
                              if (!newOpts.some((o) => o.id === 'custom_print')) {
                                newOpts.push({
                                  id: 'custom_print',
                                  label: 'هل تريد طباعة مخصصة؟',
                                  required: true,
                                  choices: [
                                    { value: 'no', label: 'لا، التصميم الافتراضي', priceModifier: 0 },
                                    { value: 'yes', label: 'نعم، طباعة مخصصة', priceModifier: 150 },
                                  ],
                                });
                              }
                            } else {
                              newOpts = newOpts.filter((o) => o.id !== 'custom_print');
                            }
                            setFormData({ ...formData, options: newOpts });
                          }}
                          style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                        />
                        <label htmlFor="customPrintEnable" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                          🎨 تفعيل ميزة الطباعة المخصصة للمنتج (Custom Print)
                        </label>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        سعر الكوستر بالطباعة المخصصة: {(formData.basePrice || 650) + (hasCp ? cpModifier : 0)} {formData.currency || 'جنيه'}
                      </span>
                    </div>

                    {hasCp && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                          قيمة الزيادة للطباعة المخصصة:
                        </label>
                        <input
                          type="number"
                          value={cpModifier}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const newOpts = (formData.options || []).map((opt) => {
                              if (opt.id === 'custom_print') {
                                return {
                                  ...opt,
                                  choices: opt.choices.map((c) =>
                                    c.value === 'yes' ? { ...c, priceModifier: val } : c
                                  ),
                                };
                              }
                              return opt;
                            });
                            setFormData({ ...formData, options: newOpts });
                          }}
                          style={{ width: '120px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
                        />
                        <span style={{ fontSize: '0.84rem', color: '#64748b' }}>{formData.currency || 'جنيه'} (يضاف للسعر الأساسي)</span>
                      </div>
                    )}
                  </div>
                );
              })()}

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
