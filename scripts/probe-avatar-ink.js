// Research probe: run `node scripts/probe-avatar-ink.js`.
// Controlled RAF in JSDOM measures the recovered website component, not the original App.
import { JSDOM } from "jsdom";
import { act } from "react";
import { mountAvatar } from "../src/avatar.js";

async function sample(fps) {
  const dom = new JSDOM('<span id="avatar"></span>', {pretendToBeVisual:true});
  const win = dom.window, queue = new Map(), old = {};
  let nextId = 0, now = performance.now(), avatar;
  win.matchMedia = () => ({matches:false,addEventListener(){},removeEventListener(){}});
  win.IntersectionObserver = class {observe(){}disconnect(){}};
  const globals = {
    window:win, document:win.document, getComputedStyle:win.getComputedStyle.bind(win),
    requestAnimationFrame:fn => {queue.set(++nextId, fn);return nextId;},
    cancelAnimationFrame:id => queue.delete(id), IS_REACT_ACT_ENVIRONMENT:true,
  };
  for (const [key,value] of Object.entries(globals)) {
    old[key] = Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
  }
  let inkFrames = 0, maxPathLength = 0;
  try {
    await act(() => {avatar = mountAvatar(win.document.querySelector("#avatar"),{state:"writing"});});
    for (let i = 0; i < fps * 5; i++) {
      now += 1000 / fps;
      const callbacks = [...queue.values()];queue.clear();
      callbacks.forEach(fn => fn(now));
      const glyph = [...win.document.querySelector("svg").children].filter(
        node => node.tagName.toLowerCase() === "path" && !node.classList.length,
      )[1];
      if (glyph.style.display !== "none") {
        inkFrames++;
        maxPathLength = Math.max(maxPathLength,glyph.getAttribute("d")?.length ?? 0);
      }
    }
    return {fps,seconds:5,inkFrames,maxPathLength};
  } finally {
    if (avatar) await act(() => avatar.destroy());
    dom.window.close();
    for (const [key,descriptor] of Object.entries(old)) {
      if (descriptor) Object.defineProperty(globalThis,key,descriptor);
      else delete globalThis[key];
    }
  }
}
console.log(JSON.stringify([await sample(60),await sample(30)],null,2));
