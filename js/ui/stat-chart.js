/**
 * stat-chart.js — Builds statistics grid and guess distribution bar chart HTML.
 */

import { MAX_ATTEMPTS } from '../config.js';

/**
 * Build HTML for player statistics and distribution chart.
 * @param {Object} stats - Stats object from stats-service
 * @param {number} [highlightAttempt=null] - 1-based attempt to highlight
 * @returns {string} HTML string
 */
export function renderStatChartHTML(stats, highlightAttempt = null) {
  const {
    gamesPlayed = 0,
    gamesWon = 0,
    currentStreak = 0,
    maxStreak = 0,
    guessDistribution = new Array(MAX_ATTEMPTS).fill(0),
  } = stats || {};

  const winPct = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const maxInDist = Math.max(...guessDistribution, 1);

  // 4 Metric cards
  const gridHtml = `
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-box__value">${gamesPlayed}</div>
        <div class="stat-box__label">Played</div>
      </div>
      <div class="stat-box">
        <div class="stat-box__value">${winPct}%</div>
        <div class="stat-box__label">Win Rate</div>
      </div>
      <div class="stat-box">
        <div class="stat-box__value">${currentStreak}</div>
        <div class="stat-box__label">Streak</div>
      </div>
      <div class="stat-box">
        <div class="stat-box__value">${maxStreak}</div>
        <div class="stat-box__label">Max Streak</div>
      </div>
    </div>
  `;

  // Guess distribution rows
  let rowsHtml = '';
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const attemptNum = i + 1;
    const count = guessDistribution[i] || 0;
    const pct = Math.max(7, Math.round((count / maxInDist) * 100));
    const isHighlight = highlightAttempt === attemptNum;
    const barClass = isHighlight ? 'stats-chart__bar stats-chart__bar--highlight' : 'stats-chart__bar';

    rowsHtml += `
      <div class="stats-chart__row">
        <div class="stats-chart__label">${attemptNum}</div>
        <div class="stats-chart__bar-wrapper">
          <div class="${barClass}" style="width: ${pct}%;">
            ${count}
          </div>
        </div>
      </div>
    `;
  }

  const chartHtml = `
    <div class="stats-chart">
      <div class="stats-chart__title">Guess Distribution</div>
      ${rowsHtml}
    </div>
  `;

  return `${gridHtml}${chartHtml}`;
}
