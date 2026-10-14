// Suche im Fehlercode-Verzeichnis (filtert die Tabellenzeilen im Browser).
const input = document.getElementById('code-filter');
const count = document.getElementById('code-count');
const groups = Array.from(document.querySelectorAll('.rule-group'));
let index = null;

function build() {
  index = groups.map((g) => ({
    g,
    rows: Array.from(g.querySelectorAll('tr[id]')).map((tr) => ({ tr, text: tr.textContent.toLowerCase() })),
  }));
}

function filter() {
  if (!index) build();
  const q = input.value.trim().toLowerCase();
  let shown = 0;
  for (const { g, rows } of index) {
    let any = 0;
    for (const r of rows) {
      const hit = !q || r.text.includes(q);
      r.tr.classList.toggle('is-hidden', !hit);
      if (hit) any += 1;
    }
    g.classList.toggle('is-hidden', any === 0);
    shown += any;
  }
  count.textContent = q ? `${shown.toLocaleString('de-DE')} Treffer` : `${shown.toLocaleString('de-DE')} Regeln`;
}

if (input) {
  let t = null;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(filter, 120); });
}
