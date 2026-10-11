"""Generate portable CSS/ESM token projections without executing target code."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'tokens/design-tokens.json').read_text())
parts = ['/* Generated from design-tokens.json. Run npm run build. */']
for mode, selector in [('light', ':root,[data-grok-theme="light"]'), ('dark', '[data-grok-theme="dark"]')]:
    parts.append(selector + '{\n' + '\n'.join('  ' + k + ':' + v + ';' for k, v in data[mode].items()) + '\n}')
(ROOT / 'tokens/themes.css').write_text('\n'.join(parts) + '\n')
(ROOT / 'tokens/themes.js').write_text('export const themes = ' + json.dumps({k: data[k] for k in ['light', 'dark']}, ensure_ascii=False, indent=2) + ';\n')
print('Generated themes.css and themes.js:', len(data['light']), 'tokens per mode')
