// Exakte Dezimalrechnung mit BigInt (8 Nachkommastellen), angelehnt an xs:decimal in den Prüfregeln.
const SCALE = 100000000n; // 10^8
const CENT = 1000000n; // 0,01 in dieser Skala

export function dec(input) {
  if (input === null || input === undefined) return null;
  const s = String(typeof input === 'object' && 'v' in input ? input.v : input).trim();
  const m = /^([+-])?(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m || (m[2] === '' && !m[3])) return null;
  const neg = m[1] === '-';
  let frac = m[3] || '';
  const extra = frac.slice(8);
  frac = frac.padEnd(8, '0').slice(0, 8);
  let val = BigInt(m[2] || '0') * SCALE + BigInt(frac);
  if (extra && extra[0] >= '5') val += 1n;
  return neg ? -val : val;
}

export const ZERO = 0n;

export function sum(list) {
  return list.reduce((a, b) => a + (b ?? 0n), 0n);
}

export function mul(a, b) {
  return (a * b) / SCALE;
}

export function div(a, b) {
  if (b === 0n) return null;
  return (a * SCALE) / b;
}

function floorDiv(a, b) {
  const q = a / b;
  return (a % b !== 0n && (a < 0n) !== (b < 0n)) ? q - 1n : q;
}

// XPath round(x * 100) div 100: rundet halbe Werte in Richtung +unendlich
export function round2(a) {
  return floorDiv(a + CENT / 2n, CENT) * CENT;
}

// XPath round(x): ganze Zahl
export function round0(a) {
  return floorDiv(a + SCALE / 2n, SCALE) * SCALE;
}

export function abs(a) {
  return a < 0n ? -a : a;
}

export function fromInt(n) {
  return BigInt(n) * SCALE;
}

export function toNumber(a) {
  return Number(a) / Number(SCALE);
}

// Anzahl der Nachkommastellen im Originaltext
export function decimals(text) {
  const s = String(text || '').trim();
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

// Formatierung für die Anzeige: 1234.5 → "1.234,50"
export function fmt(a, minFrac = 2, maxFrac = 2) {
  if (a === null || a === undefined) return '';
  const n = toNumber(a);
  return n.toLocaleString('de-DE', { minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac });
}
