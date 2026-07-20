// Firebase Auth: Google + Discord
// Prefer popup; fall back to redirect only if popup is blocked.
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  var auth = null;
  var ready = false;
  var readyCallbacks = [];
  var userListeners = [];
  var currentUser = null;
  var configOk = false;

  function mapUser(fbUser) {
    if (!fbUser) return null;
    var provider = 'unknown';
    if (fbUser.providerData && fbUser.providerData[0]) {
      var pid = fbUser.providerData[0].providerId || '';
      if (pid.indexOf('google') !== -1) provider = 'google';
      else if (pid.indexOf('discord') !== -1 || pid.indexOf('oidc') !== -1) provider = 'discord';
      else provider = pid;
    }
    return {
      uid: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email || 'Player',
      photoURL: fbUser.photoURL || '',
      email: fbUser.email || '',
      provider: provider,
      raw: fbUser
    };
  }

  function notifyUser() {
    userListeners.forEach(function(fn) {
      try { fn(currentUser); } catch (e) {}
    });
  }

  function setReady() {
    if (ready) return;
    ready = true;
    readyCallbacks.forEach(function(fn) {
      try { fn(currentUser); } catch (e) {}
    });
  }

  function friendlyAuthError(err) {
    if (!err) return 'Sign-in failed';
    var code = err.code || '';
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in cancelled. You can still Play as Guest.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Popup blocked — allow popups for this site, or try again.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Domain not authorized in Firebase (localhost should be listed).';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Enable Google under Firebase → Authentication → Sign-in method.';
    }
    if (code === 'auth/configuration-not-found') {
      return 'Enable Google under Firebase → Authentication → Sign-in method.';
    }
    return err.message || 'Sign-in failed';
  }

  function googleProvider() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    provider.addScope('profile');
    provider.addScope('email');
    return provider;
  }

  function discordProvider() {
    var providerId = window.FIREBASE_DISCORD_PROVIDER_ID || 'oidc.discord';
    var provider = new firebase.auth.OAuthProvider(providerId);
    provider.addScope('identify');
    provider.addScope('email');
    return provider;
  }

  function signInWithProvider(provider) {
    if (!configOk || !auth) {
      return Promise.reject(new Error('Firebase is not configured.'));
    }
    return auth.signInWithPopup(provider).then(function(result) {
      currentUser = mapUser(result.user);
      notifyUser();
      return currentUser;
    }).catch(function(err) {
      // Only auto-fallback to redirect when the popup is blocked
      if (err && err.code === 'auth/popup-blocked') {
        return auth.signInWithRedirect(provider);
      }
      throw err;
    });
  }

  function init() {
    if (!window.firebase || !window.FIREBASE_CONFIG) {
      console.warn('[BIG POTATO] Firebase SDK or config missing — auth disabled');
      setReady();
      return;
    }
    var cfg = window.FIREBASE_CONFIG;
    if (!cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') {
      console.warn('[BIG POTATO] Fill in js/core/firebase-config.js to enable login');
      setReady();
      return;
    }
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      auth = firebase.auth();
      configOk = true;

      auth.onAuthStateChanged(function(fbUser) {
        currentUser = mapUser(fbUser);
        notifyUser();
        setReady();
      });

      auth.getRedirectResult().then(function(result) {
        if (result && result.user) {
          currentUser = mapUser(result.user);
          notifyUser();
        }
      }).catch(function(err) {
        console.warn('[BIG POTATO] redirect result', err);
        if (Mario.ui && Mario.ui.flashAuthError) {
          Mario.ui.flashAuthError(friendlyAuthError(err));
        }
      });
    } catch (err) {
      console.error('[BIG POTATO] Firebase init failed', err);
      setReady();
    }
  }

  function onReady(fn) {
    if (ready) fn(currentUser);
    else readyCallbacks.push(fn);
  }

  function onUserChanged(fn) {
    userListeners.push(fn);
    if (ready) fn(currentUser);
  }

  function signInGoogle() {
    return signInWithProvider(googleProvider());
  }

  function signInDiscord() {
    return signInWithProvider(discordProvider());
  }

  function signOut() {
    if (!auth) return Promise.resolve();
    return auth.signOut().then(function() {
      currentUser = null;
      notifyUser();
    });
  }

  function isConfigured() {
    return configOk;
  }

  Mario.auth = {
    init: init,
    onReady: onReady,
    onUserChanged: onUserChanged,
    signInGoogle: signInGoogle,
    signInDiscord: signInDiscord,
    signOut: signOut,
    isConfigured: isConfigured,
    friendlyAuthError: friendlyAuthError,
    get user() { return currentUser; }
  };
})();
