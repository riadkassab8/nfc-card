import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Briefcase,
  Store,
  Eye,
  EyeOff,
  Check,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersApi, cardsApi } from '../../services';
import {
  ApiAdmin,
  UserRole,
  UserStatus,
  SubscriptionType,
  UserStatsSummary,
  CreateUserPayload,
  UpdateUserPayload,
  ApiCard,
  fmtDate,
} from '../../types';

/* ── Available System Permissions Definition ── */
const AVAILABLE_PAGES = [
  { id: 'overview', label: 'نظرة عامة (الرئيسية)', description: 'رؤية ملخص الإحصائيات العامة' },
  { id: 'cards', label: 'إدارة البطاقات', description: 'عرض والتحكم بالبطاقات الذكية' },
  { id: 'customers', label: 'العملاء (CRM)', description: 'إدارة العملاء وبياناتهم' },
  { id: 'notifications', label: 'الإشعارات', description: 'مركز التنبيهات والإشعارات' },
  { id: 'analytics', label: 'الإحصائيات المتقدمة', description: 'الرسوم البيانية وسجلات المسح' },
  { id: 'categories', label: 'التصنيفات', description: 'إدارة تصنيفات البطاقات' },
  { id: 'scan', label: 'فحص وتجهيز', description: 'فحص البطاقات الفيزيائية السريع' },
];

const AVAILABLE_ACTIONS = [
  { id: 'cards:view', label: 'عرض البطاقات', group: 'البطاقات' },
  { id: 'cards:create', label: 'إضافة بطاقات جديدة', group: 'البطاقات' },
  { id: 'cards:edit', label: 'تعديل بيانات وروابط البطاقات', group: 'البطاقات' },
  { id: 'cards:delete', label: 'حذف البطاقات ونقلها للمهملات', group: 'البطاقات' },
  { id: 'customers:view', label: 'عرض العملاء', group: 'العملاء' },
  { id: 'customers:create', label: 'إضافة عملاء', group: 'العملاء' },
  { id: 'customers:edit', label: 'تعديل العملاء', group: 'العملاء' },
  { id: 'customers:delete', label: 'حذف العملاء', group: 'العملاء' },
  { id: 'categories:manage', label: 'إدارة وتعديل التصنيفات', group: 'التصنيفات' },
  { id: 'analytics:view', label: 'عرض سجلات وإحصائيات المسح', group: 'الإحصائيات' },
  { id: 'export', label: 'تصدير ملفات إكسل وتقارير', group: 'عام' },
];

export const AdminUsersPage: React.FC = () => {
  const { admin: currentAdmin } = useAuth();

  const [users, setUsers] = useState<ApiAdmin[]>([]);
  const [stats, setStats] = useState<UserStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableCards, setAvailableCards] = useState<ApiCard[]>([]);

  // Filter & Search state
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Toast feedback
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiAdmin | null>(null);
  const [deletingUser, setDeletingUser] = useState<ApiAdmin | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields State
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStoreName, setFormStoreName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('staff');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formPages, setFormPages] = useState<string[]>(['overview', 'cards']);
  const [formActions, setFormActions] = useState<string[]>(['cards:view', 'cards:edit']);
  const [formAssignedCards, setFormAssignedCards] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formSubType, setFormSubType] = useState<SubscriptionType>('yearly');
  const [formSubStartDate, setFormSubStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formSubEndDate, setFormSubEndDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Users & Stats
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        usersApi.getUsers({
          search,
          role: selectedRole,
          status: selectedStatus,
          page,
          limit: 15,
        }),
        usersApi.getUserStats(),
      ]);

      setUsers(usersRes.users || []);
      setTotalPages(usersRes.totalPages || 1);
      setTotalCount(usersRes.total || 0);
      setStats(statsRes);
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحميل بيانات المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedRole, selectedStatus, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load cards list once for the merchant cards selector
  useEffect(() => {
    cardsApi
      .getCards({ limit: 100 })
      .then((res) => {
        setAvailableCards(res.data || []);
      })
      .catch(() => {});
  }, []);

  // Open Form Modal (Add or Edit)
  const openCreateModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormPassword('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormStoreName('');
    setFormRole('staff');
    setFormStatus('active');
    setFormPages(['overview', 'cards']);
    setFormActions(['cards:view', 'cards:edit', 'cards:create']);
    setFormAssignedCards([]);
    setShowPassword(false);
    setFormSubType('yearly');
    const today = new Date().toISOString().slice(0, 10);
    setFormSubStartDate(today);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormSubEndDate(nextYear.toISOString().slice(0, 10));
    setIsFormOpen(true);
  };

  const openEditModal = (user: ApiAdmin) => {
    setEditingUser(user);
    setFormUsername(user.username || '');
    setFormPassword(''); // leave blank if unchanged
    setFormName(user.name || '');
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormStoreName(user.store_name || '');
    setFormRole(user.role || 'staff');
    setFormStatus(user.status || 'active');
    setFormPages(user.permissions?.pages || []);
    setFormActions(user.permissions?.actions || []);
    setFormAssignedCards(user.assigned_cards || []);
    setShowPassword(false);

    // Subscription
    const subType = user.subscription_type || (!user.requires_subscription ? 'permanent' : 'yearly');
    setFormSubType(subType);
    setFormSubStartDate(
      user.subscription_start_date
        ? new Date(user.subscription_start_date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setFormSubEndDate(
      user.subscription_end_date
        ? new Date(user.subscription_end_date).toISOString().slice(0, 10)
        : ''
    );
    setIsFormOpen(true);
  };

  const handleSubTypeChange = (type: SubscriptionType) => {
    setFormSubType(type);
    if (type === 'yearly') {
      const start = formSubStartDate ? new Date(formSubStartDate) : new Date();
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      setFormSubEndDate(end.toISOString().slice(0, 10));
    } else if (type === 'permanent') {
      setFormSubEndDate('');
    }
  };

  const handleStartDateChange = (val: string) => {
    setFormSubStartDate(val);
    if (formSubType === 'yearly' && val) {
      const start = new Date(val);
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      setFormSubEndDate(end.toISOString().slice(0, 10));
    }
  };

  // Preset permissions by role helper
  const handleRoleChange = (newRole: UserRole) => {
    setFormRole(newRole);
    if (newRole === 'super_admin') {
      setFormPages(AVAILABLE_PAGES.map((p) => p.id));
      setFormActions(['*']);
    } else if (newRole === 'merchant') {
      setFormPages(['cards', 'overview']);
      setFormActions(['cards:view', 'cards:edit']);
    } else {
      setFormPages(['overview', 'cards', 'customers']);
      setFormActions(['cards:view', 'cards:create', 'cards:edit', 'customers:view']);
    }
  };

  // Toggle page selection
  const togglePage = (pageId: string) => {
    setFormPages((prev) =>
      prev.includes(pageId) ? prev.filter((p) => p !== pageId) : [...prev, pageId]
    );
  };

  // Toggle action selection
  const toggleAction = (actionId: string) => {
    setFormActions((prev) =>
      prev.includes(actionId) ? prev.filter((a) => a !== actionId) : [...prev, actionId]
    );
  };

  // Toggle assigned card for merchant
  const toggleAssignedCard = (cardId: string) => {
    setFormAssignedCards((prev) =>
      prev.includes(cardId) ? prev.filter((c) => c !== cardId) : [...prev, cardId]
    );
  };

  // Submit Add / Edit Form
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) {
      showToast('اسم المستخدم مطلوب', 'error');
      return;
    }

    if (!editingUser && (!formPassword || formPassword.length < 6)) {
      showToast('كلمة المرور يجب ألا تقل عن 6 أحرف', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const subPayload = {
        subscription_type: formSubType,
        requires_subscription: formSubType !== 'permanent',
        subscription_start_date: formSubStartDate ? new Date(formSubStartDate).toISOString() : null,
        subscription_end_date: formSubType === 'permanent' ? null : (formSubEndDate ? new Date(formSubEndDate).toISOString() : null),
      };

      if (editingUser) {
        // Update user
        const updatePayload: UpdateUserPayload = {
          username: formUsername.trim(),
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          store_name: formRole === 'merchant' ? formStoreName.trim() : undefined,
          role: formRole,
          status: formStatus,
          permissions: {
            pages: formPages,
            actions: formRole === 'super_admin' ? ['*'] : formActions,
          },
          assigned_cards: formRole === 'merchant' ? formAssignedCards : [],
          ...subPayload,
        };
        if (formPassword.trim()) {
          updatePayload.password = formPassword.trim();
        }

        await usersApi.updateUser(String(editingUser._id || editingUser.id), updatePayload);
        showToast('تم تحديث بيانات وصلاحيات المستخدم بنجاح!', 'success');
      } else {
        // Create user
        const createPayload: CreateUserPayload = {
          username: formUsername.trim(),
          password: formPassword.trim(),
          name: formName.trim() || formUsername.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          store_name: formRole === 'merchant' ? formStoreName.trim() : undefined,
          role: formRole,
          status: formStatus,
          permissions: {
            pages: formPages,
            actions: formRole === 'super_admin' ? ['*'] : formActions,
          },
          assigned_cards: formRole === 'merchant' ? formAssignedCards : [],
          ...subPayload,
        };

        await usersApi.createUser(createPayload);
        showToast('تم إنشاء المستخدم الجديد بنجاح!', 'success');
      }

      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'حدث خطأ أثناء حفظ المستخدم', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user: ApiAdmin) => {
    const userId = String(user._id || user.id);
    if (userId === String(currentAdmin?._id || currentAdmin?.id)) {
      showToast('لا يمكنك تجميد حسابك الشخصي النشط', 'error');
      return;
    }

    const nextStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await usersApi.toggleUserStatus(userId, nextStatus);
      showToast(
        nextStatus === 'active' ? 'تم تفعيل الحساب بنجاح' : 'تم تجميد الحساب بنجاح',
        'info'
      );
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'تعذر تغيير حالة الحساب', 'error');
    }
  };

  // Confirm delete user
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    const userId = String(deletingUser._id || deletingUser.id);
    setIsDeleting(true);
    try {
      await usersApi.deleteUser(userId);
      showToast('تم حذف المستخدم نهائياً من النظام', 'success');
      setDeletingUser(null);
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'تعذر حذف المستخدم', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render role badge helper
  const renderRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: '#f5f3ff',
              color: '#6d28d9',
              border: '1px solid #ddd6fe',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldCheck size={13} color="#7c3aed" />
            مدير رئيسي
          </span>
        );
      case 'merchant':
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Store size={13} color="#059669" />
            صاحب محل
          </span>
        );
      case 'staff':
      default:
        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Briefcase size={13} color="#2563eb" />
            موظف
          </span>
        );
    }
  };

  // Render subscription badge helper
  const renderSubscriptionBadge = (user: ApiAdmin) => {
    if (user.role === 'super_admin') {
      return (
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '999px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          مدير دائم ✓
        </span>
      );
    }

    if (!user.requires_subscription || user.subscription_type === 'permanent') {
      return (
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '999px',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
            fontSize: '0.74rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          اشتراك دائم ✓
        </span>
      );
    }

    if (user.subscription_end_date) {
      const isExpired = new Date() > new Date(user.subscription_end_date);
      const remainingDays = Math.ceil(
        (new Date(user.subscription_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (isExpired) {
        return (
          <div>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '999px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ⚠️ منتهي الصلاحية
            </span>
            <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '2px', fontWeight: 600 }}>
              انتهى في {fmtDate(user.subscription_end_date)}
            </div>
          </div>
        );
      }

      return (
        <div>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '999px',
              backgroundColor: remainingDays <= 15 ? '#fefce8' : '#eff6ff',
              color: remainingDays <= 15 ? '#ca8a04' : '#1d4ed8',
              border: `1px solid ${remainingDays <= 15 ? '#fef08a' : '#bfdbfe'}`,
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Clock size={11} />
            متبقي {remainingDays} يوم
          </span>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            حتى {fmtDate(user.subscription_end_date)}
          </div>
        </div>
      );
    }

    return (
      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
        غير محدد
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Tajawal', sans-serif" }}>
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#ffffff',
            color: '#0f172a',
            padding: '12px 22px',
            borderRadius: '16px',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            borderRight:
              toast.type === 'success'
                ? '4px solid #10b981'
                : toast.type === 'error'
                ? '4px solid #ef4444'
                : '4px solid #3b82f6',
            direction: 'rtl',
            animation: 'toastPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
          {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
          {toast.type === 'info' && <RefreshCw size={18} color="#3b82f6" />}
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{toast.msg}</span>
        </div>
      )}

      {/* ── Top Header Banner ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 18px rgba(79, 70, 229, 0.28)',
            }}
          >
            <Users size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              إدارة المستخدمين والصلاحيات
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
              تحكّم كامل في فريق العمل وأصحاب المحلات، وحدد ما يظهر وما يخفى وما يمكن لكل شخص فعله.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '11px 18px',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={18} />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>
      </div>

      {/* ── Summary Statistics Cards ── */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Total Users */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '20px 22px',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>إجمالي المستخدمين</span>
              <h3 style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                {stats.total}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={22} />
            </div>
          </div>

          {/* Card 2: Super Admins */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '20px 22px',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>المديرون الرئيسيون</span>
              <h3 style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#6d28d9' }}>
                {stats.superAdmins}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
          </div>

          {/* Card 3: Staff */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '20px 22px',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>فريق العمل والموظفين</span>
              <h3 style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#1e40af' }}>
                {stats.staff}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={22} />
            </div>
          </div>

          {/* Card 4: Merchants */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '20px 22px',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>أصحاب المحلات</span>
              <h3 style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#047857' }}>
                {stats.merchants}
              </h3>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={22} />
            </div>
          </div>
        </div>
      )}

      {/* ── Filters & Search Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="بحث بالاسم، اسم المستخدم، البريد، الهاتف..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                paddingRight: '40px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                fontFamily: "'Tajawal', sans-serif",
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>الدور:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                fontFamily: "'Tajawal', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="all">جميع الأدوار</option>
              <option value="super_admin">مدير رئيسي (Super Admin)</option>
              <option value="staff">موظف (Staff)</option>
              <option value="merchant">صاحب محل (Merchant)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>الحالة:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                fontFamily: "'Tajawal', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط فقط</option>
              <option value="suspended">مجمد فقط</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                  المستخدم
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                  نوع الحساب
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                  بيانات التواصل
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                  المحل / البطاقات
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                  فترة الاشتراك
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                  الحالة
                </th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                  تاريخ الإنشاء
                </th>
                <th
                  style={{
                    padding: '16px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#475569',
                    textAlign: 'center',
                  }}
                >
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', color: '#4f46e5' }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>جاري جلب قائمة المستخدمين...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Users size={40} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#64748b' }}>
                      لا يوجد مستخدمين مطابقين للبحث أو الفلتر
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrent = String(user._id || user.id) === String(currentAdmin?._id || currentAdmin?.id);
                  const isSuspended = user.status === 'suspended';

                  return (
                    <tr
                      key={user._id || user.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                        backgroundColor: isSuspended ? '#fafafa' : '#ffffff',
                        opacity: isSuspended ? 0.75 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isSuspended ? '#f4f4f5' : '#f8fbff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSuspended ? '#fafafa' : '#ffffff';
                      }}
                    >
                      {/* User Info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '12px',
                              backgroundColor: '#e0e7ff',
                              color: '#4338ca',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem',
                              flexShrink: 0,
                            }}
                          >
                            {(user.name || user.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                                {user.name || user.username}
                              </span>
                              {isCurrent && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    backgroundColor: '#eef2ff',
                                    color: '#4f46e5',
                                    fontWeight: 700,
                                  }}
                                >
                                  أنت
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', direction: 'ltr', display: 'inline-block' }}>
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '16px 20px' }}>{renderRoleBadge(user.role)}</td>

                      {/* Contact Info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {user.phone ? (
                            <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, direction: 'ltr', display: 'inline-block' }}>
                              {user.phone}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>بدون هاتف</span>
                          )}
                          {user.email ? (
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{user.email}</span>
                          ) : null}
                        </div>
                      </td>

                      {/* Store / Assigned Cards */}
                      <td style={{ padding: '16px 20px' }}>
                        {user.role === 'merchant' ? (
                          <div>
                            <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.88rem' }}>
                              {user.store_name || 'بدون اسم محل'}
                            </span>
                            <div style={{ marginTop: '2px' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#ecfdf5',
                                  color: '#047857',
                                  fontWeight: 700,
                                }}
                              >
                                {user.assigned_cards?.length || 0} بطاقة معينة
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {user.role === 'super_admin' ? 'كافة البطاقات' : 'حسب الصلاحيات'}
                          </span>
                        )}
                      </td>

                      {/* Subscription Period */}
                      <td style={{ padding: '16px 20px' }}>
                        {renderSubscriptionBadge(user)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isCurrent}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '999px',
                            border: user.status === 'active' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                            backgroundColor: user.status === 'active' ? '#f0fdf4' : '#fef2f2',
                            color: user.status === 'active' ? '#15803d' : '#b91c1c',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: isCurrent ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                          title={isCurrent ? 'لا يمكنك تجميد حسابك' : 'انقر لتغيير الحالة'}
                        >
                          {user.status === 'active' ? <UserCheck size={13} /> : <UserX size={13} />}
                          <span>{user.status === 'active' ? 'نشط' : 'مجمد'}</span>
                        </button>
                      </td>

                      {/* Created At */}
                      <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#64748b' }}>
                        {user.createdAt ? fmtDate(user.createdAt) : '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            title="تعديل المستخدم والصلاحيات"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#4f46e5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#eef2ff';
                              e.currentTarget.style.borderColor = '#c7d2fe';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(user)}
                            disabled={isCurrent}
                            title={isCurrent ? 'لا يمكنك حذف حسابك الشخصي' : 'حذف المستخدم'}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid #fee2e2',
                              backgroundColor: '#ffffff',
                              color: isCurrent ? '#cbd5e1' : '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isCurrent ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrent) {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#fca5a5';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrent) {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#fee2e2';
                              }
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              عرض الصفحة {page} من {totalPages} (إجمالي {totalCount} مستخدم)
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: page <= 1 ? '#f1f5f9' : '#ffffff',
                  color: page <= 1 ? '#94a3b8' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                السابق
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: page >= totalPages ? '#f1f5f9' : '#ffffff',
                  color: page >= totalPages ? '#94a3b8' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit User Modal ── */}
      {isFormOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '16px',
            }}
            onClick={() => setIsFormOpen(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
                fontFamily: "'Tajawal', sans-serif",
                direction: 'rtl',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '20px 28px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <UserPlus size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {editingUser ? 'تعديل المستخدم والصلاحيات' : 'إضافة مستخدم جديد'}
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                      حدّد نوع الحساب، الصفحات المسموحة، والإجراءات المتاحة لهذا المستخدم.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSaveUser} style={{ overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* 1. Basic Information */}
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    1. البيانات الأساسية
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                        اسم المستخدم (للدخول) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                        placeholder="مثال: ahmed_crm"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          fontFamily: "'Tajawal', sans-serif",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                        الاسم الكامل المعروض
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="مثال: أحمد محمد"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          fontFamily: "'Tajawal', sans-serif",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                        {editingUser ? 'كلمة المرور (اتركها فارغة إذا لم تتغير)' : 'كلمة المرور *'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={!editingUser}
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder={editingUser ? '••••••••' : '6 أحرف على الأقل'}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            paddingLeft: '38px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontFamily: "'Tajawal', sans-serif",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                          }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                        رقم الهاتف
                      </label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="مثال: 01012345678"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          fontFamily: "'Tajawal', sans-serif",
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                        البريد الإلكتروني (اختياري)
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="name@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          fontFamily: "'Tajawal', sans-serif",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. User Role Selector */}
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    2. نوع الحساب والدور
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {/* Super Admin */}
                    <div
                      onClick={() => handleRoleChange('super_admin')}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        border: formRole === 'super_admin' ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                        backgroundColor: formRole === 'super_admin' ? '#f5f3ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <ShieldCheck size={18} color={formRole === 'super_admin' ? '#7c3aed' : '#64748b'} />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: formRole === 'super_admin' ? '#6d28d9' : '#1e293b' }}>
                          مدير رئيسي
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                        تحكم كامل وغير مقيد بكافة صفحات وإعدادات المنظومة.
                      </p>
                    </div>

                    {/* Staff */}
                    <div
                      onClick={() => handleRoleChange('staff')}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        border: formRole === 'staff' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                        backgroundColor: formRole === 'staff' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Briefcase size={18} color={formRole === 'staff' ? '#2563eb' : '#64748b'} />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: formRole === 'staff' ? '#1e40af' : '#1e293b' }}>
                          موظف / فريق عمل
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                        صلاحيات مخصصة لصفحات وإجراءات محددة باللوحة.
                      </p>
                    </div>

                    {/* Merchant */}
                    <div
                      onClick={() => handleRoleChange('merchant')}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        border: formRole === 'merchant' ? '2px solid #059669' : '1.5px solid #e2e8f0',
                        backgroundColor: formRole === 'merchant' ? '#ecfdf5' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Store size={18} color={formRole === 'merchant' ? '#059669' : '#64748b'} />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: formRole === 'merchant' ? '#065f46' : '#1e293b' }}>
                          صاحب محل
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                        يدخل لإدارة وتعديل بطاقاته الخاصة ومتابعة زبائنه فقط.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Merchant Details (Only if role === 'merchant') */}
                {formRole === 'merchant' && (
                  <div
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800, color: '#065f46' }}>
                      3. إعدادات صاحب المحل والبطاقات التابعة
                    </h4>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                        اسم المحل أو النشاط التجاري *
                      </label>
                      <input
                        type="text"
                        value={formStoreName}
                        onChange={(e) => setFormStoreName(e.target.value)}
                        placeholder="مثال: مطعم البرنس / كافيه لافندر"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #86efac',
                          fontSize: '0.88rem',
                          fontFamily: "'Tajawal', sans-serif",
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                        اختر البطاقات المخصصة لهذا المحل ({formAssignedCards.length} محددة):
                      </label>
                      <div
                        style={{
                          maxHeight: '160px',
                          overflowY: 'auto',
                          backgroundColor: '#ffffff',
                          borderRadius: '10px',
                          border: '1px solid #86efac',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        {availableCards.length === 0 ? (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '10px', textAlign: 'center' }}>
                            لا توجد بطاقات مسجلة حالياً
                          </span>
                        ) : (
                          availableCards.map((c) => {
                            const cardId = String(c._id || '');
                            const isSelected = formAssignedCards.includes(cardId);
                            return (
                              <div
                                key={cardId}
                                onClick={() => toggleAssignedCard(cardId)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: isSelected ? '#dcfce7' : '#f8fafc',
                                  border: isSelected ? '1px solid #86efac' : '1px solid #f1f5f9',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <CreditCard size={15} color={isSelected ? '#15803d' : '#64748b'} />
                                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                                    {c.card_code}
                                  </span>
                                  {c.customer_id && typeof c.customer_id === 'object' && (
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                      ({(c.customer_id as any).name})
                                    </span>
                                  )}
                                </div>
                                <span
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '5px',
                                    border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                                    backgroundColor: isSelected ? '#16a34a' : '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                  }}
                                >
                                  {isSelected && <Check size={12} />}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Subscription Type & Period */}
                {formRole !== 'super_admin' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        4. مدة ونوع الاشتراك في السيستم
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        (يتم إيقاف دخول الحساب تلقائياً فور انتهاء الاشتراك)
                      </span>
                    </div>

                    {/* Subscription Type Selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                      {/* Permanent */}
                      <div
                        onClick={() => handleSubTypeChange('permanent')}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: formSubType === 'permanent' ? '2px solid #10b981' : '1.5px solid #e2e8f0',
                          backgroundColor: formSubType === 'permanent' ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: formSubType === 'permanent' ? '#065f46' : '#1e293b' }}>
                            دائم (مفتوح)
                          </span>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: formSubType === 'permanent' ? 'none' : '2px solid #cbd5e1',
                              backgroundColor: formSubType === 'permanent' ? '#10b981' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                            }}
                          >
                            {formSubType === 'permanent' && <Check size={11} strokeWidth={3} />}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          صلاحية دخول دائمة مدى الحياة بدون انتهاء
                        </span>
                      </div>

                      {/* Yearly */}
                      <div
                        onClick={() => handleSubTypeChange('yearly')}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: formSubType === 'yearly' ? '2px solid #4f46e5' : '1.5px solid #e2e8f0',
                          backgroundColor: formSubType === 'yearly' ? '#eef2ff' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: formSubType === 'yearly' ? '#3730a3' : '#1e293b' }}>
                            سنوي (سنة كاملة)
                          </span>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: formSubType === 'yearly' ? 'none' : '2px solid #cbd5e1',
                              backgroundColor: formSubType === 'yearly' ? '#4f46e5' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                            }}
                          >
                            {formSubType === 'yearly' && <Check size={11} strokeWidth={3} />}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          12 شهراً تحسب تلقائياً من تاريخ البدء
                        </span>
                      </div>

                      {/* Custom */}
                      <div
                        onClick={() => handleSubTypeChange('custom')}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: formSubType === 'custom' ? '2px solid #f59e0b' : '1.5px solid #e2e8f0',
                          backgroundColor: formSubType === 'custom' ? '#fffbeb' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: formSubType === 'custom' ? '#92400e' : '#1e293b' }}>
                            تاريخ مخصص
                          </span>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: formSubType === 'custom' ? 'none' : '2px solid #cbd5e1',
                              backgroundColor: formSubType === 'custom' ? '#f59e0b' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                            }}
                          >
                            {formSubType === 'custom' && <Check size={11} strokeWidth={3} />}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          تحديد تاريخ الانتهاء يدوياً
                        </span>
                      </div>
                    </div>

                    {/* Dates inputs for yearly and custom */}
                    {formSubType !== 'permanent' && (
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '14px',
                        }}
                      >
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            <Calendar size={14} color="#64748b" />
                            تاريخ بداية الاشتراك *
                          </label>
                          <input
                            type="date"
                            required
                            value={formSubStartDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '10px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '0.85rem',
                              fontFamily: "'Tajawal', sans-serif",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            <Clock size={14} color="#64748b" />
                            تاريخ انتهاء الاشتراك *
                          </label>
                          <input
                            type="date"
                            required
                            value={formSubEndDate}
                            onChange={(e) => setFormSubEndDate(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: '10px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '0.85rem',
                              fontFamily: "'Tajawal', sans-serif",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Granular Permissions (Only for Staff or custom) */}
                {formRole !== 'super_admin' && (
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      5. مصفوفة الصلاحيات الدقيقة والصفحات المسموحة
                    </h4>

                    {/* Pages Selection */}
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        الصفحات المسموح بالدخول إليها في لوحة التحكم:
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {AVAILABLE_PAGES.map((p) => {
                          const isChecked = formPages.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => togglePage(p.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                border: isChecked ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                                backgroundColor: isChecked ? '#eef2ff' : '#ffffff',
                                cursor: 'pointer',
                              }}
                            >
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '5px',
                                  border: isChecked ? 'none' : '1.5px solid #cbd5e1',
                                  backgroundColor: isChecked ? '#4f46e5' : '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff',
                                  flexShrink: 0,
                                  marginTop: '2px',
                                }}
                              >
                                {isChecked && <Check size={12} />}
                              </div>
                              <div>
                                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isChecked ? '#3730a3' : '#1e293b', display: 'block' }}>
                                  {p.label}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.description}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions Selection */}
                    <div>
                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        الإجراءات والعمليات المسموح بها (الأكشنز):
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {AVAILABLE_ACTIONS.map((act) => {
                          const isChecked = formActions.includes(act.id);
                          return (
                            <div
                              key={act.id}
                              onClick={() => toggleAction(act.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: isChecked ? '1px solid #818cf8' : '1px solid #e2e8f0',
                                backgroundColor: isChecked ? '#eef2ff' : '#ffffff',
                                cursor: 'pointer',
                              }}
                            >
                              <div
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '4px',
                                  border: isChecked ? 'none' : '1.5px solid #cbd5e1',
                                  backgroundColor: isChecked ? '#4f46e5' : '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff',
                                  flexShrink: 0,
                                }}
                              >
                                {isChecked && <Check size={11} />}
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isChecked ? '#3730a3' : '#334155' }}>
                                {act.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    style={{
                      padding: '11px 22px',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      padding: '11px 28px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isSaving && <RefreshCw size={16} className="spin" />}
                    <span>{isSaving ? 'جاري الحفظ...' : editingUser ? 'حفظ التعديلات' : 'إنشاء المستخدم'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingUser &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '16px',
            }}
            onClick={() => setDeletingUser(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '430px',
                backgroundColor: '#ffffff',
                borderRadius: '22px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)',
                direction: 'rtl',
                fontFamily: "'Tajawal', sans-serif",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '20px 24px 16px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    حذف المستخدم نهائياً
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>إجراء أمني غير قابل للتراجع</span>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.6 }}>
                  هل أنت متأكد من رغبتك في حذف حساب المستخدم{' '}
                  <span style={{ color: '#ef4444' }}>"{deletingUser.name || deletingUser.username}"</span>؟
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  سيتم إزالة صلاحياته وحساب دخوله بالكامل من قاعدة البيانات.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  padding: '16px 24px',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  }}
                >
                  {isDeleting && <RefreshCw size={15} className="spin" />}
                  <span>تأكيد الحذف</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
