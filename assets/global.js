/*================ Shopify Common JS ================*/
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  } 
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  if (this.countryEl) {
    Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

    this.initCountry();
    this.initProvince();
  }
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

Shopify.formatMoney = function(cents, format = "") {
  if (typeof cents === "string") {
    cents = cents.replace(".", "");
  }
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/, formatString = format || window.themeVariables.settings.moneyFormat;
  function defaultTo(value2, defaultValue) {
    return value2 == null || value2 !== value2 ? defaultValue : value2;
  }
  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultTo(precision, 2);
    thousands = defaultTo(thousands, ",");
    decimal = defaultTo(decimal, ".");
    if (isNaN(number) || number == null) {
      return 0;
    }
    number = (number / 100).toFixed(precision);
    let parts = number.split("."), dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands), centsAmount = parts[1] ? decimal + parts[1] : "";
    return dollarsAmount + centsAmount;
  }
  let value = "";
  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_space_separator":
      value = formatWithDelimiters(cents, 2, " ", ".");
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 2, "'", ".");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ",", ".");
      break;
    case "amount_no_decimals_with_space_separator":
      value = formatWithDelimiters(cents, 0, " ");
      break;
    case "amount_no_decimals_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 0, "'");
      break;
  }
  if (formatString.indexOf("with_comma_separator") !== -1) {
    return formatString.replace(placeholderRegex, value);
  } else {
    return formatString.replace(placeholderRegex, value);
  }
}

/*================ Helper Functions ================*/
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

function getCookie(name) {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}

function setCookie(name, value, days) {
  var d = new Date;
  d.setTime(d.getTime() + 24*60*60*1000*days);
  document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}

function slideUp(target, duration = 500) {
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 'ms';
  target.style.boxSizing = 'border-box';
  target.style.height = target.offsetHeight + 'px';
  target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  window.setTimeout( () => {
        target.style.display = 'none';
        target.style.removeProperty('height');
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
        //alert("!");
  }, duration);
}

function slideDown(target, duration = 500) {
  target.style.removeProperty('display');
  let display = window.getComputedStyle(target).display;
  if (display === 'none') display = 'block';
  target.style.display = display;
  let height = target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  target.offsetHeight;
  target.style.boxSizing = 'border-box';
  target.style.transitionProperty = "height, margin, padding";
  target.style.transitionDuration = duration + 'ms';
  target.style.height = height + 'px';
  target.style.removeProperty('padding-top');
  target.style.removeProperty('padding-bottom');
  target.style.removeProperty('margin-top');
  target.style.removeProperty('margin-bottom');
  window.setTimeout( () => {
    target.style.removeProperty('height');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

function slideToggle(target, duration = 500) {
  if (window.getComputedStyle(target).display === 'none') {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
}

function fadeIn(target, duration = 500) {
  target.style.display = '';
  target.style.opacity = 0;
  var last = +new Date();
  var tick = function() {
    target.style.opacity = +target.style.opacity + (new Date() - last) / duration;
    last = +new Date();
    if (+target.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    }
  };
  tick();
}

function fadeOut(target, duration = 500) {
  target.style.display = '';
  target.style.opacity = 1;
  let last = +new Date();
  let tick = function() {
    target.style.opacity = Number(+target.style.opacity - (new Date() - last) / duration).toFixed(4);
    last = +new Date();
    if (-target.style.opacity <= 0) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    } else{
        target.style.opacity = 0;
    }
  };
  tick();
}

function getSectionInnerHTML(html, selector) {
  return new DOMParser()
    .parseFromString(html, 'text/html')
    .querySelector(selector).innerHTML;
}

function atcGetSectionsToRender() {
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

function addToCart(body, openCart = true) {
  fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
  .then((response) => response.json())
  .then((parsedState) => {
    atcGetSectionsToRender().forEach((section => {
      const elementToReplace =
        document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

      elementToReplace.innerHTML =
        getSectionInnerHTML(parsedState.sections[section.section], section.selector);
    }));
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(() => {
    if (openCart) {
      document.querySelector('cart-drawer').open();
    }
  });
}

const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

/*================ Initialize ================*/
// Micromodal
MicroModal.init({
  openClass: 'is-open',
  disableScroll: true,
  disableFocus: true,
  openTrigger: 'data-modal-trigger',
  closeTrigger: 'data-modal-close'
});

/*================ Components ================*/
var MenuDrawer = class extends HTMLElement {
  constructor() {
    super();

    this.drawer = this.drawer = document.getElementById('menu-drawer');
    this.openButtons = document.querySelectorAll('.js-open-menu');
    this.closeButtons = document.querySelectorAll('.js-close-menu');
    this.menuButtons = document.querySelectorAll('.menu-drawer__menu-button');
    this.pageOverlayElement = document.querySelector('.page-overlay');
    
    this.drawer.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.closeMenuDrawer());
    this.bindEvents();
  }

  bindEvents() {
    this.openButtons.forEach(openBtn => openBtn.addEventListener('click', this.openMenuDrawer.bind(this)));
    this.closeButtons.forEach(closeBtn => closeBtn.addEventListener('click', this.closeMenuDrawer.bind(this)));
    this.menuButtons.forEach(menuBtn => menuBtn.addEventListener('click', this.toggleMenuButtons.bind(this)));
    this.onBodyClick = this.handleBodyClick.bind(this);
  }

  openMenuDrawer() {
    this.drawer.setAttribute('aria-hidden', false);
    this.drawer.setAttribute('aria-expanded', true);

    this.pageOverlayElement.classList.add('is-visible');
    document.body.addEventListener('click', this.onBodyClick);
  }

  closeMenuDrawer() {
    this.drawer.setAttribute('aria-hidden', true);
    this.drawer.removeAttribute('aria-expanded', true);

    this.pageOverlayElement.classList.remove('is-visible');
    document.body.removeEventListener('click', this.onBodyClick);
  }

  toggleMenuButtons() {
    const parent = event.target.parentElement;
    const secondaryMenu = event.target.nextElementSibling;
    
    if (parent.classList.contains('is-open')) {
      slideUp(secondaryMenu);
      parent.classList.remove('is-open');
    } else {
      slideDown(secondaryMenu);
      parent.classList.add('is-open');
    }
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target.classList.contains('page-overlay')) {
      this.closeMenuDrawer();
      this.pageOverlayElement.classList.remove('is-visible');
    }
  }
}

customElements.define('menu-drawer', MenuDrawer);

var QuantityInput = class extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.mainForm = this.closest("form")
    if(this.mainForm != null){
      this.connectedForm = document.querySelector(`sticky-atc[data-main-form="${this.mainForm.getAttribute("id")}"]`)
    } else {
      this.mainForm = this.closest("sticky-atc")
      this.connectedForm = document.querySelector(`form#${this.mainForm.dataset.mainForm}`)
    }

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );

    this.input.addEventListener("change", function(e){
      this.onInputChange(e)
    }.bind(this))
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }

  onInputChange(event) {
    if (this.connectedForm) {
      const quantityInput = this.connectedForm.querySelector("input[name='quantity']");
      if (quantityInput) {
        quantityInput.value = event.target.value;
      }
    } else {
      console.warn("connectedForm is not defined");
    }
  }

}

customElements.define('quantity-input', QuantityInput);

var VariantSelects = class extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    const newMedia = document.querySelector(
      `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
    );

    if (!newMedia) return;
    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    const parent = newMedia.parentElement;
    if (parent.firstChild == newMedia) return;
    modalContent.prepend(newMediaModal);
    parent.prepend(newMedia);
    this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
    if(this.stickyHeader) {
      this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
    }
    window.setTimeout(() => {
      parent.scrollLeft = 0;
      parent.querySelector('li.product__media-item').scrollIntoView({behavior: 'smooth'});
    });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

var VariantRadios = class extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

var AddToCart = class extends HTMLElement {
  constructor() {
    super();

    this.button = this.querySelector('button');
    this.button.addEventListener('click', this.onButtonClick.bind(this));
  }

  onButtonClick(event) {
    event.preventDefault();
    const id = this.dataset.id;

    const body = JSON.stringify({
      items: [{
        id: id,
        quantity: 1
      }],
      sections: atcGetSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    addToCart(body);
  }
}

customElements.define('add-to-cart', AddToCart);

// var GlobalSection = class extends HTMLElement {
//   constructor() {
//     super();

//     this.parentEl = this.closest(".shopify-section")
//     this.section_id = this.getAttribute("data-section-id")

//     fetch(`/?section_id=${ this.section_id}`)
//       .then((response) => {
//         if (response.status !== 200) {
//           throw new Error('Section not found');
//         }
//         return response;
//       })
//       .then((response) => response.text())
//       .then((responseText) => {
//         const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
//         let globalElement = responseHTML.querySelector('.shopify-section');
//         this.parentEl.outerHTML = globalElement.outerHTML;
//       })
//       .catch((err) => {
//         console.log(err);
//       })
//       .finally(() => {
//         this.parentEl.classList.remove('hidden');
//       });
//   }
// }

// customElements.define('global-section', GlobalSection)

var UGCCarousel = class extends HTMLElement {
  constructor(){
    super();

    this.section_id = this.querySelector(`.swiper`).id
    this.pagination = this.querySelector(`.ugc-carousel__pagination`)
    const swiper_options = {
      slidesPerView: 2.5,
      centeredSlides: true,
      spaceBetween: 10,
      loop: true,
      mousewheel: true,
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 'auto',
          spaceBetween: 18,
        },
      },
      on: {
        init: function () {
          console.log('swiper initialized');
        },
      },
    }

    if (!this.classList.contains("swiper-initialized")){
      this.initializeCarousel(this.querySelector(`.swiper`), swiper_options);
    }
  }

  initializeCarousel(swipe, options) {
    const ugcSwiper = new Swiper(swipe, options);
  }
}

customElements.define('ugc-carousel', UGCCarousel)

var ProductCarousel = class extends HTMLElement {
  constructor(){
    super();

    this.section_id = this.querySelector(`.swiper`).id
    this.pagination = this.querySelector(`.swiper-pagination`)
    const swiper_options = {
      slidesPerView: 2.25,
      slidesPerGroup: 2,
      slidesPerGroupAuto: false,
      centeredSlides: false,
      spaceBetween: 10,
      loopedSlides: 2,
      draggable: true,
      loop: true,
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        768: {
          slidesPerView: 'auto',
          slidesPerGroup: 3,
          centeredSlides: false,
          spaceBetween: 20,
          slidesPerGroupAuto: true,
          loopedSlides: 4,
          slidesPerGroupAuto: true,
          centeredSlides: true,
        },
      },
    }

    if (!this.classList.contains("swiper-initialized")){
      this.initializeCarousel(this.querySelector(`.swiper`), swiper_options);
    }
  }

  initializeCarousel(swipe, options) {
    const productSwiper = new Swiper(swipe, options);
  }
}

customElements.define('product-carousel', ProductCarousel)

var ProductCarouselNew = class extends HTMLElement {
  constructor(){
    super();

    this.section_id = this.querySelector(`.swiper`).id
    this.pagination = this.querySelector(`.swiper-pagination`)
     const swiper_options = {  
      spaceBetween: 10,
      slidesPerView: 2.2,
      loop: true,
      draggable: true,
      centeredSlides: false,
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        768: {
          spaceBetween: 20,
          loop: false,
          centeredSlides: false,
          slidesPerView: 4,
        },
      },
    }

    if (!this.classList.contains("swiper-initialized")){
      this.initializeCarousel(this.querySelector(`.swiper`), swiper_options);
    }

  }

  initializeCarousel(swipe, options) {
    const productSwiper = new Swiper(swipe, options);
  }
}

customElements.define('product-carousel-new', ProductCarouselNew)

var ProductCarouselNew2 = class extends HTMLElement {
  constructor(){
    super();

    this.section_id = this.querySelector(`.swiper`).id
    this.pagination = this.querySelector(`.swiper-pagination`)
     const swiper_options = {  
      spaceBetween: 10,
      slidesPerView: 2.2,
      loop: true,
      draggable: true,
      centeredSlides: false,
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        768: {
          spaceBetween: 20,
          loop: false,
          centeredSlides: false,
          slidesPerView: 4,
        },
      },
    }

    if (!this.classList.contains("swiper-initialized")){
      this.initializeCarousel(this.querySelector(`.swiper`), swiper_options);
    }

  }

  initializeCarousel(swipe, options) {
    const productSwiper = new Swiper(swipe, options);
  }
}

customElements.define('product-carousel-new-two', ProductCarouselNew2)

var ImageCarousel = class extends HTMLElement {
  constructor(){
    super();

    this.section_id = this.querySelector(`.swiper`).id
    this.pagination = this.querySelector(`.image-carousel__pagination`)
    const swiper_options = {
      slidesPerView: 1.1,
      centeredSlides: true,
      spaceBetween: 10,
      loop: true,
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      breakpoints: {
        1920: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
        1440: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1023: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 20,
        }
      },
      on: {
        init: function () {
          console.log('swiper initialized');
        },
      },
    }

    if (!this.classList.contains("swiper-initialized")){
      this.initializeCarousel(this.querySelector(`.swiper`), swiper_options);
    }
  }

  initializeCarousel(swipe, options) {
    const ugcSwiper = new Swiper(swipe, options);
  }
}

customElements.define('image-carousel', ImageCarousel)

var ArticleCarousel = class extends HTMLElement {
  constructor(){
    super();

    this.section_id = this.querySelector(`.swiper`).id
    this.pagination = this.querySelector(`.article-carousel__pagination`)
    const swiper_options = {
      slidesPerView: 2,
      spaceBetween: 12,
      centeredSlides: false,
      loop: true,
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      breakpoints: {
        1920: {
          slidesPerView: 4,
          spaceBetween: 20,
          centeredSlides: true
        },
        1440: {
          slidesPerView: 3.4,
          spaceBetween: 20,
          centeredSlides: true
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 20,
        }
      },
      on: {
        init: function () {
          console.log('swiper initialized');
        },
      },
    }

    if (!this.classList.contains("swiper-initialized")){
      this.initializeCarousel(this.querySelector(`.swiper`), swiper_options);
    }
  }

  initializeCarousel(swipe, options) {
    const articleSwiper = new Swiper(swipe, options);
  }
}

customElements.define('article-carousel', ArticleCarousel)

// var ShopStoryCarousel = class extends HTMLElement {
//   constructor(){
//     super();

//     this.section_id = this.querySelector(`.swiper`).id
//     this.pagination = this.querySelector(`.shop-story-carousel__pagination`)
//     const swiper_options = {
//       slidesPerView: 2.25,
//       spaceBetween: 20,
//       centeredSlides: false,
//       loop: true,
//       pagination: {
//         el: this.pagination,
//         clickable: true,
//       },
//       breakpoints: {
//         // 1920: {
//         //   slidesPerView: 4,
//         //   spaceBetween: 20,
//         //   centeredSlides: true
//         // },
//         // 1440: {
//         //   slidesPerView: 3.4,
//         //   spaceBetween: 20,
//         //   centeredSlides: true
//         // },
//         // 1023: {
//         //   slidesPerView: 3,
//         //   spaceBetween: 20,
//         // },
//         768: {
//           slidesPerView: 'auto',
//           centeredSlides: true,
//         }
//       },
//       on: {
//         init: function () {
//           console.log('swiper initialized');
//         },
//       },
//     }

//     if (!this.classList.contains("swiper-initialized")){
//       this.initializeCarousel(this.querySelector(`.swiper`), swiper_options);
//     }
//   }

//   initializeCarousel(swipe, options) {
//     const articleSwiper = new Swiper(swipe, options);
//   }
// }

// customElements.define('shop-story-carousel', ShopStoryCarousel)

var LoadMore = class extends HTMLElement {
  constructor() {
    super();

    const dataUrl = this.dataset.loadMore
    const productGrid = this.closest(".collection").querySelector("#product-grid")
    const loadMoreWrapper = productGrid?.nextElementSibling

    this.addEventListener("click", function(e){
      e.preventDefault();

      this.classList.add("loading")

      fetch(dataUrl).then(response => response.text()).then((responseText) => {
        const html = responseText;
        const htmlContent = new DOMParser().parseFromString(html, 'text/html')

        productGrid.innerHTML = productGrid.innerHTML + htmlContent.querySelector("#product-grid").innerHTML;
        loadMoreWrapper.innerHTML = htmlContent.querySelector("load-more") || ""

      })
    }.bind(this))
  }
}

customElements.define('load-more', LoadMore)

// offset anchor
window.addEventListener('hashchange', offsetAnchor);
window.setTimeout(offsetAnchor, 1);
function offsetAnchor() {
	if (location.hash.length !== 0) {
		window.scrollTo(window.scrollX, window.scrollY - 130);
	}
}

// PDP accordion

var accordionToggle = class extends HTMLElement {
  constructor() {
    super();
    this.accordionTitles = this.querySelectorAll('.accordion-title')
    this.accordionTitles.forEach(elem => elem.addEventListener('click', this.onToggleClick.bind(this)));
  }

  onToggleClick(event) {
    let id = event.target.parentNode.getAttribute("data-id");
    let currentToggle = document.querySelector(`.accordion-content[data-id='${id}']`)
    let currentTitle = document.querySelector(`.accordion-title[data-id='${id}'] svg`)
    currentTitle.classList.contains('rotate') ? currentTitle.classList.remove('rotate') : currentTitle.classList.add('rotate');
    currentToggle.classList.contains('active') ? currentToggle.classList.remove('active') : currentToggle.classList.add('active');
  }
}

customElements.define('pdp-accordion', accordionToggle);

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


var ProductFeature = class extends HTMLElement {
  constructor() {
    super();

    this.swatches = this.querySelectorAll("button[data-url]")
    this.swatches.forEach( swatch => {
      swatch.addEventListener("click", this.updateSection.bind(this))
    })

    this.setupTabs()
    this.setupMedia()
    this.setupBackInStock()
  }

  updateSection(event) {
    event && event.preventDefault()

    let fetchUrl = event.target.dataset.url
    if(fetchUrl.includes("?variant")) {
      fetchUrl = fetchUrl + `&section_id=${this.dataset.section}`
    } else {
      fetchUrl = fetchUrl + `?section_id=${this.dataset.section}`
    }

    fetch(fetchUrl)
    .then((response) => response.text())
    .then((responseText) => {
        const id = `product-feature-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id).parentElement;
        const source = html.getElementById(id).parentElement;

        if (source && destination) destination.innerHTML = source.innerHTML;
      })
  }

  setupTabs() {
    this.tabs = this.querySelector(".product__tabs")
    this.productTabs = new Swiper(this.tabs, {
      slidesPerView: 1,
      loop: false,
      allowTouchMove: false,
    });

    this.productTabsButtons = this.querySelectorAll('[data-product-tabs]');
    this.productTabsButtons.forEach((button) => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        Array.from(this.productTabsButtons)
          .find((btn) => btn.classList.contains('active'))
          .classList.remove('active');
        e.target.classList.add('active');
        this.productTabs.slideTo(e.target.dataset.productTabs);
      });
    });
  }

  setupMedia() {

    this.thumbnails = this.querySelector('.product__media-thumbnails')
    this.thumbnailSlider = new Swiper(this.thumbnails, {
      slidesPerView: 'auto',
      loop: false,
      spaceBetween: 10,
      direction: 'vertical',
    });

    this.thumbnailsZoom = this.querySelector('.product__media-thumbnails-zoom')
    this.zoomThumbnailSlider = new Swiper(this.thumbnailsZoom, {
      slidesPerView: 'auto',
      loop: false,
      spaceBetween: 10,
      direction: 'vertical',
    });

    this.zoomSlider = this.querySelector('.product__zoom-slider')
    this.productZoomSlider = new Swiper(this.zoomSlider, {
      loop: false,
      slidesPerView: 1,
      allowTouchMove: true,
      navigation: {
        prevEl: '.product__zoom-button.swiper-button-prev',
        nextEl: '.product__zoom-button.swiper-button-next',
      },
      breakpoints: {
        769: {
          allowTouchMove: false,
        },
      },
      thumbs: {
        swiper: this.zoomThumbnailSlider,
      },
    });

    this.mediaList = this.querySelector('.product__media-list')
    this.productSlider = new Swiper(this.mediaList, {
      slidesPerView: 1,
      loop: false,
      spaceBetween: 20,
      pagination: {
        el: '.product__media-pagination',
        clickable: true,
      },
      thumbs: {
        swiper: this.thumbnailSlider,
      },
      navigation: {
        prevEl: '.product__media-button.swiper-button-prev',
        nextEl: '.product__media-button.swiper-button-next',
      },
      controller: {
        control: this.productZoomSlider,
      },
    });

    this.zoomContainer = this.querySelector('.product__zoom');
    this.openZoom = this.querySelectorAll('[data-open-zoom]');
    this.openZoom.forEach((zoom) => {
      zoom.addEventListener('click', (event) => {
        this.zoomContainer.classList.add('open');
        document.body.classList.add('scroll-lock');
      });

      document.body.addEventListener(
        'keyup',
        (event) => {
          this.closeZoomFunction(event.key);
        },
        true
      );
    });

    this.closeZoom = this.querySelector('[data-close-zoom]');
    this.closeZoom.addEventListener('click', (event) => {
      console.log('close');
      this.closeZoomFunction();
      document.body.removeEventListener(
        'keyup',
        (event) => {
          this.closeZoomFunction(event.key);
        },
        true
      );
    });
  }

  closeZoomFunction(eventType = '') {
    if (eventType == '' || eventType == 'Escape') {
      this.zoomContainer.classList.remove('open');
      document.body.classList.remove('scroll-lock');
    }
  }

  setupBackInStock() {
    this.backInStock = document.querySelector('[data-bis-button]');
    this.backInStock?.addEventListener('click', function (e) {
      e.preventDefault();
      const container = this.closest('.NotifyMe_form');
      container.querySelector('.notifyme_error').innerHTML = '';
      let variant_value = container.querySelector('.notify-me-var').value;
      let email_value = container.querySelector('.notify-email-val').value;
      let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (variant_value != '' && email_value != '') {
        if (regex.test(email_value)) {
          let formData = {
            variant: variant_value,
            email: email_value,
          };

          async function postData(url = '', data = {}) {
            // Default options are marked with *
            const response = await fetch(url, {
              method: 'POST',
              body: JSON.stringify(data),
            });
            return response.json();
          }

          postData('https://secureddatasystem.com/clients/porteandhall/porteandhall.php', { data: formData }).then(
            (data) => {
              console.log(data); // JSON data parsed by `data.json()` call
              container.querySelector('.notifyme_error').innerHTML =
                '<p class="success">Thank You!!! We will notify you once the product is available.</p>';
              container.querySelector('.notify-email-val').value = '';
            }
          );
        } else {
          container.querySelector('.notify-email-val').focus();
          container.querySelector('.notifyme_error').innerHTML = '<p class="success">Invalid Email</p>';
        }
      } else {
        container.querySelector('.notify-email-val').focus();
        container.querySelector('.notifyme_error').innerHTML = '<p class="success">Email is required</p>';
      }
    });
  }
}

customElements.define('product-feature', ProductFeature);

const accordionItems = document.querySelectorAll('.faq__question');
accordionItems.forEach((accordion) => {
  accordion.addEventListener('click', (event) => {
    const parent = accordion.parentElement;
    const content = accordion.nextElementSibling;

    if (!parent.classList.contains('active')) {
      parent.classList.add('active');
      slideDown(content, 400);
    } else {
      parent.classList.remove('active');
      slideUp(content, 400);
    }
  });
});
window.addEventListener("load", () => {
  // console.clear();
  console.log("test");
})
document.addEventListener("DOMContentLoaded", (event) => {
  if (typeof gsap === "undefined" || !gsap.plugins.scrollTo) {
    console.error("GSAP or ScrollToPlugin not loaded!");
    return;
  }

  const HEADER_HEIGHT = document.querySelector('.header')?.offsetHeight ?? 0; 
  document.querySelectorAll(".scroll__button").forEach(function (button) {
    button.addEventListener("click", function () {
      const target = document.querySelector(".Designer_Program_Main");
      if (target) {
        gsap.to(window, {
          scrollTo: {
            y: target, 
            offsetY: HEADER_HEIGHT,
          },
          duration: 1,
          ease: "power2.out",
        });
      } else {
        console.error("Target section not found!");
      }
    });
  });
});

/* document.addEventListener("DOMContentLoaded", (event) => {
  const HEADER_HEIGHT = document.querySelector('.header').offsetHeight; // Adjust based on your fixed header height
  document.querySelectorAll(".scroll__button").forEach(function(button) {
    button.addEventListener("click", function() {
      console.log('Clicked');
      const target = document.querySelector(".Designer_Program_Main");
      if (target) {
        const offsetTop = target.offsetTop - HEADER_HEIGHT;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth"
        });
      }
    });
  });
}); */
