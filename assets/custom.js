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
  // DEBUG: Check if swatches are found
  console.debug(`[Swatch Init] Swatch #${index} found:`, swatch);

  if (!swatch) {
    console.error('[Swatch Init] Swatch element is null or undefined');
    return;
  }

  swatch.addEventListener('click', () => {
    console.group(`[Swatch Click] Swatch #${index} clicked`);
    console.debug('[Swatch Click] Element:', swatch);

    // DEBUG: Check variant name element existence
    const variantName = document.querySelector('.product__variant-name');
    console.debug('[Variant Name] Element:', variantName);

    if (!variantName) {
      console.error('[Variant Name] .product__variant-name not found in DOM — aborting scroll');
      console.groupEnd();
      return;
    }

    // DEBUG: Check nav element
    const nav = document.querySelector('.outer-header-wrapper');
    console.debug('[Nav] Element:', nav);

    if (!nav) {
      console.warn('[Nav] .outer-header-wrapper not found — defaulting navHeight to 0');
    }

    const navHeight = nav ? nav.offsetHeight : 0;
    console.debug('[Nav] Height:', navHeight);

    const buffer = 73;
    console.debug('[Scroll] Buffer:', buffer);

    // FIX: Guard against detached/invisible element with getBoundingClientRect
    const rect = variantName.getBoundingClientRect();
    console.debug('[Scroll] variantName BoundingClientRect:', rect);

    if (rect.top === 0 && rect.bottom === 0) {
      console.warn('[Scroll] variantName may be hidden or detached from layout (rect is zero)');
    }

    const scrollY = window.scrollY ?? window.pageYOffset; // FIX: fallback for older browsers
    console.debug('[Scroll] window.scrollY:', scrollY);

    const top = rect.top + scrollY - navHeight - buffer;
    console.debug('[Scroll] Calculated scroll top:', top);

    if (top < 0) {
      console.warn(`[Scroll] Calculated top is negative (${top}) — clamping to 0`);
    }

    // FIX: Clamp top to 0 to avoid negative scroll positions
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

    console.debug('[Scroll] scrollTo() called successfully');
    console.groupEnd();
  });
});

// DEBUG: Warn if no swatches were found at all
if (document.querySelectorAll('.sticky__details .product__swatch').length === 0) {
  console.warn('[Swatch Init] No swatches found matching ".sticky__details .product__swatch" — check your selector or DOM timing');
}