const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const { getCarouselIndex, parseCollectionLinks, openLightbox } = require('../js/collection');

test('parseCollectionLinks groups image links by header and requests large images', () => {
  const collection = parseCollectionLinks(`
#OC
- https://pbs.twimg.com/media/first?format=jpg&name=small
  - https://pbs.twimg.com/media/second?format=jpg&name=small
#Fanart
- https://pbs.twimg.com/media/third?format=jpg&name=medium
`);

  assert.deepEqual(collection, [
    {
      title: 'OC',
      items: [
        {
          images: [
            'https://pbs.twimg.com/media/first?format=jpg&name=large',
            'https://pbs.twimg.com/media/second?format=jpg&name=large',
          ],
        },
      ],
    },
    {
      title: 'Fanart',
      items: [{ images: ['https://pbs.twimg.com/media/third?format=jpg&name=large'] }],
    },
  ]);
});

test('getCarouselIndex wraps in both directions', () => {
  assert.equal(getCarouselIndex(0, -1, 2), 1);
  assert.equal(getCarouselIndex(1, 1, 2), 0);
});

test('openLightbox shows the selected full image in the modal', () => {
  const mainImage = {};
  const previousImage = {};
  const nextImage = {};
  const classList = { toggle: () => {} };
  let shown = false;
  const dialog = { showModal: () => { shown = true; } };

  openLightbox(
    dialog,
    { carousel: { classList }, mainImage, previousImage, nextImage },
    [
      'https://pbs.twimg.com/media/first?format=jpg&name=large',
      'https://pbs.twimg.com/media/second?format=jpg&name=large',
      'https://pbs.twimg.com/media/third?format=jpg&name=large',
    ],
    0,
    'OC image 1',
  );

  assert.equal(mainImage.src, 'https://pbs.twimg.com/media/first?format=jpg&name=large');
  assert.equal(previousImage.src, 'https://pbs.twimg.com/media/third?format=jpg&name=large');
  assert.equal(nextImage.src, 'https://pbs.twimg.com/media/second?format=jpg&name=large');
  assert.equal(mainImage.alt, 'OC image 1, slide 1 of 3');
  assert.equal(shown, true);
});

test('collection uses a tightly packed masonry layout with separated sections', () => {
  const css = readFileSync(join(__dirname, '..', 'page.css'), 'utf8');

  assert.match(css, /\.collection-gallery\s*\{\s*display:\s*grid;\s*gap:\s*72px;/);
  assert.match(css, /\.collection-grid\s*\{\s*column-width:\s*180px;\s*column-gap:\s*6px;/);
});
