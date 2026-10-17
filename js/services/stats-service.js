/**
 * stats-service.js — Generic per-mode statistics tracker.
 * Provides a uniform schema so every mode automatically gets stats.
 * Stores: games played, wins, current streak, max streak, guess distribution.
 */

import { createScopedStorage } from './storage.js';
import { MAX_ATTEMPTS } from '../config.js';

/**
 * @typedef {Object} ModeStats
 * @property {number} gamesPlayed
 * @property {number} gamesWon
 * @property {number} currentStreak
 * @property {number} maxStreak
 * @property {number[]} guessDistribution - Array of length MAX_ATTEMPTS, counts per attempt
 * @property {number} lastPlayed - Timestamp of last completed game
 */

/**
 * Create a fresh empty stats object.
 * @returns {ModeStats}
 */
function createEmptyStats() {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: new Array(MAX_ATTEMPTS).fill(0),
    lastPlayed: 0,
  };
}

/**
 * Create a stats service scoped to a specific mode.
 * @param {string} modeId - Mode identifier (e.g. 'daily')
 * @returns {Object} Stats API for that mode
 */
export function createStatsService(modeId) {
  const storage = createScopedStorage(modeId);

  /**
   * Load current stats for this mode.
   * @returns {ModeStats}
   */
  function getStats() {
    const saved = storage.load('stats', null);
    if (!saved) return createEmptyStats();

    // Ensure all fields exist (forward compatibility)
    return {
      ...createEmptyStats(),
      ...saved,
      guessDistribution: saved.guessDistribution || new Array(MAX_ATTEMPTS).fill(0),
    };
  }

  /**
   * Save stats for this mode.
   * @param {ModeStats} stats
   */
  function saveStats(stats) {
    storage.save('stats', stats);
  }

  /**
   * Record a completed game.
   * @param {boolean} won - Whether the player won
   * @param {number} [attempts=0] - Number of attempts used (1-based, only if won)
   */
  function recordGame(won, attempts = 0) {
    const stats = getStats();
    stats.gamesPlayed++;
    stats.lastPlayed = Date.now();

    if (won) {
      stats.gamesWon++;
      stats.currentStreak++;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

      // Record distribution (attempts is 1-based, array is 0-indexed)
      if (attempts >= 1 && attempts <= MAX_ATTEMPTS) {
        stats.guessDistribution[attempts - 1]++;
      }
    } else {
      stats.currentStreak = 0;
    }

    saveStats(stats);
    return stats;
  }

  /**
   * Get the win percentage.
   * @returns {number} Percentage (0–100)
   */
  function getWinPercent() {
    const stats = getStats();
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }

  /**
   * Reset stats for this mode.
   */
  function resetStats() {
    saveStats(createEmptyStats());
  }

  return {
    getStats,
    recordGame,
    getWinPercent,
    resetStats,
    modeId,
  };
}

/**
 * Get combined stats across all modes.
 * @param {string[]} modeIds - Array of mode IDs
 * @returns {ModeStats} Aggregated stats
 */
export function getCombinedStats(modeIds) {
  const combined = createEmptyStats();

  for (const modeId of modeIds) {
    const service = createStatsService(modeId);
    const stats = service.getStats();

    combined.gamesPlayed += stats.gamesPlayed;
    combined.gamesWon += stats.gamesWon;
    combined.maxStreak = Math.max(combined.maxStreak, stats.maxStreak);

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      combined.guessDistribution[i] += (stats.guessDistribution[i] || 0);
    }
  }

  return combined;
}
