customElements.define('product-form', class ProductForm extends HTMLElement {
  constructor() {
    super();   

    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.connectedForm = document.querySelector(`sticky-atc[data-main-form="${this.form.getAttribute("id")}"]`) || ""
    this.cartDrawer = document.querySelector('cart-drawer');

    const header = document.querySelector(".outer-header-wrapper")

    if(this.connectedForm){
          this.connectedForm.style.top = `${header.clientHeight}px`

          window.addEventListener("resize", function(){
            this.connectedForm.style.top = `${header.clientHeight}px`
          }.bind(this))
    }


    const observer = new IntersectionObserver(
      entries => {
        entries.forEach( entry => {
          console.log(entries)
          entry.target.classList.toggle("show", entry.isIntersecting)
          if(this.connectedForm){
            this.connectedForm.classList.toggle("show", !entry.isIntersecting)
          }
        })
      },
      {
        rootMargin: `-${(header.clientHeight - 20)}px`,
        threshold: 0
      }
    )
  
    observer.observe(document.querySelector(".product-section"))
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    
    const submitButton = this.querySelector('[type="submit"]');

    submitButton.setAttribute('disabled', true);
    submitButton.closest(".product__quantity-atc-wrapper").classList.add('loading');
    if(this.connectedForm){
          this.connectedForm.querySelector(".product__quantity-atc-wrapper").classList.add('loading');
    }


    const body = JSON.stringify({
      ...JSON.parse(serializeForm(this.form)),
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
      .then((response) => response.json())
      .then((parsedState) => {

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

        }));
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        submitButton.closest(".product__quantity-atc-wrapper").classList.remove('loading');
        submitButton.removeAttribute('disabled');
        if(this.connectedForm){
                  this.connectedForm.querySelector(".product__quantity-atc-wrapper").classList.remove('loading')
        }
        this.cartDrawer.open();
        setTimeout(function(){
          if(Rebuy){
            Rebuy.init();
          }
        }, 1000)
        const drawer = document.getElementById("cart-drawer");
        setTimeout(() => {
          drawer.focus();
        }, 250);
      });
  }

  getSectionsToRender() {
    return [
      {
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

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
    this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }
});

customElements.define('sticky-atc', class StickyATC extends HTMLElement {
  constructor(){
    super();

    this.input = this.querySelector("input[name='quantity']")
    this.submit = this.querySelector("button[name='add']")
    this.mainForm = document.querySelector(`form#${this.dataset.mainForm}`)

    this.submit.addEventListener('click', function(e){
      e.preventDefault()
      e.target.classList.add('loading')
      this.mainForm.querySelector('button[type="submit"]').click()
    }.bind(this))
  }
})