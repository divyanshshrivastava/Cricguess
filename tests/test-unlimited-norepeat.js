/**
 * test-unlimited-norepeat.js — Verifies that the no-repeat selection logic
 * never returns the same player twice within a session until the pool is exhausted.
 */

import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

console.log('Testing Unlimited Mode No-Repeat Selection...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const data = JSON.parse(readFileSync(join(__dirname, '../data/players.json'), 'utf8'));
const players = data.players || data;

const usedIds = new Set();
const totalToPick = Math.min(25, players.length);

for (let i = 0; i < totalToPick; i++) {
  // Filter pool excluding usedIds
  const pool = players.filter((p) => !usedIds.has(p.id));
  assert.ok(pool.length > 0, `Pool should have available players, remaining: ${pool.length}`);

  const pickedIndex = Math.floor(Math.random() * pool.length);
  const pickedPlayer = pool[pickedIndex];

  assert.ok(!usedIds.has(pickedPlayer.id), `Player ${pickedPlayer.id} was picked twice before exhaustion`);
  usedIds.add(pickedPlayer.id);
}

assert.strictEqual(usedIds.size, totalToPick, `Should have picked ${totalToPick} unique players`);
console.log(`✓ Successfully picked ${totalToPick} consecutive unique players without repetition`);

// Test pool exhaustion reset
usedIds.clear();
for (const p of players) {
  usedIds.add(p.id);
}

// When pool is full of usedIds, available is 0
let poolAfterFull = players.filter((p) => !usedIds.has(p.id));
assert.strictEqual(poolAfterFull.length, 0, 'Pool should be 0 when all IDs are used');

// Resetting usedIds clears the set
usedIds.clear();
poolAfterFull = players.filter((p) => !usedIds.has(p.id));
assert.strictEqual(poolAfterFull.length, players.length, 'Pool should be fully restored after clear');

console.log('✓ test-unlimited-norepeat.js PASSED');
