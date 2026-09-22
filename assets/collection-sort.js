/*
 * Sort dropdown for the default collection template (snippets/collection-sort.liquid).
 * Choosing an option checks the matching `sort_by` radio inside <collection-filters>
 * and fires its change event, so collection-filters.js keeps owning the URL and the
 * grid reload. The desktop and mobile instances are kept in sync.
 */
if (!customElements.get('collection-sort')) {
  customElements.define('collection-sort', class CollectionSort extends HTMLElement {
    connectedCallback() {
      this.trigger = this.querySelector('.collection-sort__trigger');
      this.menu = this.querySelector('.collection-sort__menu');
      if (!this.trigger || !this.menu) return;

      this.onDocumentClick = this.onDocumentClick.bind(this);

      this.trigger.addEventListener('click', () => this.toggle());
      this.trigger.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          this.open();
        }
      });

      this.menu.addEventListener('click', (event) => {
        const option = event.target.closest('.collection-sort__option');
        if (option) this.select(option.dataset.value);
      });
      this.menu.addEventListener('keydown', (event) => this.onMenuKeydown(event));
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isOpen()) {
          event.preventDefault();
          this.close();
          this.trigger.focus();
        }
      });
    }

    disconnectedCallback() {
      document.removeEventListener('click', this.onDocumentClick);
    }

    get options() {
      return Array.from(this.menu.querySelectorAll('.collection-sort__option'));
    }

    isOpen() {
      return this.trigger.getAttribute('aria-expanded') === 'true';
    }

    toggle() {
      this.isOpen() ? this.close() : this.open();
    }

    open() {
      this.menu.hidden = false;
      this.trigger.setAttribute('aria-expanded', 'true');
      this.classList.add('is-open');
      document.addEventListener('click', this.onDocumentClick);
      const selected = this.menu.querySelector('.is-selected') || this.options[0];
      selected?.focus();
    }

    close() {
      this.menu.hidden = true;
      this.trigger.setAttribute('aria-expanded', 'false');
      this.classList.remove('is-open');
      document.removeEventListener('click', this.onDocumentClick);
    }

    onDocumentClick(event) {
      if (!this.contains(event.target)) this.close();
    }

    onMenuKeydown(event) {
      const options = this.options;
      const index = options.indexOf(document.activeElement);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          options[Math.min(index + 1, options.length - 1)]?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          options[Math.max(index - 1, 0)]?.focus();
          break;
        case 'Home':
          event.preventDefault();
          options[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          options[options.length - 1]?.focus();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (index > -1) this.select(options[index].dataset.value);
          break;
        case 'Tab':
          this.close();
          break;
      }
    }

    select(value) {
      this.close();
      this.trigger.focus();

      const current = this.menu.querySelector('.is-selected');
      if (current && current.dataset.value === value) return;

      document.querySelectorAll('collection-sort').forEach((sort) => sort.markSelected(value));

      const radio = Array.from(document.querySelectorAll('collection-filters input.sort-by'))
        .find((input) => input.value === value);

      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      // No filter form on the page: fall back to a plain navigation.
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', value);
      url.searchParams.delete('page');
      window.location.assign(url.toString());
    }

    markSelected(value) {
      if (!this.menu) return;
      this.options.forEach((option) => {
        const isSelected = option.dataset.value === value;
        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        if (isSelected) {
          const current = this.querySelector('[data-sort-current]');
          if (current) current.textContent = option.textContent.trim();
        }
      });
    }
  });
}
