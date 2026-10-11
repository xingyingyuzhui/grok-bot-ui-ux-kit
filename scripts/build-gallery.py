import html
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'assets/manifest.json').read_text())['assets']
icons = json.loads((root / 'assets/icon-map.json').read_text())['icons']
cards = []
for name, values in icons.items():
    cards.append('<div class="icon-entry" data-name="' + html.escape(name) + '"><div class="glyphs"><span class="grok-icon">' + values['outline']['glyph'] + '</span><span class="grok-icon">' + values['filled']['glyph'] + '</span></div><code>' + html.escape(name) + '</code></div>')
images = []
audio = []
fonts = []
for asset in manifest:
    path = '../' + asset['path']
    name = Path(asset['path']).name
    if asset['category'] == 'images':
        images.append('<figure><img loading="lazy" src="' + path + '" alt="' + html.escape(name) + '"><figcaption><a href="' + path + '">' + html.escape(name) + '</a></figcaption></figure>')
    elif asset['category'] == 'audio':
        audio.append('<div><p>' + html.escape(name) + '</p><audio controls preload="none" src="' + path + '"></audio></div>')
    elif asset['category'] == 'fonts':
        fonts.append('<li><a href="' + path + '">' + html.escape(name) + '</a></li>')
page = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grok Bot · 原始素材目录</title><link rel="stylesheet" href="../src/styles.css"><style>*{box-sizing:border-box}body{margin:0}main{max-width:1180px;padding:32px 24px;margin:auto}header{align-items:flex-start;display:flex;justify-content:space-between;gap:20px}h1{font-size:26px;line-height:32px}h2{font-size:18px;margin-top:32px}p{color:var(--sand-text-secondary)}a{color:inherit}.icons{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}.icon-entry{padding:16px;border:1px solid var(--sand-border-weak);border-radius:8px;text-align:center}.glyphs{display:flex;justify-content:center;gap:24px;padding:8px}.glyphs .grok-icon{font-size:24px}.icon-entry code{display:block;font-size:11px;overflow-wrap:anywhere;color:var(--sand-text-secondary)}.images{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}figure{margin:0;border:1px solid var(--sand-border-weak);padding:20px;border-radius:8px}figure img{width:80px;height:80px;object-fit:contain;background:#fff;border-radius:8px}figcaption{font-size:11px;overflow-wrap:anywhere;margin-top:12px}#icon-search{margin:16px 0}.audio{display:flex;flex-wrap:wrap;gap:24px}li{font-size:12px}.font{font-family:XVF,sans-serif;font-size:24px}.mono{font-family:'XVF Mono',monospace;font-size:18px}.note{padding:14px;background:var(--sand-bg-subtle);border-radius:8px}</style></head><body class="grok-surface"><main><header><div><a href="./design-tokens.html">返回设计变量</a> · <a href="./workbench.html">组件与交互参考</a><h1>原始素材与图标目录</h1><p>Grok Bot 0.68.1 安装包的原始资源，逐文件 SHA-256 见 assets/manifest.json。</p></div><button id="theme" class="grok-button">切换主题</button></header><div class="note">图标每组左侧 outline，右侧 filled；原 resolver 未定义独立 filled 时按原算法回退。此页没有执行目标应用。</div><h2>原生名称图标 · <span id="count">808 / 808</span></h2><input class="grok-input" id="icon-search" type="search" aria-label="搜索原生图标" placeholder="搜索 arrow-up / mic / search / settings"><div class="icons">__ICONS__</div><h2>图片与连接器 Logo</h2><div class="images">__IMAGES__</div><h2>打包字体</h2><p class="font">XVF — A teammate that takes work off your plate.</p><p class="mono">XVF Mono — Aa Bb Cc 0123456789</p><p>是否在原应用启用 XVF 受开关影响，此处是资源样本。</p><ul>__FONTS__</ul><h2>原始声音</h2><p>点播放才加载声音；没有自动播放或录音。</p><div class="audio">__AUDIO__</div></main><script type="module">import{setTheme}from'../src/index.js';let mode='light';setTheme(document.documentElement,mode);document.querySelector('#theme').onclick=()=>{mode=mode==='light'?'dark':'light';setTheme(document.documentElement,mode)};document.querySelector('#icon-search').oninput=e=>{const q=e.target.value.toLowerCase();let count=0;document.querySelectorAll('.icon-entry').forEach(item=>{item.hidden=!item.dataset.name.includes(q);if(!item.hidden)count++});document.querySelector('#count').textContent=`${count} / 808`;};</script></body></html>'''
website = json.loads((root / 'assets/website/manifest.json').read_text())['assets']
website_cards = ''.join('<figure><img src="../'+a['path']+'" alt="'+html.escape(a['name'])+'"><figcaption><a href="../'+a['path']+'">'+html.escape(a['name'])+'</a></figcaption></figure>' for a in website)
page = page.replace('<h2>打包字体</h2>', '<h2>官网头像 · 独立来源</h2><p>公开网页观察的7份SVG，源路径与SHA-256见assets/website/manifest.json。</p><div class="images">'+website_cards+'</div><h2>打包字体</h2>')
page = page.replace('__ICONS__', ''.join(cards)).replace('__IMAGES__', ''.join(images)).replace('__FONTS__', ''.join(fonts)).replace('__AUDIO__', ''.join(audio))
(root / 'examples/asset-gallery.html').write_text(page)
print('Generated asset gallery:', len(icons), 'icons;', len(manifest), 'original assets')
