(() => {
  const SECTION_SELECTOR = '[data-info-accordion]';

  const toggleItem = (item, shouldOpen) => {
    const trigger = item.querySelector('.info-accordion__trigger');
    const content = item.querySelector('.info-accordion__content');

    if (!trigger || !content) {
      return;
    }

    item.classList.toggle('is-open', shouldOpen);
    trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    content.hidden = !shouldOpen;
  };

  const initializeInfoAccordion = (section) => {
    const details = section.querySelector('[data-info-accordion-items]');

    if (!details || details.dataset.initialized === 'true') {
      return;
    }

    details.dataset.initialized = 'true';
    const allowMultipleOpen = section.dataset.allowMultiple === 'true';

    details.addEventListener('click', (event) => {
      const trigger = event.target.closest('.info-accordion__trigger');

      if (!trigger || !details.contains(trigger)) {
        return;
      }

      const item = trigger.closest('.info-accordion__item');

      if (!item) {
        return;
      }

      const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';

      if (!allowMultipleOpen && shouldOpen) {
        details.querySelectorAll('.info-accordion__item.is-open').forEach((openItem) => {
          if (openItem !== item) {
            toggleItem(openItem, false);
          }
        });
      }

      toggleItem(item, shouldOpen);
    });
  };

  const boot = () => {
    document.querySelectorAll(SECTION_SELECTOR).forEach(initializeInfoAccordion);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', (event) => {
    initializeInfoAccordion(event.target);
  });
})();
