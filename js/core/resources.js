// Resource loader with resilient image/audio preloading, loading progress,
// and one-time scaled-image caches (avoids per-frame bilinear downscales).
(function() {
  var resourceCache = {};
  var scaledCache = {};
  var regionCache = {};
  var readyCallbacks = [];
  var progressCallbacks = [];
  var total = 0;
  var completed = 0;
  var readyFired = false;
  var audioPattern = /\.(?:ogg|mp3|wav|m4a)(?:\?|$)/i;

  function reportProgress() {
    var percent = total ? Math.round((completed / total) * 100) : 100;
    progressCallbacks.forEach(function(fn) {
      try { fn(percent, completed, total); } catch (e) {}
    });
  }

  function finish(url, resource) {
    if (resourceCache[url] !== false) return;
    resourceCache[url] = resource || null;
    completed += 1;
    reportProgress();
    if (isReady() && !readyFired) {
      readyFired = true;
      readyCallbacks.forEach(function(fn) { fn(); });
    }
  }

  function loadImage(url) {
    var image = new Image();
    image.onload = function() { finish(url, image); };
    image.onerror = function() { finish(url, null); };
    image.src = url;
  }

  function loadAudio(url) {
    var audio = new Audio();
    var timer = setTimeout(function() { finish(url, audio); }, 2500);
    function done() {
      clearTimeout(timer);
      finish(url, audio);
    }
    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', done, { once: true });
    audio.addEventListener('loadeddata', done, { once: true });
    audio.addEventListener('error', done, { once: true });
    audio.src = url;
    audio.load();
  }

  function loadOne(url) {
    if (!url || Object.prototype.hasOwnProperty.call(resourceCache, url)) {
      return resourceCache[url];
    }
    resourceCache[url] = false;
    total += 1;
    reportProgress();
    if (audioPattern.test(url)) loadAudio(url);
    else loadImage(url);
    return resourceCache[url];
  }

  function load(urlOrArr) {
    var urls = urlOrArr instanceof Array ? urlOrArr : [urlOrArr];
    urls.forEach(loadOne);
  }

  function get(url) {
    return resourceCache[url];
  }

  // Match game.js ctx.scale(3,3) so baked sprites map 1:1 to canvas pixels
  var BAKE_SCALE = 3;

  // Full-image scale baked once (desert tiles → sharp display size)
  function getScaled(url, dw, dh) {
    var bw = Math.max(1, Math.round(dw * BAKE_SCALE));
    var bh = Math.max(1, Math.round(dh * BAKE_SCALE));
    var key = url + '@' + bw + 'x' + bh;
    if (Object.prototype.hasOwnProperty.call(scaledCache, key)) {
      return scaledCache[key];
    }
    var img = resourceCache[url];
    if (!img || !img.width) return null;
    var canvas = document.createElement('canvas');
    canvas.width = bw;
    canvas.height = bh;
    var c = canvas.getContext('2d');
    c.imageSmoothingEnabled = true;
    if (c.imageSmoothingQuality) c.imageSmoothingQuality = 'high';
    c.drawImage(img, 0, 0, bw, bh);
    scaledCache[key] = canvas;
    return canvas;
  }

  // Crop + scale baked once at canvas pixel size (Big Potato / enemy frames)
  function getRegionScaled(url, sx, sy, sw, sh, dw, dh) {
    var bw = Math.max(1, Math.round(dw * BAKE_SCALE));
    var bh = Math.max(1, Math.round(dh * BAKE_SCALE));
    var key = [url, sx | 0, sy | 0, sw | 0, sh | 0, bw, bh].join('|');
    if (Object.prototype.hasOwnProperty.call(regionCache, key)) {
      return regionCache[key];
    }
    var img = resourceCache[url];
    if (!img || !img.width) return null;
    var canvas = document.createElement('canvas');
    canvas.width = bw;
    canvas.height = bh;
    var c = canvas.getContext('2d');
    c.imageSmoothingEnabled = true;
    if (c.imageSmoothingQuality) c.imageSmoothingQuality = 'high';
    c.drawImage(img, sx, sy, sw, sh, 0, 0, bw, bh);
    regionCache[key] = canvas;
    return canvas;
  }

  function isReady() {
    return total > 0 && completed >= total;
  }

  function onReady(fn) {
    readyCallbacks.push(fn);
    if (readyFired) fn();
  }

  function onProgress(fn) {
    progressCallbacks.push(fn);
    fn(total ? Math.round((completed / total) * 100) : 0, completed, total);
  }

  window.resources = {
    load: load,
    get: get,
    getScaled: getScaled,
    getRegionScaled: getRegionScaled,
    onReady: onReady,
    onProgress: onProgress,
    isReady: isReady
  };
})();
