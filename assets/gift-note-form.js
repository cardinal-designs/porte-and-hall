class GiftNoteForm extends HTMLElement {
  constructor() {
    super();

    this.maxCharsPerLine = parseInt(this.dataset.maxChars) || 29;
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

    this.skipRerenderTimeout = null;
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleMessageInput = this.handleMessageInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);

    if (this.messageTextarea && this.messageTextarea.value) {
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
    if (this.checkbox)
      this.checkbox.addEventListener('change', this.handleCheckboxChange);
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
  }

  unbindEvents() {
    if (this.checkbox)
      this.checkbox.removeEventListener('change', this.handleCheckboxChange);
    if (this.messageTextarea) {
      this.messageTextarea.removeEventListener(
        'input',
        this.handleMessageInput,
      );
      this.messageTextarea.removeEventListener('keydown', this.handleKeydown);
      this.messageTextarea.removeEventListener('blur', this.handleBlur);
      this.messageTextarea.removeEventListener('focus', this.handleFocus);
    }
    if (this.fromInput) {
      this.fromInput.removeEventListener('blur', this.handleBlur);
      this.fromInput.removeEventListener('focus', this.handleFocus);
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
    const lines = textarea.value.split('\n');

    if (lines.length > this.maxLines) {
      lines.length = this.maxLines;
      textarea.value = lines.join('\n');
    }

    let modified = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > this.maxCharsPerLine) {
        if (lines.length < this.maxLines) {
          const overflow = lines[i].substring(this.maxCharsPerLine);
          lines[i] = lines[i].substring(0, this.maxCharsPerLine);
          lines.splice(i + 1, 0, overflow);
          modified = true;
        } else {
          lines[i] = lines[i].substring(0, this.maxCharsPerLine);
          modified = true;
        }
      }
    }

    if (modified) {
      const cursorPos = textarea.selectionStart;
      textarea.value = lines.join('\n');
      textarea.setSelectionRange(cursorPos, cursorPos);
    }

    this.updateCharCount();
  }

  handleKeydown(event) {
    const textarea = event.target;
    const lines = textarea.value.split('\n');
    const currentLine =
      textarea.value.substring(0, textarea.selectionStart).split('\n').length -
      1;

    if (event.key === 'Enter' && lines.length >= this.maxLines) {
      event.preventDefault();
      return;
    }

    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Enter',
      'Tab',
    ];
    if (!allowedKeys.includes(event.key) && !event.ctrlKey && !event.metaKey) {
      if (
        lines[currentLine] &&
        lines[currentLine].length >= this.maxCharsPerLine
      ) {
        if (
          textarea.selectionStart === textarea.selectionEnd &&
          lines.length >= this.maxLines
        ) {
          event.preventDefault();
        }
      }
    }
  }

  updateCharCount() {
    if (
      !this.messageTextarea ||
      !this.charsRemainingEl ||
      !this.linesRemainingEl
    )
      return;

    const lines = this.messageTextarea.value.split('\n');
    const currentLineIndex = Math.min(lines.length - 1, this.maxLines - 1);
    const currentLine = lines[currentLineIndex] || '';

    this.charsRemainingEl.textContent = Math.max(
      0,
      this.maxCharsPerLine - currentLine.length,
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
    });
  }

  clearCartAttributes() {
    if (this.messageTextarea) this.messageTextarea.value = '';
    if (this.fromInput) this.fromInput.value = '';
    this.updateCharCount();

    this.updateCartAttributes(
      {
        'Gift Message': '',
        'Gift From': '',
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
