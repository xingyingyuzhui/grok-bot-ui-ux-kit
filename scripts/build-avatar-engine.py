"""Rebuild only audited animation declarations, never load the application bundle."""
import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def recover(manifest,target,exports):
 data=json.loads((root/manifest).read_text());p=root/data['source'];raw=p.read_bytes()
 assert hashlib.sha256(raw).hexdigest()==data['sourceSha256'],f'Source changed: {p}'
 s=raw.decode().encode('utf-16-le');parts=[]
 assert not data['imports'],'Animation subset must have no imports'
 for d in data['declarations']:
  fragment=s[d['start']*2:d['end']*2].decode('utf-16-le')
  assert hashlib.sha256(fragment.encode()).hexdigest()==d['sha256'],d['name']
  parts.append((d['kind']+' ' if d['kind'] else '')+fragment+(';' if d['kind'] else ''))
 header='// GENERATED from '+data['source']+'. See NOTICE.md and assets/avatar-motion/.\n// Original declarations retained; only declaration separators and exports added.\n'
 result=header+'\n'.join(parts)+'\n'+exports+'\n'
 (root/target).write_text(result)
 print('Recovered',len(parts),'animation declarations to',target)
recover('assets/avatar-motion/dmg-extraction.json','src/avatar-engine.generated.js',
 'export { oh as createMotion, zw as createBehavior, Wh as renderMotionSVG, NM as createPaint, q_ as resolveBody, rw as pointerGaze, OM as hashSeed, _r as fillScale, AM as updateSVG, ao as defaultFill, zu as stateDefinitions };')
website=json.loads((root/'assets/avatar-motion/website-extraction.json').read_text())
for module in website['modules']:
 raw=(root/module['source']).read_bytes();assert hashlib.sha256(raw).hexdigest()==module['sourceSha256']
 s=raw.decode().encode('utf-16-le');parts=[]
 for part in module['segments']:
  original=s[part['start']*2:part['end']*2].decode('utf-16-le')
  assert hashlib.sha256(original.encode()).hexdigest()==part['sha256']
  parts.append(part.get('replacement',original))
 output='// GENERATED from '+module['source']+'. See NOTICE.md.\n// Telemetry removed, module imports/exports adapted; animation logic retained.\n'+'\n'.join(parts)+'\n'
 (root/module['target']).write_text(output)
 print('Recovered official website module:',module['target'])
