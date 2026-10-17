/**
 * clue-renderer.js — Renders sleek clue cards with progressive reveal states.
 * Minimalist, elegant styling without unnecessary emojis.
 */

const CLUE_LEVELS = [
  'Hardest',
  'Hard',
  'Medium',
  'Moderate',
  'Easy',
  'Final Clue',
];

const SVG_LOCK = `<svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: 4px;"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V4.5a3 3 0 016 0V7"/></svg>`;

/**
 * Render clue cards into a container.
 * @param {HTMLElement} container - DOM container element
 * @param {string[]} clues - Array of 6 clue strings
 * @param {number} revealedCount - Number of clues currently unlocked (1 to 6)
 */
export function renderClues(container, clues, revealedCount) {
  if (!container || !clues) return;

  const total = Math.max(clues.length, 6);
  let html = '<div class="clues-list" role="region" aria-label="Cricket clues">';

  for (let i = 0; i < total; i++) {
    const isRevealed = i < revealedCount;
    const isFinal = i === total - 1;
    const levelLabel = CLUE_LEVELS[i] || 'Bonus';
    const clueText = clues[i] || '';

    const cardClasses = [
      'clue-card',
      isRevealed ? 'clue-card--revealed' : 'clue-card--locked',
      isFinal ? 'clue-card--final' : '',
    ].filter(Boolean).join(' ');

    if (isRevealed) {
      html += `
        <article class="${cardClasses}" id="clue-card-${i + 1}">
          <header class="clue-card__header">
            <span class="clue-card__badge">Clue ${i + 1}</span>
            <span class="clue-card__difficulty">${levelLabel}</span>
          </header>
          <div class="clue-card__content">
            ${escapeHtml(clueText)}
          </div>
        </article>
      `;
    } else {
      html += `
        <article class="${cardClasses}" id="clue-card-${i + 1}">
          <header class="clue-card__header">
            <span class="clue-card__badge clue-card__badge--locked">${SVG_LOCK}Clue ${i + 1}</span>
            <span class="clue-card__difficulty">Locked</span>
          </header>
          <div class="clue-card__content">
            <span>Unlocks after guess ${i}</span>
          </div>
        </article>
      `;
    }
  }

  html += '</div>';
  container.innerHTML = html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
