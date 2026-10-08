// Lokaler Server, der GitHub Pages nachbildet: Basis-Pfad /e-rechnung-klartext/,
// 301 auf Schrägstrich bei Ordnern, eigene 404-Seite, gzip.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '_site');
const BASE = '/e-rechnung-klartext/';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.ttf': 'font/ttf',
  '.csv': 'text/csv; charset=utf-8',
};

const gzCache = new Map();

function send(req, res, status, file, extraHeaders = {}) {
  const ext = path.extname(file);
  const type = TYPES[ext] || 'application/octet-stream';
  let body = fs.readFileSync(file);
  const headers = { 'Content-Type': type, 'Cache-Control': 'max-age=600', ...extraHeaders };
  if (/text|json|xml|javascript|svg|manifest/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    const key = file + ':' + fs.statSync(file).mtimeMs;
    if (!gzCache.has(key)) gzCache.set(key, zlib.gzipSync(body));
    body = gzCache.get(key);
    headers['Content-Encoding'] = 'gzip';
    headers.Vary = 'Accept-Encoding';
  }
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}

export function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let p = decodeURIComponent(url.pathname);
    if (p === '/' || p === '/e-rechnung-klartext') {
      res.writeHead(301, { Location: BASE });
      return res.end();
    }
    if (!p.startsWith(BASE)) return send(req, res, 404, path.join(ROOT, '404.html'));
    const rel = p.slice(BASE.length);
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) return send(req, res, 404, path.join(ROOT, '404.html'));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!p.endsWith('/')) {
        res.writeHead(301, { Location: p + '/' + url.search });
        return res.end();
      }
      const idx = path.join(file, 'index.html');
      if (fs.existsSync(idx)) return send(req, res, 200, idx);
    } else if (fs.existsSync(file)) {
      return send(req, res, 200, file);
    }
    return send(req, res, 404, path.join(ROOT, '404.html'));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 8080);
  createServer().listen(port, () => console.log(`http://localhost:${port}${BASE}`));
}
