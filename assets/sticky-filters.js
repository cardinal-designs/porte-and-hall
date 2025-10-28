// (function(){
//   /* ========= DESKTOP STICKY FILTERS ========= */
//   document.addEventListener('DOMContentLoaded', () => {
//     const secId = document.currentScript?.dataset?.sectionId || '';
//     const wrap = document.getElementById(`sticky-wrap-${secId}`);
//     const bar  = document.getElementById(`sticky-bar-${secId}`);
//     const ph   = document.getElementById(`sticky-placeholder-${secId}`);
//     if (!wrap || !bar || !ph) return;

//     function headerHeight() {
//       const h = document.querySelector('#shopify-section-header');
//       const a = document.querySelector('#shopify-section-announcement-bar, .announcement-bar');
//       const n = document.querySelector('.header__navigation');
//       let navH = 0;
//       if (n) {
//         const cs = getComputedStyle(n);
//         if (cs.display !== 'none' && /(fixed|sticky)/.test(cs.position) && window.matchMedia('(min-width:990px)').matches)
//           navH = n.offsetHeight;
//       }
//       return (h ? h.offsetHeight : 0) + (a && getComputedStyle(a).display !== 'none' ? a.offsetHeight : 0) + navH + 100;
//     }

//     function footerTop() {
//       const f = document.querySelector('#shopify-section-footer, .footer, footer');
//       if (!f) return Infinity;
//       const r = f.getBoundingClientRect();
//       return r.top + window.scrollY;
//     }

//     const endId = `sticky-end-sentinel-${secId}`;
//     let end = document.getElementById(endId);
//     if (!end) {
//       end = document.createElement('div');
//       end.id = endId;
//       end.style.height = '1px';
//       const grid = document.getElementById('ProductGridContainer') || wrap.parentElement;
//       grid.parentNode.insertBefore(end, grid.nextSibling);
//     }

//     let startY=0, stopY=0, H=0, left=0, width=0;

//     function measure() {
//       bar.style.position = 'static';
//       ph.style.height = bar.offsetHeight + 'px';
//       H = headerHeight();
//       const st = window.scrollY;
//       startY = wrap.getBoundingClientRect().top + st;
//       stopY  = Math.min(end.getBoundingClientRect().top + st, footerTop()) - 1;
//       const rect = bar.getBoundingClientRect();
//       left = rect.left + window.scrollX;
//       width = rect.width;
//     }

//     function apply() {
//       const y = window.scrollY, bh = bar.offsetHeight;
//       if (y + H <= startY) { bar.style = ''; return; }
//       if (y + H + bh >= stopY) {
//         const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
//         bar.style.position = 'absolute';
//         bar.style.top = `${(stopY - bh) - wrapTop}px`;
//         bar.style.left = '0';
//         bar.style.width = '100%';
//         return;
//       }
//       bar.style.position = 'fixed';
//       bar.style.top = `${H}px`;
//       bar.style.left = `${left}px`;
//       bar.style.width = `${width}px`;
//       bar.style.transform = 'translateZ(0)';
//     }

//     function tick() {
//       const nh = headerHeight();
//       if (Math.abs(nh - H) > 2) measure();
//       apply();
//     }

//     window.addEventListener('load', ()=>{ measure(); apply(); });
//     window.addEventListener('resize', ()=>{ measure(); apply(); });
//     window.addEventListener('scroll', tick, {passive:true});
//   });
// })();

// (function(){
//   /* ========= MOBILE FILTER DRAWER ========= */
//   const MOBILE_BP = '(max-width: 989px)';
//   const HEADER_Z = 200, DRAWER_Z = 190, BTN_Z = 120, SEC_Z = 110;

//   document.addEventListener('DOMContentLoaded', () => {
//     const sec = document.querySelector('[data-section-id]');
//     if (!sec) return;
//     const btn = sec.querySelector('.collection-filters__button.hide-desktop');
//     const drawer = sec.querySelector('collection-filters');
//     if (!btn || !drawer) return;

//     const ph1 = document.createElement('div');
//     const ph2 = document.createElement('div');
//     ph1.style.height = '0px'; ph2.style.height = '0px';
//     sec.insertAdjacentElement('afterend', ph1);
//     btn.insertAdjacentElement('afterend', ph2);

//     function headerOffset() {
//       const h = document.querySelector('#shopify-section-header, .header-wrapper, header[role="banner"]');
//       const a = document.querySelector('#shopify-section-announcement-bar, .announcement-bar');
//       const n = document.querySelector('.header__navigation');
//       let nh = 0;
//       if (n) {
//         const cs = getComputedStyle(n);
//         if (cs.display !== 'none' && /(fixed|sticky)/.test(cs.position)) nh = n.offsetHeight;
//       }
//       return (h ? h.offsetHeight : 0) + (a && getComputedStyle(a).display !== 'none' ? a.offsetHeight : 0) + nh;
//     }

//     let s1=0, s2=0, H=0;

//     function measure() {
//       [sec, btn].forEach(el => el.removeAttribute('style'));
//       ph1.style.height = sec.offsetHeight + 'px';
//       ph2.style.height = btn.offsetHeight + 'px';
//       H = headerOffset();
//       const st = window.scrollY;
//       s1 = sec.getBoundingClientRect().top + st;
//       s2 = btn.getBoundingClientRect().top + st;
//     }

//     function stick(el, start, z) {
//       const st = window.scrollY;
//       if (st + H > start) {
//         Object.assign(el.style, {
//           position: 'fixed',
//           top: `${H}px`,
//           left: 0, right: 0, width: '100%',
//           zIndex: z,
//           background: 'var(--color-background, #fff)'
//         });
//       } else el.removeAttribute('style');
//     }

//     function styleDrawer() {
//       if (!window.matchMedia(MOBILE_BP).matches) return;
//       const open = drawer.hasAttribute('open') || drawer.classList.contains('is-open');
//       const off = headerOffset();
//       if (open) {
//         Object.assign(drawer.style, {
//           position: 'fixed',
//           top: `${off}px`, left: 0, right: 0,
//           height: `calc(100vh - ${off}px)`,
//           maxHeight: `calc(100vh - ${off}px)`,
//           overflow: 'auto',
//           WebkitOverflowScrolling: 'touch',
//           zIndex: DRAWER_Z,
//         });
//         btn.style.zIndex = BTN_Z;
//       } else {
//         Object.assign(drawer.style, {
//           position: 'fixed',
//           top: `${off}px`, left: 0, right: 0,
//           height: 0, maxHeight: 0, overflow: 'hidden',
//           width: 0, opacity: 0, visibility: 'hidden',
//           pointerEvents: 'none', zIndex: DRAWER_Z
//         });
//       }
//     }

//     function tick() {
//       if (!window.matchMedia(MOBILE_BP).matches) {
//         [sec, btn].forEach(el => el.removeAttribute('style'));
//         ph1.style.height = '0px';
//         ph2.style.height = '0px';
//         return;
//       }
//       stick(sec, s1, SEC_Z);
//       stick(btn, s2, BTN_Z);
//       styleDrawer();
//     }

//     window.addEventListener('load', ()=>{ measure(); tick(); });
//     window.addEventListener('resize', ()=>{ measure(); tick(); });
//     window.addEventListener('scroll', tick, {passive:true});
//     new MutationObserver(styleDrawer).observe(drawer, {attributes:true});
//   });
// })();

// (function(){
//   /* ========= TITLE CAROUSEL PINNING ========= */
//   const TITLE_Z = 150, FOOTER_BUFFER = 1;

//   document.addEventListener('DOMContentLoaded', () => {
//     function headerOffset() {
//       const h = document.querySelector('#shopify-section-header, .header-wrapper, header[role="banner"]');
//       const a = document.querySelector('#shopify-section-announcement-bar, .announcement-bar');
//       const n = document.querySelector('.header__navigation');
//       let nh = 0;
//       if (n) {
//         const cs = getComputedStyle(n);
//         if (cs.display !== 'none' && /(fixed|sticky)/.test(cs.position)) nh = n.offsetHeight;
//       }
//       const desktop = window.matchMedia('(min-width: 990px)').matches;
//       return (h ? h.offsetHeight : 0) + (a && getComputedStyle(a).display !== 'none' ? a.offsetHeight : 0) + nh + (desktop ? 100 : 0);
//     }

//     function footerTop() {
//       const f = document.querySelector('#shopify-section-footer, .footer, .site-footer, footer');
//       if (!f) return Infinity;
//       const r = f.getBoundingClientRect();
//       return r.top + window.scrollY;
//     }

//     const titles = [...document.querySelectorAll('.shopify-section.title-carousel.with-spacing')];
//     if (!titles.length) return;

//     const models = titles.map(el => {
//       const ph = document.createElement('div');
//       ph.style.height = '0px';
//       el.insertAdjacentElement('afterend', ph);
//       return { el, ph, start: 0, stop: 0, H: 0 };
//     });

//     function measure(m) {
//       const el = m.el;
//       el.removeAttribute('style');
//       m.ph.style.height = el.offsetHeight + 'px';
//       m.H = headerOffset();
//       const st = window.scrollY;
//       const rect = el.getBoundingClientRect();
//       m.start = rect.top + st;
//       m.stop = footerTop() - FOOTER_BUFFER;
//     }

//     function apply(m) {
//       const el = m.el;
//       const y = window.scrollY, H = m.H, h = el.offsetHeight;
//       if (y + H <= m.start) { el.removeAttribute('style'); return; }
//       if (y + H + h >= m.stop) {
//         const pt = el.parentElement.getBoundingClientRect().top + window.scrollY;
//         Object.assign(el.style, {
//           position: 'absolute',
//           top: `${(m.stop - h) - pt}px`,
//           left: 0, right: 0, width: '100%',
//           zIndex: TITLE_Z,
//           background: 'var(--color-background, #fff)'
//         });
//         return;
//       }
//       Object.assign(el.style, {
//         position: 'fixed',
//         top: `${H}px`, left: 0, right: 0, width: '100%',
//         zIndex: TITLE_Z,
//         background: 'var(--color-background, #fff)'
//       });
//     }

//     function recalc() { models.forEach(measure); models.forEach(apply); }

//     window.addEventListener('load', recalc, {passive:true});
//     window.addEventListener('resize', recalc, {passive:true});
//     window.addEventListener('orientationchange', recalc, {passive:true});
//     window.addEventListener('scroll', () => {
//       const newH = headerOffset();
//       if (Math.abs(newH - models[0].H) > 2) models.forEach(measure);
//       models.forEach(apply);
//     }, {passive:true});
//     recalc();
//   });
// })();
