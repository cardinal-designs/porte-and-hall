class ShopBySize extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this.handleTabClick = this.handleTabClick.bind(this);
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.initTabs();

    if (window.initOnVisible) {
      window.initOnVisible(this, () => this.initSwipers());
    } else {
      this.initSwipers();
    }
  }

  initTabs() {
    this.addEventListener('click', this.handleTabClick);
  }

  handleTabClick(event) {
    const tab = event.target;
    if (!tab.classList.contains('shop-by-size__tab')) return;

    event.preventDefault();

    const tabs = Array.from(this.querySelectorAll('.shop-by-size__tab'));
    const productGroups = this.querySelectorAll('.shop-by-size__products');
    if (!tabs.length || !productGroups.length) return;

    const targetId = tab.dataset.id;
    productGroups.forEach(group => {
      group.classList.toggle(
        'shop-by-size__products--active',
        group.dataset.id === targetId
      );
    });

    tabs.forEach(t => t.classList.remove('shop-by-size__tab--active'));
    tab.classList.add('shop-by-size__tab--active');

    this.scrollNavigationToLastTab(tab);
  }

  scrollNavigationToLastTab(activeTab) {
  const isMobile = window.matchMedia('(max-width: 989px)').matches;
  if (!isMobile || !activeTab) return;

  const scrollContainer = this.querySelector('.shop-by-size__navigation ul');
  if (!scrollContainer) return;

  const tabs = Array.from(scrollContainer.querySelectorAll('.shop-by-size__tab'));
  if (!tabs.length) return;

  const activeIndex = tabs.indexOf(activeTab);
  const lastTab = tabs[tabs.length - 1];

  if (activeIndex !== 2) return; 

  requestAnimationFrame(() => {
    const edgeOffset = 8;
    const lastTabRight = lastTab.offsetLeft + lastTab.offsetWidth;
    const visibleRight = scrollContainer.scrollLeft + scrollContainer.clientWidth;

    if (lastTabRight > visibleRight - edgeOffset) {
      scrollContainer.scrollTo({
        left: lastTabRight - scrollContainer.clientWidth + edgeOffset,
        behavior: 'smooth'
      });
    }
  });
}

  initSwipers() {
    if (typeof Swiper === 'undefined') return;

    const swiperContainers = this.querySelectorAll('.js-shop-by-size-swiper');
    swiperContainers.forEach(container => {
      const nextBtn = container.querySelector('.swiper-button-next');
      const prevBtn = container.querySelector('.swiper-button-prev');

      new Swiper(container, {
        loop: false,
        slidesPerView: 'auto',
        spaceBetween: 12,
        centeredSlides: true,
        navigation: {
          nextEl: nextBtn,
          prevEl: prevBtn,
        },
        pagination: {
          el: container.querySelector(".swiper-pagination"),
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