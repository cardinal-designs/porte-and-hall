customElements.define('form-validation',class formValidation extends HTMLElement {
  constructor(params) {
    super();
    this.form = this.querySelector('.js-form-validation');
    if(!this.form) return;
    this.form.querySelector('[type="submit"]').addEventListener('click',event => this.validateForm(event))
  }
  validateForm(event){
    console.log('hii');
  }
})