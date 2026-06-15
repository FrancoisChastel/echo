// echo — read progress
// Drives --read on <html> from 0 → 1 as the post is scrolled.
// CSS in styles.css (.read-progress) consumes it. Stripped by reduced-motion.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--read', max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();
