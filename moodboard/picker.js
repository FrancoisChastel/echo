// echo moodboard — picker
// Reusable picker logic: select any number of cards per section, leave notes,
// hit submit → get a markdown summary you can copy back.
(() => {
  const STORAGE_KEY = 'echo-moodboard-picks';
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);

  function loadState() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    $$('.mb-pickable').forEach(card => {
      const key = card.dataset.section + ':' + card.dataset.id;
      const state = saved[key];
      if (!state) return;
      const cb = $('.mb-checkbox', card);
      const note = $('.mb-note', card);
      if (cb) cb.checked = !!state.picked;
      if (note) note.value = state.note || '';
      if (state.picked) card.classList.add('mb-picked');
    });
  }

  function saveState() {
    const state = {};
    $$('.mb-pickable').forEach(card => {
      const key = card.dataset.section + ':' + card.dataset.id;
      const cb = $('.mb-checkbox', card);
      const note = $('.mb-note', card);
      state[key] = {
        picked: cb?.checked || false,
        note: (note?.value || '').trim(),
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateCount() {
    const count = $$('.mb-pickable .mb-checkbox:checked').length;
    const el = $('#mb-count');
    if (el) el.textContent = count === 0 ? 'no picks yet' : `${count} pick${count === 1 ? '' : 's'}`;
  }

  function bind() {
    $$('.mb-pickable').forEach(card => {
      const cb = $('.mb-checkbox', card);
      const note = $('.mb-note', card);
      if (cb) {
        cb.addEventListener('change', () => {
          card.classList.toggle('mb-picked', cb.checked);
          saveState();
          updateCount();
        });
      }
      if (note) {
        note.addEventListener('input', saveState);
      }
    });
  }

  function sectionTitle(section) {
    return section.replace(/-/g, ' ');
  }

  function cardLabel(card) {
    const el = $('.mb-card-label', card);
    if (!el) return card.dataset.id;
    // Build label with a separator between the main text and any <small> subtitle
    const main = (el.childNodes[0]?.textContent || '').trim();
    const sub = $('small', el)?.textContent.trim();
    if (main && sub) return `${main} — ${sub}`;
    return el.textContent.trim().replace(/\s+/g, ' ');
  }

  function generateSummary() {
    const ordered = {};
    $$('.mb-pickable').forEach(card => {
      const cb = $('.mb-checkbox', card);
      if (!cb?.checked) return;
      const section = card.dataset.section;
      ordered[section] ??= [];
      ordered[section].push({
        id: card.dataset.id,
        label: cardLabel(card),
        note: ($('.mb-note', card)?.value || '').trim(),
      });
    });

    let out = '# echo — moodboard picks\n\n';
    if (Object.keys(ordered).length === 0) {
      out += '_no selections yet — pick at least one option per section before submitting._\n';
      return out;
    }
    for (const [section, picks] of Object.entries(ordered)) {
      out += `## ${sectionTitle(section)}\n\n`;
      picks.forEach(p => {
        out += `- **${p.id}** — ${p.label}\n`;
        if (p.note) out += `  > ${p.note}\n`;
      });
      out += '\n';
    }
    return out.trimEnd() + '\n';
  }

  function openOutput() {
    const dialog = $('#mb-output');
    const text = $('#mb-output-text');
    text.value = generateSummary();
    dialog.showModal();
  }

  async function copy() {
    const text = $('#mb-output-text');
    try {
      await navigator.clipboard.writeText(text.value);
    } catch {
      text.select();
      document.execCommand('copy');
    }
    const btn = $('#mb-copy-btn');
    const orig = btn.textContent;
    btn.textContent = 'copied ✓';
    setTimeout(() => btn.textContent = orig, 1500);
  }

  function clearAll() {
    if (!confirm('clear all picks?')) return;
    localStorage.removeItem(STORAGE_KEY);
    $$('.mb-pickable').forEach(card => {
      card.classList.remove('mb-picked');
      const cb = $('.mb-checkbox', card);
      const note = $('.mb-note', card);
      if (cb) cb.checked = false;
      if (note) note.value = '';
    });
    updateCount();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    bind();
    updateCount();
    $('#mb-submit')?.addEventListener('click', openOutput);
    $('#mb-clear')?.addEventListener('click', clearAll);
    $('#mb-copy-btn')?.addEventListener('click', copy);
    $('#mb-close-btn')?.addEventListener('click', () => $('#mb-output').close());
  });
})();
