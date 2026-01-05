(() => {
  const userActivityEvents = [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'keypress',
    'touchmove',
  ];
  const SCRIPTS_LOADED_FLAG = 'third-party-scripts-loaded';

  async function onUserActivity() {
    for (const event of userActivityEvents) {
      window.removeEventListener(event, onUserActivity);
    }

    const scriptTagsForLoad = Array.from(
      document.querySelectorAll('script[data-lazy-src]')
    );

    const scriptsLoad = [];

    for (const scriptTag of scriptTagsForLoad) {
      scriptTag.src = scriptTag.dataset.lazySrc;

      const scriptLoad = new Promise((resolve) => {
        scriptTag.onload = resolve;
        scriptTag.onerror = resolve;
      });

      scriptsLoad.push(scriptLoad);
    }

    window.dispatchEvent(new CustomEvent('load-head-scripts'));

    await Promise.all(scriptsLoad);

    localStorage.setItem(SCRIPTS_LOADED_FLAG, 'true');

    window.dispatchEvent(new CustomEvent('third-party-scripts-loaded'));

    document.documentElement.classList.add('third-party-scripts-loaded');
  }

  function startListenUserActivity() {
    for (const event of userActivityEvents) {
      window.addEventListener(event, onUserActivity);
    }
  }

  window.addEventListener('load', () => {
    if (localStorage.getItem(SCRIPTS_LOADED_FLAG)) {
      onUserActivity();
    } else {
      startListenUserActivity();
    }
  });
})();
