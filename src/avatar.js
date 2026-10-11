import { createElement, createRef } from "react";
import { createRoot } from "react-dom/client";
import { GrokBot } from "./website-avatar.generated.js";
import {
  GrokBotMark,
  SHAPES as stillShapes,
} from "./website-avatar-still.generated.js";
import {
  GROK_BOT_STATES,
  GROK_BOT_SHAPES,
  SHAPES,
} from "./website-avatar-data.generated.js";
// The website still renderer has 18 shapes; supply its missing shapes from the live geometry table.
for (const shape of GROK_BOT_SHAPES)
  if (!stillShapes[shape]) stillShapes[shape] = SHAPES[shape];
export { GROK_BOT_STATES as avatarStates, GROK_BOT_SHAPES as avatarShapes };
// Presentation values recovered from official module 341783. Source anchors in docs/avatar-animation.md.
const home = { turn: 17, tilt: -14, roll: 29 };
const scales = {
  blob: 0.92,
  pebble: 0.96,
  egg: 0.96,
  squircle: 0.84,
  square: 0.84,
  tablet: 1,
  wedge: 0.94,
  hex: 0.94,
  cloud: 1,
  teardrop: 1,
  sparkle: 1.12,
  clover: 0.96,
  heart: 1.1,
  star6: 1.08,
};
const tune = {
  angry: { gap: 1.28, size: 0.78, eyeWidth: 0.88, eyeHeight: 0.84 },
  suspicious: { gap: 1.24, size: 0.82, eyeWidth: 0.9 },
  confused: { gap: 1.2, size: 0.84, eyeWidth: 0.9 },
  scared: { size: 0.8, eyeWidth: 0.9, eyeHeight: 0.88 },
  surprised: { size: 0.76, eyeWidth: 0.86, eyeHeight: 0.86 },
  excited: { size: 0.78, eyeWidth: 0.88, eyeHeight: 0.88 },
  celebrate: { size: 0.74, eyeWidth: 0.84, eyeHeight: 0.84 },
  happy: { size: 0.76, eyeWidth: 0.86, eyeHeight: 0.84 },
  curious: { size: 0.84 },
  drowsy: { size: 0.92, eyeWidth: 0.96 },
  bored: { size: 0.92, eyeWidth: 0.96 },
  sad: { size: 0.92, eyeWidth: 0.96 },
  playful: { size: 0.84, gap: 1.2 },
};
export function avatarPresentation(state = "idle", shape = "blob") {
  if (!GROK_BOT_STATES.includes(state))
    throw new RangeError(`Unknown website avatar state: ${state}`);
  if (!GROK_BOT_SHAPES.includes(shape))
    throw new RangeError(`Unknown website avatar shape: ${shape}`);
  const rest = ["drowsy", "bored", "sad"].includes(state),
    custom = tune[state];
  const faceTune = ["idle", "working"].includes(state)
    ? { size: 1, gap: 1, height: 1, eyeWidth: 1.2, eyeHeight: 1.16 }
    : {
        height: 1,
        ...custom,
        gap: Math.max(custom?.gap ?? 1.18, 1.14),
        size: Math.min(custom?.size ?? 0.86, 0.92),
        eyeWidth: Math.min(custom?.eyeWidth ?? 0.96, 1),
        eyeHeight: Math.min(custom?.eyeHeight ?? 0.92, 1),
      };
  const scale = scales[shape] ?? 1;
  return {
    faceTune,
    uniformEyes: true,
    eyeScale: 0.92 / scale,
    eyeTopology: true,
    naturalLids: true,
    softenWorkingEyes: state === "working",
    matchEyeStroke: ["suspicious", "confused"].includes(state) || rest,
    minEyeStroke: 8.6 * Number(rest),
    minLidOpen: rest ? 0.8 : undefined,
    expression: ["suspicious", "confused"].includes(state)
      ? 14
      : rest
        ? 4
        : null,
    pose: { ...home, scale: (scale * 259) / 229 },
    poseHome: { ...home },
  };
}
/** Mount the recovered website component. Each mount owns and cleans up its RAF. */
export function mountAvatar(
  element,
  {
    state = "idle",
    shape = "blob",
    seed = 1,
    paused = false,
    followPointer = false,
  } = {},
) {
  avatarPresentation(state, shape);
  const doc = element.ownerDocument,
    win = doc.defaultView;
  const root = createRoot(element),
    ref = createRef();
  const reduce = win.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = true,
    destroyed = false,
    gaze = null;
  function render() {
    if (destroyed) return;
    const frozen = paused || reduce.matches || !visible || doc.hidden;
    element.dataset.avatarState = state;
    element.dataset.avatarShape = shape;
    element.dataset.avatarMotion = frozen ? "resting" : "playing";
    // Original still component avoids a live RAF when motion is paused or unavailable.
    root.render(
      createElement(frozen ? GrokBotMark : GrokBot, {
        ...(!frozen ? avatarPresentation(state, shape) : {}),
        state,
        shape,
        seed,
        ref: !frozen ? ref : undefined,
        gazeTarget: gaze,
        className: shape === "blob" ? "grok-bot-mark--fill" : undefined,
      }),
    );
  }
  const visibility = () => render(),
    preference = () => render();
  doc.addEventListener("visibilitychange", visibility);
  reduce.addEventListener("change", preference);
  const observer = win.IntersectionObserver
    ? new win.IntersectionObserver((entries) => {
        const next = entries.at(-1)?.isIntersecting ?? true;
        if (next !== visible) {
          visible = next;
          render();
        }
      })
    : null;
  observer?.observe(element);
  const pointer = (event) => {
    if (!followPointer || reduce.matches || paused) return;
    gaze = { x: event.clientX, y: event.clientY };
    render();
  };
  const leave = () => {
    if (gaze) {
      gaze = null;
      render();
    }
  };
  element.addEventListener("pointermove", pointer);
  element.addEventListener("pointerleave", leave);
  render();
  return {
    get state() {
      return state;
    },
    get shape() {
      return shape;
    },
    get paused() {
      return paused;
    },
    setState(next) {
      avatarPresentation(next, shape);
      state = next;
      render();
    },
    setShape(next) {
      avatarPresentation(state, next);
      shape = next;
      render();
    },
    setPaused(next) {
      paused = Boolean(next);
      render();
    },
    spin(turns = 1) {
      if (!Number.isFinite(turns) || turns <= 0 || turns > 4)
        throw new RangeError("spin turns must be in (0, 4]");
      ref.current?.spin(turns);
    },
    bounce() {
      ref.current?.bounce();
    },
    burst() {
      ref.current?.burst();
    },
    snapshot() {
      return ref.current?.snapshot() ?? element.innerHTML;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer?.disconnect();
      doc.removeEventListener("visibilitychange", visibility);
      reduce.removeEventListener("change", preference);
      element.removeEventListener("pointermove", pointer);
      element.removeEventListener("pointerleave", leave);
      root.unmount();
      delete element.dataset.avatarState;
      delete element.dataset.avatarShape;
      delete element.dataset.avatarMotion;
    },
  };
}
