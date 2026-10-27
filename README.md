# facet

可切换主题的 React 组件库：所有主题共用一套组件结构和 API，主题只是一层 CSS 皮肤，以源码形式通过 shadcn registry 分发。

- 术语：[GLOSSARY.md](./GLOSSARY.md)
- 架构决策：[docs/adr/](./docs/adr/)

## 基本信息

- registry 命名空间：`@facet`，安装方式：`npx shadcn add @facet/<item>`
- 协议：MIT
- 技术栈：Vite、React 19、Tailwind v4、TypeScript、`@base-ui/react`（经由 shadcn 的 Base UI 版组件）

## 路线

1. **里程碑 1：Button**。做基线主题和拟物主题，覆盖 6 个 variant 和 8 个 size；`link` 在拟物主题下只当文字链接处理，不做材质。展示站第一版和它一起做。
2. **里程碑 2：Popover**。验证"主题 CSS + Base UI 状态属性 + 进出场动画"这条链路，细节到时再定。
3. **玻璃主题**。拟物主题完成后再开始，细节到时再定。

## 展示站

- **页面结构**：左边组件列表，中间舞台，右边面板。顶栏左侧是库名和版本，右侧是主题切换（base / skeuo）和亮暗切换。
- **舞台**：有单个和矩阵两种视图。矩阵的两个轴从 variant、size、disabled 中选；选了另一个轴正在用的 prop，两个轴会互换；表格左上角是对角斜分的表头格。舞台底部左侧是代码行，右侧是预览状态下拉（rest / hover / pressed / focus），单个和矩阵两种视图都跟着它变。
- **右侧面板**：分 Props 和参数两个 tab。参数 tab 里每个材质参数一组滑块加数字输入，提供"重置"和"复制 CSS"两个按钮；当前是基线主题时，提示"基线主题不读取这些参数"。
