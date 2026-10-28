# facet

可切换主题的 React 组件库：所有主题共用一套组件结构和 API，主题只是一层 CSS 皮肤，以源码形式通过 shadcn registry 分发。

- 术语：[GLOSSARY.md](./GLOSSARY.md)
- 架构决策：[docs/adr/](./docs/adr/)

## 基本信息

- registry 命名空间：`@facet`，托管在 GitHub，安装方式见「使用」
- 协议：MIT
- 技术栈：Vite、React 19、Tailwind v4、TypeScript、`@base-ui/react`（经由 shadcn 的 Base UI 版组件）

## 使用

registry 托管在 GitHub 仓库 `SuperJony/facet`，有两种装法。

1. 在使用方项目的 `components.json` 里登记 `@facet`，指向仓库里 `shadcn build` 产出的 `public/r/`：

   ```json
   {
     "registries": {
       "@facet": "https://raw.githubusercontent.com/SuperJony/facet/main/public/r/{name}.json"
     }
   }
   ```

   不登记就安装 `@facet/...` 会报 `Unknown registry "@facet"`。本地开发时，`bun run dev` 会在 `http://localhost:5173/r/{name}.json` 提供同样的文件。

2. 安装：`npx shadcn add @facet/button --overwrite`。它会一起装上基线主题（`@facet/theme-base`）。拟物主题另装：`npx shadcn add @facet/theme-skeuo`。

   facet 的 Button 会替换项目里原有的 `ui/button.tsx`（shadcn 初始化时常已装好），所以要加 `--overwrite`。不加的话，CLI 会问 `The file button.tsx already exists. Would you like to overwrite? (y/N)`：选 N，或在非交互环境里运行（命令照样以 0 退出），结果是 `themes/base.css` 已经写入，`ui/button.tsx` 仍是原来的 shadcn 版本，没有任何 `cn-*` 类名和装饰槽，主题对它不起作用。补救办法是加上 `--overwrite` 再装一次。

   也可以不用命名空间，直接按 GitHub 地址装：`npx shadcn add SuperJony/facet/theme-skeuo`。CLI 读取仓库根目录的 `registry.json` 和其中登记的源文件，不读 `public/r/`；默认用默认分支，用 `#<分支、tag 或 commit>` 可以指定版本。`button` 依赖 `@facet/theme-base`，所以用这种方式装 `SuperJony/facet/button` 时，同样要先完成第 1 步的登记。

3. 启用主题。每个主题都要做两步，缺一步按钮就没有外观（背景透明、无圆角）：
   - 在含 `@import "tailwindcss"` 的入口 CSS 里 `@import` 主题文件。主题文件装在 `src/themes/`，项目没有 `src` 目录时装在根目录的 `themes/`。
   - 在祖先元素（比如 `<html>`）上设置 `data-theme="base"` 或 `data-theme="skeuo"`。

- 只支持 Base UI 版的 shadcn 项目（`components.json` 的 `style` 是 `base-*`）。`@facet/button` 会覆盖 `ui/button.tsx`。在 Radix 版项目里，原有组件（如 alert-dialog、pagination）给 Button 传的 `asChild` 会报类型错误。
- 暗色跟随使用方的 `dark` 变体（shadcn 默认是祖先元素上的 `.dark`），两个主题判定方式相同。

### 拟物主题的限制

- **浏览器**：最低 Chrome/Edge 122、Firefox 128、Safari 18（用到 OKLCH 相对颜色、`@property` 和 `color-mix`）。不支持 OKLCH 相对颜色的浏览器算不出 default 和 secondary 的按键面渐变：它们显示纯色的 `--primary`、`--secondary`，default 的描边换成 `color-mix` 调出的深色，悬停和按下时这两种按键面不变色。destructive、outline、ghost 只用到 `color-mix`，在这些浏览器里外观不变。Chrome 119–121 能解析相对颜色，但把 `l` 当成 0–100 来算（MDN 兼容数据，crbug 40940488）。`@supports` 只检查语法，查不出这个问题，所以在这几个版本里 default 的按键面会是 L 约 0.196 的深灰，悬停时反而变暗；文字仍然看得清。
- **default 不完全等于 `--primary`**：亮色下按键面的 OKLCH 亮度至少是 0.371（Tailwind 的 neutral-700），否则接近黑色的 primary 上看不出明暗渐变。
- **换颜色要改变量，不能用 `bg-*`**：这一点和 shadcn 原版、基线主题都不同。拟物的按键面是从颜色变量算出来的渐变（background-image），`bg-<颜色>` 只改 background-color，被渐变盖住，看不出变化（ghost 和 link 没有按键面，destructive 的按键面半透明，这三种会透出 `bg-*` 的颜色）。要换颜色，改按键颜色的来源：default 改 `--primary` 和 `--primary-foreground`；destructive 的按键面是半透明的 `--destructive`，文字也是 `--destructive`，所以只改 `--destructive`。只改一个按钮：

  ```tsx
  <Button className="[--primary:var(--color-blue-600)] [--primary-foreground:white]">保存</Button>
  <Button variant="destructive" className="[--destructive:var(--color-orange-600)]">移除</Button>
  ```

- **其他工具类**：`shadow-*`、`ring-*`、`inset-shadow-*` 会替换整条 box-shadow，五层材质阴影都会消失；焦点环是 outline，不受影响。`bg-none`、`bg-linear-*` 会去掉按键面。
- **焦点环是 outline**：使用方的 `outline-none`、`outline-hidden`，或者全局的 `:focus { outline: none }` 重置，会把拟物的焦点环去掉。基线主题的焦点环是 box-shadow，不受这些影响。
- **材质参数（`--mat-*`）**：在任一祖先元素上设置即可覆盖默认值。每个参数的单位和影响的 variant 写在 `src/themes/skeuo.css` 的文件头；大多数只影响 default。px 参数必须带 `px`，百分比参数写纯数字（9 表示 9%）。写错单位不会报错，只在用到这个参数的 variant 和状态下出问题（"阴影全无"指整条 box-shadow 失效，五层材质阴影一起消失）：

  | 参数和错法 | 后果 |
  |---|---|
  | `--mat-glow-y`、`--mat-glow-blur` 漏了 `px` | default 在静止和悬停时阴影全无 |
  | `--mat-contact-y`、`--mat-contact-blur` 漏了 `px` | 所有有按键面的 variant 在静止和悬停时阴影全无，按下时正常 |
  | `--mat-lift-y`、`--mat-lift-blur`、`--mat-lift-spread` 漏了 `px` | 所有有按键面的 variant 在静止和按下时阴影全无（ghost 悬停时也是） |
  | `--mat-hover-y`、`--mat-hover-blur`、`--mat-hover-spread` 漏了 `px` | default、secondary、outline、destructive 只在悬停时阴影全无 |
  | `--mat-press-blur` 漏了 `px` | 所有有按键面的 variant 只在按下时阴影全无 |
  | `--mat-press-y` 漏了 `px` | 按下时不下沉，阴影正常 |
  | `--mat-face-step`、`--mat-face-split` 多写 `%` | default 在所有状态下渐变失效，显示纯色 `--primary`，描边变成文字颜色 |
  | `--mat-hover-lift` 多写 `%` | default 只在悬停时显示纯色 `--primary`，描边正常 |
  | `--mat-press-darken` 多写 `%` | default 描边变成文字颜色，按下时按键面顶部颜色失效 |
  | `--mat-edge-darken` 多写 `%` | default 描边变成文字颜色 |
  | 不透明度参数多写 `%` | 再被除以 100，几乎看不见：`--mat-glow-alpha: 75%` 是 0.0075，`--mat-edge-alpha: 50%` 是 0.005 |
- **展示站的"复制 CSS"**只导出改过的参数，写在拟物主题的按钮上。亮色改过的参数在暗色那一份里也会带上暗色的值；只在暗色改过的参数只写进暗色那一份。暗色那一份和主题一样，按按钮祖先元素上的 `.dark` 类判断；如果项目用媒体查询或别的选择器切换暗色，要自己把选择器换掉。

## 路线

1. **里程碑 1：Button**。做基线主题和拟物主题，覆盖 6 个 variant 和 8 个 size；`link` 在拟物主题下只当文字链接处理，不做材质。展示站第一版和它一起做。
2. **里程碑 2：Popover**。验证"主题 CSS + Base UI 状态属性 + 进出场动画"这条链路，细节到时再定。
3. **玻璃主题**。拟物主题完成后再开始，细节到时再定。

## 展示站

在线预览：<https://superjony.github.io/facet/>。每次推送到 main，由 `.github/workflows/pages.yml` 构建并发布到 GitHub Pages。

- **屏幕宽度**：只适配桌面端，最小宽度 1024px（Tailwind `lg` 断点），不做移动端布局；窄于 1024px 时页面横向滚动。
- **页面结构**：左边组件列表，中间舞台，右边面板。顶栏左侧是库名和版本，右侧是主题切换（base / skeuo）和亮暗切换。
- **舞台**：有单个和矩阵两种视图。矩阵的两个轴从 variant、size、disabled 中选；选了另一个轴正在用的 prop，两个轴会互换；表格左上角是对角斜分的表头格。舞台底部左侧是代码行，右侧是预览状态下拉（rest / hover / pressed / focus），单个和矩阵两种视图都跟着它变。
- **右侧面板**：分 Props 和参数两个 tab。参数 tab 里每个材质参数一组滑块加数字输入，提供"重置"和"复制 CSS"两个按钮；当前是基线主题时，提示"基线主题不读取这些参数"。

## 开发

```bash
bun install
bun run dev          # 展示站
bun run build        # shadcn build（产出 public/r/*.json）+ 类型检查 + 展示站构建
bun run registry:build  # 只跑 shadcn build
bun run test:visual  # 截图回归：矩阵 2 主题 × 亮暗 × 4 预览状态，外加 disabled、单个视图、减弱动效、强制颜色模式、触屏、aria-invalid / aria-expanded 等；另有材质参数默认值的一致性检查
```

- 交付物：`src/components/ui/button.tsx`、`src/themes/base.css`、`src/themes/skeuo.css`，在 `registry.json` 里登记。`public/r/` 是 `@facet` 命名空间读取的文件，随仓库提交：改了组件、主题或 `registry.json` 后，要先跑 `shadcn build`（`bun run registry:build`）再提交。展示站自用的 shadcn 组件装在 `src/showcase/ui/`，不进 registry。
- registry 里的文件都用 `registry:file` 类型。shadcn CLI 安装 `registry:ui` 等类型时会删掉源码里所有 `cn-*` 类名（`@shadcn/registry` 的 `transformCleanup`），主题就挂不上去了；只有 `registry:file` / `registry:item` 原样写入。
- 尺寸（高度、内边距、间距、字号、图标大小、1px 边框宽度）写在组件里，所有主题外框相同，切换主题布局不动；颜色、圆角、焦点环、disabled、过渡写在主题 CSS 里。主题 CSS 里有 `@apply` 和 `@variant`，所以要从含 `@import "tailwindcss"` 的入口 CSS 引入（见「使用」）。
- 预览状态由 `postcss.config.js` 里的 `postcss-pseudo-classes` 在展示站构建时生成（ADR 0009）。展示站因此用 `@tailwindcss/postcss` 而不是 `@tailwindcss/vite`，字体在 `src/main.tsx` 里引入（`@tailwindcss/postcss` 内联 CSS import 时不改写 `url()`）。
- 截图基线在 `tests/__screenshots__/`，是在 macOS 的 Chromium 上录的；换平台要重新录：`bunx playwright test --update-snapshots`。比较阈值是 0，任何像素颜色变化都算失败。
