// DOM interaction tests: layout/pointer capture are mocked, not a browser visual test.
// See README for the temporary jsdom/tsx test setup.
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { JSDOM } = await import(pathToFileURL(process.env.JSDOM_MODULE).href);
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://shop.example/customize",
});
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
const source = process.env.SORTER_MODULE
  ? pathToFileURL(resolve(process.env.SORTER_MODULE))
  : new URL("../src/components/SectionSorter.tsx", import.meta.url);
// Resolve the same React instance as the component, including for Expo's web copy.
const require = createRequire(source);
const { act, createElement, useState } = require("react");
const { createRoot } = require("react-dom/client");
const { SectionSorter } = await import(source.href);
const { moveSection } = await import(
  new URL("./section-order.ts", source).href
);
let root;
let container;
let changes;
let dragging;
let setDisabled;

async function mount() {
  container = document.createElement("div");
  document.body.append(container);
  changes = [];
  dragging = [];
  function Harness() {
    const [sections, setSections] = useState(["hero", "products", "about"]);
    const [disabled, updateDisabled] = useState(false);
    setDisabled = updateDisabled;
    return createElement(SectionSorter, {
      sections,
      hiddenSections: ["about"],
      disabled,
      onChange: (next) => {
        changes.push(next);
        setSections(next);
      },
      onDragStateChange: (value) => dragging.push(value),
    });
  }
  root = createRoot(container);
  await act(() => root.render(createElement(Harness)));
  const rect = (top, height) => ({
    x: 0,
    y: top,
    left: 0,
    right: 280,
    top,
    bottom: top + height,
    width: 280,
    height,
  });
  container.querySelector("ol").getBoundingClientRect = () => rect(100, 224);
  for (const row of container.querySelectorAll("li")) {
    row.getBoundingClientRect = () =>
      rect(100 + [...row.parentNode.children].indexOf(row) * 78, 68);
    const handle = row.querySelector("button");
    let captured;
    handle.setPointerCapture = (id) => {
      captured = id;
    };
    handle.hasPointerCapture = (id) => captured === id;
    handle.releasePointerCapture = () => {
      captured = undefined;
    };
  }
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  container?.remove();
  root = undefined;
});
function button(label) {
  return container.querySelector(`button[aria-label="${label}"]`);
}
function order() {
  return [...container.querySelectorAll("li")].map(
    (row) => row.dataset.section,
  );
}
async function pointer(node, type, y, options = {}) {
  const event = new window.MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: options.x ?? 24,
    clientY: y,
    button: 0,
  });
  Object.defineProperties(event, {
    pointerId: { value: options.id ?? 1 },
    isPrimary: { value: options.primary ?? true },
    pointerType: { value: options.touch ? "touch" : "mouse" },
  });
  await act(() => node.dispatchEvent(event));
}
async function key(node, value) {
  await act(() =>
    node.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key: value,
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
}

test("mouse drag moves first to last, shifts the intervening sections, and commits once", async () => {
  await mount();
  const handle = button("Reorder Hero banner");
  await pointer(handle, "pointerdown", 134);
  await pointer(handle, "pointermove", 290);
  assert.equal(
    container.querySelector('[data-drop-target="true"]').dataset.section,
    "about",
  );
  assert.deepEqual(changes, [], "hovering must not save or mutate the design");
  await pointer(handle, "pointerup", 290);
  assert.deepEqual(order(), ["products", "about", "hero"]);
  assert.equal(changes.length, 1);
  assert.equal(dragging.at(-1), false);
  assert.match(
    container.querySelector('[role="status"]').textContent,
    /position 3/,
  );
});
test("touch drag moves last to first and ignores a second pointer", async () => {
  await mount();
  const handle = button("Reorder Our story");
  assert.match(handle.parentNode.textContent, /Hidden/);
  await pointer(handle, "pointerdown", 290, { touch: true });
  await pointer(handle, "pointermove", 212, {
    touch: true,
    id: 2,
    primary: false,
  });
  await pointer(handle, "pointerup", 212, {
    touch: true,
    id: 2,
    primary: false,
  });
  assert.equal(changes.length, 0);
  await pointer(handle, "pointermove", 134, { touch: true });
  await pointer(handle, "pointerup", 134, { touch: true });
  assert.deepEqual(order(), ["about", "hero", "products"]);
});
for (const cancellation of [
  "Escape",
  "pointercancel",
  "lostpointercapture",
  "blur",
  "resize",
  "scroll",
  "outside",
]) {
  test(`${cancellation} cancels without changing the stored section order`, async () => {
    await mount();
    const handle = button("Reorder Hero banner");
    await pointer(handle, "pointerdown", 134);
    await pointer(handle, "pointermove", 290);
    if (cancellation === "Escape") await key(handle, "Escape");
    else if (cancellation === "outside")
      await pointer(handle, "pointerup", 290, { x: 400 });
    else if (["blur", "resize", "scroll"].includes(cancellation))
      await act(() => window.dispatchEvent(new window.Event(cancellation)));
    else await pointer(handle, cancellation, 290);
    await pointer(handle, "pointerup", 290);
    assert.deepEqual(order(), ["hero", "products", "about"]);
    assert.equal(changes.length, 0);
    assert.equal(dragging.at(-1), false);
  });
}
test("keyboard and arrow buttons reorder with boundaries and preserve handle focus", async () => {
  await mount();
  const handle = button("Reorder Hero banner");
  handle.focus();
  await key(handle, "ArrowUp");
  assert.equal(changes.length, 0);
  await key(handle, "ArrowDown");
  assert.deepEqual(order(), ["products", "hero", "about"]);
  assert.equal(document.activeElement, handle);
  await act(() => button("Move Hero banner down").click());
  assert.deepEqual(order(), ["products", "about", "hero"]);
  assert.equal(button("Move Hero banner down").disabled, true);
});
test("saving disables reordering, including a drag already in progress", async () => {
  await mount();
  const handle = button("Reorder Hero banner");
  await pointer(handle, "pointerdown", 134);
  await pointer(handle, "pointermove", 290);
  await act(() => setDisabled(true));
  await pointer(handle, "pointerup", 290);
  await key(handle, "ArrowDown");
  assert.equal(changes.length, 0);
  assert.ok(
    [...container.querySelectorAll("button")].every((node) => node.disabled),
  );
});
test("tap, out-of-bounds moves, and saved-order round trips do not lose or duplicate sections", async () => {
  await mount();
  const handle = button("Reorder Hero banner");
  await pointer(handle, "pointerdown", 134);
  await pointer(handle, "pointerup", 134);
  assert.equal(changes.length, 0);
  const sections = ["hero", "products", "about"];
  assert.equal(moveSection(sections, "hero", -1), sections);
  assert.equal(moveSection(sections, "hero", 3), sections);
  assert.equal(moveSection(sections, "unknown", 1), sections);
  assert.deepEqual(
    JSON.parse(JSON.stringify(moveSection(sections, "hero", 2))),
    ["products", "about", "hero"],
  );
  assert.deepEqual(sections, ["hero", "products", "about"]);
});
