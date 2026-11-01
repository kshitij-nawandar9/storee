import { useEffect, useRef, useState } from 'react';

/**
 * Tracks whether an element is on screen.
 * With `once`, it stays true after the first time the element appears.
 */
export function useInView<T extends Element>({ once = false, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin]);

  return { ref, inView };
}
