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
    if (event.target.matches('#add-gift-wrap')) {
      this.handleGiftWrapChange();
    }else{
      this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
    }
  }

  handleGiftWrapChange() {
    if (this.giftWrapCheckbox.checked) {
      this.addGiftWrapToCart();
    } else {
      this.removeGiftWrapFromCart();
    }
  }

  addGiftWrapToCart() {
    const giftNoteText = document.getElementById('gift-note-text');
    const giftNoteValue = giftNoteText ? giftNoteText.value : '';
    const variantId = giftNoteText.getAttribute('data-variant-id');

    // Add the gift wrap product and note to the cart
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: variantId, // Replace with your gift wrap product variant ID
            quantity: 1,
          },
        ],
        note: giftNoteValue, // Save the note for the order
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to add gift wrap product');
        return response.json();
      })
      .then(() => {
        updateMainCart(); // Reload the cart drawer to reflect the gift wrap addition
      })
      .catch((error) => console.error(error));
  }

  removeGiftWrapFromCart() {
    const lineIndex = this.findGiftWrapLineItemIndex();
    if (lineIndex > -1) {
      // Remove the gift wrap product from the cart
      this.updateQuantity(lineIndex, 0, null); // Set quantity to 0 to remove.
    }
  }

  findGiftWrapLineItemIndex() {
    // Finds the line index of the gift wrap product in the cart
    const giftWrapProductId = variantId; // Replace with your gift wrap product variant ID
    const cartItems = [...this.querySelectorAll('[data-cart-item-id]')];
    for (let i = 0; i < cartItems.length; i++) {
      if (cartItems[i].dataset.cartItemId == giftWrapProductId) {
        return i + 1; // Shopify line items are 1-indexed
      }
    }
    return -1; // Not found
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


