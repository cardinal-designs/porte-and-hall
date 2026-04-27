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

// document.querySelectorAll('.sticky__details .product__swatch').forEach(swatch => {
//   swatch.addEventListener('click', () => {
//     console.log("swatch",swatch);
//     const variantName = document.querySelector('.product__variant-name');
//     if (!variantName) return;

//     const nav = document.querySelector('.outer-header-wrapper');
//     const navHeight = nav ? nav.offsetHeight : 0;
//     const buffer = 73;

//     const top = variantName.getBoundingClientRect().top + window.scrollY - navHeight - buffer;

//     window.scrollTo({ top, behavior: 'smooth' });
//   });
// });

document.querySelectorAll('.sticky__details .product__swatch').forEach((swatch, index) => {
  console.debug(`[Swatch Init] Swatch #${index} found:`, swatch);

  swatch.addEventListener('click', () => {
    console.group(`[Swatch Click] Swatch #${index} clicked`);

    const variantName = document.querySelector('.product__variant-name');
    console.debug('[Variant Name] Element:', variantName);

    if (!variantName) {
      console.error('[Variant Name] .product__variant-name not found in DOM — aborting scroll');
      console.groupEnd();
      return;
    }

    const nav = document.querySelector('.outer-header-wrapper');
    if (!nav) console.warn('[Nav] .outer-header-wrapper not found — defaulting navHeight to 0');

    const navHeight = nav ? nav.offsetHeight : 0;
    console.debug('[Nav] Height:', navHeight);

    const buffer = 12;

    // FIX: Use offsetTop for absolute position instead of getBoundingClientRect
    // getBoundingClientRect is relative to viewport — unreliable when scrolled
    const absoluteTop = getAbsoluteTop(variantName);
    console.debug('[Scroll] Absolute offsetTop of variantName:', absoluteTop);

    const top = absoluteTop - navHeight - buffer;
    console.debug('[Scroll] Calculated scroll top:', top);
    console.debug('[Scroll] Nav height:', navHeight, '| Buffer:', buffer);

    if (top < 0) {
      console.warn(`[Scroll] Still negative after fix (${top}) — element may be inside a transformed/sticky container`);
    }

    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    console.debug('[Scroll] scrollTo() called with top:', Math.max(0, top));
    console.groupEnd();
  });
});

// Helper: walk up the DOM to get true absolute top position
function getAbsoluteTop(element) {
  let top = 0;
  let el = element;
  while (el) {
    top += el.offsetTop;
    el = el.offsetParent;
  }
  console.debug('[getAbsoluteTop] Computed absolute top:', top, 'for', element);
  return top;
}

if (document.querySelectorAll('.sticky__details .product__swatch').length === 0) {
  console.warn('[Swatch Init] No swatches found — check selector or DOM timing');
}