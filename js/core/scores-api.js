// Firestore leaderboard — best score per player
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  var COLLECTION = 'players';

  function db() {
    if (!window.firebase || !firebase.apps.length) return null;
    try { return firebase.firestore(); } catch (e) { return null; }
  }

  function submit(finalScore) {
    var user = Mario.auth && Mario.auth.user;
    if (!user) return Promise.resolve({ skipped: true, reason: 'not-signed-in' });
    var score = Math.max(0, Math.floor(Number(finalScore) || 0));
    var firestore = db();
    if (!firestore) return Promise.resolve({ skipped: true, reason: 'no-firestore' });

    var profile = (Mario.profile && Mario.profile.get) ? Mario.profile.get() : {};
    var ref = firestore.collection(COLLECTION).doc(user.uid);
    return ref.get().then(function(snap) {
      var prev = snap.exists ? (snap.data().bestScore || 0) : 0;
      var payload = {
        displayName: profile.displayName || user.displayName || 'Player',
        photoURL: profile.photoURL || user.photoURL || '',
        provider: user.provider || 'unknown',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (score > prev) {
        payload.bestScore = score;
      } else if (!snap.exists) {
        payload.bestScore = score;
      }
      if (score <= prev && snap.exists) {
        // Still refresh name/avatar on the board
        return ref.set({
          displayName: payload.displayName,
          photoURL: payload.photoURL,
          provider: payload.provider,
          updatedAt: payload.updatedAt
        }, { merge: true }).then(function() {
          return { updated: false, bestScore: prev, score: score };
        });
      }
      return ref.set(payload, { merge: true }).then(function() {
        return { updated: score > prev, bestScore: Math.max(score, prev), score: score };
      });
    });
  }

  function fetchTop(limit) {
    limit = limit || 50;
    var firestore = db();
    if (!firestore) return Promise.resolve([]);
    return firestore.collection(COLLECTION)
      .orderBy('bestScore', 'desc')
      .limit(limit)
      .get()
      .then(function(snap) {
        var rows = [];
        var rank = 1;
        snap.forEach(function(doc) {
          var d = doc.data() || {};
          rows.push({
            uid: doc.id,
            rank: rank++,
            displayName: d.displayName || 'Player',
            photoURL: d.photoURL || '',
            provider: d.provider || '',
            bestScore: d.bestScore || 0
          });
        });
        return rows;
      });
  }

  Mario.scores = {
    submit: submit,
    fetchTop: fetchTop
  };
})();
