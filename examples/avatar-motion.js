import { mountAvatar, avatarStates, avatarShapes } from "../dist/avatar.js";
const $ = (s) => document.querySelector(s);
const material = (
  await (await fetch("../assets/website/manifest.json")).json()
).assets.slice(0, 6);
const controllers = material.map((bot, i) => {
  const card = document.createElement("div");
  card.className = "bot-motion-card";
  const art = document.createElement("span");
  art.className = "motion-avatar";
  art.style.setProperty("--fg", bot.color);
  art.style.setProperty("--bg", "var(--canvas)");
  art.setAttribute("aria-hidden", "true");
  const label = document.createElement("strong");
  label.textContent = bot.name;
  card.append(art, label);
  $("#bot-avatars").append(card);
  return mountAvatar(art, {
    shape: i === 2 ? "wedge" : i === 3 ? "gem" : "blob",
    seed: 1,
  });
});
const hero = mountAvatar($("#hero-avatar"), { followPointer: true });
for (const [el, values, current] of [
  [$("#motion-state"), avatarStates, "idle"],
  [$("#motion-shape"), avatarShapes, "blob"],
]) {
  el.replaceChildren(
    ...values.map((value) => {
      const option = document.createElement("option");
      option.value = option.textContent = value;
      return option;
    }),
  );
  el.value = current;
}
const descriptions = {
  idle: "自然呼吸与自动眨眼",
  sleeping: "闭眼与休息姿态",
  thinking: "形变为三个思考点",
  orbit: "轨道旋转",
  radar: "雷达扫描",
  progress: "进度圆环",
  dictating: "语音波形",
  writing: "书写与铅笔形变",
  sending: "发送反馈",
  receiving: "接收反馈",
  uploading: "上传反馈",
  alerting: "感叹号提醒",
  "powering-down": "关闭姿态",
};
$("#motion-state").onchange = (event) => {
  const state = event.target.value;
  [hero, ...controllers].forEach((c) => c.setState(state));
  $("#motion-current").textContent = state;
  $("#motion-description").textContent =
    descriptions[state] ?? "官网原状态的表情与身体动作";
};
$("#motion-shape").onchange = (event) => hero.setShape(event.target.value);
$("#motion-pause").onchange = (event) =>
  [hero, ...controllers].forEach((c) => c.setPaused(event.target.checked));
$("#motion-theme").onchange = (event) =>
  (document.documentElement.dataset.motionTheme = event.target.value);
$("#motion-spin").onclick = () =>
  [hero, ...controllers].forEach((c) => c.spin());
$("#motion-bounce").onclick = () =>
  [hero, ...controllers].forEach((c) => c.bounce());
$("#motion-burst").onclick = () =>
  [hero, ...controllers].forEach((c) => c.burst());
