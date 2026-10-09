// Dimensione massima del lato lungo della scansione salvata come sfondo.
// 1600 px su 219 mm sono ~185 dpi: più che sufficienti per allineare a video.
export const MAX_BG_SIDE_PX = 1600;

export const scaledSize = (width: number, height: number, maxSide = MAX_BG_SIDE_PX) => {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
};

// Legge un'immagine scelta dall'utente e la restituisce come JPEG ridotto (data URL),
// di solito qualche centinaio di KB invece di diversi MB.
export const shrinkImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = scaledSize(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas non disponibile'));
      ctx.fillStyle = '#ffffff'; // i PNG trasparenti diventerebbero neri in JPEG
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Immagine non leggibile'));
    };
    img.src = url;
  });
