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

  // Full-image scale baked once (desert tiles → 16×16, etc.)
  function getScaled(url, dw, dh) {
    var key = url + '@' + dw + 'x' + dh;
    if (Object.prototype.hasOwnProperty.call(scaledCache, key)) {
      return scaledCache[key];
    }
    var img = resourceCache[url];
    if (!img || !img.width) return null;
    var canvas = document.createElement('canvas');
    canvas.width = dw;
    canvas.height = dh;
    var c = canvas.getContext('2d');
    c.imageSmoothingEnabled = true;
    if (c.imageSmoothingQuality) c.imageSmoothingQuality = 'medium';
    c.drawImage(img, 0, 0, dw, dh);
    scaledCache[key] = canvas;
    return canvas;
  }

  // Crop + scale baked once (Big Potato atlas frames, enemy strip frames)
  function getRegionScaled(url, sx, sy, sw, sh, dw, dh) {
    var key = [url, sx | 0, sy | 0, sw | 0, sh | 0, dw | 0, dh | 0].join('|');
    if (Object.prototype.hasOwnProperty.call(regionCache, key)) {
      return regionCache[key];
    }
    var img = resourceCache[url];
    if (!img || !img.width) return null;
    var canvas = document.createElement('canvas');
    canvas.width = dw;
    canvas.height = dh;
    var c = canvas.getContext('2d');
    c.imageSmoothingEnabled = true;
    if (c.imageSmoothingQuality) c.imageSmoothingQuality = 'medium';
    c.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
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
