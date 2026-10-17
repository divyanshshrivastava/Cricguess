/**
 * ad-slot.js — Policy-safe Google AdSense slot component.
 * Ensures zero Cumulative Layout Shift (CLS) with fixed dimensions.
 */

import { ADSENSE } from '../config.js';
import { hasConsent } from './cookie-consent.js';

let adSenseScriptLoaded = false;

/**
 * Load Google AdSense script once if configured and allowed.
 */
function loadAdSenseScript() {
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    adSenseScriptLoaded = true;
    return;
  }

  if (adSenseScriptLoaded || !ADSENSE.enabled || !ADSENSE.publisherId || ADSENSE.publisherId.includes('XXXX')) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE.publisherId}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  adSenseScriptLoaded = true;
}

/**
 * Generate HTML string for an ad slot.
 * @param {Object} options
 * @param {string} options.slotId - Unique slot identifier (e.g. 'cricguess-daily-top')
 * @param {'banner'|'rectangle'|'responsive'} [options.format='banner']
 * @param {string} [options.className='']
 * @returns {string} Ad slot HTML
 */
export function renderAdSlotHTML({ slotId, format = 'banner', className = '' }) {
  return `
    <aside class="ad-slot ad-slot--${format} ${className}" aria-label="Advertisement">
      <span class="ad-slot__label">Advertisement</span>
      <div class="ad-slot__wrapper" id="${slotId}">
        <div class="ad-slot__placeholder">
          <span>Ad Space (${format})</span>
        </div>
      </div>
    </aside>
  `;
}

/**
 * Initialize all ad slots on the current page.
 */
export function mountAdSlots() {
  if (!ADSENSE.enabled || ADSENSE.publisherId.includes('XXXX')) {
    return; // Leave placeholders in place for testing
  }

  if (!hasConsent()) {
    return; // Await user consent before firing ad requests
  }

  loadAdSenseScript();

  const slots = document.querySelectorAll('.ad-slot__wrapper');
  slots.forEach((wrapper) => {
    // Avoid double mounting
    if (wrapper.querySelector('.adsbygoogle')) return;

    wrapper.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADSENSE.publisherId}"
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    `;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blocker or script not yet ready
    }
  });
}
