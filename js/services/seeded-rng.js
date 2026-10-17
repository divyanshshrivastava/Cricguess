/**
 * seeded-rng.js — Deterministic pseudo-random number generator.
 * Uses the Mulberry32 algorithm for reproducible sequences.
 * Used by Daily mode to pick the same player for everyone on a given date.
 */

/**
 * Create a seeded random number generator (Mulberry32).
 * @param {number} seed - Integer seed value
 * @returns {function(): number} Function that returns a float in [0, 1)
 */
export function createSeededRNG(seed) {
  let state = seed | 0;

  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a deterministic integer seed from a string.
 * Uses a simple hash (DJB2 variant).
 * @param {string} str - Input string (e.g. '2024-03-15')
 * @returns {number} Integer hash
 */
export function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0; // Ensure unsigned
}

/**
 * Deterministically shuffle an array using a seeded RNG.
 * Returns a new array; does not mutate the original.
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Integer seed
 * @returns {Array} Shuffled copy
 */
export function seededShuffle(array, seed) {
  const rng = createSeededRNG(seed);
  const result = [...array];

  // Fisher-Yates shuffle with seeded RNG
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Pick a deterministic index from a range based on a seed.
 * @param {number} seed - Integer seed
 * @param {number} max - Exclusive upper bound
 * @returns {number} Index in [0, max)
 */
export function seededIndex(seed, max) {
  const rng = createSeededRNG(seed);
  return Math.floor(rng() * max);
}
