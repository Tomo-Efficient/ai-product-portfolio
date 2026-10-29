import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PUBLIC_DIR, BASE_PATH, SITE_URL, CONTACT_EMAIL, NODE_ENV } from './config.js';
import { getContent, getProject, getDoc, getAllDocs, getProjects, nextProject } from './content.js';
import { renderMarkdown } from './markdown.js';
import { dbStatus, getStats, recordView, saveContact, saveFeedback, feedbackSummary } from './db.js';
import {
  layout, renderHome, renderWork, renderDocsIndex, renderDocsHome, renderDoc,
  renderContact, renderAbout, renderNotFound, renderDemo
} from './views.js';

const MIME = {
  '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY'
};

const html = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    ...SECURITY_HEADERS
  });
  res.end(body);
};

const json = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...SECURITY_HEADERS
  });
  res.end(JSON.stringify(data));
};

function stripBase(pathname) {
  if (BASE_PATH && (pathname === BASE_PATH || pathname.startsWith(BASE_PATH + '/'))) {
    return pathname.slice(BASE_PATH.length) || '/';
  }
  return pathname;
}

async function bodyJson(req, limit = 64 * 1024) {
  const type = req.headers['content-type'] || '';
  if (!type.includes('application/json')) throw Object.assign(new Error('请求格式不正确'), { status: 415 });
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('请求过大'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('请求体不是合法 JSON'), { status: 400 }); }
}

const clientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  return String(forwarded || req.socket.remoteAddress || '').split(',')[0].trim();
};
const ipHash = (req) => crypto.createHash('sha256')
  .update(`${clientIp(req)}|portfolio-v1`).digest('hex').slice(0, 32);

const hits = new Map();
function rateLimited(key, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return true;
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}

function serveStatic(req, res, pathname) {
  const rel = pathname.replace(/^\/+/, '');
  const file = path.resolve(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return false;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=3600',
    ...SECURITY_HEADERS
  });
  fs.createReadStream(file).pipe(res);
  return true;
}

async function getStatsSafe() {
  try { return await getStats(); }
  catch (err) { console.warn('[stats]', err.message); return { counts: {}, total: 0, mode: dbStatus().mode }; }
}

function sitemap() {
  const { projects } = getContent();
  const urls = ['/', '/docs', '/about', '/contact'];
  for (const p of projects) {
    urls.push(`/work/${p.slug}`);
    urls.push(`/work/${p.slug}/docs`);
    for (const d of p.docs) urls.push(`/work/${p.slug}/docs/${d.slug}`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}
</urlset>`;
}

export async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return json(res, 400, { error: '非法路径' }); }
  pathname = stripBase(pathname);
  const method = req.method || 'GET';

  if (method === 'GET' || method === 'HEAD') {
    if (pathname === '/healthz') return json(res, 200, { ok: true, db: dbStatus().mode, time: new Date().toISOString() });
    if (pathname === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    }
    if (pathname === '/sitemap.xml') {
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
      return res.end(sitemap());
    }
    if (pathname === '/api/stats') return json(res, 200, await getStatsSafe());
    if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/assets/')) {
      if (serveStatic(req, res, pathname)) return;
      return json(res, 404, { error: 'Not found' });
    }
  }

  if (method === 'POST' && pathname === '/api/contact') {
    try {
      if (rateLimited(`contact:${ipHash(req)}`, 5)) return json(res, 429, { error: '留言过于频繁，请稍后再试，或直接发邮件。' });
      const body = await bodyJson(req);
      if (body.website) return json(res, 200, { ok: true });
      const name = String(body.name || '').trim().slice(0, 80);
      const email = String(body.email || '').trim().slice(0, 160);
      const message = String(body.message || '').trim().slice(0, 3000);
      if (name.length < 1) return json(res, 400, { error: '请填写称呼' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: '请填写有效邮箱' });
      if (message.length < 10) return json(res, 400, { error: '留言至少 10 个字' });
      await saveContact({
        name, email, message, source: 'portfolio',
        ipHash: ipHash(req), userAgent: String(req.headers['user-agent'] || '').slice(0, 300)
      });
      return json(res, 200, { ok: true });
    } catch (err) {
      return json(res, err.status || 500, { error: err.message || '留言失败，请直接发邮件。' });
    }
  }

  if (method === 'POST' && pathname === '/api/feedback') {
    try {
      const body = await bodyJson(req);
      const projectSlug = String(body.project || '').slice(0, 60);
      const docSlug = String(body.doc || '').slice(0, 60);
      if (!getDoc(projectSlug, docSlug)) return json(res, 404, { error: '文档不存在' });
      if (typeof body.helpful !== 'boolean') return json(res, 400, { error: '参数错误' });
      await saveFeedback({ projectSlug, docSlug, helpful: body.helpful });
      return json(res, 200, { ok: true });
    } catch (err) {
      return json(res, err.status || 500, { error: err.message || '反馈失败' });
    }
  }

  if (method === 'POST' && pathname === '/api/events') {
    try {
      const body = await bodyJson(req);
      const project = getProject(String(body.project || ''));
      if (!project) return json(res, 404, { error: '项目不存在' });
      await recordView({ projectSlug: project.slug, path: String(body.path || '/'), referrer: String(body.referrer || '') });
      return json(res, 200, { ok: true });
    } catch (err) { return json(res, err.status || 500, { error: err.message || '记录失败' }); }
  }

  if (method !== 'GET' && method !== 'HEAD') return json(res, 405, { error: 'Method not allowed' });

  const { profile } = getContent();
  const projects = getProjects();
  const stats = await getStatsSafe();

  try {
    if (pathname === '/' || pathname === '') return html(res, 200, renderHome({ profile, projects, stats }));
    if (pathname === '/docs') return html(res, 200, renderDocsIndex({ profile, projects, allDocs: getAllDocs() }));
    if (pathname === '/about') return html(res, 200, renderAbout({ profile, projects }));
    if (pathname === '/contact') return html(res, 200, renderContact({ profile, dbMode: dbStatus().mode }));

    const workMatch = pathname.match(/^\/work\/([^/]+)\/?$/);
    if (workMatch) {
      const project = getProject(workMatch[1]);
      if (!project) return html(res, 404, renderNotFound({ profile }));
      const { html: caseHtml } = renderMarkdown(project.caseStudy, {
        project,
        demoHtml: project.demo ? renderDemo(project.demo) : ''
      });
      await recordView({ projectSlug: project.slug, path: pathname, referrer: req.headers.referer || '' }).catch((e) => console.warn('[view]', e.message));
      stats.counts[project.slug] = (stats.counts[project.slug] || 0) + 1;
      stats.total = (stats.total || 0) + 1;
      return html(res, 200, renderWork({ project, profile, caseHtml, stats, next: nextProject(project.slug) }));
    }

    const docsHomeMatch = pathname.match(/^\/work\/([^/]+)\/docs\/?$/);
    if (docsHomeMatch) {
      const project = getProject(docsHomeMatch[1]);
      if (!project) return html(res, 404, renderNotFound({ profile }));
      return html(res, 200, renderDocsHome({ project, profile }));
    }

    const docMatch = pathname.match(/^\/work\/([^/]+)\/docs\/([^/]+)\/?$/);
    if (docMatch) {
      const project = getProject(docMatch[1]);
      const doc = project ? getDoc(project.slug, docMatch[2]) : null;
      if (!project || !doc) return html(res, 404, renderNotFound({ profile }));
      const { html: docHtml, toc } = renderMarkdown(doc.markdown, { project, stripH1: true });
      const feedback = await feedbackSummary(project.slug, doc.slug).catch(() => ({ yes: 0, no: 0 }));
      await recordView({ projectSlug: project.slug, path: pathname, referrer: req.headers.referer || '' }).catch(() => {});
      return html(res, 200, renderDoc({ project, doc, profile, projects, toc, html: docHtml, feedback }));
    }

    return html(res, 404, renderNotFound({ profile }));
  } catch (err) {
    console.error('[page]', err);
    if (NODE_ENV !== 'development') return html(res, 500, renderNotFound({ profile }));
    return html(res, 500, `<pre style="padding:40px;font:14px/1.6 monospace;white-space:pre-wrap">${err.stack}</pre>`);
  }
}
