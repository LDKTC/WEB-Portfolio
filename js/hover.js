// Feeds the CSS dot-grid spotlight: cursor position + a single hue that drifts over time.
(() => {
  const root = document.documentElement.style;
  const HUE_PERIOD = 6000; // ms for a full colour cycle

  addEventListener('pointermove', e => {
    root.setProperty('--mx', e.clientX + 'px');
    root.setProperty('--my', e.clientY + 'px');
    root.setProperty('--hue', ((performance.now() / HUE_PERIOD) * 360) % 360);
  });
})();
