# YixuanWang portfolio

网站本体位于 **`site/`**：原生 HTML、CSS 和少量 JavaScript。没有 Astro、React 或 TypeScript 运行依赖，不需要 npm 安装、代码生成或构建即可部署。

已保留首页、完整 Digital Decay 案例、其他三个项目的概览、机械臂仿真原型概览、公开 CV、原有样式与整理好的展示素材。首页与公开 CV 已按 2026-11-19 的新版简历同步，工作资料使用局部拼贴展示。

网站固定地址：https://yixuanwang77.github.io/portfolio/

GitHub 仓库：https://github.com/YixuanWang77/portfolio

## 直接打开

双击 **`site/index.html`** 即可查看首页。嵌套案例使用显式 `index.html` 相对链接，直接打开、常规静态服务器和 GitHub Pages 子路径均可使用。

- 首页：`site/index.html`
- Digital Decay：`site/projects/digital-decay/index.html`
- 公开 CV：`site/cv/index.html`

核心正文、导航、图片和展开工作经历不依赖 JavaScript。JavaScript 负责媒体弹窗、点击播放、图片放大与打印。

## 本地视频预览（可选工具，不是部署要求）

现有处理后的视频仍在被忽略的 `.local/media/`。如需本地播放，在项目根目录执行：

```powershell
node scripts/serve.mjs
```

打开 http://127.0.0.1:4321/ ，或 http://127.0.0.1:4321/projects/digital-decay/ 。按 Ctrl+C 停止。

此工具使用本机已有 Node，只读取并服务 `site/`，**不生成、编译或改写任何网站文件**。它在内存中为 `config.js` 补充两个已存在的视频地址，只允许对应视频的指定路径，不开放整个 `.local/` 或原始素材目录。修改 HTML / CSS / JS 后直接刷新即可。

直接双击 HTML 或将 `site/` 部署到静态托管时，正式视频地址默认未配置，演示按钮保持隐藏。不存在空按钮或假视频路径。无需现在注册存储服务。

模拟正式静态配置：

```powershell
node scripts/serve.mjs --public-only
```

模拟 GitHub Pages 项目子路径：

```powershell
$env:PREVIEW_BASE='/portfolio-review/'
$env:PORT='4322'
node scripts/serve.mjs --public-only
```

此时打开 http://127.0.0.1:4322/portfolio-review/ 。这些变量只影响本地预览，不会修改网站。

## 编辑位置

| 文件 | 用途 |
| --- | --- |
| `site/index.html` | 首页的开场、背景、转向、项目概览、奖项与技能 |
| `site/projects/digital-decay/index.html` | 完整案例正文、统计、表格、图注与引用 |
| `site/projects/<project>/index.html` | 各项目独立页面，保留原项目目录地址 |
| `site/cv/index.html` | 单独整理的公开 CV 文字版 |
| `site/config.js` | 集中的视频地址、封面、版本、说明及机械臂未来章节预留 |
| `site/app.js` | 原生 dialog、点击加载、键盘关闭与焦点恢复 |
| `site/styles.css` | 全站编辑式样式、响应式、reduced-motion 和打印样式 |
| `site/assets/` | 挑选和整理过的展示图、文字分享卡、公开 CV PDF |
| `docs/MATERIALS.md` | 原材料清单、图像来源与事实取舍 |
| `docs/REVIEW.md` | 待确认事实、缺少素材及验证记录 |

**HTML 就是源文件**，编辑后直接保存、刷新或发布，不需要另跑命令。首页概览与对应案例是各自的 HTML，改项目名、状态或摘要时请同步检查两处。页面标题、description、分享信息在各文件的 head 中。

Digital Decay 案例中的 React / TypeScript 是对原项目原型的真实技术记录，不是本作品集网站所用的技术。

## GitHub Pages：固定链接与自动更新

`.github/workflows/pages.yml` 在 `main` 分支的 `site/` 或部署配置更新后自动发布，也保留手动 `workflow_dispatch`。工作流直接上传 `site/`，不运行 npm、Node 安装或网站构建。

仓库的 Settings → Pages → Source 使用 GitHub Actions。该方式依据 [GitHub Pages 官方自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) 配置。

日后更新网站：

1. 编辑 `site/` 中的页面、样式或图片；本地刷新确认。
2. 在项目根目录执行 `node scripts/check.mjs`。
3. 将修改提交并推送到 `main`。GitHub Actions 会自动部署，无需另建仓库或更换网址。
4. 等仓库 Actions 中的部署成功后，刷新网站即可看到更新。已经打开的页面需要刷新；GitHub Pages 的缓存可能需要几分钟更新。

仅在本地保存文件不会更新线上网站。项目页面地址保持不变时，已分享的首页和项目链接会继续访问新版本。不要随意重命名 `portfolio` 仓库或项目目录；如需改地址，应同时保留旧地址的跳转。

发布目录只选 `site/`，不要发布整个工作目录。`source-materials/`、`.local/` 和 `docs/` 内部笔记均已忽略，不上传到公开仓库。公开仓库保存网站源码、部署配置与维护脚本。

所有页面和资源使用相对路径，无需替换仓库名或执行 base-path 构建。`/projects/digital-decay/` 和其他项目目录仍然有效，也可直接访问其 `index.html` 并刷新。未来更换域名或静态托管，直接发布相同 `site/` 文件即可。

后续可将页面中的 `og:image` 设为对应绝对 URL，并添加 canonical / `og:url` 和 sitemap，以完善跨平台分享与索引。404 页面已为 `/portfolio/` 设置基础路径，嵌套的未知地址仍可返回首页；如果更换部署子路径，需同步更新该页的 `<base>`。

加拿大、美国、中国大陆的网络可达性与视频线路仍需实测，不承诺任何海外托管在中国大陆始终稳定。

## 视频配置、替换与缓存

`site/config.js` 的 `media['digital-decay']` 集中存储 sources、poster、version、updated、duration 和文字概览。正式配置的 sources 默认为 `[]`，按钮隐藏。确认托管后，填入真实地址，例如下列结构中的值应使用你实际上传的文件：

```javascript
sources: [
  { src: '你的实际 HTTPS 视频地址', type: 'video/mp4' }
]
```

也可同时配置 WebM 与 MP4，或配置放入网站目录的已确认公开小视频。相对地址按网站根目录解析，封面也支持真实 HTTPS 地址。修改配置、刷新或重新发布文件即可，**项目网页链接不会改变**。

目前的本地版本继续复用上一轮已处理的文件：

- WebM：VP9 / Opus，1920×1200，约 15.2 MB。
- MP4：H.264 / AAC fast-start 兼容版，2304×1440，约 72.3 MB，保留原视频压缩流画面质量。

原视频和 PDF 未修改。当前视频已有画面内英文说明，案例有文字概览；独立字幕轨、BGM 展示授权及真机兼容性仍需上线前确认。

更新资源时使用版本文件名（如 `digital-decay-demo-v2.mp4`），再更新配置中的地址、版本和日期。视频可采用长缓存，HTML / config.js 使用重新验证或短缓存，避免覆盖同一 URL 后旧缓存继续播放。存储需核对 HTTPS、Content-Type、Range / 206 及手机播放。

机械臂依据新版 CV 标为 Simulation prototype，记录 Unity UR3、ROS、Docker 和预训练姿态估计模型的仿真实现，不表示完成实体机械臂。截图和视频仍待补充；配置保留相应数组与未来章节，不填入不存在的演示地址。

## 可选检查工具

这些工具只帮助维护，不是网站运行或部署依赖，不会生成网页，也不需要安装包：

```powershell
node scripts/check.mjs
```

它检查 8 个页面的语法、根路径及子路径链接、锚点、图片变体、原始素材隔离、首页顺序，以及工作流确实不安装或构建。

本地视频预览运行时：

```powershell
node scripts/test-site.mjs
```

浏览器 QA 使用已有 Chrome 和开发工具协议；脚本及截图在 `scripts/` 与被忽略的 `.local/qa/`。不需要为浏览网站安装浏览器测试库。

## 素材与旧成果

原始材料保留在 `source-materials/`，提取中间件和处理后本地视频保留在 `.local/`。首页的两张 900×660 无边框拼贴均取自 `source-materials/CV/`。左侧展示商业室内照片局部，右侧保留图纸局部原有的线条和标注。公司资料使用合成图展示，不提供完整布局、原尺寸单图或放大入口。

先前 12 个工作图片与图纸公开副本已从当前 `site/` 撤下，私有本地原件保持原样。旧提交中的文件和已经形成的缓存不因当前文件删除而自动清除。本次未处理新视频或安装工具。

旧的 TypeScript 内容源、生成器、重复输出和 package.json 已留档于 `.local/legacy-generator/`，供本地追溯，不是当前网站的编辑或部署来源。没有删除原始材料，也没有为技术迁移删减案例内容或简化设计。

各页面的 CV PDF 下载链接指向 `site/assets/yixuan-wang-cv.pdf`，该文件使用用户提供的 `YixuanWang_CV.pdf` 原件。更新下载文件时，将指定的新版 PDF 复制到同一路径。`site/cv/index.html` 是独立的网页版本。
