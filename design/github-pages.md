# 双版本 GitHub Pages 发布

## 地址与来源

- `/aya-draglayout/`：仓库 `docs/` 的旧版已构建文件，保留原资源地址与路由。
- `/aya-draglayout/v2/`：`apps/v2/dist/` 的新版静态应用。Vite 使用相对资源路径，可直接部署于子目录。
- `scripts/prepare-pages.mjs` 将两者复制至 `.pages/`，不修改 `docs/`。`.pages/` 已忽略，不提交构建产物。

## 首次启用

1. 将包含 `.github/workflows/pages.yml` 的改动提交并推送至 `codex/v2`。
2. 在仓库 Settings → Pages → Build and deployment 中将 Source 设为 **GitHub Actions**。切换前记录当前分支与目录，便于回退。
3. 检查 Settings → Environments → github-pages 的部署分支规则，允许 `codex/v2`。
4. 推送后工作流自动运行；如之前因设置失败，在 Actions 中重新运行。`workflow_dispatch` 的网页手动入口通常需要工作流已存在于默认分支。
5. 确认工作流 deploy 成功，再访问两个地址，验证旧版入口、新版拖拽、生成预览和 JSON 导出。成功后将 README 中新版的“首次部署后可访问”改为“在线预览”。

当前只允许 `codex/v2` 部署，避免 master 与开发分支相互覆盖。拉取请求和 master 推送执行测试及构建，不部署。未来新版成为主版本时，应同时调整部署分支条件、触发分支与 Environment 规则。

首次配置不需要模型密钥或额外 PAT；部署任务使用 GitHub 提供的 GITHUB_TOKEN 与 OIDC 权限。尚未确认当前远程 Pages 发布源，未登录的 Pages API 返回 404 不能证明站点未启用。

## 本地验证发布产物

```sh
cd apps/v2
npm ci
npm test
npm run build
cd ../..
node scripts/prepare-pages.mjs
```

测试子目录时，将 `.pages/` 挂载在静态服务器的 `/aya-draglayout/` 下；旧版资源使用该绝对前缀。直接在服务器根目录打开旧版，不能代表实际 Pages 路径。

v2 为纯前端应用，页面数据仅在内存中。刷新前需导出。当前模拟生成完全在本地运行；GitHub Pages 不提供模型代理后端。

## 回退

发布异常时，先保留失败日志。可重新运行上一个成功部署，或将 Pages Source 恢复为切换前记录的分支与目录。不要为了回退去覆盖旧版源码或重新安装其依赖；现有 `docs/` 已保留。若恢复为分支发布，应停用此 Actions 部署任务，避免两套发布流程竞争。

旧版 history 路由的深链接刷新问题沿用旧版现状，本次不引入全站 404 重写，以免影响 `/v2/`。
