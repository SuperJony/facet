import { expect, test, type Page } from "@playwright/test";
import { matCss } from "../src/showcase/state.ts";

const THEMES = ["base", "skeuo"];
const SCHEMES = ["light", "dark"] as const;
const STATES = ["rest", "hover", "pressed", "focus"];

async function open(page: Page, query: string) {
  await page.goto(`/?${query}`);
  await page.evaluate(() => document.fonts.ready);
}

const matrix = (theme: string, scheme: string, state: string, col = "size") =>
  `theme=${theme}&scheme=${scheme}&view=matrix&state=${state}&row=variant&col=${col}`;

for (const theme of THEMES) {
  for (const scheme of SCHEMES) {
    for (const state of STATES) {
      test(`matrix ${theme} ${scheme} ${state}`, async ({ page }) => {
        await open(page, matrix(theme, scheme, state));
        await expect(page.getByTestId("matrix")).toHaveScreenshot(
          `${theme}-${scheme}-${state}.png`,
        );
      });
    }

    // Disabled buttons ignore preview states, so one state covers them.
    test(`matrix ${theme} ${scheme} disabled`, async ({ page }) => {
      await open(page, matrix(theme, scheme, "rest", "disabled"));
      await expect(page.getByTestId("matrix")).toHaveScreenshot(
        `${theme}-${scheme}-disabled.png`,
      );
    });

    test(`single ${theme} ${scheme}`, async ({ page }) => {
      await open(
        page,
        `theme=${theme}&scheme=${scheme}&view=single&state=rest`,
      );
      await expect(page.getByTestId("stage")).toHaveScreenshot(
        `single-${theme}-${scheme}.png`,
      );
    });
  }
}

// ADR 0011: with reduced motion, pressing a skeuo key changes shadows only; the face does not move.
for (const scheme of SCHEMES) {
  test(`matrix skeuo ${scheme} pressed, reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, matrix("skeuo", scheme, "pressed"));
    await expect(page.getByTestId("matrix")).toHaveScreenshot(
      `skeuo-${scheme}-pressed-reduced-motion.png`,
    );
  });
}

// ADR 0011: the focus ring stays visible in forced-colors mode, where box-shadow is dropped.
for (const theme of THEMES) {
  test(`matrix ${theme} focus, forced colors`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await open(page, matrix(theme, "light", "focus"));
    await expect(page.getByTestId("matrix")).toHaveScreenshot(
      `${theme}-focus-forced-colors.png`,
    );
  });
}

const BUTTONS = "[data-testid=matrix] .cn-button";

// Sets attributes on every button in the matrix.
const setAll = (page: Page, attrs: Record<string, string>) =>
  page.evaluate(
    ({ sel, attrs }) =>
      document.querySelectorAll(sel).forEach((e) => {
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      }),
    { sel: BUTTONS, attrs },
  );

// Computed material of every button in the matrix, in DOM order.
const material = (page: Page) =>
  page.$$eval(BUTTONS, (els) =>
    els.map((e) => {
      const c = getComputedStyle(e);
      return {
        boxShadow: c.boxShadow,
        background: c.backgroundImage,
        backgroundColor: c.backgroundColor,
        borderColor: c.borderColor,
        color: c.color,
        translate: c.translate,
      };
    }),
  );

const noTransitions = (page: Page) =>
  page.addStyleTag({
    content: "*, *::before { transition: none !important; }",
  });

for (const scheme of SCHEMES) {
  // aria-invalid: destructive border and ring, kept when focused.
  for (const state of ["rest", "focus"]) {
    test(`matrix skeuo ${scheme} ${state}, aria-invalid`, async ({ page }) => {
      await open(page, matrix("skeuo", scheme, state));
      await noTransitions(page);
      await setAll(page, { "aria-invalid": "true" });
      await expect(page.getByTestId("matrix")).toHaveScreenshot(
        `skeuo-${scheme}-${state}-invalid.png`,
      );
    });
  }

  // An open menu trigger shows the pressed face and shadows without sinking.
  test(`matrix skeuo ${scheme} aria-expanded`, async ({ page }) => {
    await open(page, matrix("skeuo", scheme, "rest"));
    await noTransitions(page);
    await setAll(page, { "aria-haspopup": "menu", "aria-expanded": "true" });
    await expect(page.getByTestId("matrix")).toHaveScreenshot(
      `skeuo-${scheme}-expanded.png`,
    );
  });

  // Menu triggers do not press. The stage's pressed preview also hovers, so this adds the
  // :active preview class alone and compares with rest.
  test(`skeuo ${scheme} aria-haspopup does not press`, async ({ page }) => {
    await open(page, matrix("skeuo", scheme, "rest"));
    await noTransitions(page);
    await setAll(page, { "aria-haspopup": "menu" });
    const rest = await material(page);
    await page.$$eval(BUTTONS, (els) =>
      els.forEach((e) => e.classList.add(":active")),
    );
    expect(await material(page)).toEqual(rest);
  });

  // A --mat-* token from the panel's exported CSS beats the theme's dark default.
  test(`matrix skeuo ${scheme} --mat-* override`, async ({ page }) => {
    await open(page, matrix("skeuo", scheme, "rest"));
    await noTransitions(page);
    await page.addStyleTag({ content: matCss(GLOW_OVERRIDE) });
    expect(await glowAlpha(page)).toBe(scheme === "light" ? 1 : 0.1);
    await expect(page.getByTestId("matrix")).toHaveScreenshot(
      `skeuo-${scheme}-mat-override.png`,
    );
  });
}

// Different values per scheme, so a dark block that matches nothing shows the light value.
const GLOW_OVERRIDE = {
  light: { "--mat-glow-alpha": 100 },
  dark: { "--mat-glow-alpha": 10 },
} as const;

// Alpha of the default key's white inner glow, the first box-shadow layer.
const glowAlpha = (page: Page) =>
  page.$eval(
    `${BUTTONS}.cn-button-variant-default.cn-button-size-default`,
    (e) => {
      const m = /^rgba?\(255, 255, 255(?:, ([\d.]+))?\)/.exec(
        getComputedStyle(e).boxShadow,
      );
      return m ? Number(m[1] ?? 1) : NaN;
    },
  );

// The exported dark block follows the theme's dark variant wherever .dark and data-theme sit.
for (const [placement, scheme, move, expected] of [
  [".dark on an element inside the theme", "light", "dark", 0.1],
  ["data-theme on an element inside .dark", "dark", "theme", 0.1],
  ["data-theme on an inner element, light", "light", "theme", 1],
] as const) {
  test(`--mat-* export: ${placement}`, async ({ page }) => {
    await open(page, matrix("skeuo", scheme, "rest"));
    await noTransitions(page);
    await page.addStyleTag({ content: matCss(GLOW_OVERRIDE) });
    await page.getByTestId("matrix").evaluate((el, move) => {
      if (move === "dark") el.classList.add("dark");
      else {
        document.documentElement.removeAttribute("data-theme");
        el.setAttribute("data-theme", "skeuo");
      }
    }, move);
    expect(await glowAlpha(page)).toBe(expected);
  });
}

// The focus ring is an outline, so utilities that replace box-shadow (shadow-*, ring-*) leave
// it. The stylesheet stands in for shadow-none ring-2, unlayered so it beats the theme.
test("skeuo focus ring survives shadow and ring utilities", async ({
  page,
}) => {
  await open(page, matrix("skeuo", "light", "focus"));
  await noTransitions(page);
  const ring = () =>
    page.$eval(
      `${BUTTONS}.cn-button-variant-default.cn-button-size-default`,
      (e) => {
        const c = getComputedStyle(e);
        return [c.outlineStyle, c.outlineWidth, c.outlineColor];
      },
    );
  const before = await ring();
  await page.addStyleTag({
    content: ".cn-button { box-shadow: 0 0 0 2px var(--ring) !important; }",
  });
  expect(await ring()).toEqual(before);
  expect(before.slice(0, 2)).toEqual(["solid", "3px"]);
});

// Hover styles sit in @media (hover: hover): on a touch screen the hover preview matches rest.
test.describe("touch screen", () => {
  test.use({ hasTouch: true });
  for (const theme of THEMES) {
    for (const scheme of SCHEMES) {
      test(`matrix ${theme} ${scheme} hover equals rest`, async ({ page }) => {
        await open(page, matrix(theme, scheme, "hover"));
        await expect(page.getByTestId("matrix")).toHaveScreenshot(
          `${theme}-${scheme}-rest.png`,
        );
      });
    }
  }
});

test("skeuo transitions", async ({ page }) => {
  await open(page, matrix("skeuo", "light", "rest"));
  const transition = () =>
    page.$eval(`${BUTTONS}.cn-button-variant-default`, (e) => {
      const c = getComputedStyle(e);
      return [c.transitionProperty, c.transitionDuration];
    });
  expect(await transition()).toEqual([
    "translate, box-shadow, outline-color, --skeuo-face-top, --skeuo-face-bottom, color, border-color",
    "0.12s, 0.14s, 0.14s, 0.16s, 0.16s, 0.16s, 0.16s",
  ]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await transition()).toEqual(["none", "0s"]);
});

// A real mouse gives the same result as the preview classes the screenshots rely on.
for (const theme of THEMES) {
  test(`${theme} real hover and press match the previews`, async ({ page }) => {
    const sel = `${BUTTONS}.cn-button-variant-default.cn-button-size-default`;
    const read = () =>
      page.$eval(sel, (e) => {
        const c = getComputedStyle(e);
        return [c.boxShadow, c.backgroundImage, c.backgroundColor, c.translate];
      });
    const preview = async (state: string) => {
      await open(page, matrix(theme, "light", state));
      return read();
    };
    const hover = await preview("hover");
    const pressed = await preview("pressed");

    await open(page, matrix(theme, "light", "rest"));
    await noTransitions(page);
    await page.locator(sel).hover();
    expect(await read()).toEqual(hover);
    await page.mouse.down();
    expect(await read()).toEqual(pressed);
    await page.mouse.up();
  });
}
