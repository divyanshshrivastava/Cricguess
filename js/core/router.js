/**
 * router.js — Lightweight client-side router & active route highlighter.
 * Supports both multi-page URL path routing and hash-based navigation.
 */

/**
 * Determine the current route ID based on pathname and hash.
 * @returns {string} Route identifier, e.g. 'daily', 'unlimited', 'home'
 */
export function getCurrentRoute() {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace('#', '').trim();

  if (hash) {
    if (hash.includes('daily')) return 'daily';
    if (hash.includes('unlimited')) return 'unlimited';
    if (hash.includes('blitz')) return 'blitz';
  }

  if (path.endsWith('/daily.html') || path.endsWith('/daily')) return 'daily';
  if (path.endsWith('/unlimited.html') || path.endsWith('/unlimited')) return 'unlimited';
  if (path.endsWith('/how-to-play.html')) return 'how-to-play';
  if (path.endsWith('/about.html')) return 'about';
  if (path.endsWith('/contact.html')) return 'contact';
  if (path.endsWith('/privacy-policy.html')) return 'privacy';
  if (path.endsWith('/terms.html')) return 'terms';

  return 'home';
}

/**
 * Highlight active nav links based on current route.
 */
export function updateActiveNav() {
  const current = getCurrentRoute();
  const navLinks = document.querySelectorAll('.header__nav-link, [data-nav-route]');

  navLinks.forEach((link) => {
    const route = link.getAttribute('data-nav-route') || link.getAttribute('href');
    if (!route) return;

    if (
      (current === 'daily' && (route.includes('daily') || route === 'daily')) ||
      (current === 'unlimited' && (route.includes('unlimited') || route === 'unlimited')) ||
      (current === 'home' && (route === '/' || route.endsWith('index.html') || route === 'home'))
    ) {
      link.classList.add('header__nav-link--active');
    } else {
      link.classList.remove('header__nav-link--active');
    }
  });
}

/**
 * Listen for route changes (popstate, hashchange).
 * @param {function(string): void} onRouteChange - Callback with new route
 */
export function initRouter(onRouteChange) {
  updateActiveNav();

  window.addEventListener('popstate', () => {
    updateActiveNav();
    if (onRouteChange) onRouteChange(getCurrentRoute());
  });

  window.addEventListener('hashchange', () => {
    updateActiveNav();
    if (onRouteChange) onRouteChange(getCurrentRoute());
  });
}
