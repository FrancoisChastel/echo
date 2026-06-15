// The Echo Continues
// Mock: AI paragraphs append from a pool when user scrolls near bottom.
// Each one reveals via the .reveal pattern. Stops after 8 paragraphs
// and appends "— silence."
(() => {
  const POOL = [
    "There are practices that resist this — a kind of work that knows it is being made, and pauses to acknowledge that knowing. They do not advertise themselves as slow; slowness is not the point. The point is the noticing.",
    "I have begun to suspect that the speed at which we work is not a property of the work itself, but of the relationship we have with it. A quick task done attentively is not fast. A long task done while elsewhere is not slow.",
    "What survives this conversation, I think, is the willingness to wait — not for nothing, but for the right moment. The waiting is the work the slowness was always for.",
    "It is possible to spend a day producing nothing and still have done something. It is also possible to spend a day producing things and have done nothing. The difference is not visible in the output.",
    "Sometimes the work asks to be left alone for a week. Not abandoned; left. The week is part of the making, though no one will see it in the result.",
    "There is a kind of attention that only the third or fourth visit can bring. The first visit is curiosity. The second is comparison. The third is the beginning of what was always there.",
    "A film I almost finished — but did not — has taught me more than the films I completed quickly. The not-finishing was the lesson, not the failure.",
    "If you make something at the speed you can speak about it, you have made something for talking. If you make it at the speed it asks to be made, you have made it for itself.",
  ];

  const aiBody = document.querySelector('.ai-body');
  const sentinel = document.querySelector('.ai-sentinel');
  const silenceMarker = document.querySelector('.ai-silence');
  if (!aiBody || !sentinel) return;

  let i = 0;
  let generating = false;

  function appendParagraph() {
    if (i >= POOL.length) {
      if (silenceMarker) silenceMarker.style.display = 'flex';
      io.disconnect();
      return;
    }
    const p = document.createElement('p');
    p.className = 'reveal';
    p.textContent = POOL[i];
    aiBody.insertBefore(p, sentinel);
    // trigger reveal next tick
    requestAnimationFrame(() => p.classList.add('revealed'));
    i++;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !generating) {
        generating = true;
        appendParagraph();
        setTimeout(() => { generating = false; }, 700);
      }
    });
  }, { rootMargin: '0px 0px 200px 0px' });

  io.observe(sentinel);
})();
