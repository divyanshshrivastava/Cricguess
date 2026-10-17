/**
 * test-registry.js — Verifies that all registered modes conform to the GameMode interface contract.
 */

import assert from 'node:assert';
import { modeRegistry } from '../js/modes/registry.js';

console.log('Testing Mode Registry & Interface Compliance...');

assert.ok(Array.isArray(modeRegistry), 'modeRegistry should be an array');
assert.ok(modeRegistry.length >= 2, 'Should register at least daily and unlimited modes');

for (const entry of modeRegistry) {
  assert.ok(entry.id, `Mode entry missing id`);
  assert.ok(entry.name, `Mode entry ${entry.id} missing name`);
  assert.ok(entry.description, `Mode entry ${entry.id} missing description`);
  assert.ok(entry.icon, `Mode entry ${entry.id} missing icon`);
  assert.ok(entry.route, `Mode entry ${entry.id} missing route`);
  assert.strictEqual(typeof entry.enabled, 'boolean', `Mode entry ${entry.id} missing enabled boolean`);
  assert.strictEqual(typeof entry.loader, 'function', `Mode entry ${entry.id} missing loader function`);

  // Load the module and verify interface
  const module = await entry.loader();
  const mode = module.default || module;

  assert.strictEqual(typeof mode.init, 'function', `Mode ${entry.id} must implement init(context)`);
  assert.strictEqual(typeof mode.handleGuess, 'function', `Mode ${entry.id} must implement handleGuess(player)`);
  assert.strictEqual(typeof mode.render, 'function', `Mode ${entry.id} must implement render(container)`);
  assert.strictEqual(typeof mode.getPuzzle, 'function', `Mode ${entry.id} must implement getPuzzle()`);
  assert.strictEqual(typeof mode.getShareText, 'function', `Mode ${entry.id} must implement getShareText()`);
  assert.strictEqual(typeof mode.destroy, 'function', `Mode ${entry.id} must implement destroy()`);

  assert.ok(mode.seo, `Mode ${entry.id} must define seo metadata`);
  assert.ok(mode.seo.title, `Mode ${entry.id} seo must have title`);
  assert.ok(mode.seo.description, `Mode ${entry.id} seo must have description`);

  console.log(`  ✓ Mode "${entry.id}" (${entry.name}) implements full GameMode contract`);
}

console.log('✓ test-registry.js PASSED');
