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
    this.giftWrapCheckbox = document.getElementById('add-gift-wrap'); 
    
    this.giftNoteText = document.getElementById('gift-note-text');
    
    // Functionality
    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));

    this.addEventListener('input', (event) => {
      if (event.target && event.target.id === 'gift-note-text') {
        this.updateCharCount(event.target);
      }
    });
  }
  updateCharCount(textarea) {
    const currentLength = textarea.value.length;
    const maxAttr = textarea.getAttribute('maxlength');
    const maxLength = maxAttr ? parseInt(maxAttr, 10) : 250;
    const remainingChars = maxLength - currentLength;
    const charCountElement = document.querySelector('.char-count span');
    charCountElement.textContent = `${remainingChars}`;
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
    if(event.target.dataset?.index){
      this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
    }
  }

  handleGiftWrapChange(target) {
    if (!target) return;
  
    let checkbox = target;
    console.log('checkbox',checkbox);
  

    if (target.tagName && target.tagName.toLowerCase() === 'label') {
      const inputId = clickedElement.getAttribute('for');
      if (inputId) {
        checkbox = document.getElementById(inputId);
      }
    }
  
    if (!checkbox) return;
  
    if (checkbox.checked) {
      const giftNoteModal = document.getElementById('gift-note-modal');
      giftNoteModal.classList.add('is-visible');
    } else {
      this.removeGiftWrapFromCart();
    }
  }
  
  addGiftWrapToCart() {
    let giftNoteField = document.getElementById('gift-note-text');
    let giftNoteValue = giftNoteField ? giftNoteField.value : '';
    let variantId = giftNoteField.getAttribute('data-variant-id');

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: variantId,
            quantity: 1,
            properties: {
              'Note': giftNoteValue
            }
          },
        ]
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to add gift wrap product');
        return response.json();
      })
      .then(() => {
        
      })
      .catch((error) => console.error(error));
  }

  removeGiftWrapFromCart() {
    const lineIndex = this.findGiftWrapLineItemIndex();
    if (lineIndex > -1) {
      this.updateQuantity(lineIndex, 0, null);
    }
  }

  findGiftWrapLineItemIndex() {
    let giftNoteField = document.getElementById('gift-note-text');
    let giftNoteValue = giftNoteField ? giftNoteField.value : '';
    let variantId = giftNoteField.getAttribute('data-variant-id');
    let giftWrapProductId = variantId;
    let cartItems = [...this.querySelectorAll('[data-cart-item-id]')];
    for (let i = 0; i < cartItems.length; i++) {
      if (cartItems[i].dataset.cartItemId == giftWrapProductId) {
        return i;
      }
    }
    return -1;
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
    console.log('Great',evt.target);
    const target = evt.target;
    if (target.matches('#gift-wrap-option label')) {
      this.handleGiftWrapChange(target);
      return;
    }
    let closeGiftModal = document.getElementById('close-gift-note');
    if (closeGiftModal) {
      const giftCloseBtn = document.getElementById('close-gift-note');
      const giftNoteModal = document.getElementById('gift-note-modal');
      const giftWrapCheckbox = document.getElementById('add-gift-wrap');
  
      if (giftCloseBtn && (target.matches('#close-gift-note') || giftCloseBtn.contains(target))) {
        if (giftWrapCheckbox) {
          giftWrapCheckbox.checked = false;
        }
        if (giftNoteModal) {
          giftNoteModal.classList.remove('is-visible');
        }
      }
      return;
    }
    const addGiftNoteBtn = document.getElementById('add-gift-note-btn');
    if (addGiftNoteBtn && target.matches('#add-gift-note-btn')) {
      this.addGiftWrapToCart();
    }
    
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


function updateMainCart(Rebuy) {
  fetch(`${window.origin}/?section_id=cart-drawer`)
    .then((response) => response.text())
    .then((responseText) => {
      const html = new DOMParser().parseFromString(responseText, 'text/html');
      const selectors = ['.cart-drawer__content'];
      for (const selector of selectors) {
        const targetElement = document.querySelector(selector);
        const sourceElement = html.querySelector(selector);
        if (targetElement && sourceElement) {
          targetElement.replaceWith(sourceElement);
        }
      }
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      setTimeout(() => {
        if (Rebuy) {
          Rebuy.init();
        }
      }, 2000);
    });
}

document.addEventListener('rebuy:cart.ready', (event) => { 
    Rebuy.init();
});
document.addEventListener('rebuy:cart.add', (event) => { 
  updateMainCart(Rebuy)
});
document.addEventListener('rebuy:cart.change', (event) => { 
  updateMainCart(Rebuy)
});


