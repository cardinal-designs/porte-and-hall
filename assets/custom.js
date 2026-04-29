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


document.querySelectorAll('.product__swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
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
});

document.addEventListener('DOMContentLoaded', function () {
  const stickyAtc = document.querySelector('sticky-atc');
  if (!stickyAtc) return;

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) return;

  const observer = new MutationObserver(function () {
    if (stickyAtc.classList.contains('show')) {
      themeColorMeta.setAttribute('content', '#ffffff');
    } else {
      themeColorMeta.setAttribute('content', '#ffffff');
    }
  });

  observer.observe(stickyAtc, { attributes: true, attributeFilter: ['class'] });

  // Also force it on scroll since Safari re-evaluates on scroll
  window.addEventListener('scroll', function () {
    themeColorMeta.setAttribute('content', '#ffffff');
  }, { passive: true });
});