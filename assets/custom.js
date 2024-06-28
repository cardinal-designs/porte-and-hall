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
})

function atcGetSectionsToRenderBubble() {
    return [{
            id: 'cart-drawer__content',
            section: document.getElementById('cart-drawer__content').dataset.id,
            selector: '.cart-drawer__content',
        },
        {
            id: 'cart-icon-bubble',
            section: 'cart-icon-bubble',
            selector: '.shopify-section'
        }
    ];
}

function addToCartListener(productForm) {
    const formData = new FormData(productForm);
    const formJSON = Object.fromEntries(formData.entries());

    formJSON.sections = ["cart-drawer", "cart-icon-bubble"];

    fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formJSON)
        })
        .then(response => response.json())
        .then(data => {
            console.log("data", data);

            atcGetSectionsToRenderBubble().forEach((section => {
                const elementToReplace =
                    document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

                elementToReplace.innerHTML =
                    getSectionInnerHTML(data.sections[section.section], section.selector);
            }));
        })
        .catch(error => {
            console.error('Error adding product to cart:', error);
        });
}
document.addEventListener('DOMContentLoaded', function() {
  const searchATCButtons = document.querySelectorAll('.spf-product__form-btn-addtocart');
  if(searchATCButtons){
      searchATCButtons.forEach(function (searchATCButton) {
          searchATCButton.addEventListener('click', function (event) {
              event.preventDefault();
              console.log("clicked atc")
          })
      })
  }
});