(() => {
  const CARD_SELECTOR = [
    '.rebuy-smart-search-results-page__product',
    '.rebuy-quick-view__product',
    '.rebuy-quick-view__product-horizontal',
  ].join(', ');
  const PRICE_SELECTOR = '.rebuy-product-price, .price';
  const FILTER_LABEL_SELECTOR = [
    '.rebuy-smart-search-results-page__filter-option-checkbox-label',
    '.rebuy-smart-search-results-page__selected-tag-label',
  ].join(', ');

  const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  const productData = new Map();

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  const splitTitle = (rawTitle) => {
    const title = rawTitle.replace(/\s+/g, ' ').trim();
    const dash = title.indexOf(' - ');
    if (dash === -1) return { line: title, name: '' };

    const series = title.slice(0, dash).trim();
    let rest = title.slice(dash + 3);
    let size = '';
    const slash = rest.lastIndexOf(' / ');
    if (slash !== -1) {
      size = rest.slice(slash + 3).replace(/\b3 x 5\b/i, '').trim();
      rest = rest.slice(0, slash);
    }

    return { line: [series, size].filter(Boolean).join(' '), name: rest.trim() };
  };

  const handleFromHref = (href) => {
    try {
      const match = new URL(href, window.location.origin).pathname.match(/\/products\/([^/?#]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (error) {
      return null;
    }
  };

  const fetchProductData = (handle) => {
    if (!productData.has(handle)) {
      const request = fetch(`${root}products/${encodeURIComponent(handle)}?view=rebuy-card`, {
        credentials: 'same-origin',
      })
        .then((response) => (response.ok ? response.text() : null))
        .then((text) => (text ? JSON.parse(text) : null))
        .catch(() => null);
      productData.set(handle, request);
    }
    return productData.get(handle);
  };

  const removeInjected = (card) => {
    card.querySelectorAll('[data-ph-rebuy]').forEach((node) => node.remove());
    card.classList.remove('ph-rebuy-card', 'ph-rebuy-card--priced');
  };

  const renderPrice = (card, data) => {
    const rebuyPrice = card.querySelector(PRICE_SELECTOR);
    if (!rebuyPrice || !data || !data.price) return;

    const price = document.createElement('p');
    price.className = 'ph-rebuy-card__price';
    price.setAttribute('data-ph-rebuy', '');
    price.innerHTML = data.compare_at_price
      ? `<span class="visually-hidden">Sale price</span><span class="ph-rebuy-card__sale-price">${escapeHtml(data.price)}</span>` +
        `<span class="visually-hidden">Regular price</span><span class="ph-rebuy-card__old-price">${escapeHtml(data.compare_at_price)}</span>`
      : `<span>${escapeHtml(data.price)}</span>`;

    rebuyPrice.insertAdjacentElement('afterend', price);
    card.classList.add('ph-rebuy-card--priced');
  };

  const renderLabel = (card, data) => {
    const media = card.querySelector('.rebuy-smart-search-results-page__product-media, .rebuy-quick-view__image-link');
    if (!media || !data || !data.label) return;

    const label = document.createElement('span');
    label.className = 'ph-rebuy-card__label';
    label.setAttribute('data-ph-rebuy', '');
    label.textContent = data.label;
    media.appendChild(label);
  };

  const enhanceCard = (card) => {
    const title = card.querySelector('.rebuy-product-title');
    if (!title) return;

    const key = `${title.textContent.trim()}|${title.getAttribute('href') || ''}`;
    if (card.dataset.phRebuyKey === key) return;

    removeInjected(card);
    card.dataset.phRebuyKey = key;

    const { line, name } = splitTitle(title.textContent);
    const heading = document.createElement('a');
    heading.className = 'ph-rebuy-card__heading';
    heading.setAttribute('data-ph-rebuy', '');
    heading.href = title.getAttribute('href') || '#';
    heading.innerHTML =
      `<span class="ph-rebuy-card__line">${escapeHtml(line)}</span>` +
      (name ? `<span class="ph-rebuy-card__name">${escapeHtml(name)}</span>` : '');
    title.insertAdjacentElement('beforebegin', heading);
    card.classList.add('ph-rebuy-card');

    // Judge.me prints "2810 reviews"; Rebuy prints "2,810".
    const count = card.querySelector('.rebuy-review-count-number');
    if (count && count.textContent.includes(',')) count.textContent = count.textContent.replace(/,/g, '');

    const handle = handleFromHref(heading.href);
    if (!handle) return;

    fetchProductData(handle).then((data) => {
      // The card may have been re-used for another product while the request was out.
      if (card.dataset.phRebuyKey !== key || !card.isConnected) return;
      renderLabel(card, data);
      renderPrice(card, data);
    });
  };

  const titleCase = (text) =>
    text
      .toLowerCase()
      .replace(/\b([a-z])([a-z]*)/g, (word, first, rest) => (word === 'x' ? word : first.toUpperCase() + rest))
      .replace(/\bXl\b/g, 'XL');

  const normaliseFilterLabel = (label) => {
    const node = Array.from(label.childNodes).find(
      (child) =>
        child.textContent.trim() &&
        (child.nodeType === Node.TEXT_NODE ||
          (child.nodeName === 'SPAN' && !child.classList.contains('rebuy-smart-search-results-page__filter-label')))
    );
    if (!node) return;

    const text = node.textContent.trim();
    if (!/[A-Z]{2}/.test(text) || text !== text.toUpperCase()) return;
    node.textContent = ` ${titleCase(text)} `;
  };

  // Colour filter swatches, resolved like snippets/filter-color-swatch.liquid: the shared
  // map (hex or image), then a "{handle}.png" in Settings > Files, then — search only — a
  // CSS colour name ("Black", "Navy"). Anything else keeps the neutral "unmapped" circle.
  const SWATCH_SELECTOR = 'label[for^="rebuy-metafield-variant-metafield-color-"]';
  const swatchMap = new Map(
    String(window.phColorSwatchMap || '')
      .split('|')
      .map((entry) => entry.split('~'))
      .filter(([handle, value]) => handle && value)
  );
  const swatchStyles = new Map();

  // Shopify's `handle` filter, after the snippet's remove: '(' / ')'.
  const toHandle = (text) =>
    text
      .toLowerCase()
      .replace(/[()]/g, '')
      .replace(/['"]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '');

  // HEAD request rather than new Image(): a detached image can stay pending forever,
  // which would leave the swatch unresolved.
  const imageExists = (url) => {
    const controller = window.AbortController ? new AbortController() : null;
    const timer = controller && setTimeout(() => controller.abort(), 5000);
    return fetch(url, { method: 'HEAD', signal: controller && controller.signal })
      .then((response) => response.ok && (response.headers.get('content-type') || '').startsWith('image/'))
      .catch(() => false)
      .finally(() => clearTimeout(timer));
  };

  const resolveSwatch = (name) => {
    const handle = toHandle(name);
    if (swatchStyles.has(handle)) return swatchStyles.get(handle);

    const style = (async () => {
      const mapped = swatchMap.get(handle);
      if (mapped) return mapped.startsWith('#') ? { color: mapped } : { image: mapped };

      const fileUrl = window.phColorSwatchFileUrl;
      if (fileUrl) {
        const url = fileUrl.split('?')[0].replace('ph-swatch-handle', handle);
        if (await imageExists(url)) return { image: url };
      }

      const cssName = name.toLowerCase().replace(/[\s-]+/g, '');
      if (window.CSS && CSS.supports('color', cssName)) return { color: cssName, outline: true };

      return null;
    })();
    swatchStyles.set(handle, style);
    return style;
  };

  const applySwatch = (label) => {
    const name = decodeURIComponent(label.htmlFor.split('-color-').pop() || '').trim();
    if (!name || label.dataset.phSwatch === name) return;
    label.dataset.phSwatch = name;
    label.title = name;

    resolveSwatch(name).then((style) => {
      if (label.dataset.phSwatch !== name) return;
      label.style.backgroundColor = style && style.color ? style.color : '';
      label.style.backgroundImage = style && style.image ? `url("${style.image}")` : '';
      // Mapped swatches drop the hairline (as on the collection); CSS-name colours keep it
      // so light ones (white) stay visible.
      label.classList.toggle('ph-rebuy-swatch--mapped', Boolean(style) && !style.outline);
    });
  };

  // Mobile filter drawer: Rebuy's flyout, restyled as the collection's bottom sheet
  // (component-rebuy-search.css). Adds the collection's "Clear all" link and "Apply" button;
  // filters already apply as they're ticked, so Apply just closes — as on the collection.
  const FLYOUT_SELECTOR = '.rebuy-smart-search-results-page__flyout-inner';

  const enhanceFlyout = (flyout) => {
    if (flyout.querySelector('[data-ph-rebuy-flyout]')) return;

    const header = flyout.querySelector('.rebuy-smart-search-results-page__flyout-header');
    if (header) {
      const clearAll = document.createElement('button');
      clearAll.type = 'button';
      clearAll.className = 'ph-rebuy-flyout__clear-all';
      clearAll.setAttribute('data-ph-rebuy-flyout', '');
      clearAll.textContent = 'Clear all';
      clearAll.addEventListener('click', () => {
        const reset = flyout.querySelector('.rebuy-smart-search-results-page__selected-filters-reset');
        if (reset) reset.click();
      });
      header.appendChild(clearAll);
    }

    const controls = document.createElement('div');
    controls.className = 'ph-rebuy-flyout__controls';
    controls.setAttribute('data-ph-rebuy-flyout', '');
    controls.innerHTML = '<button type="button" class="button ph-rebuy-flyout__apply">Apply</button>';
    controls.querySelector('button').addEventListener('click', () => {
      const close = flyout.querySelector('.rebuy-smart-search-results-page__flyout-close');
      if (close) close.click();
    });
    flyout.appendChild(controls);
  };

  let queued = false;
  const scan = () => {
    queued = false;
    document.querySelectorAll(FLYOUT_SELECTOR).forEach(enhanceFlyout);
    document.querySelectorAll(CARD_SELECTOR).forEach(enhanceCard);
    document.querySelectorAll(FILTER_LABEL_SELECTOR).forEach(normaliseFilterLabel);
    document.querySelectorAll(SWATCH_SELECTOR).forEach(applySwatch);
  };

  const queueScan = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(scan);
  };

  new MutationObserver(queueScan).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['href', 'for'],
  });
  queueScan();
})();
