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

document.addEventListener('rebuy:cart.change', function(event) {
  toggleBundleCTA(1000);
});

window.addEventListener('load', (event) => {
  toggleBundleCTA(1500);
});
