customElements.define('grouped-product-card', class GroupedProductCard extends HTMLElement {
  constructor() {
    super();

    this.swatches = this.querySelector(".product-card__swatches")
    this.showSwatches = this.querySelector("[data-hidden-swatches]")

    this.showSwatches.addEventListener("click", function(e){
      e.preventDefault()
      this.showAllSwatches()
      e.target.classList.add("hidden")
    }.bind(this))
  }

  showAllSwatches() {
    let hiddenSwatches = this.swatches.querySelectorAll(".hidden")
    hiddenSwatches.forEach( (swatch) => {
      swatch.classList.remove("hidden")
    })
  }
})