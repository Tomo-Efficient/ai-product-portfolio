import { marked } from 'marked';
import { u } from './config.js';
import { slugify } from './content.js';

const SCREENSHOTS = {
  'docs/screenshots/home.jpg': '/assets/work/mockmirror-home.jpg',
  'docs/screenshots/interview.jpg': '/assets/work/mockmirror-interview.jpg',
  'docs/screenshots/report.jpg': '/assets/work/mockmirror-report.jpg',
  'docs/screenshots/setup.jpg': '/assets/work/mockmirror-home.jpg',
  'docs/screenshots/knowledge.jpg': '/assets/work/mockmirror-home.jpg',
  'docs/screenshots/mobile-home.jpg': '/assets/work/mockmirror-home.jpg',
  'docs/screenshots/mobile-interview.jpg': '/assets/work/mockmirror-interview.jpg'
};

function rewriteHref(href, project) {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  let clean = href.replace(/^\.\//, '');
  if (SCREENSHOTS[clean]) return u(SCREENSHOTS[clean]);
  if (clean.startsWith('docs/screenshots/')) return u('/assets/work/mockmirror-home.jpg');
  const base = clean.split('#')[0].split('/').pop().toLowerCase();
  const doc = project?.docs?.find((d) => d.file.split('/').pop().toLowerCase() === base || `${d.slug}.md` === base);
  if (doc) return u(`/work/${project.slug}/docs/${doc.slug}`);
  if (clean.startsWith('/')) return u(clean);
  return href;
}

export function renderMarkdown(source, { project, demoHtml = '', stripH1 = false } = {}) {
  let md = String(source || '');
  let title = '';
  if (stripH1) {
    const m = md.match(/^#\s+(.+)$/m);
    if (m) {
      title = m[1].replace(/[*_`]/g, '').trim();
      md = md.replace(/^#\s+.+\n?/m, '');
    }
  }
  let html = marked.parse(md, { gfm: true, breaks: false });
  html = html.replace(/<a href="([^"]+)"/g, (all, href) => {
    const next = rewriteHref(href, project);
    const external = /^https?:/i.test(next);
    return `<a href="${next}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}`;
  });
  html = html.replace(/<img src="([^"]+)" alt="([^"]*)"(?: title="([^"]*)")?>/g, (all, src, alt, titleAttr) => {
    const next = rewriteHref(src, project);
    return `<img src="${next}" alt="${alt}"${titleAttr ? ` title="${titleAttr}"` : ''} loading="lazy">`;
  });
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  const toc = [];
  html = html.replace(/<h([23])>(.*?)<\/h\1>/g, (all, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const id = slugify(text);
    toc.push({ level: Number(level), text, id });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  if (demoHtml) html = html.replace(/<p>\{\{demo\}\}<\/p>|{{demo}}/g, demoHtml);
  html = html.replace(/<h1[^>]*>.*?<\/h1>/g, '');
  return { html, toc, title };
}
