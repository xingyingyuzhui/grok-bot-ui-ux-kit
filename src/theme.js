/** Reference adapter written for this kit, not recovered application code. */
const subscriptions = new WeakMap();
export function setTheme(root, preference = 'system', media = window.matchMedia('(prefers-color-scheme: dark)')) {
  if (!['light', 'dark', 'system'].includes(preference)) throw new TypeError('Unknown theme preference');
  subscriptions.get(root)?.();
  const apply = () => {
    const resolved = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    root.dataset.grokTheme = resolved;
    root.style.colorScheme = resolved;
  };
  apply();
  if (preference === 'system') media.addEventListener('change', apply);
  const dispose = () => {
    if (preference === 'system') media.removeEventListener('change', apply);
    if (subscriptions.get(root) === dispose) subscriptions.delete(root);
  };
  subscriptions.set(root, dispose);
  return dispose;
}
