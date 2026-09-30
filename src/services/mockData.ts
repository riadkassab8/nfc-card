import { Business, QRCode, QREvent, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'owner@acmecoffee.com',
    role: 'BUSINESS_OWNER',
    created_at: '2026-01-15T08:00:00Z',
  },
  {
    id: 'admin-1',
    email: 'admin@platform.com',
    role: 'PLATFORM_ADMIN',
    created_at: '2026-01-01T08:00:00Z',
  },
];

export const mockBusinesses: Business[] = [
  {
    id: 'biz-1',
    user_id: 'user-1',
    name: 'Acme Coffee Bar',
    logo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
    description: 'Artisanal espresso, fresh bakery items, and cozy seating in downtown.',
    phone: '+14155552671',
    whatsapp: '+14155552671',
    address: '123 Main Street, Suite 100, San Francisco, CA',
    latitude: 37.774929,
    longitude: -122.419416,
    instagram_url: 'https://instagram.com/acmecoffee',
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    website_url: 'https://acmecoffee.example.com',
    status: 'ACTIVE',
    created_at: '2026-01-15T08:30:00Z',
    updated_at: '2026-09-30T10:00:00Z',
  },
  {
    id: 'biz-2',
    user_id: 'user-2',
    name: 'Apex Barber Shop',
    logo_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=80',
    description: 'Classic cuts, hot towel shaves, and premium beard care.',
    phone: '+14155559812',
    whatsapp: '+14155559812',
    address: '456 Market St, San Francisco, CA',
    instagram_url: 'https://instagram.com/apexbarbers',
    google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY5',
    status: 'ACTIVE',
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-09-28T14:20:00Z',
  },
];

export const mockQRCodes: QRCode[] = [
  {
    id: 'qr-1',
    business_id: 'biz-1',
    public_code: '7FJ2K9',
    label: 'Main Counter Display',
    placement: 'Next to Cash Register',
    status: 'ACTIVE',
    scans_count: 842,
    created_at: '2026-01-16T10:00:00Z',
    updated_at: '2026-01-16T10:00:00Z',
  },
  {
    id: 'qr-2',
    business_id: 'biz-1',
    public_code: '3MX9P2',
    label: 'Table 4 Acrylic Stand',
    placement: 'Dining Floor Table 4',
    status: 'ACTIVE',
    scans_count: 310,
    created_at: '2026-01-20T11:30:00Z',
    updated_at: '2026-01-20T11:30:00Z',
  },
  {
    id: 'qr-3',
    business_id: 'biz-1',
    public_code: '8KL4W7',
    label: 'Window Vinyl Decal',
    placement: 'Front Entrance Door',
    status: 'DISABLED',
    scans_count: 268,
    created_at: '2026-02-05T14:15:00Z',
    updated_at: '2026-09-15T09:10:00Z',
  },
];

export const mockQREvents: QREvent[] = [
  {
    id: 'evt-1',
    qr_id: 'qr-1',
    event_type: 'WHATSAPP_CLICK',
    created_at: '2026-09-30T14:10:00Z',
  },
  {
    id: 'evt-2',
    qr_id: 'qr-2',
    event_type: 'PHONE_CLICK',
    created_at: '2026-09-30T13:45:00Z',
  },
  {
    id: 'evt-3',
    qr_id: 'qr-1',
    event_type: 'SCAN',
    created_at: '2026-09-30T13:00:00Z',
  },
  {
    id: 'evt-4',
    qr_id: 'qr-1',
    event_type: 'GOOGLE_REVIEW_CLICK',
    created_at: '2026-09-30T12:30:00Z',
  },
  {
    id: 'evt-5',
    qr_id: 'qr-2',
    event_type: 'LOCATION_CLICK',
    created_at: '2026-09-30T11:15:00Z',
  },
];
