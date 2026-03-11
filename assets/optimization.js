(() => {
  const userActivityEvents = [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'keypress',
    'touchmove',
    'click',
  ];

  let scriptsLoaded = false;

  async function loadDeferredScripts() {
    if (scriptsLoaded) return;
    scriptsLoaded = true;

    // Remove all interaction listeners
    for (const event of userActivityEvents) {
      window.removeEventListener(event, onUserActivity, { passive: true });
    }

    const scriptTagsForLoad = Array.from(
      document.querySelectorAll('script[data-lazy-src]')
    );

    const scriptsLoad = [];

    for (const scriptTag of scriptTagsForLoad) {
      const lazySrc = scriptTag.dataset.lazySrc;
      if (!lazySrc) continue;

      // Create a fresh script element to ensure proper loading
      // (some browsers don't load when src is set on an existing tag)
      const newScript = document.createElement('script');

      // Copy all attributes except data-lazy-src
      for (const attr of scriptTag.attributes) {
        if (attr.name === 'data-lazy-src') continue;
        // Skip blocking attribute — deferred scripts should never block render
        if (attr.name === 'blocking') continue;
        newScript.setAttribute(attr.name, attr.value);
      }

      // Set the real src
      newScript.src = lazySrc;

      const scriptLoad = new Promise((resolve) => {
        newScript.onload = resolve;
        newScript.onerror = resolve;
      });

      scriptsLoad.push(scriptLoad);

      // Replace original element with the new one
      scriptTag.parentNode.replaceChild(newScript, scriptTag);
    }

    // Fire the Shopify head-scripts load event (used by content_for_header)
    window.dispatchEvent(new CustomEvent('load-head-scripts'));

    await Promise.all(scriptsLoad);

    window.dispatchEvent(new CustomEvent('third-party-scripts-loaded'));

    document.documentElement.classList.add('third-party-scripts-loaded');
  }

  function onUserActivity() {
    loadDeferredScripts();
  }

  function startListenUserActivity() {
    for (const event of userActivityEvents) {
      window.addEventListener(event, onUserActivity, { passive: true });
    }
  }

  // Always wait for first user interaction — even for returning visitors.
  // This ensures we never add to Total Blocking Time on initial load.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startListenUserActivity);
  } else {
    startListenUserActivity();
  }
})();
