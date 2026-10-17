/**
 * config.js — Global configuration constants and per-mode feature flags.
 * Single source of truth for app-wide settings.
 */

/** Maximum guesses allowed per puzzle */
export const MAX_ATTEMPTS = 6;

/** localStorage key prefix for all CricGuess data */
export const STORAGE_PREFIX = 'cricguess';

/** Storage schema version — bump when schema changes */
export const STORAGE_VERSION = 1;

/** Timezone used for daily puzzle rotation */
export const TIMEZONE = 'Asia/Kolkata';

/** Epoch date for puzzle numbering (first puzzle = #1) */
export const EPOCH_DATE = '2024-01-01';

/** Path to the player dataset (resolved relative to this module) */
export const DATA_PATH = new URL('../data/players.json', import.meta.url).href;

/** Site metadata */
export const SITE = {
  name: 'CricGuess',
  tagline: 'Guess the mystery cricketer!',
  url: 'https://cricguess.com', // TODO: Replace with your actual domain
  description: 'A daily cricket guessing game. Identify the mystery cricketer from clues — test your cricket knowledge!',
  twitterHandle: '@cricguess', // TODO: Replace with your handle
};

/** AdSense configuration */
export const ADSENSE = {
  publisherId: 'ca-pub-2824402019208557',
  enabled: true,
};

/**
 * Per-mode feature flags.
 * Set `enabled: false` to hide a mode during development.
 */
export const MODE_FLAGS = {
  daily: { enabled: true },
  unlimited: { enabled: true },
  blitz: { enabled: false }, // Example mode — disabled by default
};

/** Difficulty labels */
export const DIFFICULTY_LABELS = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

/** Era definitions for filtering */
export const ERAS = [
  { id: 'pre-1980', label: 'Pre-1980', range: [0, 1979] },
  { id: '1980s-1990s', label: '1980s–1990s', range: [1980, 1999] },
  { id: '2000s-2010s', label: '2000s–2010s', range: [2000, 2019] },
  { id: '2020s', label: '2020s–Present', range: [2020, 2099] },
];
