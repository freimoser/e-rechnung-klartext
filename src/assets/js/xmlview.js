// Rohansicht: XML eingerückt, nur sichtbare Zeilen werden gezeichnet (auch bei sehr großen Dateien flüssig).
import { esc } from './render.js';

const LINE = 20;
const MAX_TEXT = 300;

function attrs(el) {
  let out = '';
  for (const a of el.attributes) out += ` ${a.name}="${a.value}"`;
  return out;
}

// Wandelt das DOM in Zeilen um und merkt sich, in welcher Zeile jedes Element beginnt
export function prettyLines(doc) {
  const lines = [];
  const lineOf = new Map();
  const walk = (node, depth) => {
    const pad = '  '.repeat(depth);
    if (node.nodeType === 8) {
      lines.push(`${pad}<!--${node.data}-->`);
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node;
    lineOf.set(el, lines.length);
    const kids = Array.from(el.childNodes).filter((n) => n.nodeType === 1 || n.nodeType === 8);
    const text = kids.length ? '' : el.textContent.trim();
    if (!kids.length) {
      if (!text) lines.push(`${pad}<${el.tagName}${attrs(el)}/>`);
      else {
        const shown = text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}… (${text.length.toLocaleString('de-DE')} Zeichen gekürzt)` : text.replace(/\s*\n\s*/g, ' ⏎ ');
        lines.push(`${pad}<${el.tagName}${attrs(el)}>${shown}</${el.tagName}>`);
      }
      return;
    }
    lines.push(`${pad}<${el.tagName}${attrs(el)}>`);
    for (const k of kids) walk(k, depth + 1);
    lines.push(`${pad}</${el.tagName}>`);
  };
  walk(doc.documentElement, 0);
  return { lines, lineOf };
}

function highlight(line, query) {
  // einfache Einfärbung: Tags, Attribute, Werte, Kommentare
  let h;
  const trimmed = line.trimStart();
  const pad = line.slice(0, line.length - trimmed.length);
  if (trimmed.startsWith('<!--')) h = `<span class="c">${esc(trimmed)}</span>`;
  else {
    h = esc(trimmed)
      .replace(/(&lt;\/?)([\w:.-]+)/g, '$1<span class="t">$2</span>')
      .replace(/ ([\w:.-]+)=&quot;([^&]*)&quot;/g, ' <span class="a">$1</span>=&quot;<span class="v">$2</span>&quot;');
  }
  if (query) {
    // Treffer markieren, ohne Tags zu zerstören: nur in Textabschnitten außerhalb von <...>
    const q = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    h = h.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, txt) => (tag ? tag : txt.replace(new RegExp(q, 'gi'), (x) => `<mark class="hit">${x}</mark>`)));
  }
  return pad + h;
}

export class XmlView {
  constructor(container, statusEl) {
    this.box = container;
    this.status = statusEl;
    this.inner = document.createElement('div');
    this.inner.className = 'raw-inner';
    this.box.appendChild(this.inner);
    this.lines = [];
    this.lineOf = new Map();
    this.query = '';
    this.hits = [];
    this.hitIndex = -1;
    this.target = -1;
    this.box.addEventListener('scroll', () => this.draw(), { passive: true });
  }

  load(doc) {
    const { lines, lineOf } = prettyLines(doc);
    this.lines = lines;
    this.lineOf = lineOf;
    this.inner.style.height = `${lines.length * LINE}px`;
    this.query = '';
    this.hits = [];
    this.target = -1;
    this.box.scrollTop = 0;
    this.draw();
  }

  draw() {
    const top = this.box.scrollTop;
    const h = this.box.clientHeight || 400;
    const first = Math.max(0, Math.floor(top / LINE) - 20);
    const last = Math.min(this.lines.length, Math.ceil((top + h) / LINE) + 20);
    let html = '';
    for (let i = first; i < last; i += 1) {
      const cls = i === this.target ? 'raw-line is-target' : 'raw-line';
      html += `<div class="${cls}" data-top="${i * LINE}"><span class="ln">${i + 1}</span>${highlight(this.lines[i], this.query)}</div>`;
    }
    this.inner.innerHTML = html;
    for (const el of this.inner.children) el.style.top = `${el.dataset.top}px`;
  }

  scrollToLine(i) {
    this.target = i;
    const h = this.box.clientHeight || 400;
    this.box.scrollTop = Math.max(0, i * LINE - h / 3);
    this.draw();
  }

  jumpTo(el) {
    let node = el;
    while (node && !this.lineOf.has(node)) node = node.parentElement;
    if (!node) return false;
    const i = this.lineOf.get(node);
    this.scrollToLine(i);
    this.say(`Zeile ${i + 1}: <${node.tagName}>`);
    return true;
  }

  search(query) {
    this.query = query.trim();
    this.hits = [];
    this.hitIndex = -1;
    if (this.query) {
      const q = this.query.toLowerCase();
      this.lines.forEach((l, i) => { if (l.toLowerCase().includes(q)) this.hits.push(i); });
    }
    if (this.hits.length) this.next();
    else {
      this.draw();
      this.say(this.query ? 'Keine Treffer.' : '');
    }
  }

  next(dir = 1) {
    if (!this.hits.length) return;
    this.hitIndex = (this.hitIndex + dir + this.hits.length) % this.hits.length;
    this.scrollToLine(this.hits[this.hitIndex]);
    this.say(`Treffer ${this.hitIndex + 1} von ${this.hits.length} (Zeile ${this.hits[this.hitIndex] + 1})`);
  }

  say(msg) {
    if (this.status) this.status.textContent = msg;
  }
}
