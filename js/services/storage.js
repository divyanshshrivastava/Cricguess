/**
 * storage.js — Namespaced localStorage wrapper with versioned schemas.
 * All keys are prefixed per mode (e.g. 'cricguess:daily:state').
 * Falls back gracefully if localStorage is unavailable (private browsing, etc.).
 */

import { STORAGE_PREFIX, STORAGE_VERSION } from '../config.js';

/**
 * Check if localStorage is available.
 * @returns {boolean}
 */
function isStorageAvailable() {
  try {
    const testKey = '__cricguess_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

/** In-memory fallback when localStorage is unavailable */
const memoryStore = new Map();

/**
 * Build a fully qualified storage key.
 * @param {string} namespace - Mode or service namespace (e.g. 'daily')
 * @param {string} key - Specific key (e.g. 'state')
 * @returns {string} Full key like 'cricguess:daily:state'
 */
function buildKey(namespace, key) {
  return `${STORAGE_PREFIX}:${namespace}:${key}`;
}

/**
 * Save a value to storage.
 * @param {string} namespace - Namespace (mode id or service name)
 * @param {string} key - Key within namespace
 * @param {*} value - Value to store (will be JSON-serialized)
 */
export function save(namespace, key, value) {
  const fullKey = buildKey(namespace, key);
  const envelope = {
    v: STORAGE_VERSION,
    ts: Date.now(),
    data: value,
  };

  if (storageAvailable) {
    try {
      localStorage.setItem(fullKey, JSON.stringify(envelope));
    } catch (err) {
      console.warn(`[Storage] Failed to save "${fullKey}":`, err);
      memoryStore.set(fullKey, envelope);
    }
  } else {
    memoryStore.set(fullKey, envelope);
  }
}

/**
 * Load a value from storage.
 * @param {string} namespace - Namespace
 * @param {string} key - Key within namespace
 * @param {*} [defaultValue=null] - Returned if key doesn't exist or schema mismatch
 * @returns {*} The stored value or defaultValue
 */
export function load(namespace, key, defaultValue = null) {
  const fullKey = buildKey(namespace, key);

  let raw = null;
  if (storageAvailable) {
    try {
      raw = localStorage.getItem(fullKey);
    } catch {
      raw = null;
    }
  }

  // Try in-memory fallback
  if (raw === null && memoryStore.has(fullKey)) {
    const envelope = memoryStore.get(fullKey);
    return envelope?.data ?? defaultValue;
  }

  if (raw === null) return defaultValue;

  try {
    const envelope = JSON.parse(raw);

    // Version check — if schema version doesn't match, discard stale data
    if (envelope.v !== STORAGE_VERSION) {
      console.warn(`[Storage] Schema mismatch for "${fullKey}" (got v${envelope.v}, want v${STORAGE_VERSION}). Returning default.`);
      return defaultValue;
    }

    return envelope.data ?? defaultValue;
  } catch {
    console.warn(`[Storage] Failed to parse "${fullKey}". Returning default.`);
    return defaultValue;
  }
}

/**
 * Remove a specific key from storage.
 * @param {string} namespace
 * @param {string} key
 */
export function remove(namespace, key) {
  const fullKey = buildKey(namespace, key);
  if (storageAvailable) {
    try {
      localStorage.removeItem(fullKey);
    } catch { /* ignore */ }
  }
  memoryStore.delete(fullKey);
}

/**
 * Clear all keys within a namespace.
 * @param {string} namespace
 */
export function clearNamespace(namespace) {
  const prefix = `${STORAGE_PREFIX}:${namespace}:`;

  if (storageAvailable) {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }

  for (const k of memoryStore.keys()) {
    if (k.startsWith(prefix)) {
      memoryStore.delete(k);
    }
  }
}

/**
 * Create a scoped storage interface for a specific namespace.
 * Passed to modes via the context object.
 * @param {string} namespace
 * @returns {{ save: Function, load: Function, remove: Function, clear: Function }}
 */
export function createScopedStorage(namespace) {
  return {
    save: (key, value) => save(namespace, key, value),
    load: (key, defaultValue) => load(namespace, key, defaultValue),
    remove: (key) => remove(namespace, key),
    clear: () => clearNamespace(namespace),
  };
}
