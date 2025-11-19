class collectionFilters extends HTMLElement {
  constructor() {
    super();

    this.grid = document.querySelector('.product-grid');
    this.form = document.querySelector('.filters-form');
    this.filters = document.querySelector('.collection-filters__filters');

    this.dropdownButtons = document.querySelectorAll('.collection-filters__dropdown-button');
    this.filterButtons = document.querySelectorAll('.collection-filters__filter-button');
    this.activeTagsContainer = this.querySelector('#active-filters');
    this.clearFilter = this.querySelector('#collection-filters__clear');

    this.openFilterButtons = document.querySelectorAll('.js-open-filters');
    this.closeFilterButtons = document.querySelectorAll('.js-close-filters');
    // this.applyFilters = document.querySelector('.js-apply-filters');
    this.clearFilterButtons = document.querySelectorAll('.js-clear-all-filters')

    this.setListeners();
  }

  setListeners() {
    const onHistoryChange = (event) => {
      this.searchParams = event.state ? event.state.searchParams : "";
      if (searchParams === collectionFilters.searchParamsPrev) return;
      this.reloadSections();
      window.addEventListener('popstate', onHistoryChange);
    }

    // Handle Dropdown Click
    this.dropdownButtons.forEach(item => {
      item.addEventListener('click', this.handleDropdownClick);
    });

    // Handle Form Change
    this.form.addEventListener('change', event => {
      if (event.target.classList.contains('sort-by')) {
        this.handleSortClick(event.target);
      } else {
        this.handleFilterClick(event.target);
      }
    });

    // Handle Remove Filter
    this.activeTagsContainer.addEventListener('click', event => {
      const button = event.target.closest('.remove-filter');
      if (button) {
        event.preventDefault();
        const filter = button.dataset.filter;
        const initial = button.dataset.url;
        const newUrl = window.location.protocol + '//' + window.location.host + initial;
  
        if (filter) this.removeSelectedFilter(filter);
        this.reloadSections(newUrl);
      }
    });

    // Clear All Filters
    this.addEventListener('click', function(event) {
      const button = event.target.closest('.js-clear-all-filters');
      if (button) {
        event.preventDefault();
        this.clearAllFilters(event);
      }
    });

    // Open
    this.openFilterButtons.forEach(filter => {
      filter.addEventListener('click', event => {
        this.open(event);
      });
    });

    // Close
    this.closeFilterButtons.forEach(filter => {
      filter.addEventListener('click', event => {
        this.close(event);
      });
    });

    // this.applyFilters.addEventListener("click", function(e){
    //   e.preventDefault();
    //   this.reloadSections();
    //   this.close();
    // }.bind(this))
  }

  open(event) {
    event.preventDefault();
    const overlay = this.getOverlayElement();

    document.querySelector('.collection-filters__slideout').classList.add('active');
    document.body.classList.add('scroll-lock');
    overlay.classList.add('is-visible');
    overlay.addEventListener('click', event => {
      document.querySelector('.collection-filters__slideout').classList.remove('active');
      overlay.classList.remove('is-visible');
      document.body.classList.remove('scroll-lock');
    });
  }

  close(event) {
    if(event){
      event.preventDefault();
    }

    const overlay = this.getOverlayElement();
  
    document.querySelector('.collection-filters__slideout').classList.remove('active');
    document.body.classList.remove('scroll-lock');
    overlay?.classList.remove('is-visible');
  
    // this.closeAllDropdowns();
  }

  apply() {
    this.reloadSections();
  }

  handleDropdownClick(event) {
    event.preventDefault();

    if (this.classList.contains('active')) {
      this.classList.remove('active');
    } else {
      this.classList.add('active');
    }
  }

  handleFilterClick(target) {
    if(target.value == ""){
      target.closest(".collection-filters__dropdown-container").querySelectorAll('.collection-filters__filter-button').forEach(item => {
        item.removeAttribute('checked');
        item.checked = false
      });
      target.checked = true;
      target.removeAttribute('checked');
    } else {
      target.closest(".collection-filters__dropdown-container").querySelector('.collection-filters__filter-button[remove-filter]').removeAttribute('checked');
      target.closest(".collection-filters__dropdown-container").querySelector('.collection-filters__filter-button[remove-filter]').checked = false

    }
      this.reloadSections();
  
  }

  removeSelectedFilter(filter) {
    document.querySelector(`.collection-filters__filter-button[data-filter*="${filter}"]:checked`).checked = false;
  }

  handleSortClick(target) {
    const sort = target.value;
    const sortText = target.dataset.name;
    const sortTextDestination = this.querySelector('.collection-filters__dropdown-active-sort');

    this.sortBy = sort;
    sortTextDestination.innerHTML = sortText;
    
    this.closeAllDropdowns();
    this.reloadSections();
  }

  closeAllDropdowns() {
    this.dropdownButtons.forEach(button => {
      if (button.classList.contains('active')) {
        button.classList.remove('active');
      }
    });
  }

  clearAllFilters(event) {
    if(event){
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    document.querySelectorAll('.collection-filters__filters .collection-filters__filter-button').forEach(item => {
      if(item.checked){
        item.checked = false
        item.removeAttribute('checked');
      }
      if(item.getAttribute('remove-filter')) {
        item.checked = true
        item.setAttribute('checked', "true");
      }
    });

    // Clear price range
    // this.querySelector('.price-range__input-field--min')?.value =  '';
    // this.querySelector('.price-range__input-field--max')?.value =  '';

    // this.closeAllDropdowns();
    this.reloadSections();

    this.close();
  }

  reloadSections(newUrl) {
    let url = '';

    let formData = new FormData(this.form);

    console.log("before", ...formData)

    let emptyValues = []

    for (let pair of formData.entries()) {
      if(pair[1] == "" || pair[1] == " "){
        emptyValues.push(pair[0])
      }
    }

    emptyValues.forEach(val => {
      formData.delete(val)
    })

    console.log("after", ...formData)

    // const searchParams = new URLSearchParams(formData).toString();
    
    // url = location.pathname + '?' + searchParams;
    // if (history.replaceState) {
    //   window.history.pushState({ path: url }, '', url);
    // }

    // Build search params from form
    const searchParams = new URLSearchParams(formData);

    // Preserve existing "view" parameter if present
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.has('view')) {
      searchParams.set('view', currentParams.get('view'));
    }

    url = location.pathname + '?' + searchParams.toString();


    // Fetch and replace sections
    this.enableLoading();
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        const htmlContent = new DOMParser().parseFromString(html, 'text/html');

        // Replace sections
        this.getSectionsToRender().forEach((section) => {
          document.getElementById(section.id).innerHTML = htmlContent.getElementById(section.id) ? htmlContent.getElementById(section.id).innerHTML : ""
        });

        document.querySelector("#product-grid li:first-of-type").scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

        // Replace dropdown filters
        const dropdownContents = this.querySelectorAll('.collection-filters__dropdown-container');
        dropdownContents.forEach(content => {
          const newContent = htmlContent.getElementById(content.id).innerHTML;
          content.innerHTML = newContent;
        });
        this.disableLoading();
      })
      .catch(() => {
        this.disableLoading();
      })
      .finally(() => {
        document.querySelectorAll('.product-grid__item.fade-in').forEach(item => item.style.opacity = 1);
      });
  }

  getSectionsToRender() {
    return [
      { id: 'product-grid' },
      { id: 'active-filters' },
      // { id: 'apply-product-count' },
      // { id: 'collection-filters__clear' },
      { id: 'load-more-wrapper' }
    ]
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading() {
    this.closest('.collection-grid__inner').classList.add("loading")
  }

  disableLoading() {
    this.closest('.collection-grid__inner').classList.remove("loading")
  }

  getOverlayElement() {
    if (window.innerWidth < 951) {
      return document.querySelector('.page-overlay');
    } else {
      return document.querySelector('.page-overlay-under-menu');
    }
  }
}

collectionFilters.searchParamsInitial = window.location.search.slice(1);
collectionFilters.searchParamsPrev = window.location.search.slice(1);
customElements.define('collection-filters', collectionFilters);

class PriceRange extends HTMLElement {
  connectedCallback() {
    this.rangeLowerBound = this.querySelector('.price-range__range-group input:first-child');
    this.rangeHigherBound = this.querySelector('.price-range__range-group input:last-child');
    this.textInputLowerBound = this.querySelector('.price-range__input:first-child input');
    this.textInputHigherBound = this.querySelector('.price-range__input:last-child input');
    this.textInputLowerBound.addEventListener('focus', () => this.textInputLowerBound.select());
    this.textInputHigherBound.addEventListener('focus', () => this.textInputHigherBound.select());
    this.textInputLowerBound.addEventListener('change', (event) => {
      event.target.value = Math.max(Math.min(parseInt(event.target.value), parseInt(this.textInputHigherBound.value || event.target.max) - 1), event.target.min);
      this.rangeLowerBound.value = event.target.value;
      this.rangeLowerBound.parentElement.style.setProperty('--range-min', `${parseInt(this.rangeLowerBound.value) / parseInt(this.rangeLowerBound.max) * 100}%`);
    });
    this.textInputHigherBound.addEventListener('change', (event) => {
      event.target.value = Math.min(Math.max(parseInt(event.target.value), parseInt(this.textInputLowerBound.value || event.target.min) + 1), event.target.max);
      this.rangeHigherBound.value = event.target.value;
      this.rangeHigherBound.parentElement.style.setProperty('--range-max', `${parseInt(this.rangeHigherBound.value) / parseInt(this.rangeHigherBound.max) * 100}%`);
    });
    this.rangeLowerBound.addEventListener('change', (event) => {
      this.textInputLowerBound.value = event.target.value;
      this.textInputLowerBound.dispatchEvent(new Event('change', { bubbles: true }));
    });
    this.rangeHigherBound.addEventListener('change', (event) => {
      this.textInputHigherBound.value = event.target.value;
      this.textInputHigherBound.dispatchEvent(new Event('change', { bubbles: true }));
    });
    this.rangeLowerBound.addEventListener('input', (event) => {
      event.target.value = Math.min(parseInt(event.target.value), parseInt(this.textInputHigherBound.value || event.target.max) - 1);
      event.target.parentElement.style.setProperty('--range-min', `${parseInt(event.target.value) / parseInt(event.target.max) * 100}%`);
      this.textInputLowerBound.value = event.target.value;
    });
    this.rangeHigherBound.addEventListener('input', (event) => {
      event.target.value = Math.max(parseInt(event.target.value), parseInt(this.textInputLowerBound.value || event.target.min) + 1);
      event.target.parentElement.style.setProperty('--range-max', `${parseInt(event.target.value) / parseInt(event.target.max) * 100}%`);
      this.textInputHigherBound.value = event.target.value;
    });
  }
};

window.customElements.define('price-range', PriceRange);