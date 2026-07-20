// Overlays: loading, login/hub, leaderboard, profile
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  function $(id) { return document.getElementById(id); }

  var pendingPhotoURL = null;

  function setLoadingProgress(pct) {
    var fill = $('bp-load-fill');
    var label = $('bp-load-pct');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '%';
  }

  function hideLoading() {
    var el = $('bp-loading');
    if (!el) return;
    el.classList.add('is-done');
    setTimeout(function() {
      if (el) el.style.display = 'none';
    }, 350);
  }

  function showOverlay(id) {
    ['bp-hub', 'bp-leaderboard', 'bp-profile'].forEach(function(oid) {
      var el = $(oid);
      if (!el) return;
      var on = oid === id;
      el.hidden = !on;
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
      el.style.display = on ? 'flex' : 'none';
    });
  }

  function hideOverlays() {
    document.body.classList.remove('bp-hub-open');
    ['bp-hub', 'bp-leaderboard', 'bp-profile'].forEach(function(oid) {
      var el = $(oid);
      if (!el) return;
      el.hidden = true;
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
    });
  }

  function profileForUi() {
    return (Mario.profile && Mario.profile.get) ? Mario.profile.get() : { displayName: 'Guest', photoURL: '' };
  }

  function renderUserChip(user) {
    var chip = $('bp-user-chip');
    var nameEl = $('bp-user-name');
    var avatar = $('bp-user-avatar');
    var loginActions = $('bp-login-actions');
    var playBtn = $('bp-play-btn');
    var guestBtn = $('bp-guest-btn');
    var signOutBtn = $('bp-signout-btn');
    var cfgNote = $('bp-auth-note');
    var sub = $('bp-card-sub');
    var profile = profileForUi();

    if (cfgNote) {
      cfgNote.hidden = !!(Mario.auth && Mario.auth.isConfigured && Mario.auth.isConfigured());
    }

    if (!user) {
      if (chip) {
        chip.hidden = false;
        if (nameEl) nameEl.textContent = profile.displayName || 'Guest';
        if (avatar) {
          avatar.src = profile.photoURL || 'sprites/bigpotato-hud.png';
          avatar.hidden = false;
        }
      }
      if (loginActions) loginActions.hidden = false;
      if (guestBtn) guestBtn.hidden = false;
      if (playBtn) playBtn.hidden = true;
      if (signOutBtn) signOutBtn.hidden = true;
      if (sub) sub.textContent = 'Sign in to save scores — or play as guest anytime.';
      return;
    }

    if (chip) chip.hidden = false;
    if (nameEl) nameEl.textContent = profile.displayName || user.displayName || 'Player';
    if (avatar) {
      avatar.src = profile.photoURL || user.photoURL || 'sprites/bigpotato-hud.png';
      avatar.hidden = false;
    }
    if (loginActions) loginActions.hidden = true;
    if (guestBtn) guestBtn.hidden = true;
    if (playBtn) {
      playBtn.hidden = false;
      playBtn.disabled = false;
    }
    if (signOutBtn) signOutBtn.hidden = false;
    if (sub) sub.textContent = 'You\'re signed in. Edit your profile anytime.';
  }

  function showHub() {
    document.body.classList.add('bp-hub-open');
    showOverlay('bp-hub');
    renderUserChip(Mario.auth && Mario.auth.user);
  }

  function fillProfileForm() {
    var profile = profileForUi();
    var nameInput = $('bp-profile-name');
    var previewImg = $('bp-profile-preview-img');
    var previewName = $('bp-profile-preview-name');
    pendingPhotoURL = profile.photoURL || '';
    if (nameInput) nameInput.value = profile.displayName || '';
    if (previewImg) previewImg.src = pendingPhotoURL || 'sprites/bigpotato-hud.png';
    if (previewName) previewName.textContent = profile.displayName || 'Player';
    renderPresets();
    flashProfileMsg('');
  }

  function renderPresets() {
    var wrap = $('bp-avatar-presets');
    if (!wrap || !Mario.profile) return;
    wrap.innerHTML = Mario.profile.presets.map(function(p) {
      var active = pendingPhotoURL === p.url ? ' is-active' : '';
      return '<button type="button" class="bp-preset' + active + '" data-url="' + p.url + '" title="' + p.label + '">' +
        '<img src="' + p.url + '" alt="' + p.label + '">' +
        '</button>';
    }).join('');
  }

  function flashProfileMsg(msg) {
    var el = $('bp-profile-msg');
    if (!el) return;
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  function showProfile() {
    document.body.classList.add('bp-hub-open');
    showOverlay('bp-profile');
    fillProfileForm();
  }

  function showLeaderboard() {
    document.body.classList.add('bp-hub-open');
    showOverlay('bp-leaderboard');
    var list = $('bp-lb-list');
    var status = $('bp-lb-status');
    if (status) status.textContent = 'Loading rankings…';
    if (list) list.innerHTML = '';
    if (!Mario.scores || !Mario.scores.fetchTop) {
      if (status) status.textContent = 'Scores unavailable.';
      return;
    }
    Mario.scores.fetchTop(50).then(function(rows) {
      if (!list) return;
      if (!rows.length) {
        if (status) status.textContent = 'No scores yet — be the first!';
        return;
      }
      if (status) status.textContent = '';
      var me = Mario.auth && Mario.auth.user && Mario.auth.user.uid;
      list.innerHTML = rows.map(function(r) {
        var mine = me && r.uid === me ? ' is-me' : '';
        var img = r.photoURL
          ? '<img class="bp-lb-avatar" src="' + r.photoURL.replace(/"/g, '') + '" alt="">'
          : '<span class="bp-lb-avatar bp-lb-avatar--empty"></span>';
        return '<li class="bp-lb-row' + mine + '">' +
          '<span class="bp-lb-rank">#' + r.rank + '</span>' +
          img +
          '<span class="bp-lb-name">' + escapeHtml(r.displayName) + '</span>' +
          '<span class="bp-lb-score">' + Number(r.bestScore).toLocaleString() + '</span>' +
          '</li>';
      }).join('');
    }).catch(function(err) {
      if (status) status.textContent = 'Could not load rankings (sign in + Firestore required).';
      console.warn(err);
    });
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function flashAuthError(msg) {
    var el = $('bp-auth-error');
    if (!el) return;
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  function startPlay() {
    if (Mario.profile && Mario.profile.ensureAvatarImage) {
      Mario.profile.ensureAvatarImage(true);
    }
    hideOverlays();
    if (typeof Mario.beginPlay === 'function') Mario.beginPlay();
  }

  function bind() {
    var google = $('bp-btn-google');
    var discord = $('bp-btn-discord');
    var play = $('bp-play-btn');
    var guest = $('bp-guest-btn');
    var scores = $('bp-scores-btn');
    var profileBtn = $('bp-profile-btn');
    var signOut = $('bp-signout-btn');
    var back = $('bp-lb-back');
    var refresh = $('bp-lb-refresh');
    var runScores = $('bp-run-scores');
    var profileBack = $('bp-profile-back');
    var profileSave = $('bp-profile-save');
    var profileReset = $('bp-profile-reset');
    var profileFile = $('bp-profile-file');
    var nameInput = $('bp-profile-name');
    var presets = $('bp-avatar-presets');

    if (google) {
      google.addEventListener('click', function() {
        flashAuthError('Opening Google sign-in…');
        google.disabled = true;
        Mario.auth.signInGoogle().then(function() {
          flashAuthError('');
          google.disabled = false;
          if (Mario.profile && Mario.profile.loadFromCloud) {
            return Mario.profile.loadFromCloud();
          }
        }).then(function() {
          showHub();
        }).catch(function(err) {
          google.disabled = false;
          var msg = (Mario.auth.friendlyAuthError && Mario.auth.friendlyAuthError(err)) || err.message;
          flashAuthError(msg || 'Google sign-in failed');
        });
      });
    }
    if (discord) {
      discord.addEventListener('click', function() {
        flashAuthError('Opening Discord sign-in…');
        discord.disabled = true;
        Mario.auth.signInDiscord().then(function() {
          flashAuthError('');
          discord.disabled = false;
          if (Mario.profile && Mario.profile.loadFromCloud) {
            return Mario.profile.loadFromCloud();
          }
        }).then(function() {
          showHub();
        }).catch(function(err) {
          discord.disabled = false;
          var msg = (Mario.auth.friendlyAuthError && Mario.auth.friendlyAuthError(err)) || err.message;
          flashAuthError(msg || 'Discord sign-in failed');
        });
      });
    }
    if (play) play.addEventListener('click', startPlay);
    if (guest) guest.addEventListener('click', startPlay);
    if (scores) scores.addEventListener('click', function() { showLeaderboard(); });
    if (profileBtn) profileBtn.addEventListener('click', function() { showProfile(); });
    if (signOut) {
      signOut.addEventListener('click', function() {
        Mario.auth.signOut().then(function() { showHub(); });
      });
    }
    if (back) back.addEventListener('click', function() { showHub(); });
    if (refresh) refresh.addEventListener('click', function() { showLeaderboard(); });
    if (runScores) runScores.addEventListener('click', function() { showLeaderboard(); });
    if (profileBack) profileBack.addEventListener('click', function() { showHub(); });

    if (nameInput) {
      nameInput.addEventListener('input', function() {
        var previewName = $('bp-profile-preview-name');
        if (previewName) previewName.textContent = nameInput.value.trim().slice(0, 18) || 'Player';
      });
    }

    if (presets) {
      presets.addEventListener('click', function(e) {
        var btn = e.target.closest('.bp-preset');
        if (!btn) return;
        pendingPhotoURL = btn.getAttribute('data-url') || '';
        var previewImg = $('bp-profile-preview-img');
        if (previewImg) previewImg.src = pendingPhotoURL;
        renderPresets();
      });
    }

    if (profileFile) {
      profileFile.addEventListener('change', function() {
        var file = profileFile.files && profileFile.files[0];
        if (!file || !Mario.profile) return;
        flashProfileMsg('Processing image…');
        Mario.profile.resizeImageFile(file).then(function(dataUrl) {
          pendingPhotoURL = dataUrl;
          var previewImg = $('bp-profile-preview-img');
          if (previewImg) previewImg.src = dataUrl;
          renderPresets();
          flashProfileMsg('');
        }).catch(function(err) {
          flashProfileMsg(err.message || 'Upload failed');
        }).then(function() {
          profileFile.value = '';
        });
      });
    }

    if (profileSave) {
      profileSave.addEventListener('click', function() {
        if (!Mario.profile) return;
        var name = (nameInput && nameInput.value || '').trim();
        flashProfileMsg('Saving…');
        Mario.profile.save({
          displayName: name,
          photoURL: pendingPhotoURL || ''
        }).then(function() {
          flashProfileMsg('Saved!');
          showHub();
        }).catch(function(err) {
          flashProfileMsg(err.message || 'Could not save');
        });
      });
    }

    if (profileReset) {
      profileReset.addEventListener('click', function() {
        if (!Mario.profile) return;
        Mario.profile.clearCustom().then(function() {
          fillProfileForm();
          flashProfileMsg('Reset to account defaults');
        });
      });
    }

    if (Mario.profile && Mario.profile.onChange) {
      Mario.profile.onChange(function() {
        renderUserChip(Mario.auth && Mario.auth.user);
      });
    }
  }

  Mario.ui = {
    setLoadingProgress: setLoadingProgress,
    hideLoading: hideLoading,
    showHub: showHub,
    showLeaderboard: showLeaderboard,
    showProfile: showProfile,
    hideOverlays: hideOverlays,
    renderUserChip: renderUserChip,
    bind: bind,
    flashAuthError: flashAuthError
  };
})();
