class TestimonialsSlider extends HTMLElement {
  constructor() {
    super();
    this.currentIndex = 0;
    this.cleanupFns = [];

    this.onKeydown = this.onKeydown.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  connectedCallback() {
    this.galleryViewport = this.querySelector('[data-slider-viewport="gallery"]');
    this.testimonialViewport = this.querySelector('[data-slider-viewport="testimonial"]');
    this.galleryTrack = this.querySelector('[data-slider-track="gallery"]');
    this.testimonialTrack = this.querySelector('[data-slider-track="testimonial"]');
    this.gallerySlides = Array.from(this.querySelectorAll('[data-gallery-slide]'));
    this.galleryTriggers = Array.from(this.querySelectorAll('[data-gallery-trigger]'));
    this.testimonialSlides = Array.from(this.querySelectorAll('[data-testimonial-slide]'));
    this.paginationDots = Array.from(this.querySelectorAll('[data-pagination-dot]'));
    this.arrowButtons = Array.from(this.querySelectorAll('[data-action]'));

    this.galleryCount = Number(this.dataset.galleryCount || this.galleryTrack?.children.length || 0);
    this.testimonialCount = Number(this.dataset.testimonialCount || this.testimonialTrack?.children.length || 0);
    this.totalCount = Math.min(this.galleryCount, this.testimonialCount);

    if (this.totalCount === 0) return;

    this.showPagination = this.dataset.showPagination === 'true';

    this.bindArrows();
    this.bindPagination();
    this.bindSwipe();
    this.bindGalleryTriggers();

    this.addEventListener('keydown', this.onKeydown);
    window.addEventListener('resize', this.onResize);

    this.cleanupFns.push(() => this.removeEventListener('keydown', this.onKeydown));
    this.cleanupFns.push(() => window.removeEventListener('resize', this.onResize));

    this.render();
  }

  disconnectedCallback() {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }

  bindArrows() {
    this.arrowButtons.forEach((button) => {
      const handler = () => {
        const direction = button.dataset.action === 'prev' ? -1 : 1;
        const loopTestimonialsMobile = button.dataset.slider === 'testimonial' && this.isMobileViewport();
        this.goTo(this.currentIndex + direction, { loop: loopTestimonialsMobile });
      };

      button.addEventListener('click', handler);
      this.cleanupFns.push(() => button.removeEventListener('click', handler));
    });
  }

  bindPagination() {
    if (!this.showPagination || !this.paginationDots.length) return;

    this.paginationDots.forEach((dot) => {
      const handler = () => {
        const dotIndex = Number(dot.dataset.paginationDot || 0);
        this.goTo(dotIndex);
      };

      dot.addEventListener('click', handler);
      this.cleanupFns.push(() => dot.removeEventListener('click', handler));
    });
  }

  bindSwipe() {
    const addSwipeHandlers = (viewport) => {
      if (!viewport) return;

      let touchStartX = 0;
      let touchEndX = 0;

      const onTouchStart = (event) => {
        touchStartX = event.changedTouches[0].clientX;
      };

      const onTouchEnd = (event) => {
        touchEndX = event.changedTouches[0].clientX;
        const delta = touchEndX - touchStartX;
        const threshold = 30;

        if (Math.abs(delta) < threshold) return;
        const loopTestimonialsMobile = viewport === this.testimonialViewport && this.isMobileViewport();

        if (delta > 0) {
          this.goTo(this.currentIndex - 1, { loop: loopTestimonialsMobile });
        } else {
          this.goTo(this.currentIndex + 1, { loop: loopTestimonialsMobile });
        }
      };

      viewport.addEventListener('touchstart', onTouchStart, { passive: true });
      viewport.addEventListener('touchend', onTouchEnd, { passive: true });

      this.cleanupFns.push(() => viewport.removeEventListener('touchstart', onTouchStart));
      this.cleanupFns.push(() => viewport.removeEventListener('touchend', onTouchEnd));
    };

    addSwipeHandlers(this.galleryViewport);
    addSwipeHandlers(this.testimonialViewport);
  }

  bindGalleryTriggers() {
    this.galleryTriggers.forEach((trigger) => {
      const activate = () => {
        const galleryIndex = Number(trigger.dataset.galleryIndex || -1);

        if (galleryIndex < 0 || galleryIndex >= this.totalCount) return;
        this.goTo(galleryIndex);
      };

      const onClick = () => activate();

      const onKey = (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activate();
      };

      trigger.addEventListener('click', onClick);
      trigger.addEventListener('keydown', onKey);

      this.cleanupFns.push(() => trigger.removeEventListener('click', onClick));
      this.cleanupFns.push(() => trigger.removeEventListener('keydown', onKey));
    });
  }

  onKeydown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.goTo(this.currentIndex - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.goTo(this.currentIndex + 1);
    }
  }

  onResize() {
    this.render();
  }

  goTo(index, options = {}) {
    if (this.totalCount <= 0) return;

    if (options.loop) {
      this.currentIndex = this.normalizeIndex(index, this.totalCount);
    } else {
      this.currentIndex = this.clampIndex(index, this.totalCount);
    }

    this.render();
  }

  isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  normalizeIndex(index, count) {
    if (count <= 0) return 0;
    return ((index % count) + count) % count;
  }

  clampIndex(index, count) {
    if (count <= 0) return 0;
    return Math.min(Math.max(index, 0), count - 1);
  }

  render() {
    this.renderGallery();
    this.renderTestimonials();
    this.renderActiveStates();
    this.renderPagination();
  }

  renderGallery() {
    if (!this.galleryTrack || this.galleryCount === 0) return;

    if (window.matchMedia('(max-width: 767px)').matches) {
      const offset = this.getBalancedGalleryOffset();
      this.galleryTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
      return;
    }

    const galleryIndex = this.currentIndex;
    const firstSlide = this.galleryTrack.children[0];

    if (!firstSlide) return;

    const slideWidth = firstSlide.getBoundingClientRect().width;
    const gapValue = window.getComputedStyle(this.galleryTrack).gap || '0px';
    const gap = Number.parseFloat(gapValue) || 0;
    const viewportWidth = this.galleryViewport?.getBoundingClientRect().width || 0;

    const visibleSlides = Math.max(1, Math.floor((viewportWidth + gap) / (slideWidth + gap)));
    const maxStart = Math.max(0, this.galleryCount - visibleSlides);
    const startIndex = Math.min(galleryIndex, maxStart);

    const offset = startIndex * (slideWidth + gap);
    this.galleryTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  getBalancedGalleryOffset() {
    if (!this.galleryTrack || !this.galleryViewport || this.galleryCount === 0) return 0;

    const firstSlide = this.galleryTrack.children[0];

    if (!firstSlide) return 0;

    const slideWidth = firstSlide.getBoundingClientRect().width;
    const gapValue = window.getComputedStyle(this.galleryTrack).gap || '0px';
    const gap = Number.parseFloat(gapValue) || 0;
    const viewportWidth = this.galleryViewport.getBoundingClientRect().width;
    const step = slideWidth + gap;
    const trackWidth = this.galleryCount * step - gap;
    const maxOffset = Math.max(0, trackWidth - viewportWidth);

    const baseVisibleWidth = 2 * slideWidth + gap;
    const sidePeek = Math.max((viewportWidth - baseVisibleWidth) / 2, 0);
    const centeredPairOffset = this.currentIndex * step - sidePeek;

    return Math.min(Math.max(centeredPairOffset, 0), maxOffset);
  }

  renderTestimonials() {
    if (!this.testimonialTrack || this.testimonialCount === 0) return;

    if (window.matchMedia('(max-width: 767px)').matches) {
      const offset = this.getCenteredOffset(this.testimonialTrack, this.testimonialViewport, this.currentIndex, this.testimonialCount);
      this.testimonialTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
      return;
    }

    this.testimonialTrack.style.transform = `translate3d(-${this.currentIndex * 100}%, 0, 0)`;
  }

  getCenteredOffset(track, viewport, index, count) {
    if (!track || !viewport || count <= 0) return 0;

    const firstSlide = track.children[0];

    if (!firstSlide) return 0;

    const slideWidth = firstSlide.getBoundingClientRect().width;
    const gapValue = window.getComputedStyle(track).gap || '0px';
    const gap = Number.parseFloat(gapValue) || 0;
    const viewportWidth = viewport.getBoundingClientRect().width;
    const step = slideWidth + gap;
    const trackWidth = count * step - gap;
    const maxOffset = Math.max(0, trackWidth - viewportWidth);
    const centerOffset = index * step - (viewportWidth - slideWidth) / 2;

    return Math.min(Math.max(centerOffset, 0), maxOffset);
  }

  renderActiveStates() {
    this.gallerySlides.forEach((slide, index) => {
      const isActive = index === this.currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-current', String(isActive));
    });

    this.galleryTriggers.forEach((trigger, index) => {
      const isActive = index === this.currentIndex;
      trigger.classList.toggle('is-active', isActive);
      trigger.setAttribute('aria-pressed', String(isActive));
    });

    this.testimonialSlides.forEach((slide, index) => {
      const isActive = index === this.currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
  }

  renderPagination() {
    if (!this.showPagination || !this.paginationDots.length) return;

    this.paginationDots.forEach((dot, index) => {
      const isActive = index === this.currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  }
}

if (!window.customElements.get('testimonials-slider')) {
  window.customElements.define('testimonials-slider', TestimonialsSlider);
}
