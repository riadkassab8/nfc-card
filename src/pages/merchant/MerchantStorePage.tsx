import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { websiteApi, WebsiteProduct } from '../../services/api/websiteApi';

export const MerchantStorePage: React.FC = () => {
  const { admin } = useAuth();
  const [products, setProducts] = useState<WebsiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderingProduct, setOrderingProduct] = useState<WebsiteProduct | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('white');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://smart-card-qr-api.koyeb.app/api/website/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          return;
        }
      }
      // Fallback to websiteApi
      const apiProds = await websiteApi.getProducts();
      setProducts(apiProds || []);
    } catch {
      // Offline fallback
      setProducts([
        {
          productId: 'sticker',
          name: 'كوستر K2rty الذكي',
          description: 'كوستر ذكي يعمل بتقنية NFC وQR معاً. ضعه على طاولة المحل أو الكاونتر للوصول السريع لصفحتك ومنيوهاتك.',
          basePrice: 650,
          currency: 'جنيه',
          features: [
            'يعمل بتقنية NFC وQR معاً',
            'بدون أي تطبيق — يعمل مع أي هاتف ذكي',
            'مقاوم للماء والاستخدام التجاري اليومي',
            'ثلاث ألوان أنيقة (أبيض، أسود، زيتي)',
          ],
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
          order: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenOrder = (prod: WebsiteProduct) => {
    setOrderingProduct(prod);
    const colorOpt = prod.options?.find((o) => o.id === 'color');
    if (colorOpt && colorOpt.choices?.length > 0) {
      setSelectedColor(colorOpt.choices[0].value);
    }
    setQuantity(1);
    setCustomerNotes('');
    setSuccessOrderId(null);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingProduct) return;

    setIsSubmitting(true);
    try {
      const unitPrice = orderingProduct.basePrice || 650;
      const totalAmount = unitPrice * quantity;
      const storeName = admin?.store_name || admin?.name || 'متجر معتمد';
      const phone = admin?.phone || '01000000000';

      const payload = {
        customer: {
          name: `${storeName} (حساب تاجر)`,
          phone: phone,
          city: 'طلب تاجر معتمد',
          address: 'طلب مباشر من لوحة التاجر',
        },
        items: [
          {
            productId: orderingProduct.productId || 'sticker',
            productName: orderingProduct.name,
            quantity: quantity,
            price: unitPrice,
            options: {
              color: selectedColor,
              merchantStore: storeName,
            },
          },
        ],
        totalAmount,
        notes: `طلب من لوحة التاجر لمحل (${storeName}) | ${customerNotes}`.trim(),
        paymentMethod: 'merchant_invoice',
      };

      const res = await fetch('https://smart-card-qr-api.koyeb.app/api/website/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const savedOrder = await res.json();
      setSuccessOrderId(savedOrder.orderId || 'CONFIRMED');
      showToast('تم تسجيل طلبك بنجاح وسيتواصل معك فريق العمل فوراً!', 'success');
    } catch (err: any) {
      showToast('حدث خطأ أثناء تسجيل الطلب: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActiveProductImage = (prod: WebsiteProduct) => {
    if (orderingProduct && orderingProduct.productId === prod.productId) {
      const colorOpt = prod.options?.find((o) => o.id === 'color');
      const match = colorOpt?.choices?.find((c) => c.value === selectedColor);
      if (match?.image) return match.image;
    }
    return prod.defaultImage || 'https://res.cloudinary.com/dls8ootj3/image/upload/v1792525351/k2rty/k2rty_sticker_white.png';
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
            zIndex: 999999,
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

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          borderRadius: '24px',
          padding: '28px 32px',
          color: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          boxShadow: '0 10px 30px -10px rgba(30, 58, 138, 0.4)',
        }}
      >
        <div style={{ maxWidth: '620px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <Sparkles size={14} /> تجهيزات ومبيعات المتاجر
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800 }}>
            طلب كوسترز وبطاقات ذكية جديدة لمحلك 🛒
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#93c5fd', lineHeight: 1.6 }}>
            احصل على كوسترز NFC الذكية لطاولات محلك أو بطاقات إضافية لفريق العمل لتسريع تقييمات جوجل، فتح المنيو، ومشاركة حساباتك بلمسة واحدة.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="https://wa.me/201098277229?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%86%D8%A7%20%D8%B5%D8%A7%D8%AD%D8%A8%20%D9%85%D8%AD%D9%84%20%D9%88%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D9%83%D9%88%D8%B3%D8%AA%D8%B1%D8%B2%20%D8%A5%D8%B6%D8%A7%D9%81%D9%8A%D8%A9"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#22c55e',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
            }}
          >
            <MessageCircle size={16} />
            محادثة فورية مع المبيعات
          </a>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={32} className="spin" style={{ color: '#0284c7', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>جاري تحميل منتجات المتجر...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Package size={40} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800 }}>لا توجد منتجات معروضة حالياً</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>يرجى التواصل مع الدعم الفني للاستفسار عن المنتجات المتاحة.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {products.map((prod) => {
            const imgSrc = getActiveProductImage(prod);

            return (
              <div
                key={prod.productId}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Product Image Stage */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    position: 'relative',
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={prod.name}
                    style={{
                      maxHeight: '180px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: '12px',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                    }}
                  >
                    NFC + QR
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                        {prod.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                        {prod.description}
                      </p>
                    </div>

                    <div style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                        {prod.basePrice || 650}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '4px' }}>
                        {prod.currency || 'جنيه'}
                      </span>
                    </div>
                  </div>

                  {/* Features list */}
                  {prod.features && prod.features.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {prod.features.slice(0, 4).map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                          <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action button */}
                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenOrder(prod)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '11px',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                      }}
                    >
                      <ShoppingCart size={16} />
                      طلب المنتج الآن للمحل
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Modal */}
      {orderingProduct && (
        <div
          onClick={() => setOrderingProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              direction: 'rtl',
            }}
          >
            {successOrderId ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>
                  ✓
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  تم استلام طلبك بنجاح!
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.92rem', color: '#475569' }}>
                  كود الطلب: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>#{successOrderId}</strong>
                </p>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  تم إشعار إدارة K2rty بطلبك كتاجر معتمد. سيتم التواصل معك مباشرة على هاتفك المسجل لتأكيد الشحن والتسليم.
                </p>
                <button
                  type="button"
                  onClick={() => setOrderingProduct(null)}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 24px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    طلب {orderingProduct.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOrderingProduct(null)}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                  >
                    ×
                  </button>
                </div>

                {/* Store Pre-fill Info */}
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <div><strong>المحل:</strong> {admin?.store_name || admin?.name || 'متجر معتمد'}</div>
                  <div style={{ marginTop: '4px' }}><strong>رقم الهاتف:</strong> {admin?.phone || 'مسجل في الحساب'}</div>
                </div>

                {/* Color Choice */}
                {orderingProduct.options?.find((o) => o.id === 'color') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      اختر اللون:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {orderingProduct.options.find((o) => o.id === 'color')?.choices.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setSelectedColor(c.value)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '10px',
                            border: selectedColor === c.value ? '2px solid #0284c7' : '1px solid #cbd5e1',
                            backgroundColor: selectedColor === c.value ? '#e0f2fe' : '#ffffff',
                            color: selectedColor === c.value ? '#0369a1' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    الكمية المطلوبة:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    ملاحظات التوصيل / تفاصيل إضافية:
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="أي تعليمات تسليم أو أماكن خاصة لتوزيع الكوسترز..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Total */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>الإجمالي التقديري:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                    {(orderingProduct.basePrice || 650) * quantity} جنيه
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      جاري تأكيد الطلب...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      تأكيد الطلب الآن
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
