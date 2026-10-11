"""Build an interactive product reference from observed official demo styling."""
import html,json,re,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'reference/website/observation.json').read_text())
folder=root/'assets/website';folder.mkdir(exist_ok=True)
entries=[]
for i,avatar in enumerate(data['avatars']):
    name=re.sub(r'[^a-z0-9]+','-',avatar['name'].lower()).strip('-')
    # SVGs are observed inline artwork, preserved as captured; external image URLs are not used.
    p=folder/(name+'.svg')
    artwork=avatar['svg']
    if avatar.get('group'):
        nested=[]
        for part,(x,y) in zip(avatar['group'],[(7,0),(0,14),(14,14)]):
            child=part['svg'].replace('<svg ',f'<svg x="{x}" y="{y}" width="18" height="18" style="--fg:{part["color"]}" ',1)
            nested.append(f'<circle cx="{x+9}" cy="{y+9}" r="10" fill="var(--bg)"/>'+child)
        artwork='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'+''.join(nested)+'</svg>'
    # Make the observed paths usable as standalone SVG images as well as inline avatars.
    artwork=re.sub(r'(<svg[^>]*?)\sstyle="([^"]*)"',r'\1',artwork,count=1)
    artwork=artwork.replace('<svg ',f'<svg style="--fg:{avatar["color"]};--bg:#fcfcfc" ',1)
    end=artwork.index('>')+1
    artwork=artwork[:end]+'<style>.grok-bot-mark__head{fill:var(--fg)}.grok-bot-mark__eye{fill:var(--bg)}</style>'+artwork[end:]
    p.write_text(artwork)
    entries.append({'name':avatar['name'],'path':p.relative_to(root).as_posix(),'color':avatar['color'],'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(root/'assets/website/manifest.json').write_text(json.dumps({'sourceUrl':'https://x.ai/bot','observedDate':data['observedDate'],'assets':entries},indent=2)+'\n')
previews=['Daily briefing is ready for review.','The research list is ready.','Inbox sorted. Drafts are waiting.','The follow-up is ready to review.','Three candidate notes are ready.','Nine receipts have been organized.','The team has shared its next steps.']
times=['Yesterday','15:33','12:33','10:33','7:33','11:33','9:33']
rows=[]
for i,item in enumerate(entries):
    item = {**item, 'svg': (root/item['path']).read_text()}
    rows.append(f'''<button type="button" class="baby-grok-bot-agent-row" data-bot="{i}" {'data-active' if i==0 else ''} aria-pressed="{'true' if i==0 else 'false'}" title="{html.escape(item['name'])}"><span class="baby-grok-bot-agent-row__avatar"><span class="avatar-art" style="--fg:{item['color']};--bg:var(--grok-bot-bg-editor)">{item['svg']}</span></span>{('<span class="avatar-unread" aria-label="Unread"></span>' if i==2 else '')}<span class="baby-grok-bot-agent-row__body"><span class="row-title"><span class="row-name">{html.escape(item['name'])}</span><span class="baby-grok-bot-agent-row__time">{times[i]}</span></span><span class="row-preview">{previews[i]}</span></span></button>''')
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grok Bot · Product UI reference</title><link rel="stylesheet" href="__PREFIX__examples/product.css"></head><body>
<nav class="kit-nav" aria-label="Reference navigation"><a href="__PREFIX__README.md">Grok Bot UI / UX Kit</a><span>Official demo layout · Local sample data</span><div><a href="__PREFIX__examples/design-tokens.html">Tokens</a><a href="__PREFIX__examples/workbench.html">State lab</a><a href="__PREFIX__examples/asset-gallery.html">Assets</a><button id="reference-settings">Appearance</button></div></nav>
<main class="product-stage"><div class="baby-grok-bot" id="product" data-theme="cursor-light" data-profile="website"><div class="baby-grok-bot-shell"><div class="baby-grok-bot-traffic-lights" aria-hidden="true"><span></span><span></span><span></span></div>
<div class="baby-grok-bot-sidebar-slot" id="sidebar-slot"><aside class="baby-grok-bot-sidebar" id="sidebar" aria-label="Bot conversations"><div class="baby-grok-bot-sidebar-header"><div class="baby-grok-bot-sidebar-header__lead"><div class="baby-grok-bot-traffic-lights-spacer"></div></div><div class="baby-grok-bot-sidebar-header__actions"><button class="baby-grok-bot-sidebar-header__action" id="new-bot" aria-label="New Bot"><span class="icon" data-icon="plus"></span></button></div></div>
<label class="baby-grok-bot-chat-search"><span class="icon" data-icon="search"></span><input id="chat-search" class="baby-grok-bot-chat-search__input" type="search" placeholder="Search" aria-label="Search chats"></label><div class="baby-grok-bot-sidebar-list" id="bot-list">__ROWS__</div><button class="baby-grok-bot-sidebar-footer" id="account" aria-label="Open settings"><span class="account-avatar">AM</span><span class="baby-grok-bot-sidebar-footer__name">Alex Morgan</span></button></aside></div><div id="product-resize" class="product-resize" role="separator" tabindex="0" aria-label="Resize sidebar" aria-orientation="vertical" aria-valuemin="240" aria-valuemax="400" aria-valuenow="280"></div>
<div class="baby-grok-bot-chat"><header class="product-header"><button id="agent-title" class="product-title" aria-label="Open Bot details"><span id="title-avatar" class="avatar-art"></span><span id="title-name">Chief</span></button><div class="product-actions"><button id="collapse-bots" aria-label="Collapse sidebar"><span class="icon" data-icon="layout-sidebar-left"></span></button><button id="open-computer" aria-label="Open computer"><span class="icon" data-icon="device-desktop"></span></button></div></header>
<div class="baby-grok-bot-transcript" id="transcript" aria-live="polite"></div><div class="product-composer-wrap"><div class="staged-files" id="staged-files"></div><form id="product-form"><div class="baby-grok-bot-composer-fade" aria-hidden="true"></div><div class="baby-grok-bot-composer"><button type="button" class="composer-plus" id="product-attach" aria-label="Add attachment"><span class="icon" data-icon="plus"></span></button><input type="file" id="product-files" multiple hidden><textarea id="product-prompt" class="baby-grok-bot-composer-field-input" rows="1" placeholder="Message Chief" aria-label="Message Bot"></textarea><button id="product-send" class="composer-send" aria-label="Simulate voice"><span class="icon" id="product-send-icon" data-icon="mic"></span></button></div></form></div></div>
<section class="computer-panel" id="computer-panel" hidden aria-label="Bot computer"><header><span>Computer <small>Local UI preview</small></span><button id="close-computer" aria-label="Close computer"><span class="icon" data-icon="close"></span></button></header><div class="computer-screen"><div class="browser-preview"><div class="browser-bar"><span>● ● ●</span><span>Example workspace</span></div><div class="browser-content"><span class="computer-mark">G</span><h2>Your Bot’s workspace</h2><p>Computer connection is supplied by your project.</p><button id="computer-done">I’m done, continue</button></div></div></div><div class="computer-caption">No remote computer, credentials or external actions.</div></section>
</div></div></main>
<footer class="kit-caption">Visual source: <a href="https://x.ai/bot">x.ai/bot</a> · <a href="__PREFIX__docs/website-comparison.md">Measurements & differences</a> · UI preview, without a service connection.</footer>
<dialog id="product-settings"><header><strong>Settings</strong><button id="close-product-settings" aria-label="Close settings"><span class="icon" data-icon="close"></span></button></header><div class="product-settings-body"><nav aria-label="Settings sections"><button data-section="general" data-active>General</button><button data-section="computer">Computer</button><button data-section="usage">Usage & billing</button><button data-section="updates">Updates</button></nav><div><section data-setting="general"><h2>Appearance</h2><label>Theme<select id="product-theme"><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label><label>Visual source<select id="product-profile"><option value="website">Official website demo</option><option value="dmg">DMG 0.68.1 tokens</option></select></label><p class="settings-note">The website’s theme differs from the installation package. Sources are kept separate.</p><h2>Local interaction tests</h2><label>Next message<select id="product-delivery"><option value="sent">Sent</option><option value="queued">Queued</option><option value="failed">Failed</option></select></label><label>Read-only<input type="checkbox" id="product-readonly"></label></section><section data-setting="computer" hidden><h2>Computer</h2><p>The computer preview shows a UI entry point. Connect your own host adapter.</p></section><section data-setting="usage" hidden><h2>Usage & billing</h2><p>Sample navigation only. The original app can hide this section depending on account state.</p></section><section data-setting="updates" hidden><h2>Updates</h2><p>Package reference: 0.68.1. Official web observation: 2026-10-11.</p></section></div></div></dialog>
<dialog id="new-bot-dialog"><form id="new-bot-form"><h2>New Bot</h2><label>Name<input id="new-bot-name" placeholder="Research partner" required maxlength="40"></label><p>Creates a local preview, without an account or Agent.</p><div class="new-bot-actions"><button type="button" id="cancel-new-bot">Cancel</button><button type="submit">Create</button></div></form></dialog>
<dialog id="product-info"><h2 id="product-info-title"></h2><p id="product-info-body"></p><button id="close-product-info">Close</button></dialog>
<script type="module" src="__PREFIX__examples/product.js"></script></body></html>'''
page=page.replace('__ROWS__',''.join(rows))
(root/'index.html').write_text(page.replace('__PREFIX__','./'))
(root/'examples/product.html').write_text(page.replace('__PREFIX__','../'))
print('Built official-demo product reference with',len(entries),'observed avatars')
