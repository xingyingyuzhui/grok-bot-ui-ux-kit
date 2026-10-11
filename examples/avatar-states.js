import {mountAvatar,avatarStates} from '../dist/avatar.js';
import {stateDefinitions} from '../src/avatar-engine.generated.js';
import {mountDmgComparisonAvatar} from './dmg-avatar.js';
const $=s=>document.querySelector(s), supported=new Set(avatarStates);
const states=[...avatarStates,...Object.keys(stateDefinitions).filter(s=>!supported.has(s))];
const descriptions={thinking:'三个思考点；原头像成为中间点。',orbit:'官网实际可见三颗轨道点，DMG五颗；原头像保持在中心。',radar:'三层扩散雷达环。',progress:'进度环；完成一轮后短暂回到头像，再继续循环。',spawning:'聚拢生成；重点对照官网后两颗粒子的可见性。',dictating:'语音波形，由中央头像和左右四个动态节点组成。',sending:'向右上方发射粒子与淡出波纹。',receiving:'从外侧收拢粒子，再出现接收波纹。',uploading:'两颗粒子依次进入，再环绕主体。',writing:'倾斜笔杆、水滴笔尖与书写轨迹；两版墨迹采样不同。',alerting:'直立提醒条与圆点，周期性衰减抖动。','powering-down':'关闭 / 待机形变；重点对照 DMG 的淡色呼吸光晕。',humming:'中心头像旋转、两颗外围点。',searching:'同名效果不同：官网为头像搜索动作，DMG 进入雷达。',waking:'官网持续 waking；DMG 约1.6秒后自动进入 idle。',finished:'仅 DMG：完成片段后自动回 idle。',failed:'仅 DMG：失败片段后自动回 idle。',blocked:'仅 DMG：阻塞动作；120秒后进入 drowsy（本页需持续等待）。',waiting:'仅 DMG：使用 orbit 形变。',loading:'仅 DMG：使用 progress 形变。',bouncing:'仅 DMG：球体弹跳形变。',notifying:'仅 DMG：完成片段与惊讶表情；不是笔尖或感叹号。'};
for(const state of states){const option=document.createElement('option');option.value=state;option.textContent=state+(supported.has(state)?'':' · 仅 DMG');$('#audit-state').append(option);}
$('#audit-state').value='spawning';
let controllers=[];
function dispose(){controllers.forEach(c=>c.destroy());controllers=[];}
function mount(){
 dispose();const state=$('#audit-state').value, paused=$('#audit-paused').checked;
 $('#audit-description').textContent=`${state} — ${descriptions[state]??'普通头像 / 表情 / 动作；官网程序生成动画与 DMG 预制片段分别展示。'}`;
 for(const source of ['website','dmg']){
  const stage=$(`#${source}-stage`), sizes=$(`#${source}-sizes`);stage.replaceChildren();sizes.replaceChildren();
  const available=source==='dmg'||supported.has(state);
  $(`#${source}-status`).textContent=available?(source==='website'?'官网35状态之一。':'DMG53状态之一。'):'官网没有该状态，不做隐式映射。';
  if(!available){stage.textContent='仅 DMG 支持';continue;}
  for(const size of [144,18,32,54]){
   const el=document.createElement('span');el.className='audit-avatar';el.style.width=el.style.height=`${size}px`;el.setAttribute('aria-hidden','true');
   if(size===144)stage.append(el);else {const example=document.createElement('div');example.className='size-example';const label=document.createElement('span');label.textContent=`${size}px`;example.append(el,label);sizes.append(example);}
   const factory=source==='website'?mountAvatar:mountDmgComparisonAvatar;
   controllers.push(factory(el,{state,paused,seed:1,firstPhase:0}));
  }
 }
}
$('#audit-state').addEventListener('change',mount);
for(const [selector,delta]of [['#audit-prev',-1],['#audit-next',1]])$(selector).addEventListener('click',()=>{const select=$('#audit-state');select.selectedIndex=(select.selectedIndex+delta+states.length)%states.length;mount();});
$('#audit-replay').addEventListener('click',mount);
$('#audit-paused').addEventListener('change',e=>controllers.forEach(c=>c.setPaused(e.target.checked)));
$('#audit-idle').addEventListener('click',()=>{
 if(!supported.has($('#audit-state').value)){ $('#audit-state').value='idle';mount();return;}
 controllers.forEach(c=>c.setState('idle'));$('#audit-state').value='idle';$('#audit-description').textContent='idle — 从当前形变平滑恢复普通头像。';
});
$('#audit-theme').addEventListener('change',e=>document.documentElement.dataset.auditTheme=e.target.value);
window.addEventListener('pagehide',dispose);
window.addEventListener('pageshow',e=>{if(e.persisted)mount();});
let statusTimer;
function watchStatus(){clearInterval(statusTimer);statusTimer=setInterval(()=>{
 const el=$('#dmg-stage .audit-avatar');
 if(el)$('#dmg-status').textContent=el.dataset.avatarMotion==='resting'
  ? 'DMG53状态之一。当前为静态回退。'
  : `请求：${el.dataset.avatarState} ｜ 实际运行：${el.dataset.avatarActiveState??el.dataset.avatarState}`;
},300);}
window.addEventListener('pagehide',()=>clearInterval(statusTimer));
window.addEventListener('pageshow',e=>{if(e.persisted)watchStatus();});
watchStatus();
mount();
