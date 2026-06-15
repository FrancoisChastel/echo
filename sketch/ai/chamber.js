// The Echo Chamber
// Visitor types a phrase; site pauses 3s; types a quote back letter-by-letter.
// Mock — picks a response from a fixed pool. Source link shown after.
(() => {
  const RESPONSES = [
    {
      quote: "The pleasure isn't the slowness itself. It's the noticing it permits.",
      source: "on slowness",
      date: "27.v.2026",
      slug: "../post.html",
    },
    {
      quote: "What we keep, and what we let pass.",
      source: "on attention",
      date: "11.iv.2026",
      slug: "../post.html",
    },
    {
      quote: "Architecture, time, and the spaces between meetings.",
      source: "the shape of a day",
      date: "22.iii.2026",
      slug: "../post.html",
    },
    {
      quote: "A 90-second study of light through paper.",
      source: "field notes, vol. 3",
      date: "12.v.2026",
      slug: "../film.html",
    },
  ];

  const form = document.querySelector('.chamber form');
  const promptEl = document.querySelector('.chamber-prompt');
  const inputWrap = document.querySelector('.chamber-input');
  const hint = document.querySelector('.chamber-hint');
  const out = document.querySelector('.chamber-out');
  const responseEl = document.querySelector('.chamber-response');
  const sourceEl = document.querySelector('.chamber-source');
  const againBtn = document.querySelector('.chamber-again');

  if (!form) return;

  function pickResponse(input) {
    // mock: stable pseudo-random based on input length
    const idx = (input.length * 7 + input.charCodeAt(0)) % RESPONSES.length;
    return RESPONSES[idx];
  }

  function reset() {
    out.classList.remove('is-active');
    responseEl.textContent = '';
    responseEl.classList.remove('is-done');
    sourceEl.innerHTML = '';
    inputWrap.style.display = '';
    promptEl.style.display = '';
    hint.style.display = '';
    form.querySelector('input').value = '';
    form.querySelector('input').focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input').value.trim();
    if (!input) return;

    inputWrap.style.display = 'none';
    promptEl.style.display = 'none';
    hint.style.display = 'none';
    out.classList.add('is-active');

    const response = pickResponse(input);

    setTimeout(() => {
      typeText(responseEl, response.quote, 38, () => {
        responseEl.classList.add('is-done');
        sourceEl.innerHTML = `— from <a href="${response.slug}">${response.source}</a> · ${response.date}`;
      });
    }, 2800);
  });

  function typeText(el, text, msPerChar, done) {
    let i = 0;
    function tick() {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) setTimeout(tick, msPerChar);
      else done();
    }
    tick();
  }

  againBtn?.addEventListener('click', reset);
})();
