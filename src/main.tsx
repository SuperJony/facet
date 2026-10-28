import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Fonts are imported here, not from index.css: @tailwindcss/postcss inlines CSS imports
// without rebasing their url(), which breaks the font file paths.
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import { App } from "./showcase/app";
import { applyToRoot, readUrl } from "./showcase/state";

// Theme and scheme go on <html> before the first render. Applied later, every element with a
// transition would animate from unthemed or light styles while the page loads.
applyToRoot(readUrl());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
