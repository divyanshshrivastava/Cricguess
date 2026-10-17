/**
 * test-storage-namespace.js — Verifies storage namespacing, version checking,
 * and memory store fallback behavior.
 */

import assert from 'node:assert';
import { save, load, remove, clearNamespace, createScopedStorage } from '../js/services/storage.js';

console.log('Testing Storage Namespacing & Fallback...');

// Test 1: In-memory fallback in Node environment
const dailyStorage = createScopedStorage('daily');
dailyStorage.save('state', { puzzleNumber: 42, won: true });

const loadedDaily = dailyStorage.load('state');
assert.deepStrictEqual(loadedDaily, { puzzleNumber: 42, won: true }, 'Loaded state should match saved state');

// Test 2: Namespace isolation
const unlimitedStorage = createScopedStorage('unlimited');
const loadedUnlimited = unlimitedStorage.load('state', null);
assert.strictEqual(loadedUnlimited, null, 'Unlimited namespace must not see daily state');

// Test 3: Overwrite and update
dailyStorage.save('state', { puzzleNumber: 43, won: false });
assert.deepStrictEqual(dailyStorage.load('state'), { puzzleNumber: 43, won: false });

// Test 4: Removal
dailyStorage.remove('state');
assert.strictEqual(dailyStorage.load('state', null), null, 'Removed key should return default value');

// Test 5: Clear namespace
dailyStorage.save('foo', 'bar');
dailyStorage.save('baz', 123);
unlimitedStorage.save('keep', 'this');

dailyStorage.clear();
assert.strictEqual(dailyStorage.load('foo'), null);
assert.strictEqual(dailyStorage.load('baz'), null);
assert.strictEqual(unlimitedStorage.load('keep'), 'this', 'Clearing daily should not clear unlimited namespace');

console.log('✓ test-storage-namespace.js PASSED');
