/* article.js
   TOC active-section tracking, copy-code buttons,
   footnote target highlight, chart reveal-on-view.
   All progressive enhancement — page reads fine without JS. */

(() => {
  const segments = Array.from(document.querySelectorAll('.seg[id]'));
  const tocLinks = new Map();
  document.querySelectorAll('.toc a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    tocLinks.set(id, a);
  });

  /* ---------- TOC active tracking via IntersectionObserver --- */
  if (segments.length && 'IntersectionObserver' in window) {
    const visible = new Map();
    const setActive = (id) => {
      tocLinks.forEach((link, key) => link.classList.toggle('active', key === id));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible.set(e.target.id, e.intersectionRatio);
        });
        let best = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });
        if (best) setActive(best);
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0, 0.15, 0.35, 0.6, 1],
      }
    );
    segments.forEach((s) => io.observe(s));
  }

  /* ---------- chart reveal: mark on intersection ------------ */
  if ('IntersectionObserver' in window) {
    const chartIO = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '-10% 0px -10% 0px', threshold: 0.2 }
    );
    document.querySelectorAll('.chart').forEach((c) => chartIO.observe(c));
  } else {
    document.querySelectorAll('.chart').forEach((c) => c.classList.add('revealed'));
  }

  /* ---------- copy-code buttons ----------------------------- */
  document.querySelectorAll('.code-block .copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const fig = btn.closest('.code-block');
      const code = fig.querySelector('pre code');
      if (!code) return;
      // strip the line-number spans for a clean copy
      const clone = code.cloneNode(true);
      clone.querySelectorAll('.ln').forEach((n) => n.remove());
      const text = clone.textContent.replace(/^\s*\n/, '');
      try {
        await navigator.clipboard.writeText(text);
        const orig = btn.textContent;
        btn.textContent = 'copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 1400);
      } catch {
        btn.textContent = 'select →';
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  });

  /* ---------- footnote highlight on reference click --------- */
  document.querySelectorAll('a.ref').forEach((ref) => {
    ref.addEventListener('click', () => {
      const id = ref.getAttribute('href').slice(1);
      document.querySelectorAll('.references li.is-target').forEach((li) => {
        li.classList.remove('is-target');
      });
      const target = document.getElementById(id);
      if (target) {
        target.classList.add('is-target');
        // adopt the mode color of the segment the reference lives in
        const seg = ref.closest('.seg');
        if (seg) {
          const mode = getComputedStyle(seg).getPropertyValue('--mode').trim();
          if (mode) target.style.setProperty('--mode', mode);
        }
        setTimeout(() => target.classList.remove('is-target'), 4200);
      }
    });
  });

  /* ---------- smooth-scroll for TOC --------------------------- */
  document.querySelectorAll('.toc a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
      }
    });
  });
})();
