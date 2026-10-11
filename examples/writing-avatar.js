import { mountAvatar } from "../dist/avatar.js";
import { mountDmgComparisonAvatar } from "./dmg-avatar.js";

let card, message;
function mount() {
  card?.destroy();message?.destroy();
  const factory = document.querySelector("#reference-source").value === "dmg" ? mountDmgComparisonAvatar : mountAvatar;
  const options = {state:document.querySelector("#reference-state").value, paused:document.querySelector("#reference-paused").checked};
  card = factory(document.querySelector("#card-avatar"), options);
  message = factory(document.querySelector("#message-avatar"), options);
}
mount();
document.querySelector("#reference-source").addEventListener("change", mount);
const labels = {writing:"正在记下来",alerting:"需要你注意",thinking:"正在思考",idle:"准备好了"};
document.querySelector("#reference-state").addEventListener("change", event => {
  const state = event.target.value;
  card.setState(state);
  message.setState(state);
  document.querySelector("#activity-label").textContent = labels[state];
});
document.querySelector("#reference-online").addEventListener("change", event => {
  document.querySelector("#online-dot").hidden = !event.target.checked;
});
document.querySelector("#reference-paused").addEventListener("change", event => {
  card.setPaused(event.target.checked);
  message.setPaused(event.target.checked);
});
window.addEventListener("pagehide", () => {card.destroy();message.destroy();}, {once:true});
