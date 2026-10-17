/**
 * cookie-consent.js — Cookie & AdSense consent banner.
 * Manages GDPR/ePrivacy compliance and user preference storage.
 */

const STORAGE_KEY = 'cricguess:cookie-consent';

/**
 * Check if the user has accepted cookies.
 * @returns {boolean}
 */
export function hasConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Render and display the consent banner.
 * @param {Object} [options]
 * @param {function(): void} [options.onAccept]
 * @param {function(): void} [options.onDecline]
 */
export function showConsentBanner(options = {}) {
  if (document.querySelector('.cookie-banner')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie and privacy choices');

  banner.innerHTML = `
    <div class="cookie-banner__content">
      <h3 class="cookie-banner__title">Privacy Preferences</h3>
      <p class="cookie-banner__text">
        We use cookies and local storage to save your game streaks, statistics, and provide relevant advertisements. Read our <a href="./privacy-policy.html">Privacy Policy</a> to learn more.
      </p>
    </div>
    <div class="cookie-banner__actions">
      <button type="button" class="btn btn--primary btn--sm" id="cookie-accept">Accept All</button>
      <button type="button" class="btn btn--secondary btn--sm" id="cookie-decline">Essential Only</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Trigger smooth slide up
  setTimeout(() => {
    banner.classList.add('is-visible');
  }, 100);

  const acceptBtn = banner.querySelector('#cookie-accept');
  const declineBtn = banner.querySelector('#cookie-decline');

  function dismiss() {
    banner.classList.remove('is-visible');
    setTimeout(() => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 400);
  }

  acceptBtn.addEventListener('click', () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch { /* ignore */ }
    dismiss();
    if (options.onAccept) options.onAccept();
  });

  declineBtn.addEventListener('click', () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined');
    } catch { /* ignore */ }
    dismiss();
    if (options.onDecline) options.onDecline();
  });
}

/**
 * Initialize cookie consent banner on first visit.
 * @param {Object} [options]
 */
export function initCookieConsent(options = {}) {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }

  // If user already made a choice, do not show banner automatically
  if (saved !== null) {
    if (saved === 'accepted' && options.onAccept) options.onAccept();
    return;
  }

  showConsentBanner(options);
}
