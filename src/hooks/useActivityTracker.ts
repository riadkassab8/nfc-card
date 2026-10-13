/* ==========================================================================
   USE ACTIVITY TRACKER (src/hooks/useActivityTracker.ts)
   Automatically monitors pages visited, durations spent, and user actions.
   Tracks time spent on every page accurately.
   ========================================================================== */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userLogsApi } from '../services';

const SESSION_KEY = 'k2rty_user_session_id';

const getSessionId = (): string => {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return 'sess_fallback_' + Date.now();
  }
};

export const getPageTitleArabic = (pathname: string): string => {
  if (pathname === '/admin' || pathname === '/admin/') return 'نظرة عامة';
  if (pathname.startsWith('/admin/customers')) return 'العملاء (CRM)';
  if (pathname.startsWith('/admin/cards')) return 'إدارة البطاقات';
  if (pathname.startsWith('/admin/notifications')) return 'مركز الإشعارات';
  if (pathname.startsWith('/admin/analytics')) return 'الإحصائيات والتحليلات';
  if (pathname.startsWith('/admin/categories')) return 'إدارة التصنيفات';
  if (pathname.startsWith('/admin/scan')) return 'فحص وتجهيز البطاقات';
  if (pathname.startsWith('/admin/users')) return 'المستخدمين والصلاحيات';
  if (pathname.startsWith('/admin/user-logs')) return 'سجل المستخدمين';
  if (pathname.startsWith('/admin/profile')) return 'الملف الشخصي';
  if (pathname.startsWith('/admin/settings')) return 'إعدادات المنصة';

  if (pathname === '/merchant' || pathname === '/merchant/') return 'الرئيسية للمتجر';
  if (pathname.startsWith('/merchant/cards')) return 'بطاقات المتجر';
  if (pathname.startsWith('/merchant/analytics')) return 'إحصائيات وزوار المحل';
  if (pathname.startsWith('/merchant/profile')) return 'إعدادات المتجر';
  if (pathname.startsWith('/merchant/guide')) return 'دليل المستخدم للمتجر';

  return pathname;
};

export const trackUserAction = (
  actionName: string,
  actionType: string = 'create',
  details?: Record<string, any>,
) => {
  try {
    const pathname = window.location.pathname;
    const pageTitle = getPageTitleArabic(pathname);
    const sessionId = getSessionId();

    userLogsApi
      .trackActivity({
        action_name: actionName,
        action_type: actionType,
        page_url: pathname,
        page_title: pageTitle,
        session_id: sessionId,
        details,
      })
      .catch(() => {});
  } catch {
    // Ignore tracking errors
  }
};

export const useActivityTracker = () => {
  const location = useLocation();
  const { isAuthenticated, admin } = useAuth();
  const currentLogIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Only track authenticated users inside admin or merchant portals
    if (!isAuthenticated || !admin) return;
    const pathname = location.pathname;
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/merchant')) return;

    const pageTitle = getPageTitleArabic(pathname);
    const sessionId = getSessionId();
    startTimeRef.current = Date.now();
    currentLogIdRef.current = null;

    // 1. Initial page view logging
    userLogsApi
      .trackActivity({
        action_type: 'page_view',
        action_name: `زيارة صفحة ${pageTitle}`,
        page_url: pathname,
        page_title: pageTitle,
        duration_seconds: 0,
        session_id: sessionId,
      })
      .then((res) => {
        if (res && res.log_id) {
          currentLogIdRef.current = res.log_id;
        }
      })
      .catch(() => {});

    // 2. Periodic heartbeat to update duration (every 25 seconds)
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      userLogsApi
        .trackActivity({
          log_id: currentLogIdRef.current || undefined,
          action_type: 'page_stay',
          page_url: pathname,
          page_title: pageTitle,
          duration_seconds: elapsed,
          session_id: sessionId,
        })
        .catch(() => {});
    }, 25000);

    // 3. Cleanup on route change or unmount
    return () => {
      clearInterval(interval);
      const finalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (finalDuration > 0) {
        userLogsApi
          .trackActivity({
            log_id: currentLogIdRef.current || undefined,
            action_type: 'page_stay',
            page_url: pathname,
            page_title: pageTitle,
            duration_seconds: finalDuration,
            session_id: sessionId,
          })
          .catch(() => {});
      }
    };
  }, [location.pathname, isAuthenticated, admin]);
};
