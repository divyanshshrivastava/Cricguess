/**
 * theme-manager.js — Dark / Light / System theme controller.
 * Persists user preference and syncs with system media query.
 */

const STORAGE_KEY = 'cricguess:theme';

/** @type {'light'|'dark'|'system'} */
let currentTheme = 'system';

/**
 * Get effective theme ('light' or 'dark') taking system preference into account.
 * @param {'light'|'dark'|'system'} theme
 * @returns {'light'|'dark'}
 */
function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Apply theme to document root.
 * @param {'light'|'dark'|'system'} theme
 */
export function applyTheme(theme) {
  currentTheme = theme;
  const effective = resolveTheme(theme);

  if (effective === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors in private browsing
  }

  // Update theme toggle button text/icon if present
  const toggleBtn = document.querySelector('[data-theme-toggle]');
  if (toggleBtn) {
    toggleBtn.innerHTML = effective === 'dark'
      ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    toggleBtn.setAttribute('aria-label', `Switch to ${effective === 'dark' ? 'light' : 'dark'} mode`);
  }

  window.dispatchEvent(new CustomEvent('cricguess:theme-changed', { detail: { theme, effective } }));
}

/**
 * Toggle between light and dark mode.
 */
export function toggleTheme() {
  const effective = resolveTheme(currentTheme);
  const next = effective === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

/**
 * Initialize theme from storage or system default.
 */
export function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }

  const initial = (saved === 'dark' || saved === 'light' || saved === 'system') ? saved : 'system';
  applyTheme(initial);

  // Listen to OS theme changes if user selected 'system'
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });

  // Attach click listener to any theme toggle buttons on the page
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (btn) {
      toggleTheme();
    }
  });
}

/**
 * Get current theme preference.
 * @returns {'light'|'dark'|'system'}
 */
export function getTheme() {
  return currentTheme;
}
