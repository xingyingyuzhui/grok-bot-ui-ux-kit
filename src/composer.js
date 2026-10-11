/** Minimal adapter for the documented composer branches; no server or microphone. */
export function shouldSubmit(event, menuOpen = false) {
  return !menuOpen && event.key === 'Enter' && !event.shiftKey && !event.isComposing;
}
export function composerAction({ text = '', attachments = [], canSend = true, readOnly = false, voice = 'idle' } = {}) {
  if (readOnly) return { action: 'none', glyph: 'arrow-up', disabled: true, label: '此聊天仅供查看' };
  if (voice !== 'idle') {
    if (voice === 'recording') return { action: 'stop-voice', glyph: 'stop', disabled: false, label: '停止录制（示例）' };
    return { action: 'wait-voice', glyph: 'waveform', disabled: true, label: voice === 'activating' ? '准备语音（示例）' : '转写中（示例）' };
  }
  const payload = text.trim().length > 0 || attachments.length > 0;
  return payload
    ? { action: 'send', glyph: 'arrow-up', disabled: !canSend, label: '发送' }
    : { action: 'start-voice', glyph: 'mic', disabled: !canSend, label: '模拟语音状态' };
}
