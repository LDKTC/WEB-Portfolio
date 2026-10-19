(function (global) {
  function createRipple(board, clientX, clientY, random = Math.random) {
    const bounds = board.getBoundingClientRect();
    const ripple = document.createElement('span');
    const diagonal = Math.hypot(bounds.width, bounds.height);
    const minRadius = Math.round(diagonal * 0.16);
    const maxRadius = Math.round(diagonal * 0.28);
    const maxRippleRadius = Math.round(minRadius + (maxRadius - minRadius) * random());

    ripple.className = 'led-ripple';
    ripple.style.setProperty('--ripple-x', `${clientX - bounds.left}px`);
    ripple.style.setProperty('--ripple-y', `${clientY - bounds.top}px`);
    ripple.style.setProperty('--ripple-max-radius', `${maxRippleRadius}px`);
    ripple.addEventListener('animationend', () => board.removeChild(ripple), { once: true });
    board.append(ripple);
  }

  const api = { createRipple };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BoardRipple = api;
})(typeof window === 'undefined' ? globalThis : window);
