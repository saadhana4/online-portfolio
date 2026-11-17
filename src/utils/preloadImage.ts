let preloadPromise: Promise<void> | null = null;

/**
 * Preload and decode the high-resolution hand-phone image.
 * Uses HTMLImageElement.decode() to ensure the image is fully decoded in GPU memory
 * before the zoom animation starts, preventing frame drops.
 */
export const preloadLargePhoneImage = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (!preloadPromise) {
    preloadPromise = new Promise((resolve) => {
      const img = new Image();
      img.src = '/desk/hand-phone-large.webp';

      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(() => resolve())
          .catch(() => resolve());
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  }

  return preloadPromise;
};

// Schedule idle preload
if (typeof window !== 'undefined') {
  const scheduleIdle = () => {
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
        () => {
          preloadLargePhoneImage();
        }
      );
    } else {
      setTimeout(() => {
        preloadLargePhoneImage();
      }, 1000);
    }
  };

  if (document.readyState === 'complete') {
    scheduleIdle();
  } else {
    window.addEventListener('load', scheduleIdle, { once: true });
  }
}
