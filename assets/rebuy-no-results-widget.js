(() => {
  const CARD_SELECTOR = '#rebuy-widget-297767 .rebuy-product-block';
  const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  const productData = new Map();

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  // "The Insider - Wild Side (Dove) / Doormat" -> "The Insider Doormat" + "Wild Side (Dove)".
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
      const request = fetch(`${root}products/${encodeURIComponent(handle)}?view=rebuy-no-results-card`, {
        credentials: 'same-origin',
      })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);
      productData.set(handle, request);
    }
    return productData.get(handle);
  };

  const STAR_PATH =
    'M71.996 11.368l-3.94 2.42c-.474.292-.756.096-.628-.443l1.074-4.53-3.507-3.022c-.422-.363-.324-.693.24-.74l4.602-.37 1.778-4.3c.21-.51.55-.512.762 0l1.78 4.3 4.602.37c.552.046.666.37.237.74l-3.507 3.02 1.075 4.532c.127.536-.147.74-.628.444l-3.94-2.422zM55.996 11.368l-3.94 2.42c-.474.292-.756.096-.628-.443l1.074-4.53-3.507-3.022c-.422-.363-.324-.693.24-.74l4.602-.37 1.778-4.3c.21-.51.55-.512.762 0l1.78 4.3 4.602.37c.552.046.666.37.237.74l-3.507 3.02 1.075 4.532c.127.536-.147.74-.628.444l-3.94-2.422zM40.123 11.368l-3.94 2.42c-.475.292-.756.096-.63-.443l1.076-4.53-3.508-3.022c-.422-.363-.324-.693.24-.74l4.602-.37 1.778-4.3c.21-.51.55-.512.762 0l1.778 4.3 4.603.37c.554.046.667.37.24.74l-3.508 3.02 1.075 4.532c.127.536-.147.74-.628.444l-3.94-2.422zM24.076 11.368l-3.94 2.42c-.475.292-.757.096-.63-.443l1.076-4.53-3.507-3.022c-.422-.363-.324-.693.238-.74l4.603-.37 1.78-4.3c.21-.51.55-.512.76 0l1.78 4.3 4.602.37c.554.046.667.37.24.74l-3.508 3.02 1.074 4.532c.127.536-.146.74-.628.444l-3.94-2.422zM8.123 11.368l-3.94 2.42c-.475.292-.756.096-.63-.443l1.076-4.53L1.12 5.792c-.422-.363-.324-.693.24-.74l4.602-.37 1.778-4.3c.21-.51.55-.512.762 0l1.778 4.3 4.603.37c.554.046.667.37.24.74l-3.508 3.02 1.075 4.532c.127.536-.147.74-.628.444l-3.94-2.422z';
  const starSvg = `<svg width="70" height="14" viewBox="0 0 80 14" aria-hidden="true" focusable="false"><path d="${STAR_PATH}"></path></svg>`;

  const renderData = (card, data) => {
    if (!data) return;
    const media = card.querySelector('.rebuy-product-image');
    if (media && data.label) {
      const label = document.createElement('span');
      label.className = 'ph-no-results-card__label';
      label.setAttribute('data-ph-no-results', '');
      label.textContent = data.label;
      media.appendChild(label);
    }

    const info = card.querySelector('.ph-no-results-card__info');
    if (!info) return;

    if (data.review_count) {
      const rating = Math.min(Math.max(Number(data.rating) || 0, 0), 5);
      const review = document.createElement('div');
      review.className = 'ph-no-results-card__review';
      review.innerHTML =
        `<span class="ph-no-results-card__stars"><span class="visually-hidden">${rating} stars out of 5 stars</span>` +
        `${starSvg}<span class="ph-no-results-card__stars-fill" style="width: ${(rating / 5) * 100}%;">${starSvg}</span></span>` +
        `<span class="ph-no-results-card__review-count">${Number(data.review_count)} Reviews</span>`;
      info.querySelector('.ph-no-results-card__price').insertAdjacentElement('beforebegin', review);
    }

    if (data.price) {
      info.querySelector('.ph-no-results-card__price').innerHTML = data.compare_at_price
        ? `<span class="visually-hidden">Sale price</span><span class="ph-no-results-card__sale-price">${escapeHtml(data.price)}</span>` +
          `<span class="visually-hidden">Regular price</span><span class="ph-no-results-card__old-price">${escapeHtml(data.compare_at_price)}</span>`
        : `<span>${escapeHtml(data.price)}</span>`;
    }
  };

  const enhanceCard = (card) => {
    const link = card.querySelector('.rebuy-product-title-link');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const key = `${link.textContent.trim()}|${href}`;
    if (card.dataset.phNoResultsKey === key && card.querySelector('.ph-no-results-card__info')) return;

    card.querySelectorAll('[data-ph-no-results]').forEach((node) => node.remove());
    card.dataset.phNoResultsKey = key;

    // Rebuy's own price until the theme-formatted one arrives.
    const rebuyPrice = card.querySelector('.rebuy-product-price .rebuy-money');
    const { line, name } = splitTitle(link.textContent);
    const info = document.createElement('div');
    info.className = 'ph-no-results-card__info';
    info.setAttribute('data-ph-no-results', '');
    info.innerHTML =
      `<a class="ph-no-results-card__heading" href="${escapeHtml(href)}">` +
      `<span class="ph-no-results-card__line">${escapeHtml(line)}</span>` +
      (name ? `<span class="ph-no-results-card__name">${escapeHtml(name)}</span>` : '') +
      `</a><p class="ph-no-results-card__price">${rebuyPrice ? escapeHtml(rebuyPrice.textContent.replace('Price', '').trim()) : ''}</p>`;

    const media = card.querySelector('.rebuy-product-media');
    if (media) media.insertAdjacentElement('afterend', info);
    else card.prepend(info);
    card.classList.add('ph-no-results-card');

    const handle = handleFromHref(href);
    if (!handle) return;
    fetchProductData(handle).then((data) => {
      // Rebuy may have re-used the card for another product while the request was out.
      if (card.dataset.phNoResultsKey !== key || !card.isConnected) return;
      renderData(card, data);
    });
  };

  let queued = false;
  const scan = () => {
    queued = false;
    document.querySelectorAll(CARD_SELECTOR).forEach(enhanceCard);
  };

  const queueScan = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(scan);
  };

  new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
  queueScan();
})();
