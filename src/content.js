import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_DIR, COACH_DEMO_URL } from './config.js';

const readJson = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
};

const words = (text) => String(text || '').replace(/\s+/g, '').length;

export function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section';
}

function loadProject(slug) {
  const dir = path.join(CONTENT_DIR, 'projects', slug);
  const meta = readJson(path.join(dir, 'project.json'), null);
  if (!meta) return null;
  const docs = (meta.docs || []).map((doc) => {
    const file = path.join(dir, 'docs', doc.file);
    let markdown = '';
    let updated = null;
    try {
      markdown = fs.readFileSync(file, 'utf8');
      updated = fs.statSync(file).mtime.toISOString();
    } catch { /* missing docs are filtered below */ }
    return {
      ...doc,
      projectSlug: slug,
      projectName: meta.name,
      accent: meta.accent,
      markdown,
      chars: words(markdown),
      readingMinutes: Math.max(2, Math.round(words(markdown) / 420)),
      updated
    };
  }).filter((doc) => doc.markdown);
  const caseStudy = (() => {
    try { return fs.readFileSync(path.join(dir, 'case-study.md'), 'utf8'); } catch { return ''; }
  })();
  const demo = readJson(path.join(dir, 'demo.json'), null);
  return {
    ...meta,
    docs,
    caseStudy,
    demo,
    demoUrl: slug === 'mockmirror' ? COACH_DEMO_URL : ''
  };
}

let cache = null;

function load() {
  const profile = readJson(path.join(CONTENT_DIR, 'profile.json'), {});
  const projectsDir = path.join(CONTENT_DIR, 'projects');
  const projects = fs.existsSync(projectsDir)
    ? fs.readdirSync(projectsDir)
      .map((slug) => loadProject(slug))
      .filter(Boolean)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  const docs = projects.flatMap((project) => project.docs.map((doc) => ({ ...doc, project })));
  cache = { profile, projects, docs };
  return cache;
}

export function getContent() {
  return cache || load();
}

export function getProjects() {
  return getContent().projects;
}

export function getProject(slug) {
  return getContent().projects.find((p) => p.slug === slug) || null;
}

export function getDoc(projectSlug, docSlug) {
  const project = getProject(projectSlug);
  if (!project) return null;
  const index = project.docs.findIndex((doc) => doc.slug === docSlug);
  if (index < 0) return null;
  const doc = project.docs[index];
  return {
    ...doc,
    prev: project.docs[index - 1] || null,
    next: project.docs[index + 1] || null
  };
}

export function getAllDocs() {
  return getContent().docs;
}

export function nextProject(slug) {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  return projects[(index + 1) % projects.length] || null;
}
