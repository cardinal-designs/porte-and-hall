class ShopBySize extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.initTabs();
    this.initSwipers();
  }

  initTabs() {
    const tabs = this.querySelectorAll('.shop-by-size__tab');
    const productGroups = this.querySelectorAll('.shop-by-size__products');

    if (!tabs.length || !productGroups.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', (event) => {
        event.preventDefault();

        const targetId = tab.dataset.id;

        productGroups.forEach((group) => {
          group.classList.toggle(
            'shop-by-size__products--active',
            group.dataset.id === targetId
          );
        });

        tabs.forEach((t) => t.classList.remove('shop-by-size__tab--active'));
        tab.classList.add('shop-by-size__tab--active');
      });
    });
  }

  initSwipers() {
    if (typeof Swiper === 'undefined') {
      return;
    }

    const swiperContainers = this.querySelectorAll('.js-shop-by-size-swiper');

    swiperContainers.forEach((container) => {
      const nextBtn = container.querySelector('.swiper-button-next');
      const prevBtn = container.querySelector('.swiper-button-prev');

      new Swiper(container, {
        loop: false,
        slidesPerView: 'auto',
        spaceBetween: 12,
        centeredSlides: true,
        loop: true,
        navigation: {
          nextEl: nextBtn,
          prevEl: prevBtn,
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        breakpoints: {
          990: {
            slidesPerView: 3,
            spaceBetween: 24,
            centeredSlides: false,
            loop: false,
          },
          1200: {
            slidesPerView: 4,
            centeredSlides: false,
            loop: false,
          },
        },
      });
    });
  }
}

if (!customElements.get('shop-by-size')) {
  customElements.define('shop-by-size', ShopBySize);
}