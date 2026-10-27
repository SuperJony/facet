---
status: accepted
date: 2026-10-28
---

# 预览状态只在展示站构建时生成，不进交付物

展示站的矩阵视图要让所有格子同时显示 hover、pressed 或 focus，但浏览器不能用代码强制触发这些伪类。做法是只在展示站的构建流程里加 `postcss-pseudo-classes`，把每条 `:hover`、`:active`、`:focus-visible` 规则复制一份，改成可以用类名触发的版本。交付物里的 CSS 不经过这个插件，不带任何展示站专用的钩子。这是硬性约束：如果这个插件不可用，就换别的构建期方案，不能退回到在主题 CSS 里写钩子。

2026-10-28 用 POC 验证过：Tailwind 4.3.3 + postcss-pseudo-classes 0.4.0，在 Chrome 中能正确转换 `@layer` 内的嵌套写法（`&:hover`）和 `@apply hover:…`，强制状态下 `--mat-*` 变量和背景色都按预期变化。

## Considered Options

- 在主题 CSS 里写 `:is(:hover, [data-preview="hover"])`：实现最简单，但交付物会带上展示站专用的钩子。不接受。

## Consequences

- Tailwind 的 `hover:` 写法会被包在 `@media (hover: hover)` 里，所以在纯触屏设备上，矩阵视图的 hover 预览不会显示。
- postcss-pseudo-classes 最后一次发布是 2023-11，项目已不活跃。升级 Tailwind 后要重新验证一遍。
