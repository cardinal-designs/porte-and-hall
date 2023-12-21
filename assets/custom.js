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

document.addEventListener('DOMContentLoaded', function () {
  const currencySelectors = document.querySelectorAll('[data-disclosure-currency]');
  currencySelectors.forEach(function (currencySelector) {
    const currencyOptions = currencySelector.querySelectorAll('[data-disclosure-option]');
    currencyOptions.forEach(function (option) {
      option.addEventListener('click', function (event) {
        event.preventDefault();
        const currencyCode = option.getAttribute('data-value');
        const newUrl = `${window.location.origin}?currency=${currencyCode}`;
        fetchCurrency(newUrl);
      });
    });
    function fetchCurrency(newUrl) {
      fetch(newUrl)
        .then((response) => {
          if (response.ok) {
            location.reload();
          } else {
            console.error('Failed to fetch currency data.');
          }
        })
        .catch((error) => {
          console.error('Error fetching currency data: ', error);
        });
    }
  });

  const button = document.querySelector('.currency__button');
  const currencyList = document.getElementById('CurrencyList');

  button.addEventListener('click', function () {
    currencyList.classList.toggle('hidden');
  });
});