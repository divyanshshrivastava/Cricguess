/**
 * registry.js — Central registry of available game modes.
 * Dynamically loads mode modules and provides mode querying.
 */

import { MODE_FLAGS } from '../config.js';

/**
 * Mode registration list.
 */
export const modeRegistry = [
  {
    id: 'daily',
    name: 'Daily Challenge',
    description: 'One mystery cricketer every day. Same puzzle worldwide.',
    icon: 'calendar',
    route: 'daily',
    enabled: MODE_FLAGS.daily?.enabled ?? true,
    loader: () => import('./daily.js'),
  },
  {
    id: 'unlimited',
    name: 'Unlimited Practice',
    description: 'Endless cricket guessing with optional country and era filters.',
    icon: 'infinity',
    route: 'unlimited',
    enabled: MODE_FLAGS.unlimited?.enabled ?? true,
    loader: () => import('./unlimited.js'),
  },
  {
    id: 'blitz',
    name: 'Blitz Challenge',
    description: 'Fast-paced guessing against the clock.',
    icon: 'zap',
    route: 'blitz',
    enabled: MODE_FLAGS.blitz?.enabled ?? false,
    loader: () => import('./blitz.js'),
  },
];

/**
 * Get all currently enabled modes.
 * @returns {Array} List of enabled mode descriptors
 */
export function getAvailableModes() {
  return modeRegistry.filter((m) => m.enabled);
}

/**
 * Load and return a specific mode module by ID.
 * @param {string} id - Mode ID (e.g. 'daily')
 * @returns {Promise<Object|null>} The mode instance
 */
export async function getMode(id) {
  const entry = modeRegistry.find((m) => m.id === id && m.enabled);
  if (!entry) return null;

  try {
    const module = await entry.loader();
    return module.default || module;
  } catch (err) {
    console.error(`[Registry] Failed to load mode "${id}":`, err);
    return null;
  }
}
