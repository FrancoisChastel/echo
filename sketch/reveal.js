// echo — scroll reveal
// IntersectionObserver applies .revealed to elements as they
// cross into view. Multiple items revealing in the same frame
// stagger by 60ms each. Stripped by reduced-motion.
(() => {
  const SELECTORS = [
    '.loose-list > li',
    '.section-caption',
    '.earlier-link',
    '.post-body > p',
    '.post-body > h2',
    '.post-body > blockquote',
    '.post-body > hr',
    '.film-body > p',
    '.echo-name',
  ];

  const targets = document.querySelectorAll(SELECTORS.join(', '));
  if (!targets.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(el => el.classList.add('reveal', 'revealed'));
    return;
  }

  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    // Only the ones now in view, in document order
    const incoming = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => {
        const pos = a.target.compareDocumentPosition(b.target);
        return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });

    incoming.forEach((entry, i) => {
      setTimeout(() => {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }, i * 60);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -8% 0px',
  });

  targets.forEach(el => io.observe(el));
})();
