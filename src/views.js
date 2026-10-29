import { u, SITE_URL, CONTACT_EMAIL, STATIC_EXPORT } from './config.js';

export const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const icon = (name) => {
  const paths = {
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    upRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.9 1S18.7.6 16 2.5a13.4 13.4 0 0 0-7 0C6.3.6 5.1 1 5.1 1A5 5 0 0 0 5 4.8 5.4 5.4 0 0 0 3.6 8.5c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-1 2.6V22"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    shield: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
  };
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};

const dt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export function projectUrl(project) { return u(`/work/${project.slug}`); }
export function docsUrl(project) { return u(`/work/${project.slug}/docs`); }
export function docUrl(doc) { return u(`/work/${doc.projectSlug}/docs/${doc.slug}`); }

function header(profile, active = '') {
  const nav = [
    ['work', '作品', u('/#work')],
    ['docs', '文档', u('/docs')],
    ['about', '关于', u('/about')],
    ['contact', '联系', u('/contact')]
  ];
  return `<header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${u('/')}" aria-label="返回首页">
        <span class="brand-mark">石</span>
        <span class="brand-text"><strong>石浩田</strong><small>AI Product Manager</small></span>
      </a>
      <nav class="main-nav" aria-label="主导航">
        ${nav.map(([key, label, href]) => `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <a class="header-link" href="${esc(profile.resume)}" target="_blank" rel="noopener">简历 ${icon('upRight')}</a>
        <button class="menu-btn" id="menuBtn" aria-label="打开导航" aria-expanded="false">${icon('menu')}</button>
      </div>
    </div>
    <div class="mobile-nav" id="mobileNav">
      ${nav.map(([key, label, href]) => `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`).join('')}
      <a href="${esc(profile.resume)}" target="_blank" rel="noopener">简历 ↗</a>
    </div>
  </header>`;
}

function footer(profile) {
  return `<footer class="site-footer">
    <div class="footer-inner">
      <div>
        <div class="footer-name">石浩田 <span>/ Shi Haotian</span></div>
        <p>AI 产品经理 · ${esc(profile.focus)}</p>
      </div>
      <div class="footer-links">
        <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
        <a href="${esc(profile.github)}" target="_blank" rel="noopener">GitHub</a>
        <a href="${esc(profile.resume)}" target="_blank" rel="noopener">简历</a>
        <a href="${u('/docs')}">文档</a>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} 石浩田</span>
        <span>Built with Node.js · Neon · Markdown</span>
      </div>
    </div>
  </footer>`;
}

export function layout({ title, description, content, profile, active = '', accent = '#0f766e', accentSoft = '#ecfdf5', canonical = '/' }) {
  const fullTitle = title ? `${title} · 石浩田` : '石浩田 · AI 产品经理';
  const url = `${SITE_URL}${canonical}`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || profile?.hero?.desc || '')}">
<meta name="theme-color" content="#f7f6f2">
<link rel="canonical" href="${esc(url)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description || '')}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(SITE_URL + u('/assets/work/mockmirror-home.jpg'))}">
<link rel="icon" href="${u('/assets/favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${u('/css/site.css')}">
<script>document.documentElement.classList.add('js');</script>
</head>
<body style="--accent:${accent};--accent-soft:${accentSoft}" data-static="${STATIC_EXPORT ? 'true' : 'false'}">
<a class="skip" href="#main">跳到主要内容</a>
${header(profile, active)}
<main id="main">${content}</main>
${footer(profile)}
<script type="module" src="${u('/js/site.js')}"></script>
</body>
</html>`;
}

function sectionHead(eyebrow, title, desc = '', link = '') {
  return `<div class="section-head">
    <div><div class="eyebrow">${esc(eyebrow)}</div><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ''}</div>
    ${link || ''}
  </div>`;
}

function projectVisual(project) {
  if (project.cover) {
    return `<img src="${esc(u(project.cover))}" alt="${esc(project.coverAlt || project.name)}" loading="lazy">`;
  }
  return `<div class="visual-fallback"></div>`;
}

function metricRow(metrics) {
  return `<div class="metrics">${metrics.map((m) => `<div class="metric"><strong>${esc(m.value)}<small>${esc(m.unit || '')}</small></strong><span>${esc(m.label)}</span></div>`).join('')}</div>`;
}

function projectCard(project, index) {
  const reverse = index % 2 === 1;
  return `<article class="project-card ${reverse ? 'reverse' : ''}" id="${esc(project.slug)}" style="--project-accent:${project.accent};--project-soft:${project.accentSoft}">
    <div class="project-copy">
      <div class="project-meta"><span class="project-no">0${index + 1}</span><span>${esc(project.kind)}</span><span>${esc(project.period)}</span></div>
      <h3><a href="${projectUrl(project)}">${esc(project.name)}</a></h3>
      <p class="project-summary">${esc(project.summary)}</p>
      ${metricRow(project.metrics)}
      <div class="tag-row">${project.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <div class="project-links">
        <a class="text-link" href="${projectUrl(project)}">查看案例 ${icon('arrow')}</a>
        <a class="text-link muted" href="${docsUrl(project)}">${project.docs.length} 份文档</a>
      </div>
    </div>
    <a class="project-visual" href="${projectUrl(project)}" aria-label="查看 ${esc(project.name)} 案例">
      ${projectVisual(project)}
      <span class="visual-label">${esc(project.shortName)} · ${esc(project.year)}</span>
    </a>
  </article>`;
}

function docsGroup(project) {
  return `<div class="docs-group" style="--group-accent:${project.accent}">
    <div class="docs-group-head">
      <div><span class="dot"></span><strong>${esc(project.name)}</strong><small>${project.docs.length} 份文档</small></div>
      <a class="text-link muted" href="${docsUrl(project)}">全部 ${icon('arrow')}</a>
    </div>
    <div class="docs-links">
      ${project.docs.map((doc) => `<a href="${docUrl(doc)}"><span>${esc(doc.label)}</span><strong>${esc(doc.title)}</strong><em>${esc(doc.summary)}</em>${icon('upRight')}</a>`).join('')}
    </div>
  </div>`;
}

export function renderHome({ profile, projects, stats = {} }) {
  const latest = projects[0];
  const content = `
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <div class="eyebrow">AI 产品经理 · 作品集 2026</div>
        <div class="availability"><span class="pulse"></span>${esc(profile.status)} · ${esc(profile.location)}</div>
        <h1>${esc(profile.hero.line1)}<br><span>${esc(profile.hero.line2)}</span></h1>
        <p class="hero-desc">${esc(profile.hero.desc)}</p>
        <div class="hero-actions">
          <a class="btn btn-ink" href="#work">查看作品 ${icon('arrow')}</a>
          <a class="btn btn-line" href="mailto:${esc(profile.email)}">聊聊机会 ${icon('mail')}</a>
        </div>
      </div>
      <aside class="hero-side">
        <div class="side-label">NOW</div>
        <div class="side-card">
          <div class="side-row"><span>方向</span><strong>${esc(profile.focus)}</strong></div>
          <div class="side-row"><span>坐标</span><strong>${esc(profile.location)}</strong></div>
          <div class="side-row"><span>状态</span><strong>${esc(profile.status)}</strong></div>
          <div class="side-note">${esc(profile.availability)}</div>
          <a class="text-link" href="${u('/contact')}">发一封邮件 ${icon('arrow')}</a>
        </div>
        <div class="side-index">01 — 02</div>
      </aside>
    </div>
  </section>

  <section class="section" id="work">
    <div class="container">
      ${sectionHead('作品 / SELECTED WORK', '两个 AI 产品，<br>两类真实业务问题。', '一个面向 B 端业务人员的智能问数，一个面向 C 端求职者的 AI 面试教练。共同点是：先把问题拆清楚，再让模型进入流程。', `<span class="section-count">02 PROJECTS</span>`)}
      <div class="projects">${projects.map(projectCard).join('')}</div>
    </div>
  </section>

  <section class="section section-tinted">
    <div class="container">
      ${sectionHead('方法 / HOW I WORK', '我怎么做 AI 产品：<br>先找卡点，再进流程。', '三条反复使用的工作原则：从真实卡点出发，把 AI 放进流程，用指标证明结果。', '')}
      <div class="principles">
        ${profile.principles.map((p) => `<div class="principle"><span>${esc(p.no)}</span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" id="docs">
    <div class="container">
      ${sectionHead('文档 / DOCUMENTATION', '每个项目，<br>五份可以点开的文档。', '不是截图堆砌。README 讲清做什么，PRD 讲清为谁做，架构讲清怎么做，Prompt 讲清模型怎么参与，演示脚本讲清怎么讲。', `<a class="text-link" href="${u('/docs')}">文档总览 ${icon('arrow')}</a>`)}
      <div class="docs-groups">${projects.map(docsGroup).join('')}</div>
    </div>
  </section>

  <section class="section about-section" id="about">
    <div class="container about-grid">
      <div>
        ${sectionHead('关于 / ABOUT', '关于我：<br>做产品，也写代码。', '统计学出身，关于我的经历、工作方式和为什么做这两个项目。')}
        <div class="about-copy">
          <p>我在香港城市大学读统计学，做过三段数据/AI 产品实习：从会员分层、营销归因，到智能问数 Agent 和 AI 面试教练。</p>
          <p>我的舒适区是把一个模糊的业务问题拆成：谁在什么场景下卡住、用什么指标衡量、AI 应该放在哪一步、失败了怎么退。然后把它写成 PRD、画出流程、跑通一个能演示的版本。</p>
          <p>这个站点里的两个项目，一个来自实习，一个是个人项目；产品文档、架构、Prompt 和测试记录都完整保留。</p>
        </div>
        <div class="skill-list">${profile.skills.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
      </div>
      <div class="about-side">
        <div class="about-block">
          <div class="side-label">EXPERIENCE</div>
          ${profile.experience.map((e) => `<div class="timeline-row"><div><strong>${esc(e.company)}</strong><span>${esc(e.role)}</span></div><time>${esc(e.period)}</time><p>${esc(e.summary)}</p></div>`).join('')}
        </div>
        <div class="about-block">
          <div class="side-label">EDUCATION</div>
          ${profile.education.map((e) => `<div class="timeline-row"><div><strong>${esc(e.school)}</strong><span>${esc(e.degree)}</span></div><time>${esc(e.period)}</time></div>`).join('')}
        </div>
      </div>
    </div>
  </section>

  <section class="contact-band">
    <div class="container contact-grid">
      <div>
        <div class="eyebrow">联系 / CONTACT</div>
        <h2>有岗位、项目，<br>或者一个值得聊的问题？</h2>
      </div>
      <div class="contact-side">
        <a class="contact-email" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
        <div class="contact-links">
          <a href="${esc(profile.github)}" target="_blank" rel="noopener">${icon('github')} GitHub</a>
          <a href="${esc(profile.resume)}" target="_blank" rel="noopener">${icon('doc')} 简历</a>
          <a href="${u('/contact')}">${icon('mail')} 留言</a>
        </div>
      </div>
    </div>
  </section>`;
  return layout({
    title: '',
    description: '石浩田，AI 产品经理。作品集：智能问数 Agent、面镜 MockMirror AI 面试教练，含完整 PRD、架构、Prompt 与测试文档。',
    content, profile, active: 'work', canonical: '/'
  });
}

export function renderWork({ project, profile, caseHtml, stats = {}, next }) {
  const docs = project.docs;
  const live = project.demoUrl ? `<a class="btn btn-accent" href="${esc(project.demoUrl)}" target="_blank" rel="noopener">打开 Live Demo ${icon('upRight')}</a>` : '';
  const repo = project.repoUrl ? `<a class="btn btn-line" href="${esc(project.repoUrl)}" target="_blank" rel="noopener">${icon('github')} 源码</a>` : '';
  const content = `
  <section class="work-hero" style="--project-accent:${project.accent};--project-soft:${project.accentSoft}">
    <div class="container">
      <a class="back-link" href="${u('/#work')}">← 全部作品</a>
      <div class="work-kicker"><span>${esc(project.kind)}</span><span>${esc(project.period)}</span><span>${esc(project.team)}</span></div>
      <h1>${esc(project.name)}</h1>
      <p class="work-lede">${esc(project.summary)}</p>
      <div class="work-actions">
        <a class="btn btn-accent" href="#case">阅读案例 ↓</a>
        ${live}${repo}
        <a class="btn btn-line" href="${docsUrl(project)}">${icon('doc')} 项目文档</a>
      </div>
      <div class="work-meta">
        <div><span>角色</span><strong>${esc(project.role)}</strong></div>
        <div><span>时间</span><strong>${esc(project.period)}</strong></div>
        <div><span>类型</span><strong>${esc(project.kind)}</strong></div>
        <div><span>浏览</span><strong>${STATIC_EXPORT ? '—' : (stats.counts?.[project.slug] || 0)}</strong></div>
      </div>
      ${metricRow(project.metrics)}
    </div>
  </section>

  <div class="container">
    <figure class="work-cover"><img src="${esc(u(project.cover))}" alt="${esc(project.coverAlt || project.name)}"><figcaption>${esc(project.coverAlt || '')}</figcaption></figure>
  </div>

  <section class="section" id="case">
    <div class="container case-grid">
      <aside class="case-aside">
        <div class="side-label">CASE STUDY</div>
        <p>${esc(project.problem)}</p>
        <div class="case-outcome"><span>结果</span><strong>${esc(project.outcome)}</strong></div>
        <div class="tag-row">${project.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      </aside>
      <article class="prose case-prose">${caseHtml}</article>
    </div>
  </section>

  ${project.gallery?.length ? `<section class="section section-tinted"><div class="container">${sectionHead('GALLERY', '界面与过程', '')}<div class="gallery">${project.gallery.map((g) => `<figure><img src="${esc(u(g.src))}" alt="${esc(g.caption)}" loading="lazy"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('')}</div></div></section>` : ''}

  <section class="section">
    <div class="container">
      ${sectionHead('DOCUMENTATION', '这个项目的完整文档', '从产品判断到技术实现，五份文档各自回答一个问题。', `<a class="text-link" href="${docsUrl(project)}">文档索引 ${icon('arrow')}</a>`)}
      <div class="doc-cards">
        ${docs.map((doc) => `<a class="doc-card" href="${docUrl(doc)}"><span class="doc-no">${esc(doc.label)}</span><div><strong>${esc(doc.title)}</strong><p>${esc(doc.summary)}</p></div>${icon('arrow')}</a>`).join('')}
      </div>
    </div>
  </section>

  ${next ? `<section class="next-project"><div class="container"><span class="side-label">NEXT PROJECT</span><a href="${projectUrl(next)}"><h2>${esc(next.name)}</h2><span>${esc(next.kind)} ${icon('arrow')}</span></a></div></section>` : ''}`;
  return layout({
    title: project.name,
    description: project.summary,
    content, profile, active: 'work', accent: project.accent, accentSoft: project.accentSoft,
    canonical: `/work/${project.slug}`
  });
}

function demoPanel(q, index, active) {
  return `<div class="demo-question-panel" data-panel="${esc(q.id)}" ${active ? '' : 'hidden'}>
    <div class="demo-question-head">
      <div><span class="demo-label">QUESTION</span><h3>${esc(q.question)}</h3></div>
      <span class="demo-latency">${esc(q.latency || '—')} · ${esc(q.scanned || '')}</span>
    </div>
    <p class="demo-answer">${esc(q.answer)}</p>
    <div class="demo-sql">
      <div class="demo-sql-head"><span>SQL · Query Checking passed</span><button class="copy-sql" data-copy type="button">${icon('copy')} 复制</button></div>
      <pre><code>${esc(q.sql)}</code></pre>
    </div>
    <div class="demo-result">
      <div class="demo-result-head"><span>RESULT</span><span>模拟数据 · 已脱敏</span></div>
      <div class="table-wrap"><table><thead><tr>${q.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${q.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    </div>
    <div class="demo-checks">${q.checks.map((c) => `<div class="demo-check"><span class="check-icon">${icon('shield')}</span><div><strong>${esc(c.label)}</strong><small>${esc(c.detail)}</small></div></div>`).join('')}</div>
    <div class="demo-evidence"><span class="demo-label">RETRIEVED EVIDENCE</span><ul>${q.evidence.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>
  </div>`;
}

export function renderDemo(demo) {
  if (!demo?.questions?.length) return '';
  const json = JSON.stringify(demo).replace(/</g, '\\u003c');
  return `<div class="demo" data-demo>
    <div class="demo-top"><div><span class="demo-label">INTERACTIVE DEMO</span><h2>${esc(demo.title || '问数控制台')}</h2></div><span class="demo-badge">模拟数据</span></div>
    <div class="demo-tabs" role="tablist">
      ${demo.questions.map((q, i) => `<button class="demo-tab ${i === 0 ? 'active' : ''}" data-target="${esc(q.id)}" role="tab" aria-selected="${i === 0}">${esc(q.label)}</button>`).join('')}
    </div>
    <div class="demo-panels">${demo.questions.map((q, i) => demoPanel(q, i, i === 0)).join('')}</div>
    <p class="demo-note">${esc(demo.note || '')}</p>
    <script type="application/json" id="demoData">${json}</script>
  </div>`;
}

export function renderDocsIndex({ profile, projects, allDocs }) {
  const content = `
  <section class="page-hero">
    <div class="container">
      <div class="eyebrow">DOCUMENTATION</div>
      <h1>文档不是交付物，<br>是思考的痕迹。</h1>
      <p>每个项目五份文档：README、PRD、架构、Prompt、演示脚本。它们回答的不是“做了什么”，而是“为什么这么做、怎么验证、失败了怎么办”。</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="docs-search"><input id="docsSearch" type="search" placeholder="搜索文档标题、项目或关键词…" aria-label="搜索文档"><span>${allDocs.length} 份文档</span></div>
      <div class="all-docs" id="allDocs">
        ${projects.map((project) => `<div class="all-docs-group" data-project="${esc(project.name)}">
          <div class="all-docs-head"><span class="dot" style="background:${project.accent}"></span><h2>${esc(project.name)}</h2><small>${esc(project.kind)}</small><a class="text-link muted" href="${projectUrl(project)}">项目案例 ${icon('arrow')}</a></div>
          <div class="all-docs-list">
            ${project.docs.map((doc) => `<a class="all-doc" href="${docUrl(doc)}" data-search="${esc(`${project.name} ${doc.title} ${doc.summary}`.toLowerCase())}"><span>${esc(doc.label)}</span><div><strong>${esc(doc.title)}</strong><p>${esc(doc.summary)}</p></div><em>${doc.readingMinutes} min</em>${icon('arrow')}</a>`).join('')}
          </div>
        </div>`).join('')}
      </div>
      <div class="empty-search" id="emptySearch" hidden>没有找到匹配的文档。</div>
    </div>
  </section>`;
  return layout({
    title: '文档',
    description: '面镜 MockMirror 与智能问数 Agent 的完整产品文档：README、PRD、架构、Prompt 与演示脚本。',
    content, profile, active: 'docs', canonical: '/docs'
  });
}

export function renderDocsHome({ project, profile }) {
  const content = `
  <section class="page-hero">
    <div class="container" style="--project-accent:${project.accent}">
      <a class="back-link" href="${projectUrl(project)}">← ${esc(project.name)}</a>
      <div class="eyebrow">DOCUMENTATION</div>
      <h1>${esc(project.name)} 文档</h1>
      <p>${esc(project.summary)}</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="doc-cards">
        ${project.docs.map((doc) => `<a class="doc-card" href="${docUrl(doc)}" style="--project-accent:${project.accent}"><span class="doc-no">${esc(doc.label)}</span><div><strong>${esc(doc.title)}</strong><p>${esc(doc.summary)}</p><small>${doc.readingMinutes} min read · 更新于 ${dt(doc.updated)}</small></div>${icon('arrow')}</a>`).join('')}
      </div>
    </div>
  </section>`;
  return layout({
    title: `${project.name} 文档`,
    description: project.summary,
    content, profile, active: 'docs', accent: project.accent, accentSoft: project.accentSoft,
    canonical: `/work/${project.slug}/docs`
  });
}

function docSidebar(project, current, projects) {
  const other = projects.find((p) => p.slug !== project.slug);
  return `<aside class="doc-side">
    <a class="back-link" href="${projectUrl(project)}">← 项目案例</a>
    <div class="doc-side-title">${esc(project.name)}</div>
    <nav class="doc-side-nav">
      ${project.docs.map((doc) => `<a href="${docUrl(doc)}" class="${doc.slug === current.slug ? 'active' : ''}"><span>${esc(doc.label)}</span>${esc(doc.title)}</a>`).join('')}
    </nav>
    ${other ? `<div class="doc-side-other"><span class="side-label">另一个项目</span><a href="${docsUrl(other)}">${esc(other.name)} 文档 ${icon('arrow')}</a></div>` : ''}
  </aside>`;
}

export function renderDoc({ project, doc, profile, projects, toc, html, feedback = { yes: 0, no: 0 } }) {
  const prev = doc.prev;
  const next = doc.next;
  const content = `<div class="container doc-shell">
    ${docSidebar(project, doc, projects)}
    <article class="doc-main" data-doc="${esc(project.slug)}/${esc(doc.slug)}">
      <div class="doc-breadcrumb"><a href="${u('/docs')}">文档</a><span>/</span><a href="${docsUrl(project)}">${esc(project.name)}</a><span>/</span><span>${esc(doc.title)}</span></div>
      <div class="doc-title-row">
        <div><div class="eyebrow">${esc(project.kind)} · ${esc(doc.label)}</div><h1>${esc(doc.title)}</h1><p class="doc-summary">${esc(doc.summary)}</p></div>
      </div>
      <div class="doc-meta"><span>${doc.readingMinutes} min read</span><span>更新于 ${dt(doc.updated)}</span><span>${esc(project.name)}</span></div>
      <div class="prose" id="docContent">${html}</div>
      <div class="doc-feedback" data-feedback data-project="${esc(project.slug)}" data-doc="${esc(doc.slug)}">
        <span>这篇文档有帮助吗？</span>
        <button data-helpful="1">${icon('check')} 有帮助 <em>${feedback.yes || 0}</em></button>
        <button data-helpful="0">需要补充 <em>${feedback.no || 0}</em></button>
        <small>反馈会写入 Neon，用于判断文档是否需要重写。</small>
      </div>
      <nav class="doc-pager">
        ${prev ? `<a href="${docUrl({ ...prev, projectSlug: project.slug })}"><span>上一篇</span><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
        ${next ? `<a href="${docUrl({ ...next, projectSlug: project.slug })}" class="next"><span>下一篇</span><strong>${esc(next.title)}</strong></a>` : '<span></span>'}
      </nav>
    </article>
    <aside class="doc-toc">
      <div class="side-label">ON THIS PAGE</div>
      <nav>${toc.map((h) => `<a href="#${esc(h.id)}" class="lvl-${h.level}">${esc(h.text)}</a>`).join('')}</nav>
    </aside>
  </div>`;
  return layout({
    title: `${doc.title} · ${project.name}`,
    description: doc.summary,
    content, profile, active: 'docs', accent: project.accent, accentSoft: project.accentSoft,
    canonical: `/work/${project.slug}/docs/${doc.slug}`
  });
}

export function renderContact({ profile, dbMode }) {
  const content = `
  <section class="page-hero contact-hero">
    <div class="container">
      <div class="eyebrow">CONTACT</div>
      <h1>有岗位、项目，<br>或者一个值得聊的问题？</h1>
      <p>我通常会在 24 小时内回复。也可以直接发邮件，或者通过下面的表单留言。</p>
      <div class="contact-direct">
        <a href="mailto:${esc(profile.email)}">${esc(profile.email)} ${icon('upRight')}</a>
        <span>${esc(profile.phone)}</span>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container contact-form-grid">
      <div class="contact-form-wrap">
        <form id="contactForm" class="contact-form" novalidate>
          <div class="form-row">
            <label>怎么称呼你<input name="name" maxlength="80" required autocomplete="name" placeholder="你的名字"></label>
            <label>邮箱<input name="email" type="email" maxlength="160" required autocomplete="email" placeholder="you@example.com"></label>
          </div>
          <label>想聊什么<textarea name="message" rows="6" maxlength="3000" required placeholder="岗位、项目、合作，或者只是想交流一个想法…"></textarea></label>
          <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="form-foot"><button class="btn btn-ink" type="submit">发送留言 ${icon('arrow')}</button><span id="formStatus" role="status"></span></div>
          <p class="form-note">留言保存到 Neon Postgres；不会用于营销，也不会分享给第三方。${STATIC_EXPORT ? '静态预览：表单将改为邮件发送；完整表单在 Render 版本中写入 Neon。' : `当前存储：${dbMode === 'neon' ? 'Neon' : '本地开发兜底'}。`}</p>
        </form>
      </div>
      <aside class="contact-aside">
        <div class="side-label">ELSEWHERE</div>
        <a href="${esc(profile.github)}" target="_blank" rel="noopener">${icon('github')} GitHub <span>Tomo-Efficient</span></a>
        <a href="${esc(profile.resume)}" target="_blank" rel="noopener">${icon('doc')} 在线简历 <span>tomo-efficient.github.io</span></a>
        <a href="mailto:${esc(profile.email)}">${icon('mail')} 邮箱 <span>${esc(profile.email)}</span></a>
        <div class="contact-availability"><span class="pulse"></span>${esc(profile.availability)}</div>
      </aside>
    </div>
  </section>`;
  return layout({
    title: '联系',
    description: '联系石浩田，聊聊 AI 产品、数据产品或岗位机会。',
    content, profile, active: 'contact', canonical: '/contact'
  });
}

export function renderAbout({ profile, projects }) {
  const content = `
  <section class="page-hero">
    <div class="container">
      <div class="eyebrow">ABOUT</div>
      <h1>统计学出身，<br>做产品，也写代码。</h1>
      <p>${esc(profile.hero.desc)}</p>
    </div>
  </section>
  <section class="section">
    <div class="container about-page-grid">
      <div class="prose about-prose">
        <h2>我在做什么</h2>
        <p>我在香港城市大学读统计学，2027 届。过去三段实习分别在大数据、服饰品牌和金融科技平台，做的都是同一件事：把业务问题变成可以用数据验证的产品。</p>
        <p>最近一年，我重点做 AI 应用：智能问数 Agent 让业务人员用自然语言取数；面镜 MockMirror 让求职者用自己的简历做模拟面试。两个项目一个 B 端、一个 C 端，但都绕不开三个问题：模型在哪个环节、结果怎么评估、失败怎么退。</p>
        <h2>我的工作方式</h2>
        <p>先访谈，再画流程；先定指标，再做界面；先跑一个可演示的窄版本，再扩能力。写 PRD 的时候我会同时写验收标准，做 Demo 的时候我会同时准备降级路径。</p>
        <p>技术不是我的身份标签，但它让我能和研发、算法对话，也让我能把想法做成能点开的原型。这个站点的两个项目，代码、文档和测试记录都可以在 GitHub 找到。</p>
        <div class="about-links"><a class="text-link" href="${esc(profile.github)}" target="_blank" rel="noopener">${icon('github')} GitHub ${icon('upRight')}</a><a class="text-link" href="${esc(profile.resume)}" target="_blank" rel="noopener">${icon('doc')} 在线简历 ${icon('upRight')}</a></div>
      </div>
      <aside class="about-facts">
        <div class="side-label">QUICK FACTS</div>
        <div class="fact"><span>方向</span><strong>${esc(profile.focus)}</strong></div>
        <div class="fact"><span>坐标</span><strong>${esc(profile.location)}</strong></div>
        <div class="fact"><span>状态</span><strong>${esc(profile.status)}</strong></div>
        <div class="fact"><span>项目</span><strong>${projects.length} 个 AI 产品</strong></div>
        <div class="side-label" style="margin-top:28px">SKILLS</div>
        <div class="skill-list">${profile.skills.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
      </aside>
    </div>
  </section>
  <section class="section section-tinted"><div class="container">
    ${sectionHead('EXPERIENCE', '做过的事', '')}
    <div class="experience-list">${profile.experience.map((e) => `<div class="experience-row"><time>${esc(e.period)}</time><div><h3>${esc(e.company)} <span>${esc(e.role)}</span></h3><p>${esc(e.summary)}</p></div></div>`).join('')}</div>
  </div></section>`;
  return layout({
    title: '关于',
    description: '石浩田，香港城市大学统计学硕士，AI 产品经理。',
    content, profile, active: 'about', canonical: '/about'
  });
}

export function renderNotFound({ profile }) {
  const content = `<section class="notfound"><div class="container"><div class="eyebrow">404</div><h1>这个页面不存在。</h1><p>可能链接过期了，也可能是我还没写。</p><a class="btn btn-ink" href="${u('/')}">回到首页 ${icon('arrow')}</a></div></section>`;
  return layout({ title: '404', description: '页面不存在', content, profile, canonical: '/404' });
}
