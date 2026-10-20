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
  Activity,
  Store,
  BookOpen,
  ShoppingBag,
  ShoppingCart,
  Globe,
  Link2,
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
  Activity,
  Store,
  BookOpen,
  ShoppingBag,
  ShoppingCart,
  Globe,
  Link2,
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
    id: 'website_content',
    path: '/admin/website-content',
    label: 'محتوى الموقع (CMS)',
    defaultLabel: 'محتوى الموقع (CMS)',
    iconName: 'Globe',
    visible: true,
    order: 3,
  },
  {
    id: 'website_products',
    path: '/admin/website-products',
    label: 'منتجات المتجر',
    defaultLabel: 'منتجات المتجر',
    iconName: 'ShoppingBag',
    visible: true,
    order: 4,
  },
  {
    id: 'orders',
    path: '/admin/orders',
    label: 'طلبات الشراء',
    defaultLabel: 'طلبات الشراء',
    iconName: 'ShoppingCart',
    visible: true,
    order: 5,
  },
  {
    id: 'website_links',
    path: '/admin/website-links',
    label: 'روابط وقوائم الموقع',
    defaultLabel: 'روابط وقوائم الموقع',
    iconName: 'Link2',
    visible: true,
    order: 6,
  },
  {
    id: 'notifications',
    path: '/admin/notifications',
    label: 'الإشعارات',
    defaultLabel: 'الإشعارات',
    iconName: 'Bell',
    visible: true,
    order: 7,
  },
  {
    id: 'analytics',
    path: '/admin/analytics',
    label: 'الإحصائيات',
    defaultLabel: 'الإحصائيات',
    iconName: 'BarChart2',
    visible: true,
    order: 8,
  },
  {
    id: 'categories',
    path: '/admin/categories',
    label: 'التصنيفات',
    defaultLabel: 'التصنيفات',
    iconName: 'Tags',
    visible: true,
    order: 9,
  },
  {
    id: 'scan',
    path: '/admin/scan',
    label: 'فحص وتجهيز',
    defaultLabel: 'فحص وتجهيز',
    iconName: 'Scan',
    visible: true,
    order: 10,
  },
  {
    id: 'users',
    path: '/admin/users',
    label: 'المستخدمين والصلاحيات',
    defaultLabel: 'المستخدمين والصلاحيات',
    iconName: 'ShieldAlert',
    visible: true,
    order: 11,
  },
  {
    id: 'user_logs',
    path: '/admin/user-logs',
    label: 'سجل المستخدمين',
    defaultLabel: 'سجل المستخدمين',
    iconName: 'History',
    visible: true,
    order: 12,
  },
];

const STORAGE_KEY = 'k2rty_admin_sidebar_config_v1';
export const SIDEBAR_CONFIG_EVENT = 'k2rty-sidebar-config-changed';

/**
 * تطبيع عناصر القائمة القادمة من الباك إند
 */
export function normalizeSidebarItems(items: Partial<SidebarNavItemConfig>[]): SidebarNavItemConfig[] {
  if (!Array.isArray(items) || items.length === 0) {
    return DEFAULT_SIDEBAR_ITEMS;
  }

  const merged = [...DEFAULT_SIDEBAR_ITEMS];
  items.forEach((backendItem) => {
    if (!backendItem || !backendItem.id) return;
    const existingIndex = merged.findIndex((m) => m.id === backendItem.id);
    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        label: backendItem.label || merged[existingIndex].label,
        visible: backendItem.visible ?? merged[existingIndex].visible,
        order: typeof backendItem.order === 'number' ? backendItem.order : merged[existingIndex].order,
        iconName: backendItem.iconName || merged[existingIndex].iconName,
      };
    } else if (backendItem.path) {
      merged.push({
        id: backendItem.id,
        path: backendItem.path,
        label: backendItem.label || backendItem.id,
        defaultLabel: backendItem.defaultLabel || backendItem.label || backendItem.id,
        iconName: backendItem.iconName || 'LayoutDashboard',
        visible: backendItem.visible ?? true,
        order: typeof backendItem.order === 'number' ? backendItem.order : merged.length,
      });
    }
  });

  return merged.sort((a, b) => a.order - b.order);
}

/**
 * جلب إعدادات القائمة الحالية المتزامنة محلياً
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
 * مزامنة الإعدادات من الخادم
 */
export async function fetchSidebarConfigFromApi(): Promise<SidebarNavItemConfig[]> {
  try {
    const items = await authApi.getSidebarMenu();
    if (items && Array.isArray(items) && items.length > 0) {
      const normalized = normalizeSidebarItems(items);
      saveSidebarConfig(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('Could not fetch sidebar config from API, using local fallback:', err);
  }
  return getSidebarConfig();
}

/**
 * حفظ إعدادات القائمة على الخادم
 */
export async function saveSidebarConfigToApi(items: SidebarNavItemConfig[]): Promise<SidebarNavItemConfig[]> {
  saveSidebarConfig(items);
  try {
    const res = await authApi.updateSidebarMenu(items);
    if (res && Array.isArray(res)) {
      const normalized = normalizeSidebarItems(res);
      saveSidebarConfig(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('Could not save sidebar config to server:', err);
  }
  return items;
}

/**
 * استعادة الترتيب الافتراضي على الخادم
 */
export async function resetSidebarConfigToApi(): Promise<SidebarNavItemConfig[]> {
  const defaults = resetSidebarConfig();
  try {
    await authApi.resetSidebarMenu();
  } catch (err) {
    console.warn('Could not reset sidebar config on server:', err);
  }
  return defaults;
}
