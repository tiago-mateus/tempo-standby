import type { ProgressStyle } from './Progress';

export type Mode = 'focus' | 'short' | 'long';
export type Prefs = {
  focus: number;
  short: number;
  long: number;
  longEvery: number;
  sound: boolean;
  seconds: boolean;
  keepAwake: boolean;
  showTime: boolean;
  appearance: 'night' | 'apple';
  progressStyle: ProgressStyle;
};
