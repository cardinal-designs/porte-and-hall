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

document.addEventListener('DOMContentLoaded', function () {
  const giftWrapCheckbox = document.getElementById('add-gift-wrap');
  const giftNoteModal = document.getElementById('gift-note-modal');
  const addGiftNoteBtn = document.getElementById('add-gift-note-btn');
  const giftNoteTextarea = document.getElementById('gift-note-text');

  if (giftWrapCheckbox) {
    giftWrapCheckbox.addEventListener('change', function () {
      if (giftWrapCheckbox.checked) {
        giftNoteModal.style.display = 'block';
      } else {
        giftNoteModal.style.display = 'none';
      }
    });
  }

  if (addGiftNoteBtn) {
    addGiftNoteBtn.addEventListener('click', function () {
      const giftNote = giftNoteTextarea.value;

      // Add the gift wrap product & the note to the Shopify cart
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: 7764867285055, // Replace with your Gift Note product variant ID
              quantity: 1,
            },
          ],
          note: giftNote,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to add gift note item');
          }
          return response.json();
        })
        .then(() => {
          // Reload cart for updates
          window.location.reload();
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }
});