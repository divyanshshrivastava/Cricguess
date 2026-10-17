/**
 * test-daily-seed.js — Verifies deterministic seed calculation:
 * 1. Same date always yields the identical player index.
 * 2. Different dates yield different players.
 * 3. Puzzle number increments by 1 per day.
 */

import assert from 'node:assert';
import { dateToSeed, getPuzzleNumber } from '../js/services/date-utils.js';
import { seededIndex } from '../js/services/seeded-rng.js';

console.log('Testing Daily Mode Seed & Determinism...');

const totalPlayers = 120;

// Test 1: Determinism on same date
const date1 = '2026-10-17';
const seed1A = dateToSeed(date1);
const seed1B = dateToSeed(date1);
assert.strictEqual(seed1A, seed1B, 'Seed calculation must be deterministic');

const index1A = seededIndex(seed1A, totalPlayers);
const index1B = seededIndex(seed1B, totalPlayers);
assert.strictEqual(index1A, index1B, 'Player index must be identical for the same date');

// Test 2: Consecutive days have consecutive puzzle numbers
const puzzleNumToday = getPuzzleNumber('2026-10-17');
const puzzleNumTomorrow = getPuzzleNumber('2026-10-18');
assert.strictEqual(puzzleNumTomorrow - puzzleNumToday, 1, 'Puzzle number must increment by 1 each day');

// Test 3: Variation across different dates
const dates = [
  '2026-10-17',
  '2026-10-18',
  '2026-10-19',
  '2026-10-20',
  '2026-10-21',
  '2026-10-22',
  '2026-10-23',
];
const chosenIndices = dates.map((d) => seededIndex(dateToSeed(d), totalPlayers));
const uniqueIndices = new Set(chosenIndices);
assert.ok(uniqueIndices.size >= 5, `Expected high entropy across consecutive days, got ${uniqueIndices.size} unique out of 7`);

console.log('✓ test-daily-seed.js PASSED');
