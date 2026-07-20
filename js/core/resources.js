// Resource loader with resilient image/audio preloading and loading progress.
(function() {
  var resourceCache = {};
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
    onReady: onReady,
    onProgress: onProgress,
    isReady: isReady
  };
})();
