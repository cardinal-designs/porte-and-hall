class CartDrawerRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-drawer').updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-drawer-remove-button', CartDrawerRemoveButton);

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    // Elements
    this.drawer = document.getElementById('cart-drawer');
    
    this.cartButton = document.querySelector('.js-open-cart');
    this.cartButton.addEventListener('click', this.handleCartClick.bind(this));

    this.closeIcon = document.getElementById('cart-drawer__close');
    this.closeIcon.addEventListener('click', this.close.bind(this));
    
    this.onBodyClick = this.handleBodyClick.bind(this);
    this.drawer.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());

    this.pageOverlayElement = document.querySelector('.page-overlay');

    // Functionality
    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  open() {
    this.drawer.setAttribute('aria-hidden', false);
    this.drawer.setAttribute('aria-expanded', true);

    this.pageOverlayElement.classList.add('is-visible');
    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.drawer.setAttribute('aria-hidden', true);
    this.drawer.removeAttribute('aria-expanded', true);

    this.pageOverlayElement.classList.remove('is-visible');
    document.body.removeEventListener('click', this.onBodyClick);
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        console.log("state", state)
        const parsedState = JSON.parse(state);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
            
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

        }));

        this.disableLoading();
      }).catch(() => {
        this.disableLoading();
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

  enableLoading() {
    document.getElementById('cart-drawer-loading').classList.remove('hidden');
  }

  disableLoading() {
    document.getElementById('cart-drawer-loading').classList.add('hidden');
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target.classList.contains('page-overlay')) {
      this.close();
      this.pageOverlayElement.classList.remove('is-visible');
    }
  }

  handleCartClick(evt) {
    evt.preventDefault();
    this.open();
  }
}

customElements.define('cart-drawer', CartDrawer);

const cartDrawerElement = document.querySelector('cart-drawer');
if (cartDrawerElement) {
  const cartDrawerInstance = new CartDrawer();
  // cartDrawerInstance.open();
  // cartDrawerInstance.getSectionsToRender().forEach((section => {
  //   const elementToReplace =
  //     document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
  //   elementToReplace.innerHTML =
  //     cartDrawerInstance.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

  // }));

  let sections = ['cart-icon-bubble', document.getElementById('cart-drawer__content').dataset.id]

  document.addEventListener('rebuy:cart.ready', (event) => { 
    console.log('rebuy:cart.ready event', event.detail); 
    console.log("Rebuy1", Rebuy)
  });
  document.addEventListener('rebuy:cart.add', (event) => { 
    console.log('rebuy:cart.add event', event.detail); 
    console.log("Rebuy2", Rebuy)
    // cartDrawerInstance.getSectionsToRender().forEach((section => {
    //   const elementToReplace =
    //     document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
    //   elementToReplace.innerHTML =
    //     cartDrawerInstance.getSectionInnerHTML(sections[section.section], section.selector);
  
    // }));
  });
  // document.addEventListener('rebuy:cart.change', (event) => { 
  //   console.log('rebuy:cart.change event', event.detail); 
  //   console.log("Rebuy3", Rebuy)
  //   cartDrawerInstance.getSectionsToRender().forEach((section => {
  //     const elementToReplace =
  //       document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
  //     elementToReplace.innerHTML =
  //       cartDrawerInstance.getSectionInnerHTML(sections[section.section], section.selector);
  
  //   }));
  // });
}


