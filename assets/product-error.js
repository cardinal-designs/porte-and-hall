class ProductError extends HTMLElement {
  constructor() {
    super();

    this.errorMsg = null;
    this.errorLink = null;
    this.activeColorElement = null;

    this.findAvailableColor = this.findAvailableColor.bind(this);
    this.findAvailableSizeForColor = this.findAvailableSizeForColor.bind(this);
  }

  connectedCallback() {
    this.errorMsg = this.querySelector('.product-error__message');
    this.errorLink = this.querySelector('.product-error__link');
    this.activeColorElement = document.querySelector('#active-color');

    this.initListeners();
  }

  initListeners() {
    document.querySelectorAll('.other-sizes__button--not-available').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        this.showSizeError(btn);
      });
    });

    document.querySelectorAll('.product__color-swatch--not-available').forEach(swatch => {
      swatch.addEventListener('click', e => {
        e.preventDefault();
        this.showColorError(swatch);
      });
    });

    document.querySelectorAll(
      '.other-sizes__button:not(.other-sizes__button--not-available)'
    ).forEach(el => el.addEventListener('click', () => this.clearError()));

    document.querySelectorAll(
      '.product__swatch:not(.product__color-swatch--not-available)'
    ).forEach(el => el.addEventListener('click', () => this.clearError()));
  }

  clearError() {
    this.classList.remove('active');
  }

  showSizeError(btn) {
    const sizeName = btn.dataset.size;
    const sizeHandle = btn.dataset.sizeHandle;
    const activeColor = this.activeColorElement?.dataset.color || 'this color';

    this.errorMsg.textContent = `${activeColor} is not available in ${sizeName}.`;

    const targetHandle = this.findAvailableColor(sizeHandle);
    console.log('aa',sizeName, sizeHandle, activeColor, targetHandle)
    if (targetHandle) {
      this.errorLink.textContent = `See available ${sizeName} colors here`;
      this.errorLink.href = `/products/${targetHandle}?view=unavailable-sizes`;
    } else {
      this.errorLink.textContent = '';
      this.errorLink.removeAttribute('href');
    }

    this.classList.add('active');
  }

  showColorError(swatch) {
    const thisColor = swatch.dataset.tooltip || 'This color';
    const colorHandle = swatch.dataset.colorHandle || thisColor.toLowerCase().replace(/ /g, '-');

    const activeSize =
      document.querySelector('.other-sizes__button.active span:first-child')?.textContent ||
      'this size';

    this.errorMsg.textContent = `${thisColor} is not available in ${activeSize}.`;

    const targetHandle = this.findAvailableSizeForColor(colorHandle);

    if (targetHandle) {
      this.errorLink.textContent = `See available ${activeSize} colors here`;
      this.errorLink.href = `/products/${targetHandle}?view=unavailable-sizes`;
    } else {
      this.errorLink.textContent = '';
      this.errorLink.removeAttribute('href');
    }

    this.classList.add('active');
  }

  findAvailableColor(sizeHandle) {
    const products = window.PH_AVAILABILITY?.products || [];
    console.log('prod',products)
    return products.find(handle => handle.includes(sizeHandle)) || null;
  }

  findAvailableSizeForColor(colorHandle) {
    const products = window.PH_AVAILABILITY?.products || [];
    return products.find(handle => handle.includes(colorHandle)) || null;
  }
}

customElements.define('product-error', ProductError);
