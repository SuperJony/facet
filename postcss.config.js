// Showcase build only. postcss-pseudo-classes must run after Tailwind so it sees expanded
// @apply/variant rules; it adds `.\:hover`-style companions that the stage uses to force
// preview states (ADR 0009). Registry files are copied from source and never pass through here.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-pseudo-classes": {
      restrictTo: ["hover", "active", "focus-visible"],
      allCombinations: true,
    },
  },
}
