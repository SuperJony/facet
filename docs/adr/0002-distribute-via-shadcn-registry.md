---
status: accepted
date: 2026-10-28
---

# 用 shadcn registry 分发源码，不发 npm 包

组件通过 shadcn registry 分发：使用方 `npx shadcn add @facet/<item>`，源码复制进使用方项目，归使用方所有，可以在项目里继续微调。公开的 GitHub 仓库本身就能作为 registry 使用，不需要另外部署。

## Considered Options

- npm 包：能统一升级，但要维护版本兼容和 API 稳定，使用方也没法就地改样式。个人维护成本太高。
- 只做展示站、手动复制：没有依赖声明，组件引用的其他组件和依赖要靠人记。

## Consequences

已经装走的代码不会跟着 facet 更新。facet 改了 props 或类名，只需要改自己项目里的调用处。
