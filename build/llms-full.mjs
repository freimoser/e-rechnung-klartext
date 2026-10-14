// Volltext der Fachinhalte für llms-full.txt, erzeugt aus demselben HTML wie die Seiten.
// Externe Links behalten ihre Adresse (Quellen bleiben belegbar), interne Links nur den Text.
import { abs } from './site.mjs';

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENT[m]);

export function htmlToText(html) {
  let s = html
    // Navigation, Handlungsaufforderung und Weiterlesen-Kacheln sind Seitenstruktur, kein Inhalt
    .replace(/<nav[\s\S]*?<\/nav>/g, '')
    .replace(/<div class="cta-box">[\s\S]*?<\/div>/g, '')
    .replace(/<section class="related"[\s\S]*?<\/section>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<a href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, url, text) => `${text} (${decode(url)})`)
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, '\n\n### $1\n\n')
    .replace(/<summary[^>]*>([\s\S]*?)<\/summary>/g, '\n\n### $1\n\n')
    .replace(/<li[^>]*>/g, '\n- ')
    .replace(/<\/t[hd]>\s*<t[hd][^>]*>/g, ' | ')
    .replace(/<tr[^>]*>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<span class="source">/g, ' ')
    .replace(/<\/(p|div|table|ul|ol|details|header|section|article)>/g, '\n\n')
    .replace(/<[^>]+>/g, '');
  s = decode(s)
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

export function llmsFull({ siteName, pages }) {
  const teile = pages.map((p) => `${htmlToText(p.html).replace(/^# .*/, `# ${p.h1}\n\nAdresse: ${abs(p.slug)}\nStand: ${p.updated}`)}`);
  return `# ${siteName} – Volltext\n\n> Volltext der Ratgeber und Nachschlageseiten. Allgemeine Information, keine Steuer- oder Rechtsberatung. Jede Aussage zu Pflichten und Fristen trägt ihre amtliche Quelle mit Stand-Datum. Das Fehlercode-Verzeichnis mit allen Prüfregeln steht wegen seines Umfangs nur online: ${abs('fehlercodes/')}\n\n${teile.join('\n\n---\n\n')}\n`;
}
