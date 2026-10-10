export function scrollToSection(target: string | HTMLElement | null | undefined): void {
  if (typeof window === 'undefined') return;
  if (!target) return;
  
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;
  
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({
    behavior: reduce ? 'auto' : 'smooth',
    block: 'start'
  });
}
