/**
 * daily.js — Daily Challenge game mode.
 * One mystery cricketer per day (synchronized at midnight IST).
 * Features deterministic seeded selection, state persistence, and shareable results.
 */

import { getTodayIST, getPuzzleNumber, dateToSeed } from '../services/date-utils.js';
import { seededIndex } from '../services/seeded-rng.js';
import { renderClues } from '../core/clue-renderer.js';
import { renderAttempts } from '../core/attempt-renderer.js';
import { createAutocomplete } from '../core/autocomplete.js';
import { generateShareText, shareResult } from '../core/share.js';
import { startCountdown, stopCountdown } from '../ui/countdown.js';
import { renderStatChartHTML } from '../ui/stat-chart.js';
import { createModal } from '../ui/modal-component.js';
import { MAX_ATTEMPTS, SITE } from '../config.js';

let context = null;
let currentPuzzle = null;
let puzzleNumber = 1;
let todayDate = '';
let gameState = {
  date: '',
  puzzleNumber: 1,
  guesses: [], // Array of { id, name, country, role, correct }
  gameOver: false,
  won: false,
};

let containerEl = null;
let autocompleteInstance = null;
let countdownCleanup = null;

const dailyMode = {
  id: 'daily',
  name: 'Daily Challenge',
  description: 'One mystery cricketer every day. Same puzzle worldwide.',
  icon: 'calendar',
  route: 'daily',

  seo: {
    title: 'Daily Cricket Quiz — Guess Today’s Mystery Cricketer',
    description: 'Play today’s CricGuess daily challenge! Can you identify the secret cricketer in 6 clues? Updated every day at midnight IST.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Game',
      name: 'CricGuess Daily Challenge',
      description: 'Daily cricket guessing puzzle with progressive clues.',
      gameItem: 'Cricket Quiz',
    },
  },

  ads: {
    slots: ['cricguess-daily-top', 'cricguess-daily-bottom'],
  },

  async init(ctx) {
    context = ctx;
    await context.data.loadPlayers();

    todayDate = getTodayIST();
    puzzleNumber = getPuzzleNumber(todayDate);

    // Pick player deterministically for today
    const allPlayers = context.data.getAll();
    const seed = dateToSeed(todayDate);
    const playerIndex = seededIndex(seed, allPlayers.length);
    currentPuzzle = allPlayers[playerIndex];

    // Load saved state from storage
    const saved = context.storage.load('state', null);
    if (saved && saved.date === todayDate) {
      gameState = saved;
    } else {
      gameState = {
        date: todayDate,
        puzzleNumber,
        guesses: [],
        gameOver: false,
        won: false,
      };
      context.storage.save('state', gameState);
    }
  },

  start() {
    // Mode is ready
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
      context.stats.recordGame(true, gameState.guesses.length);
      context.storage.save('state', gameState);

      context.ui.fireConfetti();
      context.ui.showToast('Correct! You identified the mystery cricketer.', 'success', 4000);
      showEndGameModal(true);
    } else if (gameState.guesses.length >= MAX_ATTEMPTS) {
      gameState.gameOver = true;
      gameState.won = false;
      context.stats.recordGame(false);
      context.storage.save('state', gameState);

      context.ui.showToast(`Out! The mystery cricketer was ${currentPuzzle.name}.`, 'error', 4000);
      showEndGameModal(false);
    } else {
      context.storage.save('state', gameState);
      context.ui.showToast(`Incorrect guess. Clue ${gameState.guesses.length + 1} revealed.`, 'info', 2500);
    }

    // Refresh UI
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
    container.classList.add('mode-daily');

    if (countdownCleanup) {
      countdownCleanup();
      countdownCleanup = null;
    }

    const revealedCount = gameState.gameOver
      ? 6
      : Math.min(gameState.guesses.length + 1, 6);

    container.innerHTML = `
      <div class="mode-header">
        <div class="mode-header__badge-row">
          <span class="badge-puzzle-num">Puzzle #${puzzleNumber}</span>
          <span class="badge-date">${todayDate}</span>
        </div>
      </div>

      <div id="daily-clues-mount"></div>

      <div id="daily-attempts-mount"></div>

      <div id="daily-input-mount" style="${gameState.gameOver ? 'display: none;' : ''}"></div>

      <div id="daily-gameover-mount" style="${gameState.gameOver ? '' : 'display: none;'}">
        <div class="next-puzzle-banner card">
          <h3>${gameState.won ? 'Solved' : 'Round Over'}</h3>
          <p>The mystery cricketer was <strong>${escapeHtml(currentPuzzle?.name || '')}</strong> (${escapeHtml(currentPuzzle?.country || '')}).</p>
          ${currentPuzzle?.funFact ? `<p class="text-small text-muted"><em>"${escapeHtml(currentPuzzle.funFact)}"</em></p>` : ''}

          <div class="countdown" style="margin-top: var(--space-4);">
            <span class="countdown__label">Next Daily Puzzle in</span>
            <span class="countdown__time" id="daily-countdown-timer">--:--:--</span>
          </div>

          <div class="share-button-wrapper">
            <button type="button" class="btn btn--primary" id="daily-share-btn">
              <span>Share Result</span>
            </button>
            <button type="button" class="btn btn--secondary" id="daily-view-stats-btn" style="margin-left: var(--space-2);">
              <span>View Stats</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Render Clues
    const cluesMount = container.querySelector('#daily-clues-mount');
    if (cluesMount && currentPuzzle) {
      renderClues(cluesMount, currentPuzzle.clues, revealedCount);
    }

    // Render Attempts & Progress
    const attemptsMount = container.querySelector('#daily-attempts-mount');
    if (attemptsMount) {
      renderAttempts(attemptsMount, gameState.guesses, gameState.gameOver, gameState.won);
    }

    // Mount Autocomplete if game is active
    if (!gameState.gameOver) {
      const inputMount = container.querySelector('#daily-input-mount');
      if (inputMount) {
        autocompleteInstance = createAutocomplete(inputMount, {
          placeholder: 'Search player name (e.g. Tendulkar, Stokes, Cummins)...',
          onSelect: (selectedPlayer) => {
            // Check if already guessed
            if (gameState.guesses.some((g) => g.id === selectedPlayer.id)) {
              context.ui.showToast(`You already guessed ${selectedPlayer.name}!`, 'info');
              return;
            }
            this.handleGuess(selectedPlayer);
          },
        });
      }
    }

    // Wire game over actions
    if (gameState.gameOver) {
      const timerEl = container.querySelector('#daily-countdown-timer');
      if (timerEl) {
        countdownCleanup = startCountdown(timerEl, () => {
          // Re-initialize on midnight
          window.location.reload();
        });
      }

      const shareBtn = container.querySelector('#daily-share-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
          const shareText = this.getShareText();
          const res = await shareResult(shareText);
          if (res.success) {
            context.ui.showToast(res.method === 'share' ? 'Shared successfully!' : 'Copied to clipboard!', 'success');
          } else {
            context.ui.showToast('Failed to copy. Please copy manually.', 'error');
          }
        });
      }

      const statsBtn = container.querySelector('#daily-view-stats-btn');
      if (statsBtn) {
        statsBtn.addEventListener('click', () => {
          showStatsModal();
        });
      }
    }
  },

  getShareText() {
    return generateShareText({
      modeName: 'Daily',
      puzzleNumber,
      guesses: gameState.guesses,
      won: gameState.won,
      maxAttempts: MAX_ATTEMPTS,
    });
  },

  onEnd(result) {
    // End of round hook
  },

  destroy() {
    if (countdownCleanup) {
      countdownCleanup();
      countdownCleanup = null;
    }
    stopCountdown();
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
        The cricketer was <strong>${escapeHtml(currentPuzzle?.name || '')}</strong> (${escapeHtml(currentPuzzle?.country || '')})
      </p>
      ${currentPuzzle?.funFact ? `<p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-2); font-style: italic;">"${escapeHtml(currentPuzzle.funFact)}"</p>` : ''}
    </div>

    ${renderStatChartHTML(stats, highlightAttempt)}
  `;

  const footerHtml = `
    <button type="button" class="btn btn--secondary" data-modal-close>Close</button>
    <button type="button" class="btn btn--primary" id="modal-share-btn">Share Result</button>
  `;

  const modal = createModal({
    id: 'game-over-modal',
    title: won ? 'Solved' : 'Round Over',
    contentHtml,
    footerHtml,
  });

  const shareBtn = modal.backdrop.querySelector('#modal-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareText = dailyMode.getShareText();
      const res = await shareResult(shareText);
      if (res.success) {
        context.ui.showToast('Copied to clipboard!', 'success');
      }
    });
  }

  modal.open();
}

function showStatsModal() {
  const stats = context.stats.getStats();
  const contentHtml = renderStatChartHTML(stats);

  const footerHtml = `
    <button type="button" class="btn btn--secondary" data-modal-close>Close</button>
  `;

  const modal = createModal({
    id: 'daily-stats-modal',
    title: 'Your Daily Stats',
    contentHtml,
    footerHtml,
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

export default dailyMode;
