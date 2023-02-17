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


let elementSelect = document.querySelector('.Select_Button_Text'),
    elementOption = document.querySelectorAll('.selectDropdown .option'),
    elementInput = document.querySelector('.reason_for_inquiry'),
    elementEmail = document.querySelector('#ContactForm-email');

  elementSelect.addEventListener('click',function(item){
    const target = item.target;
    const next = item.target.parentElement.nextElementSibling;
    target.classList.toggle('active');
    next.classList.toggle('toggle');
    next.style.zIndex = index++;
  });

  elementOption.forEach(function(optionItem){
    optionItem.addEventListener('click',function(ele){
    ele.target.parentElement.classList.remove('toggle');
    console.log(ele.target.parentElement);
    elementSelect.classList.remove('active');
    const parent = ele.target.closest('.select').children[0];
    parent.setAttribute('data-type', ele.target.getAttribute('data-type'));
    parent.innerText = ele.target.innerText;
    elementInput.value = ele.target.getAttribute('data-type');
  });
})

elementEmail.addEventListener('input', function(ele){
  if(document.querySelector('.contact__button [type="submit"].disabled')){
    document.querySelector('.contact__button [type="submit"]').classList.remove('disabled');
  }
  if(ele.target.value==''){
    document.querySelector('.contact__button [type="submit"]').classList.add('disabled');
  }
});