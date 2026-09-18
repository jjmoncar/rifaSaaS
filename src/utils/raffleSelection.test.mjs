import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSelectedRaffleId } from './raffleSelection.ts';

test('normalizeSelectedRaffleId keeps existing raffle ids and clears stale ones', () => {
  const raffles = [
    { id: 'raffle-1', name: 'Test 1' },
    { id: 'raffle-2', name: 'Test 2' }
  ];

  assert.equal(normalizeSelectedRaffleId('raffle-1', raffles), 'raffle-1');
  assert.equal(normalizeSelectedRaffleId('raffle-9', raffles), null);
  assert.equal(normalizeSelectedRaffleId(null, raffles), null);
});
