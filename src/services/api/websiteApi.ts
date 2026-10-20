import { apiClient } from './client';

export interface AnnouncementBarConfig {
  enabled: boolean;
  text: string;
  link: string;
}

export interface HeroSectionConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  badgePrice: string;
  badgePriceSub: string;
  badgeTech: string;
  badgeTechSub: string;
  heroImage: string;
}

export interface VideoSectionConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  videoUrl: string;
  caption: string;
}

export interface FeatureItemConfig {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface UseCaseItemConfig {
  id: string;
  title: string;
  description: string;
}

export interface StepItemConfig {
  num: string;
  title: string;
  description: string;
}

export interface ContactSocialConfig {
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  linkedinUrl: string;
}

export interface WebsiteContent {
  brandName: string;
  tagline: string;
  announcement: AnnouncementBarConfig;
  hero: HeroSectionConfig;
  video: VideoSectionConfig;
  featuresTitle: string;
  featuresSubtitle: string;
  features: FeatureItemConfig[];
  useCasesTitle: string;
  useCasesSubtitle: string;
  useCases: UseCaseItemConfig[];
  ctaBandTitle: string;
  ctaBandSubtitle: string;
  ctaBandButtonText: string;
  ctaBandButtonLink: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutStoryTitle: string;
  aboutStoryLead: string;
  aboutStoryBullets: string[];
  aboutImage: string;
  howEyebrow: string;
  howTitle: string;
  howSubtitle: string;
  howNfcTitle: string;
  howNfcSteps: StepItemConfig[];
  howQrTitle: string;
  howQrSteps: StepItemConfig[];
  howCtaText: string;
  contact: ContactSocialConfig;
  footerLogo: string;
  footerTagline: string;
  footerCopyright: string;
}

export interface ProductChoice {
  value: string;
  label: string;
  priceModifier?: number;
  image?: string;
}

export interface ProductOption {
  id: string;
  label: string;
  required?: boolean;
  choices: ProductChoice[];
}

export interface WebsiteProduct {
  _id?: string;
  productId: string;
  name: string;
  description?: string;
  basePrice: number;
  currency: string;
  features: string[];
  options: ProductOption[];
  visualType?: string;
  defaultImage?: string;
  gallery: string[];
  isAvailable: boolean;
  order: number;
  createdAt?: string;
}

export interface CustomerOrderInfo {
  name: string;
  phone: string;
  city: string;
  address?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  options?: Record<string, any>;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface WebsiteOrder {
  _id?: string;
  orderId: string;
  customer: CustomerOrderInfo;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

export interface WebsiteLink {
  _id?: string;
  title: string;
  url: string;
  location: 'header' | 'footer' | 'both';
  target: '_self' | '_blank';
  isActive: boolean;
  order: number;
  createdAt?: string;
}

export const websiteApi = {
  // CMS Content
  getContent: () =>
    apiClient<WebsiteContent>('/admin/website/content', { requiresAuth: true }),

  updateContent: (content: Partial<WebsiteContent>) =>
    apiClient<WebsiteContent>('/admin/website/content', {
      method: 'PUT',
      body: content,
      requiresAuth: true,
    }),

  resetContent: () =>
    apiClient<WebsiteContent>('/admin/website/content/reset', {
      method: 'POST',
      requiresAuth: true,
    }),

  // Dynamic Links
  getLinks: () =>
    apiClient<WebsiteLink[]>('/admin/website/links', { requiresAuth: true }),

  createLink: (link: Partial<WebsiteLink>) =>
    apiClient<WebsiteLink>('/admin/website/links', {
      method: 'POST',
      body: link,
      requiresAuth: true,
    }),

  updateLink: (id: string, link: Partial<WebsiteLink>) =>
    apiClient<WebsiteLink>(`/admin/website/links/${id}`, {
      method: 'PUT',
      body: link,
      requiresAuth: true,
    }),

  toggleLink: (id: string) =>
    apiClient<WebsiteLink>(`/admin/website/links/${id}/toggle`, {
      method: 'PATCH',
      requiresAuth: true,
    }),

  deleteLink: (id: string) =>
    apiClient<{ success: boolean; message: string }>(`/admin/website/links/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  // Products
  getProducts: () =>
    apiClient<WebsiteProduct[]>('/admin/website/products', { requiresAuth: true }),

  createProduct: (product: Partial<WebsiteProduct>) =>
    apiClient<WebsiteProduct>('/admin/website/products', {
      method: 'POST',
      body: product,
      requiresAuth: true,
    }),

  updateProduct: (productId: string, product: Partial<WebsiteProduct>) =>
    apiClient<WebsiteProduct>(`/admin/website/products/${productId}`, {
      method: 'PUT',
      body: product,
      requiresAuth: true,
    }),

  deleteProduct: (productId: string) =>
    apiClient<{ success: boolean; message: string }>(`/admin/website/products/${productId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  // Orders
  getOrders: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiClient<{
      orders: WebsiteOrder[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/admin/website/orders', {
      params,
      requiresAuth: true,
    }),

  getOrderStats: () =>
    apiClient<OrderStats>('/admin/website/orders/stats', { requiresAuth: true }),

  updateOrderStatus: (orderId: string, status: OrderStatus) =>
    apiClient<WebsiteOrder>(`/admin/website/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
      requiresAuth: true,
    }),

  deleteOrder: (orderId: string) =>
    apiClient<{ success: boolean; message: string }>(`/admin/website/orders/${orderId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};
