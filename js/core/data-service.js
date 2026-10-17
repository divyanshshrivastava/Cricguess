/**
 * data-service.js — Player data loader and query API.
 * Loads players.json once, then provides search, filter, and random selection.
 * Designed for reuse across all game modes.
 */

import { DATA_PATH } from '../config.js';

/** @type {Object[]|null} Cached player dataset */
let players = null;

/** @type {Map<string, Object>} Index by player ID */
const byId = new Map();

/** @type {string[]} Flattened search index: [normalizedTerm, playerId, ...] */
let searchIndex = [];

/**
 * Normalize a string for fuzzy matching.
 * Lowercases, removes accents, collapses whitespace.
 * @param {string} str
 * @returns {string}
 */
export function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strip diacritics
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Load the player dataset from JSON.
 * Caches after first load.
 * @returns {Promise<Object[]>} Array of player objects
 */
export async function loadPlayers() {
  if (players) return players;

  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    players = data.players || data;

    // Build indexes
    byId.clear();
    searchIndex = [];

    for (const player of players) {
      byId.set(player.id, player);

      // Add name and aliases to search index
      const terms = [player.name, ...(player.aliases || [])];
      for (const term of terms) {
        searchIndex.push({
          normalized: normalize(term),
          original: term,
          playerId: player.id,
        });
      }
    }

    return players;
  } catch (err) {
    console.error('[DataService] Failed to load players:', err);
    throw err;
  }
}

/**
 * Get all loaded players.
 * @returns {Object[]}
 */
export function getAll() {
  return players || [];
}

/**
 * Get a player by ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getById(id) {
  return byId.get(id) || null;
}

/**
 * Search players by partial name/alias match.
 * Returns up to `limit` results, sorted by relevance.
 * @param {string} query - User's typed input
 * @param {number} [limit=8] - Max results
 * @returns {Object[]} Matching player objects
 */
export function search(query, limit = 8) {
  if (!query || !players) return [];

  const q = normalize(query);
  if (q.length < 2) return [];

  const matches = [];
  const seen = new Set();

  for (const entry of searchIndex) {
    if (seen.has(entry.playerId)) continue;

    // Check if normalized term starts with or contains the query
    const idx = entry.normalized.indexOf(q);
    if (idx === -1) continue;

    seen.add(entry.playerId);
    const player = byId.get(entry.playerId);

    matches.push({
      player,
      // Prioritize: starts-with > word-boundary > contains
      score: idx === 0 ? 0 : (entry.normalized.charAt(idx - 1) === ' ' ? 1 : 2),
      matchedTerm: entry.original,
    });
  }

  // Sort by score (lower = better match), then alphabetically
  matches.sort((a, b) => a.score - b.score || a.player.name.localeCompare(b.player.name));

  return matches.slice(0, limit).map((m) => m.player);
}

/**
 * Filter players by criteria.
 * All parameters are optional; only provided ones are applied.
 * @param {Object} [filters]
 * @param {string} [filters.country]
 * @param {string} [filters.role] - e.g. 'Batter', 'Bowler', 'All-rounder', 'Wicketkeeper'
 * @param {string} [filters.era] - Era id from config (e.g. '2000s-2010s')
 * @param {number} [filters.difficulty] - 1, 2, or 3
 * @returns {Object[]} Filtered player objects
 */
export function filter(filters = {}) {
  if (!players) return [];

  return players.filter((p) => {
    if (filters.country && p.country !== filters.country) return false;
    if (filters.role && p.role !== filters.role) return false;
    if (filters.difficulty && p.difficulty !== filters.difficulty) return false;

    if (filters.era) {
      const { ERAS } = window.__cricguessConfig || {};
      // Dynamic import would be circular, so check era by debutYear range
      if (filters.era === 'pre-1980' && p.debutYear >= 1980) return false;
      if (filters.era === '1980s-1990s' && (p.debutYear < 1980 || p.debutYear > 1999)) return false;
      if (filters.era === '2000s-2010s' && (p.debutYear < 2000 || p.debutYear > 2019)) return false;
      if (filters.era === '2020s' && p.debutYear < 2020) return false;
    }

    return true;
  });
}

/**
 * Get a random player from the dataset, optionally filtered.
 * @param {Object} [filters] - Same filter object as filter()
 * @param {Set<string>} [excludeIds] - IDs to exclude (for no-repeat logic)
 * @returns {Object|null} Random player or null if pool exhausted
 */
export function getRandom(filters = {}, excludeIds = new Set()) {
  let pool = filter(filters);
  pool = pool.filter((p) => !excludeIds.has(p.id));

  if (pool.length === 0) return null;

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

/**
 * Get all unique countries in the dataset.
 * @returns {string[]}
 */
export function getCountries() {
  if (!players) return [];
  return [...new Set(players.map((p) => p.country))].sort();
}

/**
 * Get all unique roles in the dataset.
 * @returns {string[]}
 */
export function getRoles() {
  if (!players) return [];
  return [...new Set(players.map((p) => p.role))].sort();
}

/**
 * Get dataset size.
 * @returns {number}
 */
export function getCount() {
  return players ? players.length : 0;
}
