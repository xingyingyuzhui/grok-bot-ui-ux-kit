// Reproducible subset audit, not an original App integration test.
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {act} from 'react';
import {mountAvatar,avatarStates} from '../src/avatar.js';
import {createMotion,createBehavior,createPaint,renderMotionSVG,resolveBody,fillScale,defaultFill,stateDefinitions} from '../src/avatar-engine.generated.js';
const morphs={thinking:'dots',orbit:'orbit',radar:'radar',progress:'progress',spawning:'gather',dictating:'wave',sending:'send',receiving:'receive',uploading:'dock',writing:'pencil',alerting:'bang','powering-down':'standby'};
const times=[.25,.5,1,1.5,2,2.5,3,3.5,4,5,6,8,10];
const digest=s=>createHash('sha256').update(s).digest('hex').slice(0,16);
function visible(el){for(let n=el;n&&n.tagName?.toLowerCase()!=='svg';n=n.parentElement){if(n.style?.display==='none'||n.getAttribute('display')==='none')return false;for(const o of [n.style?.opacity,n.getAttribute('opacity')])if(o!==null&&o!==undefined&&o!==''&&Number(o)<.01)return false;}return !el.closest('defs');}
function metrics(svg,time){const nodes=[...svg.querySelectorAll('circle,path')].filter(visible);return {time,viewBox:svg.getAttribute('viewBox'),eyes:svg.querySelectorAll('.grok-bot-mark__eye').length?[...svg.querySelectorAll('.grok-bot-mark__eye')].filter(visible).length:null,circles:nodes.filter(n=>n.tagName.toLowerCase()==='circle'&&Number(n.getAttribute('r'))>0).length,rings:nodes.filter(n=>n.tagName.toLowerCase()==='circle'&&(n.getAttribute('fill')==='none')).length,inkVisible:nodes.some(n=>n.getAttribute('stroke-width')==='6'),invalid:/NaN|Infinity|undefined/.test(svg.outerHTML),signature:digest(svg.outerHTML)};}
const dom=new JSDOM('<span id="a"></span><div id="dmg"></div>',{pretendToBeVisual:true});
const win=dom.window,queue=new Map(),old={};let id=0,now=0,width=32;
win.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
win.IntersectionObserver=class{observe(){}disconnect(){}};
win.Element.prototype.getBoundingClientRect=function(){const scale=Number(this.style?.transform?.match(/^scale\(([^)]+)\)/)?.[1]??1);return {width:width*scale,height:width*scale,x:0,y:0,top:0,left:0,right:width*scale,bottom:width*scale};};
const globals={window:win,document:win.document,getComputedStyle:win.getComputedStyle.bind(win),requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:n=>queue.delete(n),IS_REACT_ACT_ENVIRONMENT:true};
for(const [k,v] of Object.entries(globals)){old[k]=Object.getOwnPropertyDescriptor(globalThis,k);Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true});}
function tick(fps){now+=1000/fps;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn(now));}
async function website(state,size,fps){width=size;now=performance.now();let avatar;const el=win.document.querySelector('#a'),samples=[];await act(()=>{avatar=mountAvatar(el,{state,seed:1});});let next=0,inkFrames=0,invalid=false;try{for(let i=1;i<=fps*10;i++){tick(fps);const svg=el.querySelector('svg');const ink=[...svg.children].filter(n=>n.tagName.toLowerCase()==='path'&&!n.classList.length)[1];if(ink&&visible(ink))inkFrames++;if(next<times.length&&i/fps+1e-6>=times[next]){const m=metrics(svg,times[next++]);invalid||=m.invalid;samples.push(m);}}
await act(()=>avatar.setState('idle'));const recovery=[];for(let i=1;i<=fps*2;i++){tick(fps);if([fps/2,fps,2*fps].includes(i)){const m=metrics(el.querySelector('svg'),i/fps);invalid||=m.invalid;recovery.push(m);}}
return {source:'website',state,morph:morphs[state]??null,size,fps,seconds:10,inkFrames,invalid,samples,recovery,uniqueSamples:new Set(samples.map(s=>s.signature)).size};
}finally{await act(()=>avatar.destroy());if(queue.size)throw Error('RAF leaked after '+state);}}
function dmg(state,size,fps){const engine=createMotion({body:resolveBody('blob')}),behavior=createBehavior(engine,state,{seed:1,isCompact:size<48,firstPhase:0});const holder=win.document.querySelector('#dmg');let next=0,invalid=false;const samples=[];for(let i=1;i<=fps*10;i++){behavior.advance(1/fps);engine.advance(1/fps);if(next<times.length&&i/fps+1e-6>=times[next]){holder.innerHTML=renderMotionSVG(engine.frame(),createPaint('#ffb039','#fcfcfc'),Math.round(size*fillScale(defaultFill)*100)/100,'audit',{displaySize:size,extent:'100%'});const m=metrics(holder.firstChild,times[next++]);m.eyes=engine.frame().eyes?.length??0;m.activeState=behavior.state;m.clip=behavior.clip;m.morph=engine.frame().morph?.kind??engine.frame().morph?.type??null;invalid||=m.invalid;samples.push(m);}}
behavior.setState('idle');const recovery=[];for(let i=1;i<=fps*2;i++){behavior.advance(1/fps);engine.advance(1/fps);if([fps/2,fps,2*fps].includes(i)){holder.innerHTML=renderMotionSVG(engine.frame(),createPaint('#ffb039','#fcfcfc'),size*fillScale(defaultFill),'audit',{displaySize:size,extent:'100%'});const m={...metrics(holder.firstChild,i/fps),eyes:engine.frame().eyes?.length??0,activeState:behavior.state};invalid||=m.invalid;recovery.push(m);}}
return {source:'dmg',state,definition:stateDefinitions[state],size,fps,seconds:10,invalid,samples,recovery,uniqueSamples:new Set(samples.map(s=>s.signature)).size};}
const sources={};for(const path of ['reference/website/motion/2x3dmgtyfwu26.js','reference/renderer/assets/index.eager-platform-AatQIEPx.js'])sources[path]=createHash('sha256').update(await readFile(path)).digest('hex');
const result={sources,schema:1,date:'2026-10-11',scope:'Recovered avatar subsets; controlled RAF and simulated SVG widths in JSDOM. Not original App or backend events.',morphs,website:[],dmg:[]};
try{for(const state of avatarStates){for(const [size,fps] of [[32,60],[144,60],[32,30],...(state in morphs?[[18,60],[54,60]]:[])])result.website.push(await website(state,size,fps));process.stdout.write('.');}
for(const state of Object.keys(stateDefinitions))for(const size of [18,32,54,144])for(const fps of [30,60])result.dmg.push(dmg(state,size,fps));
result.summary={websiteStates:avatarStates.length,dmgStates:Object.keys(stateDefinitions).length,websiteCases:result.website.length,dmgCases:result.dmg.length,invalidCases:[...result.website,...result.dmg].filter(r=>r.invalid).length};
await writeFile('docs/avatar-state-audit.json',JSON.stringify(result,null,2)+'\n');console.log('\n'+JSON.stringify(result.summary));if(result.summary.invalidCases)process.exitCode=1;
}finally{dom.window.close();for(const[k,v]of Object.entries(old)){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k];}}
