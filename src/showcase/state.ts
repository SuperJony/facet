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

// Mirrors the --mat-* defaults declared in src/themes/skeuo.css.
export const MAT_TOKENS = [
  {
    key: "--mat-depth",
    label: "厚度",
    min: 0,
    max: 8,
    step: 1,
    unit: "px",
    default: 4,
  },
  {
    key: "--mat-rim",
    label: "底座加深",
    min: 0,
    max: 50,
    step: 1,
    unit: "%",
    default: 22,
  },
  {
    key: "--mat-gloss",
    label: "面光泽",
    min: 0,
    max: 30,
    step: 1,
    unit: "%",
    default: 12,
  },
  {
    key: "--mat-highlight",
    label: "高光强度",
    min: 0,
    max: 0.6,
    step: 0.01,
    unit: "",
    default: 0.35,
  },
  {
    key: "--mat-shadow",
    label: "投影模糊",
    min: 0,
    max: 16,
    step: 1,
    unit: "px",
    default: 6,
  },
] as const;

export type MatKey = (typeof MAT_TOKENS)[number]["key"];
export type MatValues = Partial<Record<MatKey, number>>;

export type ShowcaseState = {
  theme: Theme;
  scheme: Scheme;
  view: View;
  preview: PreviewState;
  row: AxisProp;
  col: AxisProp;
  fixed: ButtonProps;
  label: string;
  mat: MatValues;
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
    mat: {},
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

export function matCss(mat: MatValues) {
  const lines = MAT_TOKENS.map(
    (t) => `  ${t.key}: ${mat[t.key] ?? t.default}${t.unit};`,
  );
  return `[data-theme="skeuo"] {\n${lines.join("\n")}\n}`;
}
