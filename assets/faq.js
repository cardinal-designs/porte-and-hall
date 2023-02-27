const accSingleTriggers = document.querySelectorAll('.faq-col-inner');

accSingleTriggers.forEach(trigger => trigger.addEventListener('click', toggleAccordion));

function toggleAccordion() {
  const items = document.querySelectorAll('.faq-col');
  const thisItem = this.parentNode;
  console.log(thisItem);
  
  items.forEach(item => {
    if (thisItem == item) {
      thisItem.classList.toggle('is-open');
      return;
    }
    item.classList.remove('is-open');
  });
}