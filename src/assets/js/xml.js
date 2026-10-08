// Kleine Helfer für den namensraum-unabhängigen Zugriff auf XML-Elemente.

export function kids(el, name) {
  const out = [];
  if (!el) return out;
  for (const c of el.children) if (c.localName === name) out.push(c);
  return out;
}

export function kid(el, name) {
  if (!el) return null;
  for (const c of el.children) if (c.localName === name) return c;
  return null;
}

// Erstes Element entlang eines Pfads 'A/B/C' (nur Kindelemente)
export function at(el, p) {
  let cur = el;
  for (const part of p.split('/')) {
    cur = kid(cur, part);
    if (!cur) return null;
  }
  return cur;
}

// Alle Elemente entlang eines Pfads
export function all(el, p) {
  let cur = el ? [el] : [];
  for (const part of p.split('/')) {
    const next = [];
    for (const c of cur) next.push(...kids(c, part));
    cur = next;
  }
  return cur;
}

// Feld = { v: Textinhalt, el: Element, attr?: Attributname }
export function F(el) {
  if (!el) return null;
  return { v: el.textContent.trim(), el };
}

export function A(el, attr) {
  if (!el || !el.hasAttribute(attr)) return null;
  return { v: el.getAttribute(attr).trim(), el, attr };
}

export function v(field) {
  return field ? field.v : '';
}

export function has(field) {
  return !!(field && field.v !== '');
}
