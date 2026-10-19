(function (global) {
  function playLedTransition(board, direction) {
    const className = `led-shift-${direction}`;
    const animationName = `led-dots-${direction}`;

    board._ledTransitionCleanup?.();
    board.classList.remove('led-shift-forward', 'led-shift-backward');
    void board.offsetWidth;
    board.classList.add(className);

    const onAnimationEnd = event => {
      if (event.animationName !== animationName) return;
      cleanup();
    };
    const cleanup = () => {
      board.classList.remove(className);
      board.removeEventListener('animationend', onAnimationEnd);
      delete board._ledTransitionCleanup;
    };

    board._ledTransitionCleanup = cleanup;
    board.addEventListener('animationend', onAnimationEnd);
  }

  const api = { playLedTransition };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BoardTransition = api;
})(typeof window === 'undefined' ? globalThis : window);
