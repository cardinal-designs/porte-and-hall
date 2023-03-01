customElements.define('ajax-pagination',class ajaxPagination extends HTMLElement {
  constructor() {
    super();
    this.next = this.dataset.next;
    this.sectionId = this.dataset.sectionId;
    this.wraperElement = this.dataset.wrapperElement;
    this.addEventListener('click',element => this.doLoadMore());
  }
  doLoadMore(){
    fetch(`${this.next}&section_id=${this.sectionId}`)
    .then(resp => {
      return resp.text();
    })
    .then(data => {
      let fakeElement = document.createElement('div');
      fakeElement.innerHTML = data;
      document.querySelector(`#${this.sectionId}`).querySelector(this.wraperElement).insertAdjacentHTML('beforeend',fakeElement.querySelector(this.wraperElement).innerHTML);
      this.replaceWith(fakeElement.querySelector('ajax-pagination'));
    })
  }
})