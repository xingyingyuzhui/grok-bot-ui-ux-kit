// Comparison adapter only. The recovered DMG engine remains unchanged.
import {
  createMotion, createBehavior, createPaint, renderMotionSVG, updateSVG,
  resolveBody, fillScale, defaultFill, hashSeed,
} from "../src/avatar-engine.generated.js";

let nextId = 0;
export function mountDmgComparisonAvatar(element, {state = "writing", paused = false} = {}) {
  const id = `dmg-comparison-${++nextId}`;
  const layer = element.ownerDocument.createElement("span");
  const scale = fillScale(defaultFill);
  Object.assign(layer.style, {
    position:"absolute", left:"50%", top:"50%", width:`${scale * 100}%`,
    height:`${scale * 100}%`, transform:"translate(-50%, -50%)", pointerEvents:"none",
  });
  const previousPosition = element.style.position;
  element.style.position = "relative";
  element.append(layer);
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let engine, behavior, raf = 0, last = 0, visible = true, destroyed = false;
  const size = () => element.getBoundingClientRect().width;
  const frozen = () => paused || media.matches || document.hidden || !visible;
  function draw() {
    const css = getComputedStyle(element), width = size();
    if (width <= 0) return;
    const paint = createPaint(css.getPropertyValue("--fg").trim(), css.getPropertyValue("--bg").trim());
    updateSVG(layer, renderMotionSVG(engine.frame(), paint, Math.round(width * scale * 100) / 100,
      id, {displaySize:width, extent:"100%"}));
  }
  function frame(now) {
    raf = 0;
    if (destroyed || frozen()) return;
    const dt = Math.min((now - last) / 1000, .1);
    last = now;
    behavior.advance(dt);
    engine.advance(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function restart() {
    if (destroyed) return;
    cancelAnimationFrame(raf);
    engine = createMotion({body:resolveBody("blob")});
    behavior = createBehavior(engine, frozen() ? "idle" : state,
      {seed:hashSeed(id), isCompact:size() < 48, isResting:frozen()});
    element.dataset.avatarState = state;
    element.dataset.avatarMotion = frozen() ? "resting" : "playing";
    if (frozen()) for (let i = 0; i < 60; i++) {behavior.advance(.1);engine.advance(.1);}
    draw();
    last = performance.now();
    if (!frozen()) raf = requestAnimationFrame(frame);
  }
  media.addEventListener("change", restart);
  document.addEventListener("visibilitychange", restart);
  const resize = new ResizeObserver(restart);
  resize.observe(element);
  const intersection = new IntersectionObserver(entries => {
    const next = entries.at(-1)?.isIntersecting ?? true;
    if (next !== visible) {visible = next;restart();}
  });
  intersection.observe(element);
  restart();
  return {
    setState(next) {state = next;behavior.setState(next);element.dataset.avatarState = next;},
    setPaused(next) {paused = Boolean(next);restart();},
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();intersection.disconnect();
      media.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
      layer.remove();element.style.position = previousPosition;
      delete element.dataset.avatarState;delete element.dataset.avatarMotion;
    },
  };
}
