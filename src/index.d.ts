export type ThemePreference = 'light' | 'dark' | 'system';
export function setTheme(root: HTMLElement, preference?: ThemePreference, media?: MediaQueryList): () => void;
export function shouldSubmit(event: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'isComposing'>, menuOpen?: boolean): boolean;
export type VoiceState = 'idle' | 'activating' | 'recording' | 'processing';
export interface ComposerState { text?: string; attachments?: readonly unknown[]; canSend?: boolean; readOnly?: boolean; voice?: VoiceState; }
export interface ComposerAction { action: 'none' | 'send' | 'start-voice' | 'stop-voice' | 'wait-voice'; glyph: string; disabled: boolean; label: string; }
export function composerAction(state?: ComposerState): ComposerAction;
