customElements.define('form-validation',class formValidation extends HTMLElement {
  constructor(params) {
    super();
    this.form = this.querySelector('.js-form-validation');
    if(!this.form) return;
    console.log(this.form.querySelector('[type="submit"]'))
    this.form.querySelector('[type="submit"]').addEventListener('click',event => this.validateForm(event))
  }
  validateForm(event){
    let requiredFirlds = this.form.querySelectorAll('.field__input[required]');
    if(requiredFirlds.length > 0){
      requiredFirlds.forEach(function (field) {
        console.log(field.checkValidity())
      });
    }
  }
})