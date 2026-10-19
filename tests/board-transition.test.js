const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const { playLedTransition } = require('../js/board-transition');

function createClassList() {
  const names = new Set();

  return {
    add: (...values) => values.forEach(value => names.add(value)),
    remove: (...values) => values.forEach(value => names.delete(value)),
    contains: value => names.has(value),
  };
}

test('playLedTransition restarts a forward LED slide and clears it after the animation', () => {
  const listeners = new Map();
  const board = {
    classList: createClassList(),
    get offsetWidth() { return 1; },
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: type => listeners.delete(type),
  };
  board.classList.add('led-shift-forward');

  playLedTransition(board, 'forward');

  assert.equal(board.classList.contains('led-shift-forward'), true);
  assert.equal(board.classList.contains('led-shift-backward'), false);
  listeners.get('animationend')({ animationName: 'led-dots-forward' });
  assert.equal(board.classList.contains('led-shift-forward'), false);
});

test('LED tab transitions use a 45px dot-grid slide distance', () => {
  const css = readFileSync(join(__dirname, '..', 'page.css'), 'utf8');

  assert.match(css, /--led-shift-distance:\s*45px/);
});
