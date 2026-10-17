/**
 * blitz.js — Blitz Mode plugin (Example third mode, disabled by default).
 * Demonstrates extensibility: timed speed-guessing against a 60-second countdown.
 */

import { MAX_ATTEMPTS } from '../config.js';

let context = null;
let currentPuzzle = null;
let containerEl = null;

const blitzMode = {
  id: 'blitz',
  name: 'Blitz Challenge',
  description: 'Guess as many mystery cricketers as possible in 60 seconds.',
  icon: 'zap',
  route: 'blitz',

  seo: {
    title: 'Blitz Cricket Quiz — Speed Challenge',
    description: 'Fast-paced cricket trivia against the clock.',
  },

  async init(ctx) {
    context = ctx;
    await context.data.loadPlayers();
    currentPuzzle = context.data.getRandom();
  },

  start() {},

  getPuzzle() {
    return currentPuzzle;
  },

  handleGuess(player) {
    const isCorrect = player.id === currentPuzzle?.id;
    return {
      correct: isCorrect,
      attemptNumber: 1,
      gameOver: false,
      won: isCorrect,
      revealedClue: null,
      answer: currentPuzzle,
      funFact: currentPuzzle?.funFact || null,
    };
  },

  render(container) {
    containerEl = container;
    container.classList.add('mode-blitz');
    container.innerHTML = `
      <div class="card text-center" style="padding: var(--space-8);">
        <h2>Blitz Mode</h2>
        <p class="text-muted" style="margin-top: var(--space-2);">
          Coming soon! Race against the clock to guess cricketers under pressure.
        </p>
      </div>
    `;
  },

  getShareText() {
    return `CricGuess Blitz Challenge!`;
  },

  onEnd() {},

  destroy() {
    containerEl = null;
  },
};

export default blitzMode;
