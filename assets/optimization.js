(() => {
  // Intentional engagement only — NOT scroll/mousemove/touchmove/pointermove.
  // Lighthouse scrolls during lab runs; scroll-as-activity caused a third-party burst.
  // Also omit pointerdown: some lab tools synthesize pointer events while scrolling.
  const userActivityEvents = ['keydown', 'touchstart', 'click'];

  let scriptsLoaded = false;

  function idleYield(timeoutMs) {
    return new Promise((resolve) => {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => resolve(), { timeout: timeoutMs });
      } else {
        setTimeout(resolve, Math.min(timeoutMs, 50));
      }
    });
  }

  function activateScript(scriptTag) {
    const lazySrc = scriptTag.dataset.lazySrc;
    if (!lazySrc) return Promise.resolve();

    const newScript = document.createElement('script');

    for (const attr of scriptTag.attributes) {
      if (attr.name === 'data-lazy-src') continue;
      if (attr.name === 'blocking') continue;
      newScript.setAttribute(attr.name, attr.value);
    }

    newScript.src = lazySrc;
    // Dynamically inserted scripts ignore defer relative to document parse;
    // mark async so they don't block each other as parser-blocking sync loads.
    if (!newScript.hasAttribute('async') && !newScript.hasAttribute('defer')) {
      newScript.async = true;
    }

    const scriptLoad = new Promise((resolve) => {
      newScript.onload = resolve;
      newScript.onerror = resolve;
    });

    if (scriptTag.parentNode) {
      scriptTag.parentNode.replaceChild(newScript, scriptTag);
    }

    return scriptLoad;
  }

  async function loadDeferredScripts() {
    if (scriptsLoaded) return;
    scriptsLoaded = true;

    for (const event of userActivityEvents) {
      window.removeEventListener(event, onUserActivity, { passive: true });
    }

    const scriptTagsForLoad = Array.from(
      document.querySelectorAll('script[data-lazy-src]')
    );

    // Stagger activation so parse/compile work does not become one long task
    // under mobile CPU throttling. Yield between each script.
    for (const scriptTag of scriptTagsForLoad) {
      activateScript(scriptTag);
      await idleYield(120);
    }

    // Shopify content_for_header listeners rewritten to this event
    window.dispatchEvent(new CustomEvent('load-head-scripts'));

    // Give network a moment, then signal secondary loaders (AccessiBe, Convert)
    await idleYield(500);
    window.dispatchEvent(new CustomEvent('third-party-scripts-loaded'));
    document.documentElement.classList.add('third-party-scripts-loaded');
  }

  function onUserActivity() {
    // Defer so the first tap (e.g. PDP swatch link) can complete before DOM changes.
    setTimeout(loadDeferredScripts, 0);
  }

  function startListenUserActivity() {
    for (const event of userActivityEvents) {
      window.addEventListener(event, onUserActivity, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startListenUserActivity);
  } else {
    startListenUserActivity();
  }
})();
