import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProfileName } from './profileName.ts';

test('normalizeProfileName trims spaces and falls back for empty values', () => {
  assert.equal(normalizeProfileName('  Ana López  '), 'Ana López');
  assert.equal(normalizeProfileName('   '), 'Usuario');
  assert.equal(normalizeProfileName(''), 'Usuario');
});
