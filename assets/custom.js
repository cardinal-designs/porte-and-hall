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

(function() {
  'use strict';
  
  function focusChatButton() {
    const chatIframe = document.getElementById('chat-button');
    
    if (!chatIframe) {
      console.error('Chat button iframe not found');
      return;
    }
    
    // Make iframe focusable
    chatIframe.setAttribute('tabindex', '0');
    chatIframe.focus();
    
    // Optional: Add visual indicator
    chatIframe.style.outline = '3px solid #0066cc';
    setTimeout(() => {
      chatIframe.style.outline = '';
    }, 2000);
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = 'Chat widget focused';
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
  
  // Wait for DOM to load
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
      // Use Ctrl + Shift + C
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        focusChatButton();
      }
    });
  });
})();