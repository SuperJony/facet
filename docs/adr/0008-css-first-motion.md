---
status: accepted
date: 2026-10-28
---

# 动效默认用 CSS 写，Motion 只用在 CSS 做不了的场景

默认用 CSS transition、keyframes、`linear()` 缓动，配合 Base UI 的 `data-starting-style` / `data-ending-style` 写动效。只有带速度且能被打断的弹簧、`layout` 布局动画、拖拽、列表项退场这几类场景，才允许在单个组件里引入 Motion，并在这个组件的 registry 条目里声明 `motion` 依赖。

理由：

- 体积：Motion 的 `motion` 组件最小也有 43kb；改用 `LazyMotion` 加 `m` 组件，首屏可以降到约 5kb，但要另外加载功能包，`domAnimation` +18kb、`domMax` +28kb（motion.dev/docs/react-reduce-bundle-size）。所有使用方项目都要装这个依赖。
- 主题归属：动效参数是主题的一部分，比如拟物按下时的回弹、像素风的 `steps()`。写在 CSS 里，一个主题文件就能同时管视觉和动效；写在 JS 里，换主题就要额外给组件传 JS 配置。
- Base UI 集成：Base UI 默认用 CSS 驱动进出场。改用 Motion 时，每个弹层组件都要改成受控的 `open`，再加 `keepMounted`、`render={<motion.div/>}` 和 `AnimatePresence`（Base UI v1.9 动画手册）。
