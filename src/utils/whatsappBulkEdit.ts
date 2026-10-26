import { BusinessData, WhatsappContact } from '../types';

export interface WhatsappBulkEditTouched {
  whatsapp: boolean;
  contacts: boolean;
}

/**
 * Build an explicit partial update for WhatsApp fields in bulk-edit mode.
 * Empty strings and empty arrays are meaningful here: they instruct the API
 * to remove existing WhatsApp data instead of leaving the old values intact.
 */
export const buildWhatsappBulkPatch = (
  whatsapp: string,
  contacts: WhatsappContact[],
  touched: WhatsappBulkEditTouched,
): Partial<BusinessData> => {
  const patch: Partial<BusinessData> = {};

  if (touched.whatsapp) {
    patch.whatsapp = whatsapp.trim();
  }

  if (touched.contacts) {
    patch.whatsapp_contacts = contacts
      .filter((contact) => contact.name.trim() && contact.number.trim())
      .map((contact) => ({
        name: contact.name.trim(),
        number: contact.number.trim(),
      }));
  }

  return patch;
};
