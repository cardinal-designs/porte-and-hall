customElements.define('ajax-pagination',class ajaxPagination extends HTMLElement {
  constructor() {
    super();
    this.next = this.dataset.next;
    this.sectionId = this.dataset.sectionId;
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
      console.log(fakeElement,data)
    })
  }
})