import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { CardItem } from '../types';

export interface GeneratedQRCodeData {
  publicCode: string;
  publicUrl: string;
  dataUrl: string;
  svgString: string;
}

export const getPublicUrl = (publicCode: string): string => {
  if (publicCode.startsWith('http://') || publicCode.startsWith('https://')) {
    return publicCode.trim();
  }
  const origin =
    typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : 'https://dynamic-qr-nfc.com';
  return `${origin}/q/${publicCode.trim().toUpperCase()}`;
};

export const getCardPublicUrl = (card: CardItem): string => {
  if (card.public_url && card.public_url.trim().length > 0) {
    return card.public_url.trim();
  }
  return getPublicUrl(card.public_code);
};

/**
 * Programmatically generates a REAL 2D QR Code encoding the exact Public URL using 'qrcode' library.
 * Accepts an explicit URL string (e.g. 'https://example.com') or a publicCode or CardItem.
 */
export const generateRealQRCode = async (target: string | CardItem): Promise<GeneratedQRCodeData> => {
  let publicUrl = '';
  let publicCode = '';

  if (typeof target === 'string') {
    publicUrl = getPublicUrl(target);
    publicCode = target;
  } else {
    publicUrl = getCardPublicUrl(target);
    publicCode = target.public_code;
  }

  const dataUrl = await QRCode.toDataURL(publicUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  const svgString = await QRCode.toString(publicUrl, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  return {
    publicCode,
    publicUrl,
    dataUrl,
    svgString,
  };
};

/**
 * Decodes a generated QR Data URL / Canvas image using jsQR library to verify the encoded payload.
 */
export const decodeQRCodeDataUrl = async (dataUrl: string): Promise<{ success: boolean; decodedPayload: string | null }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ success: false, decodedPayload: null });
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        resolve({ success: true, decodedPayload: code.data });
      } else {
        resolve({ success: false, decodedPayload: null });
      }
    };
    img.onerror = () => resolve({ success: false, decodedPayload: null });
    img.src = dataUrl;
  });
};
