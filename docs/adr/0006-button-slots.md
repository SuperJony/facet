---
status: accepted
date: 2026-10-28
---

# Button 固定四个装饰槽：base、face、highlight、label

Button 的 DOM 固定包含 base（底座）、face（按键面）、highlight（高光）、label（内容）四个装饰槽，不用的主题让它们保持空白。这套槽位已经在拟物和玻璃两种效果上验证过，一套 DOM 能同时撑起两个主题。现在把它定下来，以后加玻璃主题就不用改 DOM，也就不会破坏已经装到使用方项目里的代码。
