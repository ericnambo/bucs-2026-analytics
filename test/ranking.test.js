const test = require('node:test');
const assert = require('node:assert/strict');
const { sortRows } = require('../src/ranking');

test('sortRows sorts by any column in either direction and keeps missing values last', () => {
  const rows = [
    { rank: 1, name: 'B', winPct: 0.5, avgMargin: 3, sos: null },
    { rank: 2, name: 'A', winPct: 1, avgMargin: null, sos: 0.4 },
    { rank: 3, name: 'C', winPct: 0, avgMargin: 9, sos: 0.6 },
  ];
  assert.deepEqual(sortRows(rows, 'name', 'asc').map((r) => r.name), ['A', 'B', 'C']);
  assert.deepEqual(sortRows(rows, 'record', 'desc').map((r) => r.name), ['A', 'B', 'C']);
  assert.deepEqual(sortRows(rows, 'avgMargin', 'asc').map((r) => r.name), ['B', 'C', 'A']);
  assert.deepEqual(sortRows(rows, 'sos', 'desc').map((r) => r.name), ['C', 'A', 'B']);
});
