class GiftNoteForm extends HTMLElement {
  constructor() {
    super();

    this.maxCharsTotal = parseInt(this.dataset.maxChars) || 250;
    this.maxLines = parseInt(this.dataset.maxLines) || 4;

    this.checkbox = this.querySelector('.gift-note-form__checkbox');
    this.content = this.querySelector('.gift-note-form__content');
    this.messageTextarea = this.querySelector('.gift-note-form__message');
    this.charsRemainingEl = this.querySelector(
      '.gift-note-form__chars-remaining',
    );
    this.linesRemainingEl = this.querySelector(
      '.gift-note-form__lines-remaining',
    );
    this.fromInput = this.querySelector('.gift-note-form__from');
    this.toInput = this.querySelector('.gift-note-form__to');

    this.skipRerenderTimeout = null;
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleMessageInput = this.handleMessageInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);

    if (this.messageTextarea) {
      this.updateCharCount();
    }
  }

  connectedCallback() {
    this.bindEvents();
  }

  disconnectedCallback() {
    this.unbindEvents();
  }

  bindEvents() {
    if (this.checkbox) {
      this.checkbox.addEventListener('change', this.handleCheckboxChange);
    }

    if (this.messageTextarea) {
      this.messageTextarea.addEventListener('input', this.handleMessageInput);
      this.messageTextarea.addEventListener('keydown', this.handleKeydown);
      this.messageTextarea.addEventListener('blur', this.handleBlur);
      this.messageTextarea.addEventListener('focus', this.handleFocus);
    }

    if (this.fromInput) {
      this.fromInput.addEventListener('blur', this.handleBlur);
      this.fromInput.addEventListener('focus', this.handleFocus);
    }

    if (this.toInput) {
      this.toInput.removeEventListener('blur', this.handleBlur);
      this.toInput.removeEventListener('focus', this.handleFocus);
    }
  }

  unbindEvents() {
    if (this.checkbox) {
      this.checkbox.removeEventListener('change', this.handleCheckboxChange);
    }

    if (this.messageTextarea) {
      this.messageTextarea.removeEventListener('input', this.handleMessageInput);
      this.messageTextarea.removeEventListener('keydown', this.handleKeydown);
      this.messageTextarea.removeEventListener('blur', this.handleBlur);
      this.messageTextarea.removeEventListener('focus', this.handleFocus);
    }

    if (this.fromInput) {
      this.fromInput.removeEventListener('blur', this.handleBlur);
      this.fromInput.removeEventListener('focus', this.handleFocus);
    }


    if (this.toInput) {
      this.toInput.removeEventListener('blur', this.handleBlur);
      this.toInput.removeEventListener('focus', this.handleFocus);
    }
  }

  handleFocus() {
    window.skipCartRerender = true;
    if (this.skipRerenderTimeout) {
      clearTimeout(this.skipRerenderTimeout);
      this.skipRerenderTimeout = null;
    }
  }

  handleBlur() {
    this.saveToCart();
    if (this.skipRerenderTimeout) {
      clearTimeout(this.skipRerenderTimeout);
    }
    this.skipRerenderTimeout = setTimeout(() => {
      window.skipCartRerender = false;
      this.skipRerenderTimeout = null;
    }, 500);
  }

  handleCheckboxChange(event) {
    const isChecked = event.target.checked;

    if (this.content) {
      this.content.hidden = !isChecked;
    }

    event.target.setAttribute('aria-expanded', isChecked);

    if (isChecked) {
      this.messageTextarea?.focus();
    } else {
      this.clearCartAttributes();
    }
  }

  setLoading(isLoading) {
    if (this.checkbox) {
      this.checkbox.disabled = isLoading;
    }
  }

  handleMessageInput(event) {
    const textarea = event.target;
    let value = textarea.value;

    // Limit to 4 lines
    let lines = value.split('\n');
    if (lines.length > this.maxLines) {
      lines = lines.slice(0, this.maxLines);
      value = lines.join('\n');
    }

    // Limit to 250 total characters, including line breaks
    if (value.length > this.maxCharsTotal) {
      value = value.substring(0, this.maxCharsTotal);
    }

    if (textarea.value !== value) {
      const cursorPos = Math.min(textarea.selectionStart, value.length);
      textarea.value = value;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }

    this.updateCharCount();
  }

  handleKeydown(event) {
    const textarea = event.target;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const hasSelection = selectionStart !== selectionEnd;

    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Tab',
    ];

    // Block Enter if already at max lines and no text is selected
    if (event.key === 'Enter') {
      const lines = value.split('\n');
      if (lines.length >= this.maxLines && !hasSelection) {
        event.preventDefault();
      }
      return;
    }

    // Let navigation/deletion/shortcuts through
    if (
      allowedKeys.includes(event.key) ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    // Block typing if already at total max and no text is selected
    if (value.length >= this.maxCharsTotal && !hasSelection) {
      event.preventDefault();
    }
  }

  updateCharCount() {
    if (
      !this.messageTextarea ||
      !this.charsRemainingEl ||
      !this.linesRemainingEl
    ) {
      return;
    }

    const value = this.messageTextarea.value;
    const lines = value ? value.split('\n') : [''];

    this.charsRemainingEl.textContent = Math.max(
      0,
      this.maxCharsTotal - value.length,
    );

    this.linesRemainingEl.textContent = Math.max(
      0,
      this.maxLines - lines.length,
    );
  }

  saveToCart() {
    this.updateCartAttributes({
      'Gift Message': this.messageTextarea.value.trim(),
      'Gift From': this.fromInput?.value.trim() || '',
      'Gift To': this.toInput?.value.trim() || '',
    });
  }

  clearCartAttributes() {
    if (this.messageTextarea) this.messageTextarea.value = '';
    if (this.fromInput) this.fromInput.value = '';
    if (this.toInput) this.fromInput.value = '';
    this.updateCharCount();

    this.updateCartAttributes(
      {
        'Gift Message': '',
        'Gift From': '',
        'Gift To': '',
      },
      'Failed to clear gift note:',
    );
  }

  updateCartAttributes(attributes, errorMessage = 'Failed to save gift note:') {
    this.setLoading(true);
    window.skipCartRerender = true;

    fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes }),
    })
      .catch((error) => console.error(errorMessage, error))
      .finally(() => {
        this.setLoading(false);
      });
  }
}

if (!customElements.get('gift-note-form')) {
  customElements.define('gift-note-form', GiftNoteForm);
}