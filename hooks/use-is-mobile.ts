import { useEffect, useState } from 'react';

/**
 * Returns `true` when the viewport width is below the `md` breakpoint (768 px)
 * and updates reactively on resize.
 *
 * @example
 * const isMobile = useIsMobile();
 * if (isMobile) { ... }
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
};