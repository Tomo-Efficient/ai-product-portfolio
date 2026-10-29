import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLIC_DIR = path.join(ROOT, 'public');
export const CONTENT_DIR = path.join(ROOT, 'content');
export const PORT = Number(process.env.PORT || 3000);
export const HOST = process.env.HOST || '0.0.0.0';
export const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '');
const inferredSite = process.env.RENDER_EXTERNAL_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
export const SITE_URL = (process.env.SITE_URL || inferredSite || `http://localhost:${PORT}`).replace(/\/+$/, '');
export const COACH_DEMO_URL = process.env.COACH_DEMO_URL || '';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 's18538218915@163.com';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const STATIC_EXPORT = process.env.STATIC_EXPORT === '1';

export const u = (path = '/') => {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${BASE_PATH}${path}`;
};
