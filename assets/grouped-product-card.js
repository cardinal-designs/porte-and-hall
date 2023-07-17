customElements.define('grouped-product-card', class GroupedProductCard extends HTMLElement {
  constructor() {
    super();

    this.swatches = this.querySelector(".product-card__swatches")
    this.showSwatches = this.querySelector("[data-hidden-swatches]")
    this.swiper = this.querySelector(".swiper")
    this.atc = this.querySelector("[data-quick-add]")

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

  quickAdd(t){
    t.classList.add('loading')

    let formData = {
      'items': [{
       'id': t.dataset.variant,
       'quantity': 1
       }]
     };

    fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
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