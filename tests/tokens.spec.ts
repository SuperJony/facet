import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { MAT_TOKENS } from "../src/showcase/state.ts";

// The --mat-* defaults live twice: as var() fallbacks in the theme (what consumers get) and in
// MAT_TOKENS (what the showcase panel shows and exports). This fails when they diverge, and on
// any --mat-* use it cannot read.
test("skeuo --mat-* fallbacks match the showcase defaults", () => {
  const css = readFileSync(
    new URL("../src/themes/skeuo.css", import.meta.url),
    "utf8",
  ).replace(/\/\*[\s\S]*?\*\//g, (c) => " ".repeat(c.length));

  // The dark defaults are the fallbacks inside the theme's one `@variant dark` block.
  const darkStarts = [...css.matchAll(/@variant dark\s*\{/g)];
  expect(darkStarts, "exactly one @variant dark block").toHaveLength(1);
  const start = darkStarts[0].index;
  let end = start + darkStarts[0][0].length;
  for (let depth = 1; depth > 0; end++) {
    if (css[end] === "{") depth++;
    if (css[end] === "}") depth--;
  }

  const found = new Map<string, { light: Set<string>; dark: Set<string> }>();
  const unreadable: string[] = [];
  for (const m of css.matchAll(/--mat-[a-z-]+/g)) {
    // Every --mat-* must be the first argument of a var() with a fallback.
    if (!/var\(\s*$/.test(css.slice(0, m.index))) {
      unreadable.push(`${m[0]} outside var()`);
      continue;
    }
    // Read to the var()'s closing parenthesis, so a fallback may contain parentheses.
    let i = m.index + m[0].length;
    for (let depth = 1; depth > 0; i++) {
      if (css[i] === "(") depth++;
      if (css[i] === ")") depth--;
    }
    const rest = css.slice(m.index + m[0].length, i - 1);
    const fallback = /^\s*,\s*([\s\S]+?)\s*$/.exec(rest)?.[1];
    if (!fallback) {
      unreadable.push(`${m[0]} without a fallback`);
      continue;
    }
    const entry = found.get(m[0]) ?? { light: new Set(), dark: new Set() };
    entry[m.index > start && m.index < end ? "dark" : "light"].add(fallback);
    found.set(m[0], entry);
  }
  expect(unreadable).toEqual([]);

  const expected = new Map(
    MAT_TOKENS.map((t) => [
      t.key as string,
      {
        light: new Set([`${t.default.light}${t.unit}`]),
        dark: new Set(
          t.default.dark === t.default.light
            ? []
            : [`${t.default.dark}${t.unit}`],
        ),
      },
    ]),
  );
  expect(found).toEqual(expected);
});
