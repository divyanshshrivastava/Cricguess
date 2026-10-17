/**
 * unlimited.js — Unlimited Practice mode.
 * Endless cricketer guessing with filters (country, role, era, difficulty)
 * and guaranteed no-repeat selection until pool is exhausted.
 */

import { renderClues } from '../core/clue-renderer.js';
import { renderAttempts } from '../core/attempt-renderer.js';
import { createAutocomplete } from '../core/autocomplete.js';
import { generateShareText, shareResult } from '../core/share.js';
import { renderStatChartHTML } from '../ui/stat-chart.js';
import { createModal } from '../ui/modal-component.js';
import { MAX_ATTEMPTS, ERAS, DIFFICULTY_LABELS } from '../config.js';

let context = null;
let currentPuzzle = null;
let containerEl = null;
let usedIds = new Set();
let sessionSolved = 0;

let currentFilters = {
  country: '',
  role: '',
  era: '',
  difficulty: '',
};

let gameState = {
  guesses: [],
  gameOver: false,
  won: false,
};

const unlimitedMode = {
  id: 'unlimited',
  name: 'Unlimited Practice',
  description: 'Endless cricket guessing with optional country and era filters.',
  icon: 'infinity',
  route: 'unlimited',

  seo: {
    title: 'Unlimited Cricket Quiz — Practice Mode',
    description: 'Play unlimited cricket guessing games! Filter by country, role, or era. Test your cricket knowledge with endless mystery players.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Game',
      name: 'CricGuess Unlimited Mode',
      description: 'Endless cricket quiz practice mode with filterable player pool.',
    },
  },

  ads: {
    slots: ['cricguess-unlimited-top', 'cricguess-unlimited-bottom'],
  },

  async init(ctx) {
    context = ctx;
    await context.data.loadPlayers();

    // Load used IDs from storage
    const savedUsed = context.storage.load('usedIds', []);
    usedIds = new Set(savedUsed);

    // Load session score
    sessionSolved = context.storage.load('sessionSolved', 0);

    this.pickNextPlayer();
  },

  start() {
    // Mode is ready
  },

  pickNextPlayer() {
    const filters = {};
    if (currentFilters.country) filters.country = currentFilters.country;
    if (currentFilters.role) filters.role = currentFilters.role;
    if (currentFilters.era) filters.era = currentFilters.era;
    if (currentFilters.difficulty) filters.difficulty = Number(currentFilters.difficulty);

    let player = context.data.getRandom(filters, usedIds);

    // If pool exhausted with current filters, reset used set for this filter combination
    if (!player) {
      usedIds.clear();
      context.storage.save('usedIds', []);
      player = context.data.getRandom(filters, usedIds);
    }

    if (!player) {
      currentPuzzle = null;
      return;
    }

    currentPuzzle = player;
    usedIds.add(player.id);
    context.storage.save('usedIds', Array.from(usedIds));

    gameState = {
      guesses: [],
      gameOver: false,
      won: false,
    };
  },

  getPuzzle() {
    return currentPuzzle;
  },

  handleGuess(player) {
    if (gameState.gameOver || !currentPuzzle) return null;

    const isCorrect = player.id === currentPuzzle.id;
    const guessEntry = {
      id: player.id,
      name: player.name,
      country: player.country,
      role: player.role,
      correct: isCorrect,
    };

    gameState.guesses.push(guessEntry);

    if (isCorrect) {
      gameState.gameOver = true;
      gameState.won = true;
      sessionSolved++;
      context.storage.save('sessionSolved', sessionSolved);
      context.stats.recordGame(true, gameState.guesses.length);

      context.ui.fireConfetti();
      context.ui.showToast('Correct! You identified the mystery cricketer.', 'success', 3000);
      showEndGameModal(true);
    } else if (gameState.guesses.length >= MAX_ATTEMPTS) {
      gameState.gameOver = true;
      gameState.won = false;
      context.stats.recordGame(false);

      context.ui.showToast(`Out! The player was ${currentPuzzle.name}.`, 'error', 3500);
      showEndGameModal(false);
    } else {
      context.ui.showToast(`Incorrect guess. Clue ${gameState.guesses.length + 1} revealed.`, 'info', 2000);
    }

    this.render(containerEl);

    return {
      correct: isCorrect,
      attemptNumber: gameState.guesses.length,
      gameOver: gameState.gameOver,
      won: gameState.won,
      revealedClue: !gameState.gameOver && gameState.guesses.length < currentPuzzle.clues.length
        ? currentPuzzle.clues[gameState.guesses.length]
        : null,
      answer: gameState.gameOver ? currentPuzzle : null,
      funFact: gameState.gameOver ? currentPuzzle.funFact : null,
    };
  },

  render(container) {
    if (!container) return;
    containerEl = container;
    container.classList.add('mode-unlimited');

    if (!currentPuzzle) {
      container.innerHTML = `
        <div class="card text-center" style="padding: var(--space-8);">
          <h3>No Cricketers Found</h3>
          <p>No players matched your selected filter combination.</p>
          <button type="button" class="btn btn--primary" id="unlimited-reset-filters-btn" style="margin-top: var(--space-4);">
            Reset Filters
          </button>
        </div>
      `;
      container.querySelector('#unlimited-reset-filters-btn')?.addEventListener('click', () => {
        currentFilters = { country: '', role: '', era: '', difficulty: '' };
        this.pickNextPlayer();
        this.render(container);
      });
      return;
    }

    const revealedCount = gameState.gameOver ? 6 : Math.min(gameState.guesses.length + 1, 6);
    const countries = context.data.getCountries();
    const roles = context.data.getRoles();

    container.innerHTML = `
      <div class="mode-header">
        <div style="display: flex; justify-content: center; align-items: center; gap: var(--space-3); flex-wrap: wrap;">
          <span class="session-counter">Solved this session: <strong>${sessionSolved}</strong></span>
          <button type="button" class="btn btn--secondary btn--sm" id="unlimited-giveup-btn" style="${gameState.gameOver ? 'display: none;' : ''}">
            Give Up / Skip
          </button>
        </div>

        <div class="filter-bar">
          <select class="filter-select" id="filter-country" aria-label="Filter by country">
            <option value="">All Countries</option>
            ${countries.map((c) => `<option value="${escapeHtml(c)}" ${currentFilters.country === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
          </select>

          <select class="filter-select" id="filter-role" aria-label="Filter by role">
            <option value="">All Roles</option>
            ${roles.map((r) => `<option value="${escapeHtml(r)}" ${currentFilters.role === r ? 'selected' : ''}>${escapeHtml(r)}</option>`).join('')}
          </select>

          <select class="filter-select" id="filter-era" aria-label="Filter by era">
            <option value="">All Eras</option>
            ${ERAS.map((e) => `<option value="${e.id}" ${currentFilters.era === e.id ? 'selected' : ''}>${e.label}</option>`).join('')}
          </select>

          <select class="filter-select" id="filter-difficulty" aria-label="Filter by difficulty">
            <option value="">All Difficulties</option>
            <option value="1" ${currentFilters.difficulty === '1' ? 'selected' : ''}>Easy</option>
            <option value="2" ${currentFilters.difficulty === '2' ? 'selected' : ''}>Medium</option>
            <option value="3" ${currentFilters.difficulty === '3' ? 'selected' : ''}>Hard</option>
          </select>
        </div>
      </div>

      <div id="unlimited-clues-mount"></div>
      <div id="unlimited-attempts-mount"></div>
      <div id="unlimited-input-mount" style="${gameState.gameOver ? 'display: none;' : ''}"></div>

      <div id="unlimited-gameover-mount" style="${gameState.gameOver ? '' : 'display: none;'}">
        <div class="card text-center" style="margin-top: var(--space-6); padding: var(--space-6);">
          <h3>${gameState.won ? 'Solved' : 'Round Over'}</h3>
          <p style="margin-top: var(--space-2);">
            The mystery cricketer was <strong>${escapeHtml(currentPuzzle.name)}</strong> (${escapeHtml(currentPuzzle.country)}).
          </p>
          ${currentPuzzle.funFact ? `<p class="text-small text-muted" style="margin-top: var(--space-2); font-style: italic;">"${escapeHtml(currentPuzzle.funFact)}"</p>` : ''}

          <div class="action-buttons">
            <button type="button" class="btn btn--primary" id="unlimited-next-btn">
              Next Cricketer
            </button>
            <button type="button" class="btn btn--secondary" id="unlimited-share-btn">
              Share Result
            </button>
          </div>
        </div>
      </div>
    `;

    // Filter listeners
    container.querySelector('#filter-country')?.addEventListener('change', (e) => {
      currentFilters.country = e.target.value;
      this.pickNextPlayer();
      this.render(container);
    });
    container.querySelector('#filter-role')?.addEventListener('change', (e) => {
      currentFilters.role = e.target.value;
      this.pickNextPlayer();
      this.render(container);
    });
    container.querySelector('#filter-era')?.addEventListener('change', (e) => {
      currentFilters.era = e.target.value;
      this.pickNextPlayer();
      this.render(container);
    });
    container.querySelector('#filter-difficulty')?.addEventListener('change', (e) => {
      currentFilters.difficulty = e.target.value;
      this.pickNextPlayer();
      this.render(container);
    });

    // Give up / skip
    container.querySelector('#unlimited-giveup-btn')?.addEventListener('click', () => {
      if (confirm(`Give up on this cricketer? The answer will be revealed.`)) {
        gameState.gameOver = true;
        gameState.won = false;
        context.stats.recordGame(false);
        this.render(container);
      }
    });

    // Render Clues
    const cluesMount = container.querySelector('#unlimited-clues-mount');
    if (cluesMount) {
      renderClues(cluesMount, currentPuzzle.clues, revealedCount);
    }

    // Render Attempts
    const attemptsMount = container.querySelector('#unlimited-attempts-mount');
    if (attemptsMount) {
      renderAttempts(attemptsMount, gameState.guesses, gameState.gameOver, gameState.won);
    }

    // Mount Autocomplete if game is active
    if (!gameState.gameOver) {
      const inputMount = container.querySelector('#unlimited-input-mount');
      if (inputMount) {
        createAutocomplete(inputMount, {
          placeholder: 'Search player name...',
          onSelect: (selectedPlayer) => {
            if (gameState.guesses.some((g) => g.id === selectedPlayer.id)) {
              context.ui.showToast(`Already guessed ${selectedPlayer.name}!`, 'info');
              return;
            }
            this.handleGuess(selectedPlayer);
          },
        });
      }
    }

    // Next Cricketer button
    container.querySelector('#unlimited-next-btn')?.addEventListener('click', () => {
      this.pickNextPlayer();
      this.render(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Share button
    container.querySelector('#unlimited-share-btn')?.addEventListener('click', async () => {
      const shareText = this.getShareText();
      const res = await shareResult(shareText);
      if (res.success) {
        context.ui.showToast('Copied to clipboard!', 'success');
      }
    });
  },

  getShareText() {
    return generateShareText({
      modeName: 'Unlimited',
      puzzleNumber: null,
      guesses: gameState.guesses,
      won: gameState.won,
      maxAttempts: MAX_ATTEMPTS,
    });
  },

  onEnd() {},

  destroy() {
    containerEl = null;
  },
};

function showEndGameModal(won) {
  const stats = context.stats.getStats();
  const highlightAttempt = won ? gameState.guesses.length : null;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: var(--space-4);">
      <h3 style="font-size: var(--text-2xl); color: ${won ? 'var(--color-pitch)' : 'var(--color-leather)'};">
        ${won ? 'Solved' : 'Round Over'}
      </h3>
      <p style="margin-top: var(--space-2);">
        The mystery cricketer was <strong>${escapeHtml(currentPuzzle?.name || '')}</strong> (${escapeHtml(currentPuzzle?.country || '')}).
      </p>
      ${currentPuzzle?.funFact ? `<p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-2); font-style: italic;">"${escapeHtml(currentPuzzle.funFact)}"</p>` : ''}
    </div>

    ${renderStatChartHTML(stats, highlightAttempt)}
  `;

  const footerHtml = `
    <button type="button" class="btn btn--secondary" data-modal-close>Close</button>
    <button type="button" class="btn btn--primary" id="unlimited-modal-next-btn">Next Cricketer</button>
  `;

  const modal = createModal({
    id: 'unlimited-game-over-modal',
    title: won ? 'Solved' : 'Round Over',
    contentHtml,
    footerHtml,
  });

  modal.backdrop.querySelector('#unlimited-modal-next-btn')?.addEventListener('click', () => {
    modal.close();
    unlimitedMode.pickNextPlayer();
    unlimitedMode.render(containerEl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  modal.open();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default unlimitedMode;
