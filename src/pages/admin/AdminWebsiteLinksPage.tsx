import React, { useState, useEffect } from 'react';
import {
  Link2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Power,
} from 'lucide-react';
import { websiteApi } from '../../services';
import { WebsiteLink } from '../../services/api/websiteApi';

export const AdminWebsiteLinksPage: React.FC = () => {
  const [links, setLinks] = useState<WebsiteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<WebsiteLink | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<WebsiteLink>>({
    title: '',
    url: '',
    location: 'both',
    target: '_self',
    isActive: true,
    order: 0,
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await websiteApi.getLinks();
      setLinks(data);
    } catch (err: any) {
      showToast('تعذر تحميل الروابط: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const openCreateModal = () => {
    setEditingLink(null);
    setFormData({
      title: '',
      url: 'index.html',
      location: 'both',
      target: '_self',
      isActive: true,
      order: links.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (link: WebsiteLink) => {
    setEditingLink(link);
    setFormData({ ...link });
    setModalOpen(true);
  };

  const handleToggle = async (link: WebsiteLink) => {
    if (!link._id) return;
    try {
      setTogglingId(link._id);
      await websiteApi.toggleLink(link._id);
      showToast(`تم ${link.isActive ? 'تعطيل' : 'تفعيل'} الرابط بنجاح`, 'success');
      loadLinks();
    } catch (err: any) {
      showToast('تعذر تغيير حالة الرابط: ' + err.message, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (link: WebsiteLink) => {
    if (!link._id) return;
    if (!window.confirm(`هل أنت متأكد من حذف الرابط "${link.title}" نهائياً؟`)) {
      return;
    }
    try {
      await websiteApi.deleteLink(link._id);
      showToast('تم حذف الرابط بنجاح', 'success');
      loadLinks();
    } catch (err: any) {
      showToast('تعذر حذف الرابط: ' + err.message, 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      showToast('يرجى ملء عنوان ورابط الصفحة', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingLink && editingLink._id) {
        await websiteApi.updateLink(editingLink._id, formData);
        showToast('تم تحديث الرابط بنجاح', 'success');
      } else {
        await websiteApi.createLink(formData);
        showToast('تم إضافة الرابط الجديد بنجاح', 'success');
      }
      setModalOpen(false);
      loadLinks();
    } catch (err: any) {
      showToast('حدث خطأ أثناء الحفظ: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const locationBadges = {
    header: { label: 'القائمة العلوية (Navbar)', bg: '#e0f2fe', color: '#0369a1' },
    footer: { label: 'تذييل الموقع (Footer)', bg: '#fef3c7', color: '#b45309' },
    both: { label: 'القائمة والفوتر معاً', bg: '#dcfce7', color: '#15803d' },
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

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px -10px rgba(4, 120, 87, 0.4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link2 size={28} style={{ color: '#a7f3d0' }} />
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              إدارة روابط وقوائم الموقع الديناميكية
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.92rem', opacity: 0.9, color: '#d1fae5' }}>
            أضف أي رابط أو احذفه أو فعّله/عطّله بضغطة زر ليظهر فورياً في شريط التنقل أو الفوتر في الموقع.
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
            background: '#34d399',
            color: '#064e3b',
            fontSize: '0.92rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(52, 211, 153, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          <Plus size={18} />
          إضافة رابط جديد
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>إجمالي الروابط</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{links.length}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>الروابط المفعلة</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
            {links.filter((l) => l.isActive).length}
          </div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1' }}>القائمة العلوية</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0369a1', marginTop: '4px' }}>
            {links.filter((l) => l.location === 'header' || l.location === 'both').length}
          </div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>الفوتر</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
            {links.filter((l) => l.location === 'footer' || l.location === 'both').length}
          </div>
        </div>
      </div>

      {/* Links List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
          <Loader2 size={32} className="spin" style={{ color: '#047857' }} />
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>جاري تحميل الروابط...</span>
        </div>
      ) : links.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Link2 size={48} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: 0 }}>لا توجد روابط مسجلة</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>قم بإضافة أول رابط للقائمة أو الفوتر الآن.</p>
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '14px 20px' }}>عنوان الرابط</th>
                  <th style={{ padding: '14px 20px' }}>الوجهة (URL)</th>
                  <th style={{ padding: '14px 20px' }}>مكان الظهور</th>
                  <th style={{ padding: '14px 20px' }}>النافذة</th>
                  <th style={{ padding: '14px 20px' }}>الحالة</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => {
                  const loc = locationBadges[link.location] || locationBadges.both;
                  return (
                    <tr key={link._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a' }}>
                        {link.title}
                      </td>

                      <td style={{ padding: '14px 20px', color: '#475569', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right' }}>
                        {link.url}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: loc.bg,
                            color: loc.color,
                          }}
                        >
                          {loc.label}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: '#64748b' }}>
                        {link.target === '_blank' ? 'نافذة جديدة ↗' : 'نفس الصفحة'}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggle(link)}
                          disabled={togglingId === link._id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: link.isActive ? '#dcfce7' : '#fee2e2',
                            color: link.isActive ? '#15803d' : '#b91c1c',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Power size={13} />
                          {link.isActive ? 'مفعل وشغال' : 'معطل ومخفي'}
                        </button>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(link)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                            title="تعديل الرابط"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(link)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid #fee2e2',
                              background: '#fef2f2',
                              color: '#ef4444',
                              cursor: 'pointer',
                            }}
                            title="حذف الرابط"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
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
              maxWidth: '520px',
              width: '100%',
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
                {editingLink ? 'تعديل الرابط' : 'إضافة رابط جديد للموقع'}
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
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  عنوان الرابط (النص الظاهر)
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: الرئيسية، عن K2rty، واتساب..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  الرابط أو المسار (URL or Path)
                </label>
                <input
                  type="text"
                  required
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="مثال: index.html أو product.html أو https://wa.me/..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', direction: 'ltr', textAlign: 'right' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    مكان ظهور الرابط
                  </label>
                  <select
                    value={formData.location || 'both'}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="both">القائمة والفوتر معاً</option>
                    <option value="header">القائمة العلوية فقط</option>
                    <option value="footer">الفوتر فقط</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    طريقة الفتح
                  </label>
                  <select
                    value={formData.target || '_self'}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="_self">في نفس الصفحة (_self)</option>
                    <option value="_blank">في نافذة جديدة (_blank)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="linkActiveCheck"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#047857' }}
                />
                <label htmlFor="linkActiveCheck" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  الرابط مفعل ويظهر للزوار في الموقع
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
                  style={{ padding: '9px 24px', borderRadius: '10px', border: 'none', background: '#047857', color: '#ffffff', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الرابط'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
