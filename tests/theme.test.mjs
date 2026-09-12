import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeTheme,
  defaultTheme,
  contrastText,
} from "../src/lib/store-theme.ts";
test("untrusted stored settings cannot introduce CSS or script URLs", () => {
  const theme = normalizeTheme({
    accent: "red;display:none",
    background: "#fff",
    banner: "javascript:alert(1)",
    heading: "a".repeat(200),
  });
  assert.equal(theme.accent, defaultTheme.accent);
  assert.equal(theme.background, defaultTheme.background);
  assert.equal(theme.banner, "");
  assert.equal(theme.heading.length, 120);
});
test("the collection cannot be removed or duplicated by saved section order", () => {
  assert.deepEqual(
    normalizeTheme({ sections: ["hero", "hero", "about"] }).sections,
    defaultTheme.sections,
  );
  assert.deepEqual(
    normalizeTheme({ sections: ["products", "about", "hero"] }).sections,
    ["products", "about", "hero"],
  );
});
test("valid controls round-trip without losing toggles or column count", () => {
  const theme = {
    ...defaultTheme,
    showHero: false,
    showAbout: true,
    showInventory: false,
    columns: 4,
    font: "serif",
    banner: "https://example.com/banner.jpg",
  };
  assert.deepEqual(normalizeTheme(theme), theme);
  assert.equal(contrastText("#FFFFFF"), "#101820");
  assert.equal(contrastText("#000000"), "#FFFFFF");
});
