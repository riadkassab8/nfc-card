import { BusinessData } from '../types';

export const GYM_LIST_FIELDS = ['gym_services', 'gym_plans', 'gym_trainers', 'gym_classes'] as const;
export type GymListField = (typeof GYM_LIST_FIELDS)[number];

export const serializeGymList = (value: unknown): string => JSON.stringify(Array.isArray(value) ? value : []);

export const appendGymLists = (business: BusinessData, formData: Record<string, string>): boolean => {
  let hasEntries = false;
  for (const key of GYM_LIST_FIELDS) {
    try {
      const parsed: unknown = JSON.parse(formData[key] || '[]');
      if (!Array.isArray(parsed)) continue;
      const rows = parsed.filter((row) => row && typeof row === 'object' && Object.values(row as Record<string, unknown>).some((value) => String(value ?? '').trim()));
      if (rows.length) {
        (business as Record<string, unknown>)[key] = rows;
        hasEntries = true;
      }
    } catch {
      // Ignore malformed draft JSON rather than blocking unrelated contact data.
    }
  }
  return hasEntries;
};
