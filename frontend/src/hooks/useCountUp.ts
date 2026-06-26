import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  target: number;
  duration?: number;       // seconds
  suffix?: string;
  prefix?: string;
  startOnView?: boolean;
}

/**
 * useCountUp — animates a number from 0 → target once triggered.
 * By default fires on mount; pass `startOnView` + the returned `ref`
 * to trigger only when the element enters the viewport.
 */
export function useCountUp({
  target,
  duration = 1.6,
  suffix = '',
  prefix = '',
  startOnView = true,
}: UseCountUpOptions) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // IntersectionObserver to trigger when in view
  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView]);

  // Run count-up animation
  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();
    const durationMs = duration * 1000;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easedProgress * target);
      setDisplay(`${prefix}${current}${suffix}`);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(`${prefix}${target}${suffix}`);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hasStarted, target, duration, suffix, prefix]);

  return { display, ref };
}
