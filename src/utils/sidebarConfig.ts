/* ==========================================================================
   DYNAMIC SIDEBAR MENU CONFIG (src/utils/sidebarConfig.ts)
   Enables the admin to customize order, visibility, and labels of sidebar items.
   Supports API sync (GET / PUT / POST reset) with localStorage caching.
   ========================================================================== */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  BarChart2,
  Tags,
  Scan,
  ShieldAlert,
  History,
} from 'lucide-react';
import { authApi } from '../services/api';
import { SidebarNavItemConfig } from '../types';

export type { SidebarNavItemConfig };

export const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  BarChart2,
  Tags,
  Scan,
  ShieldAlert,
  History,
};

export const DEFAULT_SIDEBAR_ITEMS: SidebarNavItemConfig[] = [
  {
    id: 'overview',
    path: '/admin',
    label: 'نظرة عامة',
    defaultLabel: 'نظرة عامة',
    iconName: 'LayoutDashboard',
    visible: true,
    order: 0,
  },
  {
    id: 'customers',
    path: '/admin/customers',
    label: 'العملاء (CRM)',
    defaultLabel: 'العملاء (CRM)',
    iconName: 'Users',
    visible: true,
    order: 1,
  },
  {
    id: 'cards',
    path: '/admin/cards',
    label: 'إدارة البطاقات',
    defaultLabel: 'إدارة البطاقات',
    iconName: 'CreditCard',
    visible: true,
    order: 2,
  },
  {
    id: 'notifications',
    path: '/admin/notifications',
    label: 'الإشعارات',
    defaultLabel: 'الإشعارات',
    iconName: 'Bell',
    visible: true,
    order: 3,
  },
  {
    id: 'analytics',
    path: '/admin/analytics',
    label: 'الإحصائيات',
    defaultLabel: 'الإحصائيات',
    iconName: 'BarChart2',
    visible: true,
    order: 4,
  },
  {
    id: 'categories',
    path: '/admin/categories',
    label: 'التصنيفات',
    defaultLabel: 'التصنيفات',
    iconName: 'Tags',
    visible: true,
    order: 5,
  },
  {
    id: 'scan',
    path: '/admin/scan',
    label: 'فحص وتجهيز',
    defaultLabel: 'فحص وتجهيز',
    iconName: 'Scan',
    visible: true,
    order: 6,
  },
  {
    id: 'users',
    path: '/admin/users',
    label: 'المستخدمين والصلاحيات',
    defaultLabel: 'المستخدمين والصلاحيات',
    iconName: 'ShieldAlert',
    visible: true,
    order: 7,
  },
  {
    id: 'user_logs',
    path: '/admin/user-logs',
    label: 'سجل المستخدمين',
    defaultLabel: 'سجل المستخدمين',
    iconName: 'History',
    visible: true,
    order: 8,
  },
];

const STORAGE_KEY = 'k2rty_admin_sidebar_config_v1';
export const SIDEBAR_CONFIG_EVENT = 'k2rty-sidebar-config-changed';

/**
 * دمج أي عناصر مع الإعدادات الافتراضية لضمان عدم فقدان أي مسار
 */
export function normalizeSidebarItems(items: Partial<SidebarNavItemConfig>[]): SidebarNavItemConfig[] {
  if (!Array.isArray(items) || items.length === 0) {
    return DEFAULT_SIDEBAR_ITEMS;
  }

  const merged: SidebarNavItemConfig[] = [];
  const seenIds = new Set<string>();

  for (const item of items) {
    const def = DEFAULT_SIDEBAR_ITEMS.find((d) => d.id === item.id);
    if (def) {
      merged.push({
        ...def,
        label: item.label || def.defaultLabel,
        visible: item.visible ?? true,
        order: typeof item.order === 'number' ? item.order : def.order,
      });
      seenIds.add(def.id);
    }
  }

  for (const def of DEFAULT_SIDEBAR_ITEMS) {
    if (!seenIds.has(def.id)) {
      merged.push(def);
    }
  }

  return merged.sort((a, b) => a.order - b.order);
}

/**
 * جلب إعدادات القائمة الحالية المتزامنة محلياً (للبناء اللحظي)
 */
export function getSidebarConfig(): SidebarNavItemConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SIDEBAR_ITEMS;

    const saved: SidebarNavItemConfig[] = JSON.parse(raw);
    return normalizeSidebarItems(saved);
  } catch {
    return DEFAULT_SIDEBAR_ITEMS;
  }
}

/**
 * حفظ إعدادات القائمة محلياً وإطلاق حدث التحديث
 */
export function saveSidebarConfig(items: SidebarNavItemConfig[]): void {
  try {
    const normalized = items.map((item, index) => ({
      ...item,
      order: index,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(SIDEBAR_CONFIG_EVENT));
  } catch (err) {
    console.error('Failed to save sidebar config', err);
  }
}

/**
 * استعادة الترتيب الافتراضي محلياً
 */
export function resetSidebarConfig(): SidebarNavItemConfig[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(SIDEBAR_CONFIG_EVENT));
  } catch (err) {
    console.error('Failed to reset sidebar config', err);
  }
  return DEFAULT_SIDEBAR_ITEMS;
}

/**
 * جلب إعدادات القائمة من الـ Backend API ومزامنتها محلياً
 */
export async function fetchSidebarConfigFromApi(): Promise<SidebarNavItemConfig[]> {
  try {
    if (!authApi.isAuthenticated()) {
      return getSidebarConfig();
    }
    const apiItems = await authApi.getSidebarMenu();
    const normalized = normalizeSidebarItems(apiItems);
    saveSidebarConfig(normalized);
    return normalized;
  } catch (err) {
    console.warn('Could not fetch sidebar menu from API, using cached config:', err);
    return getSidebarConfig();
  }
}

/**
 * حفظ إعدادات القائمة في الـ Backend API ومزامنتها محلياً
 */
export async function saveSidebarConfigToApi(items: SidebarNavItemConfig[]): Promise<SidebarNavItemConfig[]> {
  const normalized = items.map((item, index) => ({
    ...item,
    order: index,
  }));

  // حفظ محلي فوري
  saveSidebarConfig(normalized);

  try {
    if (authApi.isAuthenticated()) {
      const saved = await authApi.updateSidebarMenu(normalized);
      const res = normalizeSidebarItems(saved);
      saveSidebarConfig(res);
      return res;
    }
  } catch (err) {
    console.error('Failed to save sidebar menu to API:', err);
    throw err;
  }

  return normalized;
}

/**
 * استعادة الإعدادات الافتراضية عبر الـ Backend API ومزامنتها محلياً
 */
export async function resetSidebarConfigToApi(): Promise<SidebarNavItemConfig[]> {
  try {
    if (authApi.isAuthenticated()) {
      const resetItems = await authApi.resetSidebarMenu();
      const res = normalizeSidebarItems(resetItems);
      saveSidebarConfig(res);
      return res;
    }
  } catch (err) {
    console.error('Failed to reset sidebar menu via API:', err);
  }

  return resetSidebarConfig();
}
