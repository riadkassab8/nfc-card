import { describe, expect, it } from 'vitest';
import { buildWhatsappBulkPatch } from '../../utils/whatsappBulkEdit';

describe('buildWhatsappBulkPatch', () => {
  it('sends explicit empty values when WhatsApp data is removed', () => {
    expect(buildWhatsappBulkPatch('', [], { whatsapp: true, contacts: true })).toEqual({
      whatsapp: '',
      whatsapp_contacts: [],
    });
  });

  it('does not overwrite WhatsApp values when the fields were not edited', () => {
    expect(buildWhatsappBulkPatch('', [], { whatsapp: false, contacts: false })).toEqual({});
  });

  it('trims retained WhatsApp values and contact details', () => {
    expect(buildWhatsappBulkPatch(' https://wa.me/201000000000 ', [
      { name: ' خدمة العملاء ', number: ' 201000000000 ' },
    ], { whatsapp: true, contacts: true })).toEqual({
      whatsapp: 'https://wa.me/201000000000',
      whatsapp_contacts: [{ name: 'خدمة العملاء', number: '201000000000' }],
    });
  });
});
