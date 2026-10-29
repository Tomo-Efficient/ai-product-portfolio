import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, PUBLIC_DIR } from '../src/config.js';
import { getContent } from '../src/content.js';

const PORT = 3100;
const BASE = (process.env.PAGES_BASE || '/ai-product-portfolio').replace(/\/+$/, '');
const SITE = (process.env.PAGES_SITE || `https://tomo-efficient.github.io${BASE}`).replace(/\/+$/, '');
const OUT = path.join(ROOT, 'dist');

const routes = ['/', '/docs', '/about', '/contact'];
const { projects } = getContent();
for (const project of projects) {
  routes.push(`/work/${project.slug}`);
  routes.push(`/work/${project.slug}/docs`);
  for (const doc of project.docs) routes.push(`/work/${project.slug}/docs/${doc.slug}`);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(PUBLIC_DIR, OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

const child = spawn(process.execPath, ['server.js'], {
  cwd: ROOT,
  env: {
    ...process.env,
    PORT: String(PORT),
    HOST: '127.0.0.1',
    BASE_PATH: BASE,
    SITE_URL: SITE,
    STATIC_EXPORT: '1',
    DATABASE_URL: '',
    NODE_ENV: 'production'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
child.stdout.on('data', (d) => process.stdout.write(d));
child.stderr.on('data', (d) => process.stderr.write(d));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitReady() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}${BASE}/healthz`);
      if (res.ok) return;
    } catch { /* retry */ }
    await wait(250);
  }
  throw new Error('server did not start');
}

try {
  await waitReady();
  for (const route of routes) {
    const url = `http://127.0.0.1:${PORT}${BASE}${route === '/' ? '/' : route}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${route} -> ${res.status}`);
    const html = await res.text();
    const dir = route === '/' ? OUT : path.join(OUT, route.replace(/^\//, ''));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    console.log('built', route);
  }
  // 404
  const notFound = await fetch(`http://127.0.0.1:${PORT}${BASE}/__404__`);
  fs.writeFileSync(path.join(OUT, '404.html'), await notFound.text());
  console.log(`static build ready: ${OUT} (base ${BASE})`);
} finally {
  child.kill('SIGTERM');
  await wait(300);
}
