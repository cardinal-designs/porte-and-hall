customElements.define('ajax-pagination',class ajaxPagination extends HTMLElement {
  constructor() {
    super();
    this.next = this.dataset.next;
    this.sectionId = this.dataset.sectionId;
    this.wraperElement = this.dataset.wrapperElement;
    this.button = this.querySelector('.js-button');
    this.button.addEventListener('click',element => this.doLoadMore());
  }
  doLoadMore(){
    this.button.classList.add('loading');
    fetch(`${this.next}&section_id=${this.sectionId}`)
    .then(resp => {
      return resp.text();
    })
    .then(data => {
      // let fakeElement = document.createElement('div');
      // fakeElement.innerHTML = data;
      // console.log(document.querySelector(`#${this.sectionId}`))
      // document.querySelector(`#shopify-section-${this.sectionId}`).querySelector(this.wraperElement).insertAdjacentHTML('beforeend',fakeElement.querySelector(this.wraperElement).innerHTML);
      // this.replaceWith(fakeElement.querySelector('ajax-pagination'));
    })
  }
})