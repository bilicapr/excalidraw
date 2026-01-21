# Excalidraw Cloudflare Workers Edition / Excalidraw Cloudflare Workers 版

This is a modified version of Excalidraw optimized for deployment on **Cloudflare Workers**. It enables the **Share Link** feature using Cloudflare KV storage, eliminating the dependency on the official Excalidraw backend or Firebase.

这是一个 Excalidraw 的修改版本，专门针对 **Cloudflare Workers** 部署进行了优化。它使用 Cloudflare KV 存储实现了 **分享链接 (Share Link)** 功能，从而消除了对 Excalidraw 官方后端或 Firebase 的依赖。

## Features / 功能特性

- 🚀 **Serverless Deployment**: Runs entirely on Cloudflare Workers (Edge Network).
  - **无服务器部署**: 完全运行在 Cloudflare Workers（边缘网络）上。
- 🔗 **Shareable Links**: Fully functional sharing feature using Cloudflare KV.
  - **分享链接**: 使用 Cloudflare KV 实现功能完整的分享功能。
- 🎨 **Core Experience**: All standard Excalidraw features (drawing, export, etc.).
  - **核心体验**: 保留所有 Excalidraw 标准功能（绘图、导出等）。
- 🛠️ **No Firebase Required**: Modified to use local API routes for data persistence.
  - **无需 Firebase**: 修改为使用本地 API 路由进行数据持久化。

## Prerequisites / 前置要求

- [Node.js](https://nodejs.org/) (v18 or later / v18 或更高版本)
- [Yarn](https://yarnpkg.com/) (v1.22.22 or later / v1.22.22 或更高版本)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare CLI)

## Installation / 安装

1.  **Clone the repository / 克隆仓库**:
    ```bash
    git clone <your-repo-url>
    cd excalidraw
    ```

2.  **Install dependencies / 安装依赖**:
    ```bash
    yarn install
    ```

3.  **Login to Cloudflare / 登录 Cloudflare**:
    ```bash
    npx wrangler login
    ```

## Configuration / 配置

### 1. Create a KV Namespace / 创建 KV 命名空间

You need a Cloudflare KV Namespace to store shared drawings.
你需要一个 Cloudflare KV 命名空间来存储分享的绘图数据。

```bash
yarn wrangler kv:namespace create "EXCALIDRAW_KV"
```

Copy the `id` from the output (e.g., `aaf653e38de14c3f8285f1c8a4ee5cb7`).
复制输出中的 `id`（例如 `aaf653e38de14c3f8285f1c8a4ee5cb7`）。

### 2. Update `wrangler.toml` / 更新 `wrangler.toml`

Open `excalidraw-app/wrangler.toml` and update the `kv_namespaces` section with your ID:
打开 `excalidraw-app/wrangler.toml` 并用你的 ID 更新 `kv_namespaces` 部分：

```toml
[[kv_namespaces]]
binding = "EXCALIDRAW_KV"
id = "<YOUR_KV_ID>"
preview_id = "<YOUR_KV_ID>"
```

### 3. Verify Environment Variables / 验证环境变量

Ensure `.env.production` (or your build environment variables) points to the local worker API:
确保 `.env.production`（或你的构建环境变量）指向本地 Worker API：

```env
VITE_APP_BACKEND_V2_GET_URL=/api/v2/
VITE_APP_BACKEND_V2_POST_URL=/api/v2/post/
```

## Local Development / 本地开发

To run the app locally:
在本地运行应用：

```bash
yarn start
```

## Deployment / 部署

To deploy the application to Cloudflare Workers:
将应用部署到 Cloudflare Workers：

```bash
yarn workspace excalidraw-app deploy
```

Once deployed, you will receive a URL (e.g., `https://excalidraw-app.<your-subdomain>.workers.dev` or similar).
部署完成后，你将获得一个 URL（例如 `https://excalidraw-app.<your-subdomain>.workers.dev` 或类似地址）。

## Troubleshooting / 故障排除

-   **Share Link fails / 分享链接失败**: Check if the KV Namespace ID in `wrangler.toml` matches what you created in Cloudflare.
    -   检查 `wrangler.toml` 中的 KV Namespace ID 是否与你在 Cloudflare 中创建的一致。
-   **Build errors / 构建错误**: Ensure you are using the correct Node.js version and have run `yarn install`.
    -   确保你使用的是正确的 Node.js 版本，并且已经运行了 `yarn install`。
-   **Firebase errors / Firebase 错误**: The code has been patched to gracefully handle missing Firebase configuration, but ensure you haven't accidentally re-enabled strict checks.
    -   代码已经过修补，可以优雅地处理缺少 Firebase 配置的情况，但请确保你没有意外重新启用严格检查。

## Original Project / 原项目

This project is a fork of [Excalidraw](https://github.com/excalidraw/excalidraw).
本项目是 [Excalidraw](https://github.com/excalidraw/excalidraw) 的一个分支。
