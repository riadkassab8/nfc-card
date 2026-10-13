import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Smartphone,
  Edit3,
  BarChart2,
  TrendingUp,
  HelpCircle,
  ArrowLeft,
  Store,
  Share2,
  Sparkles,
  MapPin,
  MessageCircle,
  ThumbsUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  Zap,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const MerchantGuidePage: React.FC = () => {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState<'basics' | 'edit' | 'nfc' | 'reviews' | 'analytics' | 'faq'>('basics');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState('');

  const storeTitle = admin?.store_name || admin?.name || 'متجرك الذكي';

  const faqs: FaqItem[] = [
    {
      question: 'هل يحتاج العميل لتحميل أي تطبيق لمسح البطاقة؟',
      answer: 'لا نهائياً! بمجرد ملامسة الهاتف للبطاقة (NFC) أو توجيه كاميرا الهاتف لكود الـ QR، تفتح صفحة المتجر فوراً في متصفح العميل الافتراضي دون أي برامج.',
      category: 'عام',
    },
    {
      question: 'هل يمكنني تعديل الروابط بعد طباعة واستلام البطاقة؟',
      answer: 'نعم بكل تأكيد وبشكل غير محدود! ميزة البطاقة الذكية الديناميكية أنها تتيح لك تحديث رقم الواتساب، رابط تقييم جوجل، أرقام الهاتف، وصفحات السوشيال ميديا في أي وقت من لوحة التحكم، والتحديث يظهر فوراً للعميل دون الحاجة لتغيير الكارت.',
      category: 'التعديل',
    },
    {
      question: 'أين يقع مستشعر الـ NFC في هواتف الآيفون؟',
      answer: 'في هواتف iPhone، يقع مستشعر الـ NFC في أعلى حافة الهاتف من الخلف (قرب الكاميرا). يكفي تقريب أعلى الآيفون من الكارت ليظهر إشعار فوري في أعلى الشاشة.',
      category: 'NFC',
    },
    {
      question: 'أين يقع مستشعر الـ NFC في هواتف الأندرويد؟',
      answer: 'في معظم هواتف Android (سامسونج، شاومي، هواوي، أوبو)، يقع المستشعر في منتصف ظهر الهاتف. يجب التأكد فقط من أن ميزة NFC مفعلة من شريط الإعدادات السريعة بالأعلى.',
      category: 'NFC',
    },
    {
      question: 'ماذا لو كان هاتف العميل قديماً ولا يدعم الـ NFC؟',
      answer: 'كل بطاقة مطبوع عليها كود QR ذكي عالي الجودة في الخلف. يمكن للعميل ببساطة فتح تطبيق الكاميرا ومسح الكود ليفتح نفس الرابط تماماً وبنفس السرعة.',
      category: 'عام',
    },
    {
      question: 'كيف أربط البطاقة مباشرة بصفحة تقييم جوجل ماب (Google Review)؟',
      answer: 'يمكنك الحصول على رابط التقييم المباشر من لوحة نشاطك التجاري على جوجل ماب، ثم الدخول إلى قسم "بطاقاتي الذكية" ووضع الرابط في خانة جوجل ماب، وتفعيله كرابط أساسي أو إبرازه بأعلى الصفحة.',
      category: 'التعديل',
    },
    {
      question: 'كيف أعرف عدد الأشخاص الذين استخدموا البطاقة؟',
      answer: 'من خلال الضغط على صفحة "إحصائيات وزوار المحل" في القائمة الجانبية، ستجد تقريراً تفصيلياً بعدد مرات التمرير والزيارات اليومية والشهرية، وأنواع هواتف العملاء (آيفون أو أندرويد).',
      category: 'الإحصائيات',
    },
    {
      question: 'ماذا أفعل عندما يقترب موعد انتهاء الاشتراك؟',
      answer: 'سيظهر لك تنبيه ذكي أعلى لوحة التحكم قبل الانتهاء بفترة كافية. يمكنك التواصل مباشرة مع إدارة النظام لتجديد باقة الاشتراك بكل سهولة دون انقطاع الخدمة.',
      category: 'الاشتراك',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(faqSearch.toLowerCase()),
  );

  return (
    <div dir="rtl" style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 0 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Hero Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
          borderRadius: '20px',
          padding: '30px 28px',
          color: '#ffffff',
          boxShadow: '0 12px 30px rgba(37, 99, 235, 0.22)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', padding: '5px 14px', borderRadius: '999px', width: 'fit-content', fontSize: '12.5px', fontWeight: 800 }}>
            <Sparkles size={15} color="#fef08a" />
            <span>الدليل الرسمي لتشغيل متجر {storeTitle}</span>
          </div>

          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, lineHeight: 1.3 }}>
            كيف تستفيد إلى أقصى حد من بطاقتك الذكية ونظامك؟
          </h1>

          <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.9)', maxWidth: '780px' }}>
            أهلاً بك! صُمم هذا الدليل لمساعدتك خطوة بخطوة في إدارة وتعديل بطاقتك الذكية، تدريب فريق العمل على ميزة الـ NFC، ومضاعفة تقييمات جوجل ماب وزوار متجرك بأسهل الطرق.
          </p>

          {/* Quick CTA Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Link
              to="/merchant/cards"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#1d4ed8',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13.5px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              <Edit3 size={16} />
              <span>تعديل بطاقتي الآن</span>
            </Link>

            <Link
              to="/merchant/analytics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13.5px',
                textDecoration: 'none',
              }}
            >
              <BarChart2 size={16} />
              <span>مشاهدة الزوار والإحصائيات</span>
            </Link>

            <Link
              to="/merchant/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13.5px',
                textDecoration: 'none',
              }}
            >
              <Store size={16} />
              <span>بيانات المتجر</span>
            </Link>
          </div>
        </div>

        {/* Ambient Decorative background */}
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-40px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Quick 3-Steps Journey ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--bdr-light, #e2e8f0)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', flexShrink: 0 }}>
            1
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading, #0f172a)' }}>
              اضبط الروابط ومعلوماتك
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--txt-muted, #64748b)' }}>
              ادخل على صفحة <strong>بطاقاتي الذكية</strong> وتأكد من إضافة رابط جوجل ماب ورقم الواتساب وحسابات السوشيال الخاصة بمتجرك.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--bdr-light, #e2e8f0)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', flexShrink: 0 }}>
            2
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading, #0f172a)' }}>
              ضع البطاقة في مكان استراتيجي
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--txt-muted, #64748b)' }}>
              ضع حامل البطاقة بجوار ماكينة الدفع (الكاشير) أو على الطاولات بحيث تكون أمام عين الزبون أثناء انتظار الفاتورة.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--bdr-light, #e2e8f0)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', flexShrink: 0 }}>
            3
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading, #0f172a)' }}>
              تابع التفاعل والإحصائيات
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--txt-muted, #64748b)' }}>
              ادخل أسبوعياً على صفحة <strong>إحصائيات وزوار المحل</strong> لترى نمو عدد الزوار والروابط الأكثر طلباً.
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid var(--bdr-light, #e2e8f0)' }}>
        {[
          { id: 'basics', label: 'الأساسيات والتشغيل', icon: BookOpen },
          { id: 'edit', label: 'طريقة تعديل البطاقة', icon: Edit3 },
          { id: 'nfc', label: 'أسرار تمرير NFC', icon: Smartphone },
          { id: 'reviews', label: 'زيادة تقييمات جوجل ومبيعاتك', icon: TrendingUp },
          { id: 'analytics', label: 'فهم الإحصائيات', icon: BarChart2 },
          { id: 'faq', label: 'الأسئلة الشائعة (FAQ)', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px 12px 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                backgroundColor: isActive ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: isActive ? '#2563eb' : 'var(--txt-muted, #64748b)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content: Basics ── */}
      {activeTab === 'basics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--bdr-light, #e2e8f0)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt-heading)' }}>
              <Layers size={20} color="#2563eb" />
              ما هي بطاقتك الذكية وكيف تعمل؟
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--txt-body)', margin: '0 0 16px' }}>
              بطاقتك الذكية تجمع بين أحدث تقنيتين لمشاركة البيانات لاسلكياً بدون أي برامج خارجية:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1e3a8a', fontWeight: 800, fontSize: '15px' }}>
                  <Zap size={18} color="#2563eb" /> تقنية التمرير اللاسلكي (NFC)
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#475569' }}>
                  شريحة دقيقة مدمجة داخل الكارت تتواصل مع الهواتف الذكية بمجرد تقريب الهاتف لمسافة 2-3 سم، وتفتح صفحة متجرك تلقائياً وفورياً.
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1e3a8a', fontWeight: 800, fontSize: '15px' }}>
                  <Share2 size={18} color="#2563eb" /> رمز الاستجابة السريع (QR Code)
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#475569' }}>
                  كود مطبوع على ظهر البطاقة، يعمل مع أي هاتف ذكي عبر تطبيق الكاميرا العادية، وهو الحل البديل الفوري للهواتف القديمة.
                </p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#eff6ff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Info size={24} color="#2563eb" />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 800, color: '#1e40af' }}>
                  تأكد من تجربة الكارت بنفسك الآن!
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a' }}>
                  جرب تقريب هاتفك من الكارت لتشاهد الصفحة التفاعلية التي يراها زبائنك عند زيارة المحل.
                </p>
              </div>
            </div>
            <Link
              to="/merchant/cards"
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              عرض بطاقاتي <ArrowLeft size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Tab Content: Edit Card ── */}
      {activeTab === 'edit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--bdr-light, #e2e8f0)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt-heading)' }}>
              <Edit3 size={20} color="#2563eb" />
              خطوات تعديل وتحديث بيانات بطاقتك
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    توجه إلى صفحة "بطاقاتي الذكية"
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt-muted)', lineHeight: 1.6 }}>
                    من القائمة الجانبية، اختر <strong>بطاقاتي الذكية</strong> لتظهر لك جميع البطاقات المخصصة لمتجرك.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    اضغط على زر "تعديل البطاقة"
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt-muted)', lineHeight: 1.6 }}>
                    ستفتح لك نافذة تحتوي على كل بيانات البطاقة (اسم المتجر، الوصف، اللوجو، روابط التواصل الاجتماعي، ورابط الخريطة).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    أضف أو عدّل الروابط التي تريدها
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt-muted)', lineHeight: 1.6 }}>
                    يمكنك وضع رقم الواتساب بدون مسافات مع كود الدولة (مثلاً 2010xxxxxxx)، ورابط إنستغرام، ورابط تقييم جوجل ماب المباشر.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
                  ✓
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 800, color: '#059669' }}>
                    اضغط "حفظ التعديلات" (التحديث لحظي)
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt-muted)', lineHeight: 1.6 }}>
                    بمجرد النقر على حفظ، سيتحدث الكارت الفيزيائي المطبوع فوراً وبدون أي تدخل، وأي زبون يلمس الكارت بعدها سيرى التعديلات الجديدة في ثانية واحدة!
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--bdr-light)' }}>
              <Link
                to="/merchant/cards"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  textDecoration: 'none',
                }}
              >
                <Edit3 size={16} /> الذهاب لتعديل بطاقتي الآن
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: NFC Master Guide ── */}
      {activeTab === 'nfc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--bdr-light, #e2e8f0)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt-heading)' }}>
              <Smartphone size={20} color="#2563eb" />
              كيف تمرر الكارت على الهواتف باحترافية؟ (آيفون وأندرويد)
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--txt-body)', margin: '0 0 18px' }}>
              معرفة مكان مستشعر الـ NFC في هواتف الزبائن يجعل تجربة التمرير تبدو سحرية وسريعة جداً. إليك الدليل:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* iPhone Card */}
              <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px' }}>🍏</span>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    هواتف آبل (iPhone)
                  </h3>
                </div>
                <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.7 }}>
                  <p style={{ margin: '0 0 8px' }}>
                    • <strong>مكان المستشعر:</strong> في <strong>أعلى حافة الهاتف من الخلف</strong> (بجوار عدسات الكاميرا).
                  </p>
                  <p style={{ margin: '0 0 8px' }}>
                    • <strong>طريقة التمرير:</strong> المس الجزء العلوي من ظهر الآيفون بمنتصف الكارت لمدة ثانية واحدة.
                  </p>
                  <p style={{ margin: 0 }}>
                    • <strong>ميزة:</strong> الـ NFC يعمل تلقائياً دائماً في الآيفون (من آيفون XS والإصدارات الأحدث) دون الحاجة لتشغيل أي زر أو إعداد.
                  </p>
                </div>
              </div>

              {/* Android Card */}
              <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px' }}>🤖</span>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    هواتف أندرويد (Samsung / Xiaomi / Huawei)
                  </h3>
                </div>
                <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.7 }}>
                  <p style={{ margin: '0 0 8px' }}>
                    • <strong>مكان المستشعر:</strong> في <strong>منتصف ظهر الهاتف</strong> بالضبط.
                  </p>
                  <p style={{ margin: '0 0 8px' }}>
                    • <strong>طريقة التمرير:</strong> ضع منتصف ظهر هاتف الأندرويد مباشرة على الكارت.
                  </p>
                  <p style={{ margin: 0 }}>
                    • <strong>ملاحظة هامة:</strong> تأكد من تفعيل أيقونة <strong>NFC</strong> من شريط الإشعارات العلوي في الهاتف.
                  </p>
                </div>
              </div>
            </div>

            {/* General tips */}
            <div style={{ marginTop: '18px', padding: '14px 18px', borderRadius: '12px', backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#854d0e', fontWeight: 800, fontSize: '13.5px', marginBottom: '4px' }}>
                <Sparkles size={16} /> نصيحة لتمرير مثالي:
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#713f12', lineHeight: 1.6 }}>
                يجب أن تكون شاشة الهاتف مضاءة ومفتوحة القفل (Unlocked). إذا كانت الشاشة مطفأة فلن يستجيب مستشعر الأمان في الهاتف لحماية خصوصية الزبون.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: Reviews & Sales Strategy ── */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--bdr-light, #e2e8f0)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt-heading)' }}>
              <TrendingUp size={20} color="#059669" />
              أسرار مضاعفة تقييمات جوجل ماب وزوار متجرك
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--txt-body)', margin: '0 0 16px' }}>
              كل تقييم 5 نجوم على Google Maps يرفع ترتيب متجرك أمام مئات الزبائن في منطقتك مجاناً. إليك أسهل خطة عملية لجمع التقييمات:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '14.5px', marginBottom: '8px' }}>
                  <MapPin size={18} /> 1. ضع الكارت عند الكاشير
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: 1.6 }}>
                  أفضل لحظة لطلب التقييم هي أثناء دفع الفاتورة أو تجهيز الطلب. الزبون يكون ممسكاً بموبايله ومستعداً للتفاعل.
                </p>
              </div>

              <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '14.5px', marginBottom: '8px' }}>
                  <MessageCircle size={18} /> 2. الجملة السحرية لطلب التقييم
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: 1.6 }}>
                  قل للزبون بلطف: <em>"يا فندم رأيك بيفرق معانا جداً، ثانية بموبايلك على الكارت ده تدعمنا بتقييم لطيف لو الخدمة عجبتك"</em>.
                </p>
              </div>

              <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '14.5px', marginBottom: '8px' }}>
                  <ThumbsUp size={18} /> 3. اربط التقييم بمكافأة لطيفة
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: 1.6 }}>
                  قدم حافزاً بسيطاً مثل: <em>"لو قيمتنا على جوجل هتاخد خصم 5% على زيارتك القادمة أو استيكر هدية"</em>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: Analytics Guide ── */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ backgroundColor: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '16px', border: '1px solid var(--bdr-light, #e2e8f0)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt-heading)' }}>
              <BarChart2 size={20} color="#2563eb" />
              كيف تقرأ وتفهم إحصائيات متجرك؟
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--txt-body)', margin: '0 0 18px' }}>
              توفر لك المنصة تحليلات حية ودقيقة لكل شخص مرر هاتفه على بطاقتك الذكية. إليك ما تعنيه كل خانة:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    إجمالي الزيارات والمسحات (Total Taps)
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                    العدد الكلي للمرات التي قرب فيها العملاء هواتفهم من الكارت أو مسحوا كود الـ QR.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '999px' }}>
                  عداد رئيسي
                </span>
              </div>

              <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    أنواع هواتف وأجهزة الزبائن (Device Breakdown)
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                    يوضح لك نسبة استخدام هواتف الآيفون (iOS) مقابل هواتف الأندرويد لزبائن متجرك.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '999px' }}>
                  نوع الأجهزة
                </span>
              </div>

              <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    أوقات الذروة والتفاعل (Peak Hours)
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                    يساعدك في معرفة الساعات الأكثر ازدحاماً بالزبائن لتكثيف فريق العمل والعروض في هذا الوقت.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '999px' }}>
                  توقيت النشاط
                </span>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--bdr-light)' }}>
              <Link
                to="/merchant/analytics"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  textDecoration: 'none',
                }}
              >
                <BarChart2 size={16} /> فتح إحصائيات متجرك الآن
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: FAQ ── */}
      {activeTab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* FAQ Search */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="ابحث في الأسئلة الشائعة (مثال: نفاذ الاشتراك، آيفون، تعديل الروابط)..."
              style={{
                width: '100%',
                padding: '12px 42px 12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--bdr-light, #e2e8f0)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                fontSize: '14px',
                color: 'var(--txt-heading, #0f172a)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* FAQ List Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredFaqs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                لم يتم العثور على نتائج تطابق بحثك.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-card, #ffffff)',
                      borderRadius: '12px',
                      border: '1px solid var(--bdr-light, #e2e8f0)',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: '14.5px',
                        color: isExpanded ? '#2563eb' : 'var(--txt-heading, #0f172a)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                          {faq.category}
                        </span>
                        <span>{faq.question}</span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} color="#2563eb" /> : <ChevronDown size={18} color="#94a3b8" />}
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          padding: '0 20px 18px',
                          fontSize: '13.5px',
                          lineHeight: 1.8,
                          color: 'var(--txt-body, #475569)',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '12px',
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Need Support Card ── */}
      <div
        style={{
          marginTop: '10px',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              هل تحتاج لمساعدة إضافية أو طلب بطاقات جديدة؟
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              فريق الدعم الفني وإدارة النظام متاح لمساعدتك في أي وقت وتجديد اشتراك متجرك.
            </p>
          </div>
        </div>

        <Link
          to="/merchant/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <Store size={15} /> إعدادات حساب المتجر
        </Link>
      </div>

    </div>
  );
};
