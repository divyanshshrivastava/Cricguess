/**
 * date-utils.js — IST (Asia/Kolkata) date utilities.
 * Handles daily puzzle rotation at midnight IST, puzzle numbering,
 * and countdown timer values.
 */

import { TIMEZONE, EPOCH_DATE } from '../config.js';

/**
 * Get the current date string in IST (YYYY-MM-DD).
 * @returns {string} Date string like '2024-03-15'
 */
export function getTodayIST() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // Returns 'YYYY-MM-DD' in en-CA locale
}

/**
 * Calculate the puzzle number for a given date.
 * Puzzle #1 corresponds to EPOCH_DATE.
 * @param {string} [dateStr] - Optional date string (YYYY-MM-DD); defaults to today IST
 * @returns {number} Puzzle number (1-based)
 */
export function getPuzzleNumber(dateStr) {
  const today = dateStr || getTodayIST();
  const epoch = new Date(EPOCH_DATE + 'T00:00:00');
  const current = new Date(today + 'T00:00:00');
  const diffMs = current - epoch;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1; // 1-based
}

/**
 * Get milliseconds remaining until midnight IST.
 * @returns {number} Milliseconds until next puzzle
 */
export function msUntilMidnightIST() {
  const now = new Date();

  // Get current IST time components
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = istFormatter.formatToParts(now);
  const hours = parseInt(parts.find((p) => p.type === 'hour').value, 10);
  const minutes = parseInt(parts.find((p) => p.type === 'minute').value, 10);
  const seconds = parseInt(parts.find((p) => p.type === 'second').value, 10);

  const secondsSinceMidnight = hours * 3600 + minutes * 60 + seconds;
  const secondsUntilMidnight = 86400 - secondsSinceMidnight;

  return secondsUntilMidnight * 1000;
}

/**
 * Format milliseconds as HH:MM:SS countdown string.
 * @param {number} ms - Milliseconds remaining
 * @returns {string} Formatted time like '05:23:17'
 */
export function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

/**
 * Convert a date string to a numeric seed for the RNG.
 * Combines year, month, and day into a single integer.
 * @param {string} dateStr - Date string 'YYYY-MM-DD'
 * @returns {number} Numeric seed
 */
export function dateToSeed(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return y * 10000 + m * 100 + d;
}
