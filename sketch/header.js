// echo — sticky header behavior
// 1. once scrolled past ~4px, header gets blurred translucent paper bg
// 2. once past 80px, header hides on scroll-down, shows on scroll-up
//    (the Medium/Substack reading pattern)
// 3. reduced-motion: bg/blur stays, hide-on-scroll is disabled
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastY = 0;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const dy = y - lastY;

    header.classList.toggle('is-scrolled', y > 4);

    if (!reducedMotion && y > 80) {
      // scroll-down past threshold → hide; small intent threshold prevents jitter
      if (dy > 6) header.classList.add('is-hidden');
      else if (dy < -6) header.classList.remove('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }

    lastY = y;
    ticking = false;
  };

  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  // also handle initial state on load
  update();
})();
