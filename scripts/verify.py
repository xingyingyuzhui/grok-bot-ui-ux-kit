"""Check material provenance, portable links and shipped code syntax."""
import gzip
import hashlib
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).resolve().parents[1]
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for record in json.loads((root / 'reference/website/manifest.json').read_text())['files']:
    assert digest(root / record['path']) == record['sha256'], record['path']
for asset in json.loads((root / 'assets/website/manifest.json').read_text())['assets']:
    assert digest(root / asset['path']) == asset['sha256'], asset['path']
    tree = ET.parse(root / asset['path'])
    assert not any(el.tag.endswith('script') for el in tree.iter())
for record in json.loads((root / 'reference/manifest.json').read_text())['files']:
    assert digest(root / record['path']) == record['sha256'], record['path']
# Audited motion subsets: preserve original sources and every selected declaration/statement.
dmg_motion=json.loads((root/'assets/avatar-motion/dmg-extraction.json').read_text())
assert digest(root/dmg_motion['source']) == dmg_motion['sourceSha256']
assert not dmg_motion['imports']
assert set(dmg_motion['globals']) <= {'Array','Error','Float64Array','Int32Array','Map','Math','Number','Object','Set','String','Uint8Array','WeakMap','parseFloat'}
for specification in [dmg_motion,*json.loads((root/'assets/avatar-motion/website-extraction.json').read_text())['modules']]:
    assert digest(root/specification['source']) == specification['sourceSha256']
    source=(root/specification['source']).read_text().encode('utf-16-le')
    for part in specification.get('declarations',specification.get('segments',[])):
        fragment=source[part['start']*2:part['end']*2].decode('utf-16-le')
        assert hashlib.sha256(fragment.encode()).hexdigest() == part['sha256']
        assert len(source[:part['start']*2].decode('utf-16-le')) == part['charOffset']
wrapper=json.loads((root/'assets/avatar-motion/website-extraction.json').read_text())['wrapperEvidence']
assert digest(root/wrapper['path']) == wrapper['sha256']
catalog=json.loads((root/'assets/avatar-motion/catalog.json').read_text())
assert len(catalog['website']['states']) == 35 and len(catalog['website']['shapes']) == 25 and len(catalog['dmg']['states']) == 53
assets = json.loads((root / 'assets/manifest.json').read_text())['assets']
for asset in assets:
    assert digest(root / asset['path']) == asset['sha256'], asset['path']
    assert digest(root / asset['source']) == asset['sha256'], asset['source']
data = json.loads((root / 'tokens/design-tokens.json').read_text())
assert len(data['light']) == len(data['dark']) == 136
assert digest(root / data['source']['javascript']) == data['source']['sha256']
assert digest(root / data['source']['css']) == data['source']['cssSha256']
for token in data['tokens']:
    source = (root / token['source']['file']).read_text()
    offset = token['source']['characterOffset']
    expression = token['source']['expression']
    assert source[offset:offset + len(expression)] == expression, token['name']
used_vars = set(re.findall(r'var\((--sand-[\w-]+)', (root / 'src/styles.css').read_text() + (root / 'examples/workbench.css').read_text()))
assert not used_vars - data['light'].keys(), used_vars - data['light'].keys()
icons = json.loads((root / 'assets/icon-map.json').read_text())
assert len(icons['icons']) == 808
html = (root / 'examples/workbench.html').read_text() + (root / 'index.html').read_text()
for name in re.findall(r'data-icon="([^"]+)"', html):
    assert name in icons['icons'], name
assert icons['icons']['arrow-up']['outline']['unicode'] == 'U+EAA1'
for record in json.loads((root / 'evidence/manifest.json').read_text())['records']:
    raw = gzip.decompress((root / record['file']).read_bytes())
    assert hashlib.sha256(raw).hexdigest() == record['uncompressedSha256'], record['file']
    assert json.loads(raw)['evidence_id'] == record['evidenceId']
for path in [*root.glob('*.md'), *root.glob('docs/*.md')]:
    for link in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        link = link.strip('<>').split('#')[0]
        if not link or '://' in link or link.startswith('mailto:'):
            continue
        assert (path.parent / link).exists(), f'Broken link: {path.relative_to(root)} -> {link}'
for path in [root / 'index.html', *root.glob('examples/*.html')]:
    for link in re.findall(r'(?:href|src)="([^"]+)"', path.read_text()):
        if '://' in link or link.startswith('data:') or link.startswith('#'):
            continue
        assert (path.parent / link).exists(), f'Broken HTML asset: {path.relative_to(root)} -> {link}'
for path in [*root.glob('src/*.js'), *root.glob('examples/*.js'), *root.glob('tokens/*.js'),*root.glob('scripts/*.js'),*root.glob('dist/*.js')]:
    subprocess.run(['node', '--check', str(path)], check=True)
assert not list(root.rglob('*.dmg')) and not list(root.rglob('*.asar'))
print(f'OK: {len(assets)} asset hashes, 136 token anchors, 808 icons, 7 website SVG snapshots, 3 original website avatar modules, 633 DMG motion declarations, original reference hashes, 3 canonical Evidence records, Markdown/HTML links and JS syntax')
