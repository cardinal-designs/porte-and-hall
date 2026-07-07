console.log('YES LOADING')
customElements.define('form-validation',class formValidation extends HTMLElement {
  constructor(params) {
    super();
    this.form = this.querySelector('.js-form-validation');
    this.requiredFields = this.form.querySelectorAll('.field__input[required]');
    if(!this.form) return;
    console.log(this.form.querySelector('[type="submit"]'))
    this.form.querySelector('[type="submit"]').addEventListener('click',event => this.submitBtnClick(event));
    let _this = this;
    if(this.requiredFields.length > 0){
      this.requiredFields.forEach(function (field) {
        field.addEventListener('input',event => _this.validateForm(event));
      });
    }
  }
  submitBtnClick(event){
    this.form.classList.add('js-start-validation');
    this.validateForm();
  }
  validateForm(event){
    if(!this.form.classList.contains('js-start-validation')) return;
    let _this = this;
    this.errorMessage = [];
    if(this.requiredFields.length > 0){
      this.requiredFields.forEach(function (field) {
        if(!field.dataset.errorMessage) return;
        console.log(field.checkValidity())
        field.setCustomValidity('');
        if(!field.checkValidity()){
          _this.errorMessage.push(`<li>${field.dataset.errorMessage}</li>`);
          field.setCustomValidity(field.dataset.errorMessage);
        }
      });
    } 
    this.querySelector('.js-error-messages').innerHTML = this.errorMessage.join('');
  }

}); 


document.addEventListener('click', (event) => {
  const swatch = event.target.closest('.product__swatches .product__swatch');
  if (!swatch) return;

  // Scroll-to-label is desktop-only; on mobile it can fight swatch navigation.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const variantName = document.querySelector('.product__variant-name');
  if (!variantName) return;

  const nav = document.querySelector('header');
  const navHeight = nav ? nav.offsetHeight : 0;
  const buffer = 73;

  const scrollRootSelectors = [
    '[data-scroll-container]',
    '.scroll-container',
    'main',
    '#MainContent',
    '#main-content',
    'body',
  ];

  let scrollRoot = null;
  for (const sel of scrollRootSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const { overflow, overflowY } = getComputedStyle(el);
      const isScrollable = /auto|scroll/.test(overflow + overflowY) && el.scrollHeight > el.clientHeight;
      if (isScrollable && !scrollRoot) scrollRoot = el;
    }
  }

  if (scrollRoot) {
    const containerRect = scrollRoot.getBoundingClientRect();
    const containerScrollTop = scrollRoot.scrollTop;
    const rect = variantName.getBoundingClientRect();
    const targetTop = rect.top - containerRect.top + containerScrollTop - navHeight - buffer;
    scrollRoot.scrollTo({ top: targetTop, behavior: 'smooth' });
  } else {
    let offsetTop = 0;
    let el = variantName;
    while (el) {
      offsetTop += el.offsetTop;
      el = el.offsetParent;
    }
    window.scrollTo({ top: offsetTop - navHeight - buffer, behavior: 'smooth' });
  }
});

function toggleBundleCTA(timeout) {
  setTimeout(() => {
    const items = Rebuy.Cart.items();
    document.querySelector(".rebuy-bundle-builder__cta-container button").disabled = false;
    document.querySelectorAll(".rebuy-bundle-builder__product-quantity .rebuy-button").forEach(button => button.disabled = false);
    if(document.querySelector(".rebuy-bundle-builder__group-container-action .error-message")) {
      document.querySelector(".rebuy-bundle-builder__group-container-action .error-message").remove();
    }
    items.forEach(item => {
      if(window.productData.id == item.product_id) { 
        document.querySelector(".rebuy-bundle-builder__cta-container button").disabled = true;
        document.querySelectorAll(".rebuy-bundle-builder__product-quantity .rebuy-button").forEach(button => button.disabled = true);
        if(!document.querySelector(".rebuy-bundle-builder__group-container-action .error-message")) {
          document.querySelector(".rebuy-bundle-builder__group-container-action").insertAdjacentHTML('beforeend', `<p class="error-message" style="color: red;">${window.bundleErrorMessage}</p>`);
        }
      }
    });
  }, timeout);
}

function enforceNotAvailableClass(root = document) {
  root
    .querySelectorAll('.rebuy-bundle-builder__product-quantity .rebuy-button')
    .forEach((btn) => {
      const label = (btn.querySelector('span') || btn).textContent.trim().toLowerCase();
      if (label === 'not available') btn.classList.add('is-disabled');
      else btn.classList.remove('is-disabled'); // optional
    });
}

function initNotAvailableObserver() {
  const widget = document.querySelector('.rebuy-widget.rebuy-bundle-builder') || document.body;

  // apply immediately
  enforceNotAvailableClass(widget);

  // re-apply on any re-render / tab switch / content replacement
  const mo = new MutationObserver(() => enforceNotAvailableClass(widget));
  mo.observe(widget, { childList: true, subtree: true, characterData: true, attributes: true });

  // return observer in case you ever want to disconnect
  return mo;
}

document.addEventListener('rebuy:cart.change', function(event) {
  toggleBundleCTA(1000);
  setTimeout(() => enforceNotAvailableClass(), 1100);
});

window.addEventListener('load', (event) => {
  toggleBundleCTA(1500);
  initNotAvailableObserver();
});



