const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// header
const header = $('.site-header');
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// mobile nav
const menuBtn = $('#menuBtn');
const mobileNav = $('#mobileNav');
menuBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.innerHTML = open
    ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
    : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
});
$$('#mobileNav a').forEach((a) => a.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}));

// docs search
const search = $('#docsSearch');
if (search) {
  const groups = $$('.all-docs-group');
  const rows = $$('.all-doc');
  const empty = $('#emptySearch');
  const filter = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    rows.forEach((row) => {
      const hit = !q || (row.dataset.search || '').includes(q);
      row.hidden = !hit;
      if (hit) shown += 1;
    });
    groups.forEach((group) => {
      const any = $$('.all-doc', group).some((r) => !r.hidden);
      group.hidden = !any;
    });
    if (empty) empty.hidden = shown !== 0;
  };
  search.addEventListener('input', filter);
}

// contact form
const isStatic = document.body.dataset.static === 'true';
const form = $('#contactForm');
if (form) {
  const status = $('#formStatus');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (isStatic) {
      const subject = encodeURIComponent('来自作品集的联系');
      const body = encodeURIComponent(`姓名：${data.name || ''}\n邮箱：${data.email || ''}\n\n${data.message || ''}`);
      window.location.href = `mailto:s18538218915@163.com?subject=${subject}&body=${body}`;
      status.textContent = '已打开邮件客户端；也可以直接发到 s18538218915@163.com';
      status.className = 'ok';
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    status.textContent = '发送中…';
    status.className = '';
    btn.disabled = true;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || '发送失败');
      form.reset();
      status.textContent = '收到了，我会尽快回复。';
      status.className = 'ok';
    } catch (err) {
      status.textContent = `${err.message}。也可以直接发邮件到 s18538218915@163.com`;
      status.className = 'error';
    } finally {
      btn.disabled = false;
    }
  });
}

// doc feedback
$$('[data-feedback]').forEach((box) => {
  const project = box.dataset.project;
  const doc = box.dataset.doc;
  $$('button[data-helpful]', box).forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      if (isStatic) {
        box.classList.add('done');
        btn.innerHTML = '静态预览暂不收集反馈';
        return;
      }
      $$('button', box).forEach((b) => { b.disabled = true; });
      const helpful = btn.dataset.helpful === '1';
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project, doc, helpful })
        });
        if (!res.ok) throw new Error();
        box.classList.add('done');
        btn.innerHTML = helpful ? '谢谢反馈 ✓' : '收到，会补充';
        const em = btn.querySelector('em');
        if (em) em.textContent = String(Number(em.textContent || 0) + 1);
      } catch {
        $$('button', box).forEach((b) => { b.disabled = false; });
        btn.innerHTML = '提交失败，请稍后再试';
      }
    });
  });
});

// smart query demo
$$('[data-demo]').forEach((demo) => {
  const tabs = $$('.demo-tab', demo);
  const panels = $$('.demo-question-panel', demo);
  const activate = (id) => {
    tabs.forEach((t) => {
      const on = t.dataset.target === id;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
    panels.forEach((p) => { p.hidden = p.dataset.panel !== id; });
  };
  tabs.forEach((tab) => tab.addEventListener('click', () => activate(tab.dataset.target)));

  $$('[data-copy]', demo).forEach((btn) => {
    btn.addEventListener('click', async () => {
      const panel = btn.closest('.demo-question-panel');
      const code = panel?.querySelector('.demo-sql code')?.textContent || '';
      try {
        await navigator.clipboard.writeText(code);
        const old = btn.innerHTML;
        btn.textContent = '已复制';
        setTimeout(() => { btn.innerHTML = old; }, 1600);
      } catch {
        btn.textContent = '复制失败';
      }
    });
  });
});

// footer year is server-rendered; keep smooth anchor behavior native
