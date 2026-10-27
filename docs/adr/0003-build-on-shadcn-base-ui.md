---
status: accepted
date: 2026-10-28
---

# 以 shadcn 的 Base UI 版组件为起点改皮，props 暂用 shadcn 的

组件源码以 shadcn 的 Base UI 版（components.json 的 `style` 为 `base-*`）为起点：保留它的 props（variant、size）、`data-slot` 和 `cn-*` 语义类名，在结构里补上装饰槽，再给 `cn-*` 类名写各主题的样式。选择 shadcn 的 props 是为了先简单起步，不是最终设计，以后可以改。

shadcn 的 Base UI 版本身就建在 `@base-ui/react` 上（组件第一行就是 `import { Button as ButtonPrimitive } from "@base-ui/react/button"`），所以「基于 shadcn」和「基于 Base UI」不冲突，以后也不存在「迁到 Base UI」这一步。以后想脱离 shadcn，要改的只是 props 命名、`cn-*` 类名和 `cva`，底层不用动。

## Considered Options

- 直接在 `@base-ui/react` 上从零写：更自由，但要自己重新定 props 约定和类名体系，起步慢。
- shadcn 的 Radix 版：Radix 版用 `Slot` 和 `asChild`，Base UI 版用 `render` prop，两者组合方式不同，以后再换就得逐个组件重写。不选。
