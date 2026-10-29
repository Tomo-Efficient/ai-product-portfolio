# 部署手册

## 0. 前置

- GitHub 账号（仓库：`Tomo-Efficient/ai-product-portfolio`）
- Neon 账号（免费版即可）
- Render 账号（推荐）或 Vercel 账号

## 1. 推 GitHub

```bash
cd portfolio
git init
git add .
git commit -m "feat: AI product portfolio"
gh repo create Tomo-Efficient/ai-product-portfolio --public --source=. --push
```

## 2. Neon

1. 新建 Project，选择离用户最近的 Region。
2. 复制 **Pooled connection string**，形如：
   `postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
3. 不需要手动建表：应用启动时执行 `db/schema.sql` 中的 `CREATE TABLE IF NOT EXISTS`。
4. 当前仓库已用 Neon CLI 初始化；`neon deploy` 会把 `DATABASE_URL` 写入 `.env.local`，本地 `npm start` 自动加载。
5. 验证：

```bash
npm run db:check
curl https://<your-domain>/healthz
```

返回 `"db":"neon"` 即连接成功。若显示 `local`，检查 `DATABASE_URL` 是否带 `sslmode=require`、是否用了 pooler 地址。

## 3. Render

### 方式 A：Blueprint

仓库根目录有 `render.yaml`。在 Render 选择 **New → Blueprint**，连接仓库，按提示填写：

| 变量 | 值 |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string（必填） |
| `SITE_URL` | 可选；自定义域名时才填，否则自动用 `RENDER_EXTERNAL_URL` |
| `COACH_DEMO_URL` | 可选；AI 面试教练 Demo 地址 |

部署完成后访问：

- `/` 作品集
- `/healthz` 健康检查
- `/sitemap.xml`

### 方式 B：Docker

```bash
docker build -t portfolio .
docker run -p 3000:3000 \
  -e DATABASE_URL='postgresql://...' \
  -e SITE_URL='https://your-domain' \
  portfolio
```

## 4. Vercel（可选）

仓库已包含：

- `api/index.js`：把 Node handler 暴露为 Vercel Function
- `vercel.json`：所有请求交给函数处理，并把 `content/**`、`public/**` 打包进函数

步骤：

1. Vercel → Add New → Project → 导入 GitHub 仓库。
2. Framework Preset 选 **Other**，Build Command 留空，Output Directory 留空。
3. 环境变量只填 `DATABASE_URL`；`SITE_URL` 可选。
4. Deploy。

> 注意：Vercel 的 serverless 适配已经写好，但本机没有 Vercel 凭据，未做真实线上验证；Render 为已验证路径。

## 5. AI 面试教练 Demo（可选）

面镜 MockMirror 是独立 Node 服务（仓库 `Tomo-Efficient/mockmirror`），需要单独部署：

1. 在 Render 新建 Web Service，连接 `mockmirror` 仓库。
2. Build：`npm install`；Start：`npm start`；健康检查：`/api/health`。
3. 在作品集的 Render 环境变量里设置 `COACH_DEMO_URL=https://<mockmirror>.onrender.com`。
4. 重新部署作品集，项目页会出现 **Live Demo** 按钮。

> MockMirror 默认把数据写在 `data/store.json`；Render 免费实例重启会丢数据。如果需要持久化，挂载 Render Disk（付费）或把它接到 Postgres。

## 6. 自定义域名

1. Render/Vercel 绑定域名后，把 `SITE_URL` 改成正式域名。
2. 重新部署（sitemap、canonical、OG 会使用 `SITE_URL`）。

## 7. 上线检查清单

- [ ] `/healthz` 返回 `db: neon`
- [ ] 首页两个项目卡片可点
- [ ] `/docs` 能搜索
- [ ] 每篇文档能打开，目录可跳转
- [ ] 联系表单提交后 Neon `portfolio_contacts` 有记录
- [ ] 文档反馈写入 `portfolio_doc_feedback`
- [ ] 项目页浏览数递增
- [ ] 移动端 390px 无横向滚动
- [ ] 404 页面正常
- [ ] `robots.txt` / `sitemap.xml` 可访问
