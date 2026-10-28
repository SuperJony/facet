---
name: run-facet
description: Build, serve and drive the facet showcase in a real browser to see a theme or Button change working (hover, press, focus, panel export). Use when verifying or demoing a change to src/themes/*, src/components/ui/button.tsx or src/showcase/*.
---

# Run facet

## Build and serve

The production build is what screenshots and preview states rely on (ADR 0009: preview
classes exist only in the showcase build), so drive the built site, not `bun run dev`.

```bash
bunx vite build
bunx vite preview --port 4180 --strictPort   # run in the background
```

- Use a port other than 4173. Playwright's `webServer` uses 4173 with `reuseExistingServer`, so
  a server you leave on 4173 makes `bun run test:visual` test a stale build.
- `vite preview` serves `dist/` as static files: after a CSS change, rebuild and the running
  server picks it up.
- Stop it when done: `pkill -f "vite preview --port 4180"`.

## URL state

`/?theme=skeuo|base&scheme=light|dark&view=single|matrix&state=rest|hover|pressed|focus&row=variant&col=size`

- `state=` forces a preview state through the `:hover` / `:active` / `:focus-visible` classes.
  `pressed` is `:hover :active` together.
- Matrix buttons: `[data-testid=matrix] .cn-button-variant-<v>.cn-button-size-<s>`.
  The single view: `getByTestId("stage").locator(".cn-button")`.

## Drive it (Playwright from node_modules)

```js
import { chromium } from "/Users/jony/Developer/Front/facet/node_modules/playwright/index.mjs"
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] })
const p = await ctx.newPage()
await p.goto("http://localhost:4180/?theme=skeuo&scheme=light&view=single&state=rest")
await p.evaluate(() => document.fonts.ready)
```

Flows worth driving:
- Real input: `btn.hover()`, `p.mouse.down()`, Shift+Tab then Tab for keyboard focus. Read
  `getComputedStyle(btn)`: `boxShadow`, `backgroundImage`, `translate`, `outline*`.
- Panel: `getByRole("tab", { name: "参数" })`, inputs `#mat---mat-<token>`, buttons
  "复制 CSS" (read with `navigator.clipboard.readText()`) and "重置".
  Light/dark toggle: `getByLabel("亮色")` / `getByLabel("暗色")`.
- Edge cases: `aria-haspopup` / `aria-expanded` / `aria-invalid` set via `evaluate`;
  `p.emulateMedia({ reducedMotion: "reduce" })`; `forcedColors: "active"`; a context with
  `hasTouch: true` makes `(hover: hover)` false.

## Gotchas

- Changing attributes or styles after load starts transitions (registered `--skeuo-face-*`
  stops, box-shadow, outline-color). Before reading styles or taking screenshots, add
  `*{transition:none!important}` with `addStyleTag`, or wait about 200ms.
- Chromium serializes alpha 1 as `rgb(...)`, not `rgba(..., 1)`.
- To measure label contrast, screenshot with and without `color: transparent` on the label
  and compare the pixels behind the glyphs. ADR 0011 uses APCA (`apca-w3`). Install it
  outside the repo, not as a project dependency.
