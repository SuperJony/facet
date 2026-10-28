import { useLayoutEffect, useState } from "react";

export const THEMES = ["base", "skeuo"] as const;
export const SCHEMES = ["light", "dark"] as const;
export const VIEWS = ["single", "matrix"] as const;
export const PREVIEW_STATES = ["rest", "hover", "pressed", "focus"] as const;

export const AXIS_VALUES = {
  variant: ["default", "secondary", "outline", "ghost", "destructive", "link"],
  size: ["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"],
  disabled: [false, true],
} as const;

export type Theme = (typeof THEMES)[number];
export type Scheme = (typeof SCHEMES)[number];
export type View = (typeof VIEWS)[number];
export type PreviewState = (typeof PREVIEW_STATES)[number];
export type AxisProp = keyof typeof AXIS_VALUES;
export type Variant = (typeof AXIS_VALUES.variant)[number];
export type Size = (typeof AXIS_VALUES.size)[number];
export const AXIS_PROPS = Object.keys(AXIS_VALUES) as AxisProp[];

export type ButtonProps = { variant: Variant; size: Size; disabled: boolean };

// Class names that postcss-pseudo-classes adds to every :hover / :active / :focus-visible rule
// in the showcase build (ADR 0009). A real press also hovers, so pressed forces both.
export const PREVIEW_CLASS: Record<PreviewState, string> = {
  rest: "",
  hover: ":hover",
  pressed: ":hover :active",
  focus: ":focus-visible",
};

// The --mat-* defaults (default size, light / dark). They repeat the var() fallbacks in
// src/themes/skeuo.css; tests/tokens.spec.ts fails when the two diverge.
// Percentages are plain numbers in CSS (9 means 9%), so `unit` is what the value is written with
// and `suffix` is only shown in the panel.
export const MAT_TOKENS = [
  {
    group: "面",
    key: "--mat-face-step",
    label: "面明暗差",
    min: 0,
    max: 30,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 9, dark: 9 },
  },
  {
    group: "面",
    key: "--mat-face-split",
    label: "分配 s（0 只提亮顶部，1 只压暗底部）",
    min: 0,
    max: 1,
    step: 0.05,
    unit: "",
    suffix: "",
    default: { light: 0.5, dark: 1 },
  },
  {
    group: "面",
    key: "--mat-hover-lift",
    label: "悬停整体提亮",
    min: 0,
    max: 15,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 6, dark: 6 },
  },
  {
    group: "面",
    key: "--mat-press-darken",
    label: "按下比底部再压暗",
    min: 0,
    max: 25,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 7, dark: 7 },
  },
  {
    group: "边",
    key: "--mat-edge-darken",
    label: "比按下顶部再压暗",
    min: 0,
    max: 40,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 10, dark: 15 },
  },
  {
    group: "边",
    key: "--mat-edge-alpha",
    label: "描边不透明度",
    min: 0,
    max: 100,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 100, dark: 100 },
  },
  {
    group: "白色内阴影",
    key: "--mat-glow-alpha",
    label: "不透明度",
    min: 0,
    max: 100,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 75, dark: 45 },
  },
  {
    group: "白色内阴影",
    key: "--mat-glow-blur",
    label: "模糊",
    min: 0,
    max: 6,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: 1.5, dark: 1.5 },
  },
  {
    group: "白色内阴影",
    key: "--mat-glow-y",
    label: "偏移（正值往下）",
    min: -2,
    max: 2,
    step: 0.05,
    unit: "px",
    suffix: "px",
    default: { light: 0.3, dark: 0.3 },
  },
  {
    group: "贴地投影",
    key: "--mat-contact-y",
    label: "y 偏移",
    min: 0,
    max: 4,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: 0.6, dark: 0.6 },
  },
  {
    group: "贴地投影",
    key: "--mat-contact-blur",
    label: "模糊",
    min: 0,
    max: 6,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: 1.2, dark: 1.2 },
  },
  {
    group: "贴地投影",
    key: "--mat-contact-alpha",
    label: "不透明度",
    min: 0,
    max: 70,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 13, dark: 40 },
  },
  {
    group: "浮起投影",
    key: "--mat-lift-y",
    label: "y 偏移",
    min: 0,
    max: 12,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: 2.4, dark: 2.4 },
  },
  {
    group: "浮起投影",
    key: "--mat-lift-blur",
    label: "模糊",
    min: 0,
    max: 24,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: 6, dark: 6 },
  },
  {
    group: "浮起投影",
    key: "--mat-lift-spread",
    label: "扩散",
    min: -10,
    max: 4,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: -1.8, dark: -1.8 },
  },
  {
    group: "浮起投影",
    key: "--mat-lift-alpha",
    label: "不透明度",
    min: 0,
    max: 70,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 16, dark: 42 },
  },
  {
    group: "悬停",
    key: "--mat-hover-y",
    label: "y 偏移",
    min: 0,
    max: 16,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: 4.8, dark: 4.8 },
  },
  {
    group: "悬停",
    key: "--mat-hover-blur",
    label: "模糊",
    min: 0,
    max: 30,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: 9.6, dark: 9.6 },
  },
  {
    group: "悬停",
    key: "--mat-hover-spread",
    label: "扩散",
    min: -12,
    max: 4,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: -3, dark: -3 },
  },
  {
    group: "按下",
    key: "--mat-press-y",
    label: "下沉",
    min: 0,
    max: 3,
    step: 0.05,
    unit: "px",
    suffix: "px",
    default: { light: 0.5, dark: 0.5 },
  },
  {
    group: "按下",
    key: "--mat-press-blur",
    label: "内阴影模糊",
    min: 0,
    max: 6,
    step: 0.1,
    unit: "px",
    suffix: "px",
    default: { light: 1.5, dark: 1.5 },
  },
  {
    group: "按下",
    key: "--mat-press-alpha",
    label: "内阴影不透明度",
    min: 0,
    max: 70,
    step: 1,
    unit: "",
    suffix: "%",
    default: { light: 26, dark: 34 },
  },
] as const;

export type MatKey = (typeof MAT_TOKENS)[number]["key"];
export type MatValues = Partial<Record<MatKey, number>>;
export type MatState = Record<Scheme, MatValues>;

export type ShowcaseState = {
  theme: Theme;
  scheme: Scheme;
  view: View;
  preview: PreviewState;
  row: AxisProp;
  col: AxisProp;
  fixed: ButtonProps;
  label: string;
  mat: MatState;
};

function pick<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function readUrl(): ShowcaseState {
  const q = new URLSearchParams(window.location.search);
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const row = pick(q.get("row"), AXIS_PROPS, "variant");
  const col = pick(
    q.get("col"),
    AXIS_PROPS,
    row === "size" ? "variant" : "size",
  );
  return {
    theme: pick(q.get("theme"), THEMES, "skeuo"),
    scheme: pick(q.get("scheme"), SCHEMES, systemDark ? "dark" : "light"),
    view: pick(q.get("view"), VIEWS, "matrix"),
    preview: pick(q.get("state"), PREVIEW_STATES, "rest"),
    row,
    col: col === row ? (row === "size" ? "variant" : "size") : col,
    fixed: { variant: "default", size: "default", disabled: false },
    label: "Button",
    mat: { light: {}, dark: {} },
  };
}

// The URL carries what a screenshot needs to reproduce a view.
function writeUrl(s: ShowcaseState) {
  const q = new URLSearchParams({
    theme: s.theme,
    scheme: s.scheme,
    view: s.view,
    state: s.preview,
    row: s.row,
    col: s.col,
  });
  window.history.replaceState(null, "", `?${q}`);
}

export function applyToRoot({
  theme,
  scheme,
}: Pick<ShowcaseState, "theme" | "scheme">) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", scheme === "dark");
  root.style.colorScheme = scheme;
}

export function useShowcaseState() {
  const [state, setState] = useState(readUrl);

  // Layout effect: the theme and scheme must be on <html> before the first paint.
  useLayoutEffect(() => {
    writeUrl(state);
    const root = document.documentElement;
    root.dataset.theme = state.theme;
    root.classList.toggle("dark", state.scheme === "dark");
    root.style.colorScheme = state.scheme;
  }, [state]);

  const update = (patch: Partial<ShowcaseState>) =>
    setState((s) => ({ ...s, ...patch }));

  // Picking the prop the other axis already shows swaps the two axes.
  const setAxis = (axis: "row" | "col", prop: AxisProp) =>
    setState((s) => {
      const other = axis === "row" ? "col" : "row";
      return s[other] === prop
        ? { ...s, [axis]: prop, [other]: s[axis] }
        : { ...s, [axis]: prop };
    });

  return { state, update, setAxis };
}

// Only the tokens that differ from the defaults, scoped the way the theme scopes itself: on
// skeuo buttons, with dark as `.dark` on any ancestor of the button (the theme's `dark` variant
// compiles to `:is(.dark *)`). The light block also applies in dark mode, so a token changed in
// light is repeated in the dark block with its dark value; a token changed only in dark is
// written only there, so it leaves the consumer's light setting alone.
const LIGHT_SCOPE = '[data-theme="skeuo"] .cn-button';
const DARK_SCOPE = '[data-theme="skeuo"] .cn-button:is(.dark *)';

export function matCss(mat: MatState) {
  const value = (t: (typeof MAT_TOKENS)[number], scheme: Scheme) =>
    mat[scheme][t.key] ?? t.default[scheme];
  const changedIn = (scheme: Scheme) =>
    MAT_TOKENS.filter((t) => value(t, scheme) !== t.default[scheme]);
  const light = changedIn("light");
  const dark = MAT_TOKENS.filter(
    (t) => light.includes(t) || changedIn("dark").includes(t),
  );
  if (dark.length === 0) return "/* 所有材质参数都是默认值，没有要导出的。 */";
  const block = (selector: string, tokens: typeof dark, scheme: Scheme) =>
    `${selector} {\n${tokens
      .map((t) => `  ${t.key}: ${value(t, scheme)}${t.unit};`)
      .join("\n")}\n}`;
  return [
    ...(light.length ? [block(LIGHT_SCOPE, light, "light")] : []),
    "/* 暗色按按钮祖先上的 .dark 类判断。用媒体查询或别的选择器切换暗色时，把下面的选择器换成对应写法。 */",
    block(DARK_SCOPE, dark, "dark"),
  ].join("\n\n");
}
