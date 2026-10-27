# facet

facet 是一个可切换主题的 React 组件库：同一套组件结构与 API，配多套视觉主题（拟物、玻璃、像素……），以源码形式分发到使用方项目。

## 主题

**主题（Theme）**：
一整套视觉语言，覆盖组件的颜色、材质、动效与素材，运行时可切换。所有主题共用同一份组件结构和 API。
_Avoid_：风格、皮肤、style（shadcn 的 style 是安装时选定的另一个概念，见「shadcn 风格」）

**基线主题（Base Theme）**：
从 shadcn 官方风格原样移植的主题，作为对照，用来检验组件结构不偏向任何一个主题。
_Avoid_：默认主题、default

**拟物主题（Skeuo Theme）**：
模拟实体按键的厚度、底座与高光，按下有下沉感的主题。
_Avoid_：3D 主题、立体主题

**玻璃主题（Glass Theme）**：
半透明、模糊背景、可带边缘折射的主题。
_Avoid_：毛玻璃、liquid glass（指苹果的具体实现）

**主题增强（Theme Enhancement）**：
主题可选附带的脚本能力，用来做纯样式做不到的效果（如玻璃折射），不改变组件结构和 API。
_Avoid_：主题插件、主题 JS

**shadcn 风格（shadcn Style）**：
shadcn 在安装组件时选定的视觉预设（如 nova），装好后固定在源码里，不能运行时切换。facet 只把它当作基线主题的来源。
_Avoid_：把它叫作「主题」

**亮暗模式（Color Scheme）**：
亮色或暗色，与主题互相独立：任一主题都有亮、暗两种。
_Avoid_：暗色主题、dark theme

## 组件结构

**装饰槽（Slot）**：
组件结构里有名字的部位，供主题分别上色上材质。Button 的装饰槽是 base（底座）、face（按键面）、highlight（高光）、label（内容）。
_Avoid_：layer、part（Base UI 用 part 指子组件，不是一回事）

**材质参数（Material Token）**：
描述实体材质的可调参数：厚度、底座加深、面光泽、高光强度、投影模糊。由主题读取，基线主题不读。
_Avoid_：效果变量、阴影参数

**语义颜色（Semantic Color）**：
按用途命名的颜色（primary、background、ring 等），沿用 shadcn 的命名。
_Avoid_：品牌色、调色板

**Variant**：
组件的轻重与形态档位（default、outline、secondary、ghost、destructive、link），沿用 shadcn。
_Avoid_：type、kind、风格

**Size**：
组件的尺寸档位（default、xs、sm、lg 及 icon 系列），沿用 shadcn。

## 状态

**交互状态（Interaction State）**：
用户操作造成的瞬时状态：rest（静止）、hover（悬停）、pressed（按下）、focus（键盘聚焦）。
_Avoid_：把 disabled 叫状态（它是 prop）

**预览状态（Preview State）**：
展示站为了静态展示而强制呈现的交互状态，只存在于展示站，不进入交付物。
_Avoid_：假 hover、模拟状态

## 分发

**交付物（Deliverable）**：
使用方通过 registry 拿到的组件源码与主题样式，不含任何展示站专用的东西。
_Avoid_：产物、包

**使用方项目（Consumer Project）**：
安装 facet 组件的项目。
_Avoid_：宿主、下游

## 展示站

**展示站（Showcase）**：
用来切换主题、亮暗、预览组件与调材质参数的站点，同时托管 registry。
_Avoid_：文档站、playground、demo

**舞台（Stage）**：
展示站中间展示组件的区域，有单个视图和矩阵视图。
_Avoid_：画布、预览区

**单个视图（Single View）**：
舞台上只放一个可交互的组件。

**矩阵视图（Matrix View）**：
舞台上把组件按两个轴铺成表格，所有格子同步呈现同一个预览状态。
_Avoid_：网格、组合表

**轴（Axis）**：
矩阵视图里沿行或列展开的一个 prop（variant、size 或 disabled）。矩阵总是恰好两个轴。
_Avoid_：维度
