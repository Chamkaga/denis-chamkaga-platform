import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useHashScroll — reactive hook that listens to router location hash changes.
 * Combines an immediate viewport scroll-to-top reset with a robust polling loop
 * to ensure target anchor elements align correctly even during heavy layout shifts
 * (lazy imports, images, and AnimatePresence transitions).
 */
export const useHashScroll = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set scroll restoration to manual to override browser default jumps
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      const targetId = hash.replace('#', '');

      // 1. Instantly reset to top to clear the previous page's scroll positions (avoids getting stuck at footer coords)
      window.scrollTo(0, 0);

      // 2. Polling loop to repeatedly adjust scroll offsets as lazy layout segments render
      let attempts = 0;
      const maxAttempts = 20;

      const scrollInterval = setInterval(() => {
        const element = document.getElementById(targetId);
        attempts++;

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const rect = element.getBoundingClientRect();

          // Stop polling if target element is near the top or limit reached
          if (attempts >= maxAttempts || Math.abs(rect.top) < 20) {
            clearInterval(scrollInterval);
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(scrollInterval);
        }
      }, 150); // Check and re-align every 150ms for up to 3 seconds

      return () => clearInterval(scrollInterval);
    } else {
      // Direct path change resets view to top
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);
};

export default useHashScroll;
