// Keep the 256×240 stage fitted to phone / iPad / desktop viewports
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  var ASPECT = 256 / 240;

  function viewportSize() {
    var vv = window.visualViewport;
    var w = (vv && vv.width) || window.innerWidth || document.documentElement.clientWidth;
    var h = (vv && vv.height) || window.innerHeight || document.documentElement.clientHeight;
    return { w: w, h: h };
  }

  function isCompactPlay() {
    if (document.body.classList.contains('touch-ui')) return true;
    var vp = viewportSize();
    var shortSide = Math.min(vp.w, vp.h);
    // Phones + iPads: full-bleed play surface
    if (shortSide <= 920) return true;
    if (vp.h <= 720) return true;
    return false;
  }

  Mario.fitStage = function() {
    var canvas = document.querySelector('#game-frame canvas') || document.querySelector('canvas');
    var frame = document.getElementById('game-frame');
    if (!canvas || !frame) return;

    var compact = isCompactPlay();
    document.body.classList.toggle('play-compact', compact);

    var vp = viewportSize();
    var padX = compact ? 0 : 48;
    var padY = compact ? 0 : 130;
    if (!compact && vp.h < 800) padY = 100;

    var maxW = Math.max(160, vp.w - padX);
    var maxH = Math.max(140, vp.h - padY);

    var width = maxW;
    var height = width / ASPECT;
    if (height > maxH) {
      height = maxH;
      width = height * ASPECT;
    }

    width = Math.floor(width);
    height = Math.floor(width / ASPECT);

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    frame.style.width = width + 'px';
    frame.style.height = height + 'px';
  };

  Mario.startResponsiveStage = function() {
    var fit = function() { Mario.fitStage(); };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', function() {
      setTimeout(fit, 60);
      setTimeout(fit, 320);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fit);
      window.visualViewport.addEventListener('scroll', fit);
    }
  };
})();
