import { setTheme, composerAction, shouldSubmit } from '../src/index.js';
const icons = (await (await fetch('../assets/icon-map.json')).json()).icons;
const $ = (selector) => document.querySelector(selector);
function paintIcon(element, name) {
  const icon = icons[name];
  element.classList.add('grok-icon');
  element.setAttribute('aria-hidden', 'true');
  element.textContent = icon?.outline.glyph ?? icons['circle'].outline.glyph;
  element.dataset.icon = name;
}
document.querySelectorAll('[data-icon]').forEach(el => paintIcon(el, el.dataset.icon));
setTheme(document.documentElement);
let files = [], voice = 'idle', sidebarWidth = 280, manuallyCompact = false, threadRequested = false, voiceGeneration = 0;
const state = () => ({text:$('#prompt').value,attachments:files,voice,readOnly:$('#readonly').checked});
function syncComposer() {
  const action = composerAction(state());
  $('#send').disabled = action.disabled;
  $('#send').setAttribute('aria-label', action.label);
  paintIcon($('#action-icon'), action.glyph);
  $('#prompt').disabled = $('#readonly').checked;
  $('#attach').disabled = $('#readonly').checked;
  $('#teach').disabled = $('#readonly').checked;
  $('#voice-status').textContent = voice === 'idle' ? '' : voice === 'recording' ? '录制中（模拟）' : '转写中（模拟）';
  $('#composer-hint').textContent = $('#readonly').checked ? '此聊天仅供查看' : 'Enter 发送 · Shift+Enter 换行 · 语音按钮仅模拟状态，不请求麦克风';
}
function syncLayout() {
  const compact = manuallyCompact || window.innerWidth < sidebarWidth + 424;
  $('#shell').classList.toggle('compact', compact);
  $('#shell').style.setProperty('--sidebar-width', `${compact ? 88 : sidebarWidth}px`);
  $('#collapse').setAttribute('aria-label', compact ? '展开侧边栏' : '折叠侧边栏');
  paintIcon($('#collapse span'), compact ? 'chevron-right' : 'layout-sidebar-left');
  $('#thread').hidden = !threadRequested || !$('#side-by-side').checked || $('#workspace').clientWidth < 848;
}
function openThread() {
  threadRequested = !threadRequested;
  syncLayout();
  if (threadRequested && $('#thread').hidden) $('#thread-dialog').showModal();
}
function attachments() {
  $('#attachments').replaceChildren(...files.map((file, index) => {
    const chip = document.createElement('span'); chip.className = 'attachment-chip';
    const text = document.createElement('span'); text.textContent = file.name;
    const remove = document.createElement('button'); remove.type='button'; remove.textContent='×'; remove.setAttribute('aria-label',`移除附件 ${file.name}`);
    remove.onclick = () => { files.splice(index,1); attachments(); }; chip.append(text,remove); return chip;
  })); syncComposer();
}
function appendMessage(text, delivery, attachmentNames) {
  const item=document.createElement('div');item.className='message user';
  const bubble=document.createElement('div');bubble.className='grok-bubble grok-bubble--user';bubble.textContent=[text,...attachmentNames.map(n=>`附件：${n}`)].filter(Boolean).join('\n');
  const meta=document.createElement('div');meta.className='message-meta';
  const status=document.createElement('span');status.className='grok-status';status.dataset.state=delivery;status.textContent=delivery==='queued'?'等待发送（示例）':delivery==='failed'?'发送失败（示例）':'已发送（示例）';
  meta.append(status);
  if(delivery==='failed'||delivery==='queued') {
    const action=document.createElement('button');action.className='grok-button';action.textContent=delivery==='failed'?'重试':'取消';
    action.onclick=()=>{if(delivery==='queued'){item.remove();return;}status.textContent='已发送（示例）';status.dataset.state='sent';action.remove();};meta.append(action);
  }
  item.append(bubble,meta);$('#messages').append(item);$('#messages').scrollTop=$('#messages').scrollHeight;
}
function submit() {
  const action=composerAction(state());
  if(action.disabled)return;
  if(action.action==='start-voice'){voice='recording';syncComposer();return;}
  if(action.action==='stop-voice'){voice='processing';syncComposer();const generation=++voiceGeneration;setTimeout(()=>{if(generation!==voiceGeneration)return;voice='idle';$('#prompt').value='这是模拟转写文本。';syncComposer();$('#prompt').focus();},600);return;}
  if(action.action!=='send')return;
  const delivery=$('#delivery').value;appendMessage($('#prompt').value.trim(),delivery,files.map(f=>f.name));if(delivery!=='failed'){$('#prompt').value='';files=[];}attachments();$('#prompt').focus();
}
$('#composer').addEventListener('submit',event=>{event.preventDefault();submit();});
$('#prompt').addEventListener('input',syncComposer);
$('#prompt').addEventListener('keydown',event=>{if(shouldSubmit(event)){event.preventDefault();submit();}if(event.key==='Escape'){if(voice!=='idle'){voiceGeneration++;voice='idle';syncComposer();}else $('#prompt').blur();}});
$('#readonly').onchange=()=>{voiceGeneration++;voice='idle';syncComposer();};
$('#attach').onclick=()=>$('#files').click();
function stageFiles(incoming){const remaining=6-files.length;files.push(...incoming.slice(0,remaining));if(incoming.length>remaining)info('附件上限','主输入区最多暂存 6 个附件；多出的文件未加入。');}
$('#files').onchange=event=>{stageFiles(Array.from(event.target.files));event.target.value='';attachments();};
$('#prompt').addEventListener('paste',event=>{const clipboardFiles=Array.from(event.clipboardData?.files??[]);if(clipboardFiles.length){event.preventDefault();stageFiles(clipboardFiles);attachments();}});
$('#collapse').onclick=()=>{manuallyCompact=!$('#shell').classList.contains('compact');syncLayout();};
$('#bot-search').oninput=event=>document.querySelectorAll('.bot').forEach(button=>button.hidden=!button.dataset.bot.includes(event.target.value));
document.querySelectorAll('.bot').forEach(button=>button.onclick=()=>{document.querySelectorAll('.bot').forEach(b=>b.setAttribute('aria-selected',String(b===button)));$('#bot-name').textContent=button.dataset.bot;});
$('#new-chat').onclick=()=>{$('#messages').replaceChildren();$('#prompt').value='';files=[];voiceGeneration++;voice='idle';attachments();$('#prompt').focus();};
$('#settings').onclick=()=>$('#settings-dialog').showModal();$('#close-settings').onclick=()=>$('#settings-dialog').close();
document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));document.querySelectorAll('[data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==button.dataset.tab);});
$('#theme').onchange=event=>setTheme(document.documentElement,event.target.value);
$('#font').onchange=event=>document.documentElement.dataset.grokTypeface=event.target.value;
$('#side-by-side').onchange=syncLayout;
$('#thread-toggle').onclick=openThread;$('#open-task').onclick=openThread;
document.querySelectorAll('.close-thread').forEach(button=>button.onclick=()=>{threadRequested=false;syncLayout();});
$('#close-thread-dialog').onclick=()=>{threadRequested=false;$('#thread-dialog').close();syncLayout();};
function info(title,body){$('#info-title').textContent=title;$('#info-body').textContent=body;$('#info-dialog').showModal();}
$('#computer').onclick=()=>info('电脑入口','这是 UI 接入点示例。真实电脑连接需要你的项目实现宿主/服务适配器。');
$('#teach').onclick=()=>info('教它做一项任务','原代码包含教学入口。完整录制、提交和回放流程仍需真实应用观察；本示例只展示入口反馈。');
$('#close-info').onclick=()=>$('#info-dialog').close();
const resize=$('#resize');let start=null;
resize.onpointerdown=event=>{start={x:event.clientX,width:sidebarWidth};resize.setPointerCapture(event.pointerId);};
resize.onpointermove=event=>{if(!start)return;sidebarWidth=Math.max(240,Math.min(400,start.width+event.clientX-start.x));resize.setAttribute('aria-valuenow',String(sidebarWidth));syncLayout();};
resize.onpointerup=()=>{start=null;};resize.onpointercancel=()=>{start=null;};
resize.onkeydown=event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();sidebarWidth=Math.max(240,Math.min(400,sidebarWidth+(event.key==='ArrowLeft'?-8:8)));resize.setAttribute('aria-valuenow',String(sidebarWidth));syncLayout();}};
new ResizeObserver(syncLayout).observe($('#workspace'));window.addEventListener('resize',syncLayout);syncLayout();syncComposer();
