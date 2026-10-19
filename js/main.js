const tabs = [...document.querySelectorAll('.menu button')];
const pages = [...document.querySelectorAll('.page')];
const board = document.querySelector('.board');
let currentIndex = 0;

function show(i, animate = true) {
  const direction = i > currentIndex ? 'forward' : 'backward';

  pages.forEach((page, index) => {
    page.classList.toggle('active', index === i);
    page.classList.toggle('before', index < i);
  });
  tabs.forEach((tab, index) => index === i
    ? tab.setAttribute('aria-current', 'page')
    : tab.removeAttribute('aria-current'));

  if (animate && i !== currentIndex) BoardTransition.playLedTransition(board, direction);
  currentIndex = i;
}

tabs.forEach((tab, index) => tab.addEventListener('click', () => {
  show(index);
  history.replaceState(null, '', `#${tab.dataset.tab}`);
}));

// Touch: swipe up/down to change tab (matches the vertical slide), unless the page itself scrolls.
let touchY = null;
let touchX = 0;

board.addEventListener('touchstart', event => {
  touchY = event.touches[0].clientY;
  touchX = event.touches[0].clientX;
}, { passive: true });

board.addEventListener('touchend', event => {
  if (touchY === null) return;

  const dy = event.changedTouches[0].clientY - touchY;
  const dx = event.changedTouches[0].clientX - touchX;
  touchY = null;
  const currentPage = pages.findIndex(page => page.classList.contains('active'));
  const page = pages[currentPage];

  if (Math.abs(dy) < 70 || Math.abs(dy) < Math.abs(dx) * 1.5 || page.scrollHeight > page.clientHeight + 1) return;

  const next = currentPage + (dy < 0 ? 1 : -1);
  if (next >= 0 && next < tabs.length) tabs[next].click();
}, { passive: true });

board.addEventListener('click', event => {
  if (event.detail !== 0) BoardRipple.createRipple(board, event.clientX, event.clientY);
});

// Collection is the default; honour a #hash if present.
const start = tabs.findIndex(tab => `#${tab.dataset.tab}` === location.hash);
show(start < 0 ? 0 : start, false);
Collection.initCollection();
