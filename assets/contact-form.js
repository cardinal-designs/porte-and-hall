let interval = null

let domWorks = () => {
   let d = document.querySelector('#ContactForm-email-error')
   if(d){
    console.log('dom manipulation')
    document.querySelector('.contact__button button').classList.add('disabled')
    clearInterval(interval) // Change it via reference
   }
}

interval = setInterval(domWorks, 100)

let index = 1;
const on = (listener, query, fn) => {
  document.querySelectorAll(query).forEach(item => {
      item.addEventListener(listener, el => {
      fn(el);
    })
  })
}

on('click', '.selectBtn', item => {
  const target = item.target;
  const next = item.target.nextElementSibling;
  target.classList.toggle('active');
  next.classList.toggle('toggle');
  next.style.zIndex = index++;
});

on('click', '.option', item => {
  item.target.parentElement.classList.remove('toggle');
  const parent = item.target.closest('.select').children[0];
  parent.setAttribute('data-type', item.target.getAttribute('data-type'));
  parent.innerText = item.target.innerText;
})