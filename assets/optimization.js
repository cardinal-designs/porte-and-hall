(() => {
    const userActivityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "keypress",
      "touchmove",
    ];
    async function onUserActivity() {
      const scriptTagsForLoad = [...document.querySelectorAll("script[data-lazy-src]")];
      const linkTagsForLoad = document.querySelectorAll("link[rel=stylesheet][data-lazy-href]");
      const scriptsLoad = [];
      for (const scriptTag of scriptTagsForLoad) {
        scriptTag.src = scriptTag.dataset.lazySrc;
        const scriptLoad =  new Promise((resolve) => {
          scriptTag.onload = resolve;
          scriptTag.onerror = resolve;
        })
        scriptsLoad.push(scriptLoad);
      }
      for (const linkTag of linkTagsForLoad) {
        linkTag.href = linkTag.dataset.lazyHref;
      }
      for (const event of userActivityEvents) {
        window.removeEventListener(event, onUserActivity);
      }
      
      window.dispatchEvent(new CustomEvent("load-head-scripts"));
      await Promise.all(scriptsLoad);
      window.dispatchEvent(new CustomEvent("lazy-scripts-loaded"));
    }
    function startListenUserActivity() {
      for (const event of userActivityEvents) {
        window.addEventListener(event, onUserActivity);
      }
    }
    window.addEventListener("load", startListenUserActivity);
  })();