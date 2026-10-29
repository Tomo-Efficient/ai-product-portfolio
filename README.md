# 石浩田 · AI 产品经理作品集

一个面向 AI 产品 / 数据产品岗位的作品集站点：两个项目、两套完整文档，以及一个可交互的智能问数演示。

> 在线预览：https://tomo-efficient.github.io/ai-product-portfolio/
> 完整版（Neon + 表单写入）：按 [`DEPLOY.md`](DEPLOY.md) 部署到 Render
> 代码：https://github.com/Tomo-Efficient/ai-product-portfolio

## 项目

### 01 · 面镜 MockMirror — AI 面试教练

上传简历与目标 JD，生成只针对你的题单，和三种人格的 AI 面试官完成多轮追问，最后拿到有证据、能执行的复盘报告。

- 80 道题、16 篇教研知识、3 种人格
- 显式状态机 + RAG + 五维评分 + 158 条测试用例
- 文档：README / PRD / 架构 / Prompt / 演示脚本

### 02 · 智能问数 Agent — NL2SQL

让业务人员用自然语言问数：系统理解口径、召回相关表与字段、生成并校验 SQL，最后用文字、数据与图表回答。

- 四层数据准备、复杂度路由、混合检索、Query Checking、AST 安全护栏
- SQL 答案正确率 85%+，分析周期 6h → 30s
- 文档：README / PRD / 架构 / Prompt / 演示脚本
- 页面内置一个可点击的「问题 → SQL → 结果 → 校验」交互演示（模拟数据）

## 技术栈

| 层 | 选型 |
| --- | --- |
| 服务端 | Node.js 原生 HTTP，无 Web 框架 |
| 内容 | Markdown + `marked` 服务端渲染，文档自动生成目录 |
| 前端 | 原生 HTML / CSS / ES Modules，零构建 |
| 数据库 | Neon Postgres（`@neondatabase/serverless` HTTP 驱动） |
| 部署 | Render（主）/ Vercel（可选）/ Docker |
| 测试 | Puppeteer + Node fetch，10 条端到端检查 |

数据库不是装饰：项目浏览、联系表单、文档反馈都会写入 Neon；没有 `DATABASE_URL` 时自动降级到本地 `.data/local-db.json`，保证本地开发可用。

## 本地启动

```bash
cd portfolio
pnpm install      # 或 npm install
pnpm start        # http://localhost:3000
```

不配置数据库也能完整浏览；联系表单/反馈会写入本地 JSON。

### 配置 Neon

1. 在 [Neon](https://neon.tech) 创建项目，复制 **pooled** connection string（带 `sslmode=require`）。
2. 复制 `.env.example` 为 `.env`，填入 `DATABASE_URL`。
3. 重启服务。服务启动时会自动建表（`db/schema.sql`），也可以手动在 Neon SQL Editor 执行。

```bash
DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
SITE_URL=http://localhost:3000
```

判断是否连上：

```bash
curl http://localhost:3000/healthz
# {"ok":true,"db":"neon",...}
```

## 路由

| 路径 | 页面 |
| --- | --- |
| `/` | 首页：Hero、两个项目、工作方式、文档入口、关于、联系 |
| `/work/mockmirror` | 面镜案例 |
| `/work/smart-query` | 智能问数案例（含交互演示） |
| `/work/:project/docs` | 项目文档索引 |
| `/work/:project/docs/:doc` | 文档正文，服务端 Markdown 渲染 |
| `/docs` | 全部文档 + 搜索 |
| `/about` | 关于 |
| `/contact` | 联系表单 |
| `/healthz` | 健康检查与数据库模式 |
| `/sitemap.xml`、`/robots.txt` | SEO |

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/contact` | 联系表单，写入 Neon；限流 5 次/10 分钟 |
| POST | `/api/feedback` | 文档「有帮助 / 需要补充」 |
| POST | `/api/events` | 浏览事件（服务端也会自动记录） |
| GET | `/api/stats` | 各项目浏览数 |

## 数据库

```sql
portfolio_views          -- 项目浏览
portfolio_contacts       -- 联系留言
portfolio_doc_feedback   -- 文档反馈
```

完整定义见 [`db/schema.sql`](db/schema.sql)。连接使用 Neon 的 HTTP 驱动，适配 Render 与 Vercel 的 serverless 环境。

## 部署

### Render（推荐，完整功能）

1. 把仓库推到 GitHub。
2. 在 Render 新建 Blueprint，选择本仓库（会自动读取 `render.yaml`）。
3. 填写环境变量：
   - `DATABASE_URL`：Neon pooled connection string
   - `SITE_URL`：Render 分配的域名
   - `COACH_DEMO_URL`（可选）：AI 面试教练 Demo 的独立地址
4. 部署完成后访问 `/healthz`，确认 `db` 为 `neon`。

也可以使用仓库里的 `Dockerfile` 部署到任意容器平台：

```bash
docker build -t portfolio .
docker run -p 3000:3000 -e DATABASE_URL=... portfolio
```

### Vercel（可选）

仓库包含 `api/index.js` 适配器与 `vercel.json`：

```bash
vercel --prod
```

在 Vercel 项目里配置 `DATABASE_URL`、`SITE_URL`。`vercel.json` 已把 `content/**` 与 `public/**` 打进函数包。

> 说明：Render 是主部署目标；Vercel 的 serverless 适配已写好，但本机没有 Vercel 账号，未做真实部署验证。

### GitHub

```bash
git init
git add .
git commit -m "feat: portfolio"
gh repo create Tomo-Efficient/ai-product-portfolio --public --source=. --push
```

## 目录结构

```text
portfolio/
├── server.js              # 启动入口
├── api/index.js           # Vercel serverless 适配
├── src/
│   ├── app.js             # 路由、API、静态资源
│   ├── views.js           # 页面与组件模板
│   ├── markdown.js        # Markdown 渲染、目录、链接重写
│   ├── content.js         # 项目/文档加载
│   ├── db.js              # Neon + 本地兜底
│   └── config.js
├── content/
│   ├── profile.json
│   └── projects/
│       ├── mockmirror/    # project.json + case-study.md + docs/ + demo/
│       └── smart-query/
├── public/                # CSS / JS / 图片 / favicon
├── db/schema.sql
├── api/index.js           # Vercel serverless 入口
├── .github/workflows/     # GitHub Pages 静态预览
├── tools/                 # 静态构建、封面生成
├── render.yaml
├── vercel.json
└── Dockerfile
```

## 测试

- **静态页面**：25 个内部链接与资源全部 200；390 / 768 / 1024 / 1440 四个宽度无横向溢出。
- **端到端**：10 条检查通过（首页、项目页、浏览计数、文档搜索、Demo 切换、文档反馈、联系表单、404、移动端菜单、移动端溢出）。
- **数据库**：用 `pg-mem` 验证 `db/schema.sql` 与浏览、留言、反馈三类查询可执行。
- **线上预览**：GitHub Pages 静态页已通过 Chrome 实测，两个项目与 10 篇文档可访问。

## 部署链接

- GitHub Pages（静态预览，已上线）：<https://tomo-efficient.github.io/ai-product-portfolio/>
- Render Blueprint：<https://render.com/deploy?repo=https://github.com/Tomo-Efficient/ai-product-portfolio>
- Vercel 导入：<https://vercel.com/new/clone?repository-url=https://github.com/Tomo-Efficient/ai-product-portfolio>

> GitHub Pages 是静态预览：文档、项目页、Demo 都可浏览，但表单与浏览统计不写入数据库。需要在 Render/Vercel 配置 `DATABASE_URL` 才能启用 Neon。

## 内容边界

- 智能问数的生产系统属于招商金科内部项目，代码与数据不对外；本站仅展示脱敏后的方案、指标与交互演示。
- 面镜 MockMirror 是个人项目，演示数据为虚构候选人。
- 联系表单仅用于招聘/合作沟通，不做营销。

## License

MIT
