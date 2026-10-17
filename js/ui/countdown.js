/**
 * countdown.js — Live countdown timer to next daily puzzle at midnight IST.
 */

import { msUntilMidnightIST, formatCountdown } from '../services/date-utils.js';

let intervalId = null;

/**
 * Start updating a countdown element every second.
 * @param {HTMLElement} element - Target element to display the time
 * @param {function(): void} [onMidnight] - Callback when midnight arrives
 * @returns {function(): void} Cleanup function to stop countdown
 */
export function startCountdown(element, onMidnight) {
  if (!element) return () => {};

  function tick() {
    const ms = msUntilMidnightIST();
    element.textContent = formatCountdown(ms);

    if (ms <= 1000) {
      if (onMidnight) {
        onMidnight();
      }
    }
  }

  tick(); // immediate initial tick
  intervalId = setInterval(tick, 1000);

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

/**
 * Stop active countdown timer.
 */
export function stopCountdown() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
