---
status: accepted
date: 2026-10-28
---

# 每个主题一个 CSS 文件，给 `cn-*` 类名写样式，用 `[data-theme]` 限定作用域

组件文件里只写布局和结构用的 Tailwind 类（尺寸、间距、flex）；视觉写在每个主题自己的 CSS 文件里，选择器形如 `[data-theme="skeuo"] .cn-button-variant-default`，状态挂在 Base UI 暴露的 data 属性和伪类上。这和 shadcn 每个 style 一个 CSS 文件的组织方式一致，区别只是作用域在运行时生效。颜色 token 沿用 shadcn 的语义命名，和 shadcn 生态保持一致；材质参数另起 `--mat-*` 前缀，不和颜色 token 混在一起。

## Considered Options

- 用 Tailwind 的 `@custom-variant` 把所有主题的样式写进组件类名：每加一个主题都要改一遍所有组件文件，组件文件也会随主题数量越来越长。
