/**
 * attempt-renderer.js — Renders sleek attempt indicators, progress bar, and guess history.
 * No big numbers: displays clean minimalist indicator slots with red/green marks and borders.
 */

import { MAX_ATTEMPTS } from '../config.js';

const SVG_CHECK = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.5 3.5 6.5-7"/></svg>`;
const SVG_CROSS = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l10 10M13 3l-10 10"/></svg>`;

/**
 * @typedef {Object} GuessEntry
 * @property {string} id - Player id
 * @property {string} name - Player name
 * @property {string} country - Player country
 * @property {string} role - Player role
 * @property {boolean} correct - Whether this guess was correct
 */

/**
 * Render the attempt indicators and guess history.
 * @param {HTMLElement} container - Target container element
 * @param {GuessEntry[]} guesses - Array of guesses made so far
 * @param {boolean} gameOver - Whether current game has ended
 * @param {boolean} won - Whether current game was won
 */
export function renderAttempts(container, guesses = [], gameOver = false, won = false) {
  if (!container) return;

  const currentCount = guesses.length;

  // Build grid of 6 sleek indicator slots (no numbers inside)
  let gridHtml = '<div class="attempts-grid" aria-label="Attempt indicators">';
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    let boxClass = 'attempt-box';
    let content = '';

    if (i < currentCount) {
      const g = guesses[i];
      if (g.correct) {
        boxClass += ' attempt-box--correct';
        content = SVG_CHECK;
      } else {
        boxClass += ' attempt-box--wrong';
        content = SVG_CROSS;
      }
    } else if (i === currentCount && !gameOver) {
      boxClass += ' attempt-box--current';
    }

    gridHtml += `<div class="${boxClass}" aria-label="Attempt ${i + 1}">${content}</div>`;
  }
  gridHtml += '</div>';



  // Build guess history
  let historyHtml = '<div class="guess-history" aria-label="Previous guesses">';
  if (guesses.length > 0) {
    for (let i = 0; i < guesses.length; i++) {
      const g = guesses[i];
      const itemClass = g.correct ? 'guess-item guess-item--correct' : 'guess-item guess-item--wrong';
      const markIcon = g.correct ? SVG_CHECK : SVG_CROSS;

      historyHtml += `
        <div class="${itemClass}">
          <div class="guess-item__player">
            <span class="guess-item__mark">${markIcon}</span>
            <span class="guess-item__name">${escapeHtml(g.name)}</span>
          </div>
          <div class="guess-item__tags">
            <span class="guess-item__tag">${escapeHtml(g.country)}</span>
            <span class="guess-item__tag">${escapeHtml(g.role)}</span>
          </div>
        </div>
      `;
    }
  }
  historyHtml += '</div>';

  container.innerHTML = `
    <div class="attempts-container">
      ${gridHtml}
      ${historyHtml}
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
