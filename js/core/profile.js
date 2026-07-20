// Player profile: custom display name + avatar (local + Firestore sync)
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  var STORAGE_KEY = 'bp_profile_v1';
  var listeners = [];
  var avatarImg = null;
  var avatarKey = '';
  var PRESETS = [
    { id: 'potato', label: 'Potato', url: 'sprites/bigpotato-hud.png' },
    { id: 'loading', label: 'Glam', url: 'assets/ui/loading.png' }
  ];

  function readLocal() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function writeLocal(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[BIG POTATO] could not save profile locally', e);
    }
  }

  function authDefaults() {
    var u = Mario.auth && Mario.auth.user;
    if (!u) {
      return { displayName: 'Guest', photoURL: '', uid: 'guest' };
    }
    return {
      displayName: u.displayName || 'Player',
      photoURL: u.photoURL || '',
      uid: u.uid
    };
  }

  function get() {
    var base = authDefaults();
    var local = readLocal();
    // Scope custom fields per uid so accounts don't clash
    var scoped = (local.uid && local.uid === base.uid) ? local : {};
    var name = (scoped.displayName || base.displayName || 'Player').trim().slice(0, 18);
    var photo = scoped.photoURL || base.photoURL || '';
    return {
      uid: base.uid,
      displayName: name || 'Player',
      photoURL: photo,
      isCustomName: !!(scoped.displayName),
      isCustomPhoto: !!(scoped.photoURL)
    };
  }

  function notify() {
    listeners.forEach(function(fn) {
      try { fn(get()); } catch (e) {}
    });
    // Force HUD redraw
    if (typeof hudCache !== 'undefined' && hudCache) {
      hudCache.score = null;
    }
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function syncToCloud(profile) {
    var user = Mario.auth && Mario.auth.user;
    if (!user || !window.firebase || !firebase.apps.length) return Promise.resolve();
    try {
      var db = firebase.firestore();
      return db.collection('players').doc(user.uid).set({
        displayName: profile.displayName,
        photoURL: profile.photoURL || '',
        provider: user.provider || 'unknown',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      return Promise.resolve();
    }
  }

  function loadFromCloud() {
    var user = Mario.auth && Mario.auth.user;
    if (!user || !window.firebase || !firebase.apps.length) return Promise.resolve(get());
    try {
      return firebase.firestore().collection('players').doc(user.uid).get().then(function(snap) {
        if (!snap.exists) return get();
        var d = snap.data() || {};
        var local = readLocal();
        // Prefer cloud custom fields when present
        if (d.displayName || d.photoURL) {
          writeLocal({
            uid: user.uid,
            displayName: d.displayName || local.displayName || '',
            photoURL: d.photoURL || local.photoURL || ''
          });
          ensureAvatarImage(true);
          notify();
        }
        return get();
      }).catch(function() { return get(); });
    } catch (e) {
      return Promise.resolve(get());
    }
  }

  function save(partial) {
    var base = authDefaults();
    var cur = readLocal();
    var next = {
      uid: base.uid,
      displayName: (partial.displayName != null ? partial.displayName : (cur.displayName || '')).trim().slice(0, 18),
      photoURL: partial.photoURL != null ? partial.photoURL : (cur.photoURL || '')
    };
    if (!next.displayName) next.displayName = base.displayName;
    writeLocal(next);
    ensureAvatarImage(true);
    notify();
    return syncToCloud(get()).then(function() { return get(); });
  }

  function clearCustom() {
    writeLocal({ uid: authDefaults().uid });
    ensureAvatarImage(true);
    notify();
    return syncToCloud(get());
  }

  function resizeImageFile(file) {
    return new Promise(function(resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) {
        reject(new Error('Please choose an image file'));
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        reject(new Error('Image too large (max 4MB)'));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function() { reject(new Error('Could not read file')); };
      reader.onload = function() {
        var img = new Image();
        img.onload = function() {
          var size = 96;
          var canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext('2d');
          var scale = Math.max(size / img.width, size / img.height);
          var w = img.width * scale;
          var h = img.height * scale;
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = function() { reject(new Error('Invalid image')); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function ensureAvatarImage(force) {
    var profile = get();
    var key = profile.photoURL || 'preset:potato';
    if (!force && avatarImg && avatarKey === key && avatarImg.complete) {
      return avatarImg;
    }
    avatarKey = key;
    avatarImg = new Image();
    // data URLs and same-origin assets work on canvas; remote may fail → fallback in HUD
    if (profile.photoURL && profile.photoURL.indexOf('data:') !== 0 && profile.photoURL.indexOf('sprites/') !== 0 && profile.photoURL.indexOf('assets/') !== 0) {
      avatarImg.crossOrigin = 'anonymous';
      avatarImg.referrerPolicy = 'no-referrer';
    }
    avatarImg.onload = function() {
      if (typeof hudCache !== 'undefined' && hudCache) hudCache.score = null;
    };
    avatarImg.onerror = function() {
      avatarImg = null;
      if (typeof hudCache !== 'undefined' && hudCache) hudCache.score = null;
    };
    avatarImg.src = profile.photoURL || 'sprites/bigpotato-hud.png';
    return avatarImg;
  }

  function getAvatarImage() {
    if (!avatarImg) ensureAvatarImage(false);
    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) return avatarImg;
    return resources.get('sprites/bigpotato-hud.png') || null;
  }

  Mario.profile = {
    get: get,
    save: save,
    clearCustom: clearCustom,
    loadFromCloud: loadFromCloud,
    onChange: onChange,
    resizeImageFile: resizeImageFile,
    ensureAvatarImage: ensureAvatarImage,
    getAvatarImage: getAvatarImage,
    presets: PRESETS
  };
})();
