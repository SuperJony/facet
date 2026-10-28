---
status: accepted
date: 2026-10-28
---

# 用截图回归保证质量，不写组件单元测试

组件的交互逻辑都由 Base UI 提供，facet 自己写的主要是样式，所以不写单元测试。改用 Playwright 对展示站的矩阵视图做截图回归，覆盖每个主题 × 亮暗模式。另外几条底线只针对拟物主题：

- 焦点环用 shadcn 的默认值（`border-ring` 加 3px 的 `ring/50`），画成 outline，不被拟物的投影盖住，也不会被使用方的 `shadow-*` 去掉。它和页面背景的 APCA 对比度很低：亮色 Lc 25，暗色 Lc 8。这是有意接受的。
- 在 `prefers-reduced-motion` 下，按下不做位移，也没有过渡动画；按键面的颜色和阴影仍然变化，给出按下的反馈。
- 文字对比度用 APCA 衡量，不用 WCAG 2.x 的对比度比值。每个 variant 在 rest、hover、pressed 下，文字颜色和它背后实际渲染出来的按键面像素之间，APCA 对比度的绝对值不低于 Lc 60，亮暗都算。
  - 阈值来源：APCA Readability Criterion 的 Bronze Simple Mode（readtech.org/ARC，草案，2023-02-10 修订）。其中「Other Content Text」的最低值是 Lc 60；Lc 75 的「Body Text」指超过两行的连续正文，按钮文字不算。
  - 计算用 `apca-w3` 0.1.9 的 `APCAcontrast` 和 `sRGBtoY`（对比度常数是 APCA 0.0.98G-4g；0.1.7 是其中字号查找表 `fontLookupAPCA` 的版本）。
  - 没有采用 APCA 的字号查找表（`fontLookupAPCA`）。按这张表，500 字重的 14px 文字需要约 Lc 105，12px 需要更高，白底黑字（Lc 106）也只是勉强达到。
  - 例外：destructive 按用户决定沿用 shadcn 的浅红（半透明 `--destructive` 底，`--destructive` 文字），实测 Lc 41–57，低于 60。这一点有意接受，和 shadcn 原版 destructive 的 Lc 41–58 一致。
- `link` 和 shadcn 原版一致：文字链接，悬停加下划线，按下下沉 1px。

基线主题不受这几条约束，按 ADR 0010 原样移植 nova，包括按下时 1px 的位移，以及 destructive 只有 Lc 41–58 的文字对比度。
