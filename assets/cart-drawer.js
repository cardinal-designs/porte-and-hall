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

    this.addEventListener('change', (event) => {
      this.lockCheckoutForQuantityChange(event);
      this.debouncedOnChange(event);
    });

    this.addEventListener('input', (event) => {
      if (event.target && event.target.matches('.js-gift-note-text')) {
        this.updateCharCount(event.target);
      }
    });
    this.disableDrawerFocus();
    this.giftNoteRemovalInFlight = false;
    requestAnimationFrame(() => this.enforceGiftNoteEligibility());
  }

  updateCharCount(textarea) {
    if (!textarea) return;
    const currentLength = textarea.value.length;
    const maxAttr = textarea.getAttribute('maxlength');
    const maxLength = maxAttr ? parseInt(maxAttr, 10) : 250;
    const remainingChars = maxLength - currentLength;
    const charCountElement = this.querySelector('.js-gift-note-char-count');
    if (charCountElement) charCountElement.textContent = `${remainingChars}`;
  }

  enforceGiftNoteEligibility() {
    if (document.querySelector('cart-items')) return;

    const marker = this.querySelector('.js-gift-note-fix');
    if (!marker) {
      this.giftNoteRemovalInFlight = false;
      return;
    }
    if (this.giftNoteRemovalInFlight) return;

    const line = marker.dataset.line;
    if (!line || line === '0') return;

    this.giftNoteRemovalInFlight = true;
    this.updateQuantity(line, marker.dataset.quantity || 0, null);
  }

  // Keeps the cart page in sync when the drawer changes the cart on /cart.
  refreshCartPage() {
    const cartItems = document.querySelector('cart-items');
    if (cartItems && typeof cartItems.refresh === 'function') cartItems.refresh();
  }

  open() {
    this.drawer.setAttribute('aria-hidden', 'false');
    this.drawer.setAttribute('aria-expanded', true);

    this.drawer.querySelector(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )?.focus();

    this.pageOverlayElement.classList.add('is-visible');
    document.body.addEventListener('click', this.onBodyClick);
    this.enableDrawerFocus();
    cartScroll();
  }

  disableDrawerFocus() {
    this.drawer.querySelectorAll('[tabindex], a, button, input, select, textarea')
      .forEach(el => el.setAttribute('tabindex', '-1'));
  }

  // Call this when the drawer opens
  enableDrawerFocus() {
    this.drawer.querySelectorAll('[tabindex], a, button, input, select, textarea')
      .forEach(el => el.removeAttribute('tabindex'));
  }

  close() {
    this.drawer.setAttribute('aria-hidden', true);
    this.drawer.removeAttribute('aria-expanded', true);

    this.pageOverlayElement.classList.remove('is-visible');
    document.body.removeEventListener('click', this.onBodyClick);
    this.disableDrawerFocus();
  }

  onChange(event) {
    if (event.target.matches('.js-gift-note-checkbox')) {
      this.handleGiftWrapChange(event);
    }else if(event.target.dataset?.index){
      this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
    }
    this.unlockCheckoutForQuantityChange();
  }

  // Locks checkout during the debounce delay, before the update request starts.
  lockCheckoutForQuantityChange(event) {
    if (!event.target.dataset?.index || this.quantityChangePending) return;
    this.quantityChangePending = true;
    CartCheckoutGuard.start();
  }

  unlockCheckoutForQuantityChange() {
    if (!this.quantityChangePending) return;
    this.quantityChangePending = false;
    CartCheckoutGuard.end();
  }

  handleGiftWrapChange(event) {
    if (event.target.checked) {
      const giftNoteModal = this.querySelector('.js-gift-note-modal');
      if (giftNoteModal) giftNoteModal.classList.add('is-visible');
    } else {
      this.removeGiftWrapFromCart();
    }
  }

  addGiftWrapToCart() {
    const giftNoteField = this.querySelector('.js-gift-note-text');
    if (!giftNoteField) return;

    const giftNoteValue = giftNoteField.value;
    const variantId = giftNoteField.dataset.variantId;
    if (!variantId) return;

    const propertyName = giftNoteField.dataset.propertyName;
    const properties = propertyName ? { [propertyName]: giftNoteValue } : {};

    CartCheckoutGuard.start();
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
            properties
          },
        ]
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to add gift wrap product');
        return response.json();
      })
      .then(() => {
        const giftNoteModal = this.querySelector('.js-gift-note-modal');
        if (giftNoteModal) giftNoteModal.classList.remove('is-visible');
        this.refreshCartPage();
        if (typeof updateMainCart === 'function') {
          return updateMainCart(typeof Rebuy !== 'undefined' ? Rebuy : null);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        CartCheckoutGuard.end();
        this.drawer.focus();
      });
  }

  removeGiftWrapFromCart() {
    const lineIndex = this.findGiftWrapLineItemIndex();
    if (lineIndex > -1) {
      this.updateQuantity(lineIndex, 0, null);
    }
  }

  findGiftWrapLineItemIndex() {
    const giftNoteField = this.querySelector('.js-gift-note-text');
    const variantId = giftNoteField ? giftNoteField.dataset.variantId : null;
    if (!variantId) return -1;

    const cartItems = [...this.querySelectorAll('[data-cart-item-id]')];
    for (let i = 0; i < cartItems.length; i++) {
      if (cartItems[i].dataset.cartItemId == variantId) {
        return i + 1;
      }
    }
    return -1;
  }

  showLineItemError(lineIndex, message) {
    const quantityInput = document.querySelector(`input[data-index="${lineIndex}"]`);
    if (!quantityInput) return;
  
    const quantityWrapper = quantityInput.closest('.cart-item__content');
    if (!quantityWrapper) return;
  
    let errorElement = quantityWrapper.querySelector('.cart-item__error');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'cart-item__error';
      errorElement.id = `Line-item-error-${lineIndex}`;
      errorElement.setAttribute('role', 'alert');
      errorElement.innerHTML = `<small class="cart-item__error-text">${message}</small>`;
      quantityWrapper.appendChild(errorElement);
    } else {
      errorElement.querySelector('.cart-item__error-text').textContent = message;
    }
  
    errorElement.style.display = 'block';
  
    clearTimeout(errorElement.dataset.timer);
    errorElement.dataset.timer = setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }


  updateQuantity(line, quantity, name) {
    this.enableLoading(line);
    CartCheckoutGuard.start();

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
        
        const quantityElement =
          document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);

        if (parsedState.errors) {
          if (quantityElement) quantityElement.value = quantityElement.getAttribute('value');
          this.showLineItemError(line, parsedState.errors);
          this.disableLoading();
          this.giftNoteRemovalInFlight = false;
          return;
        }

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
            
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

        }));

        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: { cart: parsedState }
        }));

        cartScroll();

        this.disableLoading();
        this.drawer.focus();
        this.enforceGiftNoteEligibility();
        this.refreshCartPage();
      }).catch(() => {
        this.disableLoading();
        this.giftNoteRemovalInFlight = false;
      }).finally(() => {
        CartCheckoutGuard.end();
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

  enableLoading(line) {
    const subtotalLoader = document.getElementById('cart-drawer-loading');
    if (subtotalLoader) subtotalLoader.classList.remove('hidden');

    const lineItem = this.querySelector(`#CartDrawer-Item-${line}`);
    if (lineItem) {
      lineItem.querySelectorAll('.cart-item__price .loading-overlay').forEach((overlay) => {
        overlay.classList.remove('hidden');
      });
    }
  }

  disableLoading() {
    const subtotalLoader = document.getElementById('cart-drawer-loading');
    if (subtotalLoader) subtotalLoader.classList.add('hidden');

    this.querySelectorAll('.cart-item__price .loading-overlay').forEach((overlay) => {
      overlay.classList.add('hidden');
    });
  }

  handleBodyClick(evt) {
    const target = evt.target;
    const giftCloseBtn = target.closest('.js-gift-note-close');
    if (giftCloseBtn && this.contains(giftCloseBtn)) {
      evt.preventDefault();
      const giftWrapCheckbox = this.querySelector('.js-gift-note-checkbox');
      const giftNoteModal = this.querySelector('.js-gift-note-modal');
      if (giftWrapCheckbox) giftWrapCheckbox.checked = false;
      if (giftNoteModal) giftNoteModal.classList.remove('is-visible');
    }

    const addGiftNoteBtn = target.closest('.js-gift-note-add');
    if (addGiftNoteBtn && this.contains(addGiftNoteBtn)) {
      evt.preventDefault();
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


function refreshCartIconBubble() {
  const cartIcon = document.getElementById('cart-icon-bubble');
  if (!cartIcon) return Promise.resolve();

  return fetch(`${window.origin}/?section_id=cart-icon-bubble`)
    .then((response) => response.text())
    .then((responseText) => {
      const html = new DOMParser().parseFromString(responseText, 'text/html');
      const source = html.querySelector('.shopify-section');
      if (source) cartIcon.innerHTML = source.innerHTML;
    });
}

function updateMainCart(Rebuy) {
  CartCheckoutGuard.start();
  return fetch(`${window.origin}/?section_id=cart-drawer`)
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
    .then(() => refreshCartIconBubble())
    .then(() => {
      const drawerElement = document.querySelector('cart-drawer');
      if (drawerElement && typeof drawerElement.enforceGiftNoteEligibility === 'function') {
        drawerElement.enforceGiftNoteEligibility();
      }
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      CartCheckoutGuard.end();
      setTimeout(() => {
        if (Rebuy) {
          Rebuy.init();
          cartScroll();
        }
      }, 2000);
    });
}

document.addEventListener('rebuy:cart.ready', (event) => { 
  Rebuy.init();
  const drawer = document.getElementById("cart-drawer");
  setTimeout(() => {
    drawer.focus();
  }, 250);
});
document.addEventListener('rebuy:cart.add', (event) => { 
  updateMainCart(Rebuy)
  const drawer = document.getElementById("cart-drawer");
  setTimeout(() => {
    drawer.focus();
  }, 250);
});
document.addEventListener('rebuy:cart.change', (event) => { 
  updateMainCart(Rebuy)
  const drawer = document.getElementById("cart-drawer");
  setTimeout(() => {
    drawer.focus();
  }, 250);
});

function trapFocusinCart(modal) {  
  modal.addEventListener('keydown', (e) => {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [name="checkout"]');
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const newcheckout = document.querySelector(`[aria-label="CHECK OUT"]`);
    const skipContent = document.querySelector(`main .skip-to-content-link`);
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || document.activeElement === newcheckout || document.activeElement === skipContent) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById("cart-drawer");
  // Call this after opening the drawer
  // drawer.classList.add('aria-unhidden');
  if(drawer.getAttribute("aria-hidden") == "false") drawer.focus();
  trapFocusinCart(drawer);
});

function cartScroll() {
  const cartFooter = document.querySelector('.cart-drawer__footer');
  const cartHeader = document.querySelector('.cart-drawer__header');
  const cartItemsEle = document.querySelector('.cart-drawer__items');

  if (!cartItemsEle) return;

  // Batch reads, then single write.
  const footerHeight = cartFooter ? cartFooter.offsetHeight : 0;
  const headerHeight = cartHeader ? cartHeader.offsetHeight : 0;
  cartItemsEle.style.height = `calc(100vh - ${footerHeight + headerHeight}px)`;
}

document.addEventListener('cart:updated', function () {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cartScroll();
      // Run again after delay for safety
      setTimeout(cartScroll, 300);
    });
  });
});