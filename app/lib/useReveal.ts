import { useEffect, RefObject } from 'react';

export function useReveal(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!ref.current) return;
    
    const elements = ref.current.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    ref.current.setAttribute('data-reveal-ready', 'true');

    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.2 }
    );

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [enabled, ref]);
}
