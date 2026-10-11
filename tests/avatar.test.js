import test from "node:test";
import assert from "node:assert/strict";
import {
  avatarPresentation,
  avatarStates,
  avatarShapes,
  mountAvatar,
} from "../src/avatar.js";
import {
  createMotion,
  createBehavior,
  createPaint,
  renderMotionSVG,
  hashSeed,
  stateDefinitions,
} from "../src/avatar-engine.generated.js";
import {
  BLINK_CADENCE,
  EXPRESSION_CADENCE,
} from "../src/website-avatar-data.generated.js";
import { JSDOM } from "jsdom";
import { act } from "react";

test("website presentation preserves the original dimensions and distinct state vocabulary", () => {
  assert.equal(avatarStates.length, 35);
  assert.equal(avatarShapes.length, 25);
  assert.deepEqual(BLINK_CADENCE.idle, [6000, 14000]);
  assert.deepEqual(EXPRESSION_CADENCE.idle, [9000, 16000]);
  assert.equal(
    avatarPresentation("idle", "blob").pose.scale,
    (0.92 * 259) / 229,
  );
  assert.equal(
    avatarPresentation("idle", "wedge").pose.scale,
    (0.94 * 259) / 229,
  );
  assert.equal(avatarPresentation("idle", "gem").pose.scale, 259 / 229);
  assert.equal(avatarPresentation("sad").expression, 4);
  assert.equal(avatarPresentation("sad").minLidOpen, 0.8);
  assert.throws(() => avatarPresentation("failed"), RangeError); // DMG failed is not a website state.
});

test("DMG subset advances deterministically and renders all 53 behaviors without invalid geometry", () => {
  function sequence(seed) {
    const engine = createMotion({ body: "sphere" }),
      behavior = createBehavior(engine, "idle", {
        seed: hashSeed(seed),
        isCompact: true,
      });
    const frames = [];
    for (let i = 0; i < 120; i++) {
      behavior.advance(1 / 60);
      engine.advance(1 / 60);
      if (i % 40 === 0)
        frames.push(
          renderMotionSVG(
            engine.frame(),
            createPaint("#54b9a6", "#fcfcfc"),
            192,
            "deterministic",
          ),
        );
    }
    return frames;
  }
  const frames = sequence("chief");
  assert.deepEqual(frames, sequence("chief"));
  assert.notEqual(frames[0], frames[1]);
  assert.equal(Object.keys(stateDefinitions).length, 53);
  for (const state of Object.keys(stateDefinitions)) {
    const engine = createMotion({ body: "sphere" }),
      behavior = createBehavior(engine, state, { seed: 1 });
    for (let i = 0; i < 90; i++) {
      behavior.advance(1 / 60);
      engine.advance(1 / 60);
    }
    const svg = renderMotionSVG(
      engine.frame(),
      createPaint("#54b9a6", "#fcfcfc"),
      192,
      "state",
    );
    assert.match(svg, /^<svg /);
    assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
  }
});

test("website component moves, blinks, morphs, pauses and releases RAF/media listeners", async () => {
  const dom = new JSDOM('<!doctype html><span id="avatar"></span>', {
      pretendToBeVisual: true,
      url: "http://localhost/",
    }),
    win = dom.window;
  const queue = new Map(),
    listeners = new Set();
  let nextId = 0,
    now = performance.now();
  const media = {
    matches: false,
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
  };
  win.matchMedia = () => media;
  win.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
  const request = (fn) => {
      queue.set(++nextId, fn);
      return nextId;
    },
    cancel = (id) => queue.delete(id);
  const old = {};
  for (const [key, value] of Object.entries({
    window: win,
    document: win.document,
    requestAnimationFrame: request,
    cancelAnimationFrame: cancel,
    getComputedStyle: win.getComputedStyle.bind(win),
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    old[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value,
      writable: true,
    });
  }
  const el = win.document.getElementById("avatar");
  let avatar;
  function tick(count) {
    for (let i = 0; i < count; i++) {
      now += 1000 / 60;
      const callbacks = [...queue.values()];
      queue.clear();
      callbacks.forEach((fn) => fn(now));
    }
  }
  try {
    await act(() => {
      avatar = mountAvatar(el, { shape: "wedge", seed: 1 });
    });
    tick(120);
    const open = el.innerHTML;
    tick(40);
    assert.notEqual(el.innerHTML, open);
    assert.equal(el.dataset.avatarMotion, "playing");
    const eye = () => el.querySelector(".grok-bot-mark__eye").getAttribute("d");
    const openEye = eye();
    const observed = new Set([openEye]),
      areas = [];
    for (let i = 0; i < 1500; i++) {
      tick(1);
      const path = eye();
      observed.add(path);
      const numbers = path.match(/-?\d+(?:\.\d+)?/g).map(Number),
        points = Array.from({ length: numbers.length / 2 }, (_, i) =>
          numbers.slice(i * 2, i * 2 + 2),
        );
      areas.push(
        (Math.abs(
          points.reduce((sum, [x, y], i) => {
            const [nx, ny] = points[(i + 1) % points.length];
            return sum + x * ny - nx * y;
          }, 0),
        ) /
          2) *
          (() => {
            const [a, b, c, d] = el
              .querySelector(".grok-bot-mark__eye")
              .getAttribute("transform")
              .match(/matrix\(([^)]+)\)/)[1]
              .split(/\s+/)
              .map(Number);
            return Math.abs(a * d - b * c);
          })(),
      );
    }
    assert.ok(
      observed.size > 5,
      "automatic eyelid/expression frames should change over 25 seconds",
    );
    assert.ok(
      Math.min(...areas) < Math.max(...areas) * 0.25,
      "automatic blink must close the eyelid substantially",
    );
    for (const state of avatarStates) {
      await act(() => avatar.setState(state));
      tick(150);
      assert.equal(el.querySelector("svg").dataset.state, state);
      assert.doesNotMatch(el.innerHTML, /NaN|Infinity|undefined/);
    }
    await act(() => avatar.setState("thinking"));
    tick(120);
    assert.ok(
      [...el.querySelectorAll("circle")].some(
        (c) => Number(c.getAttribute("r")) > 0,
      ),
      "thinking must show morph particles",
    );
    await act(() => avatar.setState("writing"));
    tick(120);
    const glyphs = () => [...el.querySelector("svg").children].filter(
      (node) => node.tagName.toLowerCase() === "path" && !node.classList.length,
    );
    const writingShaft = glyphs()[0];
    assert.equal(writingShaft.style.display, "");
    assert.ok(
      [...el.querySelectorAll(".grok-bot-mark__eye")].every(
        (eye) => eye.style.display === "none",
      ),
      "writing intentionally hides eyes after morphing into a pen tip",
    );
    const penTransform = writingShaft.getAttribute("transform");
    assert.ok(Number(penTransform.match(/rotate\(([^)]+)\)/)[1]) > 10);
    tick(30);
    assert.notEqual(writingShaft.getAttribute("transform"), penTransform);
    await act(() => avatar.setState("alerting"));
    tick(120);
    assert.equal(glyphs()[0].style.display, "none");
    assert.equal(glyphs()[2].style.display, "");
    assert.notEqual(glyphs()[2].getAttribute("d"), writingShaft.getAttribute("d"));
    for (const shape of avatarShapes) {
      await act(() => avatar.setShape(shape));
      tick(60);
      assert.doesNotMatch(el.innerHTML, /NaN|Infinity|undefined/);
      await act(() => avatar.setPaused(true));
      assert.ok(el.querySelector("svg"));
      await act(() => avatar.setPaused(false));
    }
    avatar.spin();
    avatar.bounce();
    avatar.burst();
    tick(120);
    assert.doesNotMatch(el.innerHTML, /NaN|Infinity|undefined/);
    await act(() => avatar.setPaused(true));
    assert.equal(queue.size, 0);
    const still = el.innerHTML;
    tick(120);
    assert.equal(el.innerHTML, still);
    assert.equal(el.dataset.avatarMotion, "resting");
    await act(() => avatar.setPaused(false));
    assert.ok(queue.size > 0);
    await act(() => {
      media.matches = true;
      listeners.forEach((fn) => fn());
    });
    assert.equal(queue.size, 0);
    assert.equal(el.dataset.avatarMotion, "resting");
    await act(() => avatar.destroy());
    assert.equal(queue.size, 0);
    assert.equal(listeners.size, 0);
    assert.equal(el.innerHTML, "");
    assert.equal(el.dataset.avatarMotion, undefined);
  } finally {
    if (el.hasChildNodes()) await act(() => avatar?.destroy());
    dom.window.close();
    for (const [key, descriptor] of Object.entries(old)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
