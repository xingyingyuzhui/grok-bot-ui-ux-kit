export type AvatarState =
  | "sleeping"
  | "waking"
  | "idle"
  | "listening"
  | "thinking"
  | "searching"
  | "working"
  | "excited"
  | "surprised"
  | "suspicious"
  | "angry"
  | "drowsy"
  | "happy"
  | "curious"
  | "confused"
  | "bored"
  | "proud"
  | "shy"
  | "sad"
  | "laughing"
  | "scared"
  | "playful"
  | "celebrate"
  | "orbit"
  | "radar"
  | "progress"
  | "spawning"
  | "humming"
  | "dictating"
  | "writing"
  | "sending"
  | "receiving"
  | "uploading"
  | "alerting"
  | "powering-down";
export type AvatarShape =
  | "blob"
  | "pebble"
  | "bean"
  | "egg"
  | "squircle"
  | "square"
  | "tablet"
  | "capsule"
  | "cylinder"
  | "hex"
  | "gem"
  | "crystal"
  | "wedge"
  | "shield"
  | "dome"
  | "arch"
  | "horseshoe"
  | "cloud"
  | "teardrop"
  | "leaf"
  | "clover"
  | "house"
  | "heart"
  | "sparkle"
  | "star6";
export const avatarStates: readonly AvatarState[];
export const avatarShapes: readonly AvatarShape[];
export interface AvatarOptions {
  state?: AvatarState;
  shape?: AvatarShape;
  seed?: number;
  paused?: boolean;
  followPointer?: boolean;
}
export interface AvatarController {
  readonly state: AvatarState;
  readonly shape: AvatarShape;
  readonly paused: boolean;
  setState(state: AvatarState): void;
  setShape(shape: AvatarShape): void;
  setPaused(paused: boolean): void;
  spin(turns?: number): void;
  bounce(): void;
  burst(): void;
  snapshot(): string;
  destroy(): void;
}
export function mountAvatar(
  element: HTMLElement,
  options?: AvatarOptions,
): AvatarController;
export function avatarPresentation(
  state?: AvatarState,
  shape?: AvatarShape,
): Record<string, unknown>;
