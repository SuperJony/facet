import { expect, test, type Page } from "@playwright/test";

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
