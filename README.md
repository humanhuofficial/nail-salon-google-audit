# Nail Maps Audit（Real Data）

这是一个基于 **Next.js App Router + Tailwind** 的真实数据版 MVP：  
用户输入美甲店名称 + postcode/area 后，服务端调用 **Google Places API (New)** 并返回真实竞品分析。

## 1) 环境要求

- Node.js 18.18+（推荐 20+）

## 2) Google Maps API Key 获取步骤（精确）

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 新建项目（或选择已有项目）
3. 进入 **APIs & Services → Library**
4. 启用：
   - **Places API**
5. 进入 **APIs & Services → Credentials**
6. 点击 **Create Credentials → API key**
7. 建议马上限制 Key：
   - Application restrictions：可选 `IP addresses`（本地开发可先不设）
   - API restrictions：限制为 `Places API`

## 3) 配置环境变量

在项目根目录新建 `.env.local`：

```bash
GOOGLE_MAPS_API_KEY=你的真实API_KEY
```

> 这个 Key **只在服务端** `app/api/analyze/route.ts` 中使用。  
> 前端不会拿到 Key，也不会直接调用 Google API。

## 4) 本地启动

```bash
cd nail-maps-audit
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 5) 核心请求流程

1. 首页提交 `salonName + area`
2. 前端请求 `POST /api/analyze`
3. 服务器执行：
   - Text Search (New) 先找目标门店
   - 选择最可信匹配结果
   - 使用目标经纬度进行 Nearby Search (New) 找竞品
4. 服务器返回：
   - salon（真实门店）
   - competitors（最多 5 个）
   - analysis（平均评论、评论差距、ranking score、summary）

## 6) 常用命令

```bash
npm run dev
npm run build
npm run start
npm run lint
```
