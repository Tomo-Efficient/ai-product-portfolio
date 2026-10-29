-- 面镜作品集 · Neon Postgres schema
-- 在 Neon SQL Editor 中执行，或由服务启动时自动创建。

CREATE TABLE IF NOT EXISTS portfolio_views (
  id bigserial PRIMARY KEY,
  project_slug text NOT NULL,
  path text NOT NULL,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolio_views_slug_idx ON portfolio_views (project_slug, created_at);

CREATE TABLE IF NOT EXISTS portfolio_contacts (
  id bigserial PRIMARY KEY,
  name varchar(80) NOT NULL,
  email varchar(160) NOT NULL,
  message text NOT NULL,
  source varchar(40) DEFAULT 'portfolio',
  ip_hash varchar(64),
  user_agent text,
  status varchar(20) NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_doc_feedback (
  id bigserial PRIMARY KEY,
  project_slug text NOT NULL,
  doc_slug text NOT NULL,
  helpful boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolio_doc_feedback_doc_idx
  ON portfolio_doc_feedback (project_slug, doc_slug);
