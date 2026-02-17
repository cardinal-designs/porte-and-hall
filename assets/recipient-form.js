(() => {
  if (customElements.get('recipient-form')) return;

  class RecipientForm extends HTMLElement {
    constructor() {
      super();

      this.sectionId = this.dataset.sectionId;
      this.checkboxInput = this.querySelector(`#Recipient-checkbox-${this.sectionId}`);
      this.hiddenControlField = this.querySelector(`#Recipient-control-${this.sectionId}`);
      this.offsetProperty = this.querySelector(`#Recipient-timezone-offset-${this.sectionId}`);

      this.emailInput = this.querySelector(`#Recipient-email-${this.sectionId}`);
      this.nameInput = this.querySelector(`#Recipient-name-${this.sectionId}`);
      this.messageInput = this.querySelector(`#Recipient-message-${this.sectionId}`);
      this.sendonInput = this.querySelector(`#Recipient-send-on-${this.sectionId}`);

      this.sendonHint = this.querySelector(`#Recipient-send-on-hint-${this.sectionId}`);

      this.liveRegion = this.querySelector(`#Recipient-fields-live-region-${this.sectionId}`);

      this.errorWrapper = this.querySelector('.product-form__recipient-error-message-wrapper');
      this.errorList = this.errorWrapper?.querySelector('ul');
      this.errorHeading = this.errorWrapper?.querySelector('.error-message');

      this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
      this.handleSendOnInput = this.handleSendOnInput.bind(this);
    }

    connectedCallback() {
      if (this.checkboxInput) {
        this.checkboxInput.disabled = false;
        this.checkboxInput.addEventListener('change', this.handleCheckboxChange);
      }

      this.sendonInput?.addEventListener('input', this.handleSendOnInput);
      this.sendonInput?.addEventListener('change', this.handleSendOnInput);

      if (this.offsetProperty) {
        this.offsetProperty.value = new Date().getTimezoneOffset().toString();
        this.offsetProperty.disabled = true;
      }

      this.updateUI();
    }

    disconnectedCallback() {
      this.checkboxInput?.removeEventListener('change', this.handleCheckboxChange);
      this.sendonInput?.removeEventListener('input', this.handleSendOnInput);
      this.sendonInput?.removeEventListener('change', this.handleSendOnInput);
    }

    handleCheckboxChange() {
      this.updateUI();
    }

    handleSendOnInput() {
      if (!this.checkboxInput?.checked) return;

      const hasValue = !!this.sendonInput?.value?.trim();
      this.toggleSendOnHint(!hasValue);
    }

    updateUI() {
      if (!this.checkboxInput) return;

      if (this.checkboxInput.checked) {
        this.enableFields();
        this.toggleSendOnHint(!this.sendonInput?.value);
        this.liveRegion && (this.liveRegion.innerText = 'Gift card recipient form expanded');
      } else {
        this.clearFields();
        this.disableFields();
        this.clearErrors();
        this.toggleSendOnHint(false);
        this.liveRegion && (this.liveRegion.innerText = 'Gift card recipient form collapsed');
      }
    }

    enableFields() {
      this.getDisableableFields().forEach(el => (el.disabled = false));
    }

    disableFields() {
      this.getDisableableFields().forEach(el => (el.disabled = true));
    }

    clearFields() {
      this.getInputFields().forEach(el => (el.value = ''));
    }

    getInputFields() {
      return [this.emailInput, this.nameInput, this.messageInput, this.sendonInput].filter(Boolean);
    }

    getDisableableFields() {
      return [...this.getInputFields(), this.offsetProperty].filter(Boolean);
    }

    validateOnSubmit({ focus = true } = {}) {
      if (!this.checkboxInput?.checked) {
        this.clearErrors();
        return true;
      }

      const errors = {};
      const email = this.emailInput?.value?.trim();

      if (!email) {
        errors.email = ["Email can't be blank"];
      } else if (!this.isValidEmail(email)) {
        errors.email = ['Please enter a valid email address'];
      }

      if (Object.keys(errors).length) {
        this.displayErrors(errors);
        if (focus) this.emailInput?.focus();
        return false;
      }

      this.clearErrors();
      return true;
    }

    isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    displayErrors(errors) {
      if (!this.errorWrapper) return;

      this.clearErrors();
      this.errorWrapper.hidden = false;

      if (this.errorHeading) {
        this.errorHeading.innerText = 'Please adjust the following:';
      }

      Object.entries(errors).forEach(([key, messages]) => {
        const message = messages.join(', ');
        const errorElement = this.querySelector(
          `#RecipientForm-${key}-error-${this.sectionId}`
        );
        const errorText = errorElement?.querySelector('.error-message');

        if (errorElement) errorElement.classList.remove('hidden');
        if (errorText) errorText.textContent = message;
      });
    }

    clearErrors() {
      if (this.errorWrapper) this.errorWrapper.hidden = true;
      if (this.errorList) this.errorList.innerHTML = '';

      this.querySelectorAll('[id^="RecipientForm-"][id$="-error-' + this.sectionId + '"]')
      .forEach((el) => {
        el.classList.add('hidden');

        const message = el.querySelector('.error-message');
        if (message) message.textContent = '';
      });

      this.getInputFields().forEach(field => {
        if (!field) return;
        field.setAttribute('aria-invalid', 'false');
        field.removeAttribute('aria-describedby');
      });
    }

    toggleSendOnHint(show) {
      if (!this.sendonHint) return;
      this.sendonHint.classList.toggle('hidden', !show);
    }
  }

  customElements.define('recipient-form', RecipientForm);
})();
