import QRCode from 'qrcode';
import jsQR from 'jsqr';

export interface GeneratedQRCodeData {
  publicCode: string;
  publicUrl: string;
  dataUrl: string;
  svgString: string;
}

export const getPublicUrl = (publicCode: string): string => {
  const origin =
    typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : 'https://dynamic-qr-nfc.com';
  return `${origin}/q/${publicCode.trim().toUpperCase()}`;
};

/**
 * Programmatically generates a REAL 2D QR Code encoding the exact Public URL using 'qrcode' library.
 */
export const generateRealQRCode = async (publicCode: string): Promise<GeneratedQRCodeData> => {
  const publicUrl = getPublicUrl(publicCode);

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
