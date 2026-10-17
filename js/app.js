/**
 * app.js — Main application bootstrap.
 * Boots the design system, theme manager, cookie consent, router,
 * and dynamically loads the active mode plugin.
 */

import { initTheme } from './core/theme-manager.js';
import { initRouter, getCurrentRoute } from './core/router.js';
import { updateSEO } from './core/seo.js';
import { createEventBus } from './core/event-bus.js';
import * as dataService from './core/data-service.js';
import { createScopedStorage } from './services/storage.js';
import { createStatsService, getCombinedStats } from './services/stats-service.js';
import { showToast } from './ui/toast.js';
import { fireConfetti } from './ui/confetti.js';
import { openModal, closeModal } from './core/modal.js';
import { createModal } from './ui/modal-component.js';
import { renderStatChartHTML } from './ui/stat-chart.js';
import { initCookieConsent } from './ui/cookie-consent.js';
import { mountAdSlots } from './ui/ad-slot.js';
import { getMode, getAvailableModes } from './modes/registry.js';
import * as config from './config.js';

let activeModeInstance = null;
const eventBus = createEventBus();

/**
 * Build the context object passed to every mode plugin.
 * @param {string} modeId
 * @returns {Object} ModeContext
 */
function createModeContext(modeId) {
  return {
    data: dataService,
    storage: createScopedStorage(modeId),
    stats: createStatsService(modeId),
    events: eventBus,
    ui: {
      showToast,
      openModal,
      closeModal,
      fireConfetti,
    },
    config,
  };
}

/**
 * Mount a mode plugin into a container.
 * @param {string} modeId - 'daily', 'unlimited', etc.
 * @param {HTMLElement} mountEl - Target container
 */
async function mountMode(modeId, mountEl) {
  if (activeModeInstance) {
    if (typeof activeModeInstance.destroy === 'function') {
      activeModeInstance.destroy();
    }
    activeModeInstance = null;
  }

  mountEl.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 200px;">
      <div style="font-family: var(--font-display); font-size: var(--text-base); color: var(--color-pitch); font-weight: 600; letter-spacing: 0.02em;">
        Loading CricGuess...
      </div>
    </div>
  `;

  const mode = await getMode(modeId);
  if (!mode) {
    mountEl.innerHTML = `<div class="card text-center"><p>Mode "${modeId}" is currently unavailable.</p></div>`;
    return;
  }

  activeModeInstance = mode;

  // Update SEO for this mode
  if (mode.seo) {
    updateSEO(mode.seo);
  }

  const ctx = createModeContext(modeId);
  await mode.init(ctx);
  if (typeof mode.start === 'function') {
    mode.start();
  }

  mode.render(mountEl);
}

/**
 * Show the global Help / How to Play modal.
 */
function showHowToPlayModal() {
  const contentHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <p>
        Identify the mystery cricketer in <strong>6 guesses or fewer</strong>.
      </p>
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        <div style="display: flex; gap: var(--space-3); align-items: flex-start;">
          <span style="font-size: var(--text-xs); font-weight: 700; padding: 2px 6px; background: var(--color-bg-alt); border-radius: var(--radius-sm); color: var(--color-pitch);">01</span>
          <div>
            <strong>Clue 1 is the hardest:</strong> Start by analyzing career debut year and total international match counts.
          </div>
        </div>
        <div style="display: flex; gap: var(--space-3); align-items: flex-start;">
          <span style="font-size: var(--text-xs); font-weight: 700; padding: 2px 6px; background: var(--color-bg-alt); border-radius: var(--radius-sm); color: var(--color-pitch);">02</span>
          <div>
            <strong>Progressive clues:</strong> Each wrong guess unlocks the next clue (role, style, franchise teams, and jersey numbers).
          </div>
        </div>
        <div style="display: flex; gap: var(--space-3); align-items: flex-start;">
          <span style="font-size: var(--text-xs); font-weight: 700; padding: 2px 6px; background: var(--color-bg-alt); border-radius: var(--radius-sm); color: var(--color-pitch);">03</span>
          <div>
            <strong>Clue 6 is the easiest:</strong> The final clue reveals famous records, nicknames, or iconic moments.
          </div>
        </div>
      </div>

      <div style="background: var(--color-bg-alt); padding: var(--space-3); border-radius: var(--radius-md); margin-top: var(--space-2);">
        <h4 style="font-size: var(--text-sm); margin-bottom: var(--space-1);">Game Modes</h4>
        <ul style="font-size: var(--text-xs); line-height: 1.6; list-style: disc; padding-left: var(--space-4);">
          <li><strong>Daily Challenge:</strong> One mystery player daily. Resets at midnight IST. Same puzzle worldwide.</li>
          <li><strong>Unlimited Mode:</strong> Play endless rounds with custom country, role, and era filters.</li>
        </ul>
      </div>
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--primary" data-modal-close>Got It</button>
  `;

  const modal = createModal({
    id: 'how-to-play-modal',
    title: 'How to Play CricGuess',
    contentHtml,
    footerHtml,
  });

  modal.open();
}

/**
 * Show the global Statistics modal.
 */
function showGlobalStatsModal() {
  const dailyStats = createStatsService('daily').getStats();
  const unlimitedStats = createStatsService('unlimited').getStats();

  const contentHtml = `
    <div>
      <h3 style="font-size: var(--text-base); margin-bottom: var(--space-3); color: var(--color-pitch);">Daily Challenge Stats</h3>
      ${renderStatChartHTML(dailyStats)}

      <hr style="border: none; border-top: 1px solid var(--color-surface-border); margin: var(--space-6) 0;" />

      <h3 style="font-size: var(--text-base); margin-bottom: var(--space-3); color: var(--color-pitch);">Unlimited Practice Stats</h3>
      ${renderStatChartHTML(unlimitedStats)}
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn--secondary" data-modal-close>Close</button>
  `;

  const modal = createModal({
    id: 'global-stats-modal',
    title: 'Statistics',
    contentHtml,
    footerHtml,
  });

  modal.open();
}

/**
 * Application entry point.
 */
async function initApp() {
  // 1. Theme
  initTheme();

  // 2. Cookie consent
  initCookieConsent({
    onAccept: () => mountAdSlots(),
  });

  // 3. Ad slots
  mountAdSlots();

  // 4. Wire global header action buttons
  document.querySelectorAll('[data-action="how-to-play"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showHowToPlayModal();
    });
  });

  document.querySelectorAll('[data-action="stats"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showGlobalStatsModal();
    });
  });

  // 5. Check if page has a mode mount container
  const modeMount = document.querySelector('[data-mode-mount]');
  if (modeMount) {
    const specifiedMode = modeMount.getAttribute('data-mode') || getCurrentRoute();
    const targetMode = specifiedMode === 'home' ? 'daily' : specifiedMode;
    await mountMode(targetMode, modeMount);
  }

  // 6. Router listener
  initRouter(async (route) => {
    if (modeMount && (route === 'daily' || route === 'unlimited' || route === 'blitz')) {
      await mountMode(route, modeMount);
    }
  });

  // Preload player dataset in background
  dataService.loadPlayers().catch((err) => {
    console.warn('[App] Preloading dataset failed:', err);
  });
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

export { initApp, mountMode, showHowToPlayModal, showGlobalStatsModal };
