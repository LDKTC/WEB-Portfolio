const test = require('node:test');
const assert = require('node:assert/strict');

const { createRipple } = require('../js/board-ripple');

function createFakeElement() {
  const listeners = new Map();

  return {
    className: '',
    style: {
      setProperty(name, value) {
        this[name] = value;
      },
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type) {
      listeners.get(type)?.();
    },
  };
}

test('createRipple places an LED wave at the pointer and removes it after animation', () => {
  const previousDocument = global.document;
  const ripple = createFakeElement();
  let removed = false;
  global.document = { createElement: () => ripple };

  const board = {
    getBoundingClientRect: () => ({ left: 120, top: 80, width: 600, height: 400 }),
    append: element => assert.equal(element, ripple),
    removeChild: element => {
      assert.equal(element, ripple);
      removed = true;
    },
  };

  createRipple(board, 150, 120, () => 0.5);

  assert.equal(ripple.className, 'led-ripple');
  assert.equal(ripple.style['--ripple-x'], '30px');
  assert.equal(ripple.style['--ripple-y'], '40px');
  assert.equal(ripple.style['--ripple-max-radius'], '159px');
  ripple.dispatch('animationend');
  assert.equal(removed, true);

  global.document = previousDocument;
});
