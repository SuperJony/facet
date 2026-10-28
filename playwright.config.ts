import { defineConfig, devices } from "@playwright/test";

// Screenshot regression runs against the production build, so preview states come
// from the same postcss-pseudo-classes pipeline the deployed showcase uses.
export default defineConfig({
  testDir: "tests",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:4173",
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  },
  expect: {
    // threshold 0: any pixel color change fails. Rendering is deterministic on one machine,
    // and the default 0.2 let small color changes (e.g. hover /80 → /90) pass.
    toHaveScreenshot: { animations: "disabled", caret: "hide", threshold: 0 },
  },
  webServer: {
    command: "bun run build && bunx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
