import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL, ROOT } from './config.js';

const LOCAL_FILE = path.join(ROOT, '.data', 'local-db.json');
const local = { views: [], contacts: [], feedback: [] };
let sql = null;
let mode = 'local';
let lastError = '';

function loadLocal() {
  try {
    const saved = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
    local.views = Array.isArray(saved.views) ? saved.views : [];
    local.contacts = Array.isArray(saved.contacts) ? saved.contacts : [];
    local.feedback = Array.isArray(saved.feedback) ? saved.feedback : [];
  } catch { /* first run */ }
}

function saveLocal() {
  try {
    fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(local));
  } catch (err) {
    console.warn('[db] local save failed:', err.message);
  }
}

async function createSchema() {
  await sql`CREATE TABLE IF NOT EXISTS portfolio_views (
    id bigserial PRIMARY KEY,
    project_slug text NOT NULL,
    path text NOT NULL,
    referrer text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS portfolio_views_slug_idx ON portfolio_views (project_slug, created_at)`;
  await sql`CREATE TABLE IF NOT EXISTS portfolio_contacts (
    id bigserial PRIMARY KEY,
    name varchar(80) NOT NULL,
    email varchar(160) NOT NULL,
    message text NOT NULL,
    source varchar(40) DEFAULT 'portfolio',
    ip_hash varchar(64),
    user_agent text,
    status varchar(20) NOT NULL DEFAULT 'new',
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS portfolio_doc_feedback (
    id bigserial PRIMARY KEY,
    project_slug text NOT NULL,
    doc_slug text NOT NULL,
    helpful boolean NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS portfolio_doc_feedback_doc_idx ON portfolio_doc_feedback (project_slug, doc_slug)`;
}

export async function initDb() {
  loadLocal();
  if (!DATABASE_URL) {
    mode = 'local';
    console.log('[db] DATABASE_URL 未配置，使用本地 JSON 兜底（仅开发）');
    return { mode };
  }
  try {
    sql = neon(DATABASE_URL);
    await sql`SELECT 1`;
    await createSchema();
    mode = 'neon';
    console.log('[db] Neon Postgres 已连接，数据表就绪');
  } catch (err) {
    mode = 'local';
    lastError = err.message;
    console.warn('[db] Neon 连接失败，降级本地 JSON：', err.message);
  }
  return { mode };
}

export function dbStatus() {
  return { mode, lastError };
}

export async function recordView({ projectSlug, path: viewPath, referrer = '' }) {
  if (!projectSlug) return;
  if (mode === 'neon') {
    await sql`INSERT INTO portfolio_views (project_slug, path, referrer)
              VALUES (${projectSlug}, ${String(viewPath).slice(0, 300)}, ${String(referrer).slice(0, 300)})`;
    return;
  }
  local.views.push({ projectSlug, path: viewPath, referrer, at: new Date().toISOString() });
  saveLocal();
}

export async function getStats() {
  const counts = {};
  let total = 0;
  if (mode === 'neon') {
    const rows = await sql`SELECT project_slug, COUNT(*)::int AS views
                           FROM portfolio_views GROUP BY project_slug`;
    for (const row of rows) {
      counts[row.project_slug] = Number(row.views);
      total += Number(row.views);
    }
    return { counts, total, mode };
  }
  for (const view of local.views) {
    counts[view.projectSlug] = (counts[view.projectSlug] || 0) + 1;
    total += 1;
  }
  return { counts, total, mode };
}

export async function saveContact({ name, email, message, source, ipHash, userAgent }) {
  if (mode === 'neon') {
    const rows = await sql`INSERT INTO portfolio_contacts (name, email, message, source, ip_hash, user_agent)
                           VALUES (${name}, ${email}, ${message}, ${source}, ${ipHash}, ${userAgent})
                           RETURNING id`;
    return rows[0]?.id ?? null;
  }
  const row = {
    id: local.contacts.length + 1,
    name, email, message, source, ipHash, userAgent,
    at: new Date().toISOString()
  };
  local.contacts.push(row);
  saveLocal();
  return row.id;
}

export async function saveFeedback({ projectSlug, docSlug, helpful }) {
  if (mode === 'neon') {
    await sql`INSERT INTO portfolio_doc_feedback (project_slug, doc_slug, helpful)
              VALUES (${projectSlug}, ${docSlug}, ${helpful})`;
    return;
  }
  local.feedback.push({ projectSlug, docSlug, helpful, at: new Date().toISOString() });
  saveLocal();
}

export async function feedbackSummary(projectSlug, docSlug) {
  if (mode === 'neon') {
    const rows = await sql`SELECT helpful, COUNT(*)::int AS n
                           FROM portfolio_doc_feedback
                           WHERE project_slug = ${projectSlug} AND doc_slug = ${docSlug}
                           GROUP BY helpful`;
    return {
      yes: Number(rows.find((r) => r.helpful)?.n || 0),
      no: Number(rows.find((r) => r.helpful === false)?.n || 0)
    };
  }
  const rows = local.feedback.filter((f) => f.projectSlug === projectSlug && f.docSlug === docSlug);
  return { yes: rows.filter((f) => f.helpful).length, no: rows.filter((f) => !f.helpful).length };
}
