customElements.define('grouped-product-card', class GroupedProductCard extends HTMLElement {
  constructor() {
    super();

    this.swatches = this.querySelector(".product-card__swatches")
    this.showSwatches = this.querySelector("[data-hidden-swatches]")
    this.swiper = this.querySelector(".swiper")
    this.atc = this.querySelector("[data-quick-add]")
    this.cartDrawer = document.querySelector('cart-drawer');

    if(this.swiper){
      this.initSwiper(this.swiper)
    }

    this.showSwatches?.addEventListener("click", function(e){
      e.preventDefault()
      this.showAllSwatches()
      e.target.classList.add("hidden")
    }.bind(this))

    this.atc?.addEventListener('click', function(e){
      e.preventDefault()
      
      this.quickAdd(e.target)
    }.bind(this))
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

  quickAdd(t){
    t.classList.add('loading')

    const body = JSON.stringify({
      'items': [{
       'id': t.dataset.variant,
       'quantity': 1
       }],
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
     });

     console.log({ ...fetchConfig('javascript'), body })

    fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
    .then(response => response.json())
    .then((parsedState) => {

      console.log(parsedState)
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
      t.classList.remove('loading')
      this.cartDrawer.open();
    });
  }

  showAllSwatches() {
    let hiddenSwatches = this.swatches.querySelectorAll(".hidden")
    hiddenSwatches.forEach( (swatch) => {
      swatch.classList.remove("hidden")
    })
  }

  initSwiper(s) {
    const images = new Swiper(s, {
      slidesPerView: 1,
      spaceBetween: 0,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      },
    })
  }
})