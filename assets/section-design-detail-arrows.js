const arrows = document.querySelectorAll(".details__arrow")

arrows.forEach((arrow) => {
  const tooltip = arrow.nextElementSibling
  function updatePosition() {
    if(arrow.classList.contains('details__arrow-right')){
      window.FloatingUIDOM.computePosition(arrow, tooltip, {
        middleware: [window.FloatingUIDOM.autoPlacement({allowedPlacements: ['left']}), window.FloatingUIDOM.offset({ alignmentAxis: -20})]
      }).then(({x, y}) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    } else if( arrow.classList.contains('details__arrow-downward-right')){
      window.FloatingUIDOM.computePosition(arrow, tooltip, {
        middleware: [window.FloatingUIDOM.autoPlacement({allowedPlacements: ['top']}), window.FloatingUIDOM.offset({ alignmentAxis: -50})]
      }).then(({x, y}) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    } else if( arrow.classList.contains('details__arrow-downward-left')){
      window.FloatingUIDOM.computePosition(arrow, tooltip, {
        middleware: [window.FloatingUIDOM.autoPlacement({allowedPlacements: ['top']}), window.FloatingUIDOM.offset({ alignmentAxis: -50})]
      }).then(({x, y}) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    } else {
      window.FloatingUIDOM.computePosition(arrow, tooltip, {
        middleware: [window.FloatingUIDOM.autoPlacement({ allowedPlacements: ['right']}), window.FloatingUIDOM.offset({ alignmentAxis: -20})]
      }).then(({x, y}) => {
      Object.assign(tooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
    }
  }

  updatePosition()

  window.FloatingUIDOM.autoUpdate(
    arrow,
    tooltip,
    updatePosition,
    {
      ancestorScroll: false,
      ancestoryResize: true,
      elementResize: false,
      animationFrame: false
    }
  )
})