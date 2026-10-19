(function (global) {
  function toLargeImageUrl(value) {
    const url = new URL(value);
    url.searchParams.set('name', 'large');
    return url.toString();
  }

  function parseCollectionLinks(source) {
    const sections = [];
    let section = null;
    let item = null;

    source.split(/\r?\n/).forEach(line => {
      const heading = line.trim().match(/^#\s*(.+)$/);
      if (heading) {
        section = { title: heading[1].trim(), items: [] };
        item = null;
        sections.push(section);
        return;
      }

      const image = line.match(/^(\s*)-\s+(https?:\/\/\S+)$/);
      if (!section || !image) return;

      if (!image[1] || !item) {
        item = { images: [] };
        section.items.push(item);
      }
      item.images.push(toLargeImageUrl(image[2]));
    });

    return sections.filter(({ items }) => items.length > 0);
  }

  function getCarouselIndex(currentIndex, step, total) {
    return (currentIndex + step + total) % total;
  }

  function renderLightboxSlides(lightbox, sources, currentIndex, label) {
    const previousIndex = getCarouselIndex(currentIndex, -1, sources.length);
    const nextIndex = getCarouselIndex(currentIndex, 1, sources.length);
    const mainAlt = `${label}, slide ${currentIndex + 1} of ${sources.length}`;

    lightbox.mainImage.src = sources[currentIndex];
    lightbox.mainImage.alt = mainAlt;
    lightbox.previousImage.src = sources[previousIndex];
    lightbox.previousImage.alt = `Previous: ${label}, slide ${previousIndex + 1} of ${sources.length}`;
    lightbox.nextImage.src = sources[nextIndex];
    lightbox.nextImage.alt = `Next: ${label}, slide ${nextIndex + 1} of ${sources.length}`;
    lightbox.carousel.classList.toggle('has-slides', sources.length > 1);
  }

  function openLightbox(dialog, lightbox, sources, currentIndex, label) {
    dialog._collectionCarousel = { sources, currentIndex, label };
    renderLightboxSlides(lightbox, sources, currentIndex, label);
    if (!dialog.open) dialog.showModal();
  }

  function changeLightboxSlide(dialog, lightbox, step) {
    const state = dialog._collectionCarousel;
    if (!state || state.sources.length < 2) return;

    state.currentIndex = getCarouselIndex(state.currentIndex, step, state.sources.length);
    renderLightboxSlides(lightbox, state.sources, state.currentIndex, state.label);
  }

  function createCollectionCard(documentRoot, sources, label, dialog, lightbox) {
    const button = documentRoot.createElement('button');
    const image = documentRoot.createElement('img');
    const count = documentRoot.createElement('span');

    button.type = 'button';
    button.className = 'collection-image';
    button.setAttribute('aria-label', `View ${label} full size`);
    image.src = sources[0];
    image.alt = label;
    image.loading = 'lazy';
    image.addEventListener('error', () => button.classList.add('unavailable'));
    button.addEventListener('click', () => openLightbox(dialog, lightbox, sources, 0, label));
    button.append(image);
    if (sources.length > 1) {
      count.className = 'collection-stack-count';
      count.textContent = `+${sources.length - 1}`;
      count.setAttribute('aria-hidden', 'true');
      button.append(count);
    }
    return button;
  }

  function renderCollection(documentRoot, gallery, sections, dialog, lightbox) {
    const fragment = documentRoot.createDocumentFragment();

    sections.forEach(({ title, items }) => {
      const section = documentRoot.createElement('section');
      const heading = documentRoot.createElement('h3');
      const grid = documentRoot.createElement('div');

      section.className = 'collection-section';
      heading.className = 'collection-heading';
      heading.textContent = title;
      grid.className = 'collection-grid';
      items.forEach(({ images }, index) => grid.append(createCollectionCard(
        documentRoot,
        images,
        `${title} image ${index + 1}`,
        dialog,
        lightbox,
      )));
      section.append(heading, grid);
      fragment.append(section);
    });

    gallery.replaceChildren(fragment);
  }

  async function initCollection(documentRoot = document) {
    const gallery = documentRoot.querySelector('#collection-gallery');
    const dialog = documentRoot.querySelector('#image-lightbox');
    const lightbox = {
      carousel: documentRoot.querySelector('#lightbox-carousel'),
      previousImage: documentRoot.querySelector('#lightbox-previous-image'),
      mainImage: documentRoot.querySelector('#lightbox-image'),
      nextImage: documentRoot.querySelector('#lightbox-next-image'),
    };

    if (!gallery || !dialog || Object.values(lightbox).some(value => !value)) return;

    dialog.querySelector('[data-close-lightbox]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-lightbox-previous]').addEventListener('click', () => changeLightboxSlide(dialog, lightbox, -1));
    dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => changeLightboxSlide(dialog, lightbox, 1));
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') changeLightboxSlide(dialog, lightbox, -1);
      if (event.key === 'ArrowRight') changeLightboxSlide(dialog, lightbox, 1);
    });

    try {
      const response = await fetch('ref/collectionImglink');
      if (!response.ok) throw new Error(`Collection request failed: ${response.status}`);

      const sections = parseCollectionLinks(await response.text());
      if (!sections.length) throw new Error('No collection images found');
      renderCollection(documentRoot, gallery, sections, dialog, lightbox);
    } catch (error) {
      gallery.replaceChildren();
      const message = documentRoot.createElement('p');
      message.className = 'collection-message';
      message.textContent = 'Unable to load the collection right now.';
      gallery.append(message);
      console.error(error);
    }
  }

  const api = { getCarouselIndex, initCollection, openLightbox, parseCollectionLinks };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Collection = api;
})(typeof window === 'undefined' ? globalThis : window);
