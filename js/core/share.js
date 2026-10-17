/**
 * share.js — Share text generator and Web Share / Clipboard API integration.
 */

import { SITE, MAX_ATTEMPTS } from '../config.js';

/**
 * Generate shareable emoji grid text.
 * @param {Object} options
 * @param {string} [options.modeName='Daily'] - Mode label
 * @param {number|null} [options.puzzleNumber=null] - Puzzle # for daily
 * @param {Array<{correct: boolean}>} options.guesses - Guesses made
 * @param {boolean} options.won - Whether round was won
 * @param {number} [options.maxAttempts=6]
 * @returns {string} Formatted share text with emoji grid
 */
export function generateShareText({
  modeName = 'Daily',
  puzzleNumber = null,
  guesses = [],
  won = false,
  maxAttempts = MAX_ATTEMPTS,
}) {
  const count = guesses.length;
  const scoreStr = won ? `${count}/${maxAttempts}` : `X/${maxAttempts}`;
  const header = puzzleNumber !== null
    ? `${SITE.name} #${puzzleNumber} ${scoreStr}`
    : `${SITE.name} ${modeName} ${scoreStr}`;

  // Build emoji line
  const emojis = [];
  for (let i = 0; i < guesses.length; i++) {
    emojis.push(guesses[i].correct ? '🟩' : '🟥');
  }

  // If won before maxAttempts, fill rest with ⬜
  while (emojis.length < maxAttempts) {
    emojis.push('⬜');
  }

  const grid = emojis.join('');
  const url = window.location.origin ? `${window.location.origin}${window.location.pathname}` : SITE.url;

  return `${header}\n\n${grid}\n\nPlay at: ${url}`;
}

/**
 * Share text via Web Share API or copy to clipboard.
 * @param {string} text - Text to share
 * @returns {Promise<{ success: boolean, method: 'share'|'clipboard' }>}
 */
export async function shareResult(text) {
  if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent || '')) {
    try {
      await navigator.share({
        title: `${SITE.name} Result`,
        text: text,
      });
      return { success: true, method: 'share' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'share' };
      }
      // Fall through to clipboard if share failed
    }
  }

  // Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } catch {
      // Fallback
    }
  }

  // Fallback for older browsers
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (successful) {
      return { success: true, method: 'clipboard' };
    }
  } catch (err) {
    console.warn('[Share] Fallback copy failed:', err);
  }

  return { success: false, method: 'clipboard' };
}
