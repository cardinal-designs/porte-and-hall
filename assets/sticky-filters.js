(function(){
  var secId = '{{ section.id }}';
  var wrap = document.getElementById(`sticky-wrap-${secId}`);
  var bar  = document.getElementById(`sticky-bar-${secId}`);
  var ph   = document.getElementById(`sticky-placeholder-${secId}`);
  if (!wrap || !bar || !ph) return;

  function headerHeight() {
    var h = document.querySelector('#shopify-section-header');
    var a = document.querySelector('#shopify-section-announcement-bar, .announcement-bar');
    var n = document.querySelector('.header__navigation');
    var navH = 0;
    if (n) {
      var cs = getComputedStyle(n);
      if (cs.display !== 'none' && /(fixed|sticky)/.test(cs.position) && window.matchMedia('(min-width:990px)').matches)
        navH = n.offsetHeight;
    }
    return (h ? h.offsetHeight : 0) + (a && getComputedStyle(a).display !== 'none' ? a.offsetHeight : 0) + navH + 100;
  }

  var end = document.getElementById(`sticky-end-sentinel-${secId}`);
  if (!end) {
    end = document.createElement('div');
    end.id = `sticky-end-sentinel-${secId}`;
    end.style.height = '1px';
    (document.getElementById('ProductGridContainer') || wrap.parentElement)
      .insertAdjacentElement('afterend', end);
  }

  function footerTop() {
    var f = document.querySelector('#shopify-section-footer, .footer, footer');
    if (!f) return Infinity;
    var r = f.getBoundingClientRect();
    return r.top + window.scrollY;
  }

  var startY = 0, stopY = 0, H = 0, left = 0, width = 0;
  function measure() {
    bar.style.position = 'static';
    ph.style.height = bar.offsetHeight + 'px';
    H = headerHeight();
    var st = window.scrollY;
    startY = wrap.getBoundingClientRect().top + st;
    stopY = Math.min(end.getBoundingClientRect().top + st, footerTop()) - 1;
    var rect = bar.getBoundingClientRect();
    left = rect.left + window.scrollX;
    width = rect.width;
  }

  function apply() {
    var y = window.scrollY, bh = bar.offsetHeight;
    if (y + H <= startY) {
      bar.style = ''; return;
    }
    if (y + H + bh >= stopY) {
      var wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
      bar.style.position = 'absolute';
      bar.style.top = `${(stopY - bh) - wrapTop}px`;
      bar.style.left = '0'; bar.style.width = '100%';
      return;
    }
    bar.style.position = 'fixed';
    bar.style.top = `${H}px`;
    bar.style.left = `${left}px`;
    bar.style.width = `${width}px`;
    bar.style.transform = 'translateZ(0)';
  }

  function tick() {
    var nh = headerHeight();
    if (Math.abs(nh - H) > 2) measure();
    apply();
  }

  window.addEventListener('load', () => { measure(); apply(); });
  window.addEventListener('resize', () => { measure(); apply(); });
  window.addEventListener('scroll', tick, { passive: true });
})();