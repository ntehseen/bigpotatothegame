// Virtual joystick + action buttons (COD Mobile–style), for phones/tablets
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  var ROOT_ID = 'touch-controls';
  var DEAD = 0.22;

  function knobTravel() {
    var base = document.querySelector('.touch-joy-base');
    if (!base) return 36;
    return Math.max(28, Math.floor(base.offsetWidth * 0.32));
  }

  function wantsTouchUI() {
    try {
      if (/[?&]touch=1\b/.test(location.search)) return true;
    } catch (e) {}
    return (
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  function el(tag, className, parent) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (parent) parent.appendChild(node);
    return node;
  }

  function bindButton(btn, key) {
    var active = false;
    function down(e) {
      e.preventDefault();
      e.stopPropagation();
      active = true;
      btn.classList.add('is-active');
      input.set(key, true);
    }
    function up(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!active) return;
      active = false;
      btn.classList.remove('is-active');
      input.set(key, false);
    }
    btn.addEventListener('touchstart', down, { passive: false });
    btn.addEventListener('touchend', up, { passive: false });
    btn.addEventListener('touchcancel', up, { passive: false });
    btn.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
  }

  function setupJoystick(zone, base, knob) {
    var tracking = null; // touch identifier or 'mouse'
    var originX = 0;
    var originY = 0;

    function clearMove() {
      input.set('LEFT', false);
      input.set('RIGHT', false);
      input.set('DOWN', false);
      input.set('UP', false);
      knob.style.transform = 'translate(-50%, -50%)';
      base.classList.remove('is-active');
    }

    function applyVector(dx, dy) {
      var maxKnob = knobTravel();
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = dx / dist;
      var ny = dy / dist;
      var mag = Math.min(1, dist / maxKnob);
      var kx = nx * mag * maxKnob;
      var ky = ny * mag * maxKnob;
      knob.style.transform = 'translate(calc(-50% + ' + kx + 'px), calc(-50% + ' + ky + 'px))';

      if (mag < DEAD) {
        input.set('LEFT', false);
        input.set('RIGHT', false);
        input.set('DOWN', false);
        input.set('UP', false);
        return;
      }

      input.set('LEFT', nx < -DEAD);
      input.set('RIGHT', nx > DEAD);
      // Down = crouch / pipe entry; ignore up (jump is a button)
      input.set('DOWN', ny > DEAD * 1.1);
      input.set('UP', false);
    }

    function placeBase(clientX, clientY) {
      var rect = zone.getBoundingClientRect();
      var x = clientX - rect.left;
      var y = clientY - rect.top;
      // Keep base inside the zone with padding
      var pad = 48;
      x = Math.max(pad, Math.min(rect.width - pad, x));
      y = Math.max(pad, Math.min(rect.height - pad, y));
      base.style.left = x + 'px';
      base.style.top = y + 'px';
      base.classList.add('is-active');
      originX = clientX;
      originY = clientY;
      applyVector(0, 0);
    }

    function onStart(e) {
      e.preventDefault();
      e.stopPropagation();
      var t = e.changedTouches ? e.changedTouches[0] : e;
      if (e.changedTouches) tracking = t.identifier;
      else tracking = 'mouse';
      placeBase(t.clientX, t.clientY);
    }

    function onMove(e) {
      if (tracking === null) return;
      var t = null;
      if (e.changedTouches) {
        for (var i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === tracking) {
            t = e.changedTouches[i];
            break;
          }
        }
        if (!t) return;
      } else if (tracking === 'mouse') {
        t = e;
      } else {
        return;
      }
      e.preventDefault();
      applyVector(t.clientX - originX, t.clientY - originY);
    }

    function onEnd(e) {
      if (tracking === null) return;
      if (e.changedTouches) {
        var hit = false;
        for (var i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === tracking) hit = true;
        }
        if (!hit) return;
      } else if (tracking !== 'mouse') {
        return;
      }
      tracking = null;
      clearMove();
    }

    zone.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: false });
    window.addEventListener('touchcancel', onEnd, { passive: false });
    zone.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
  }

  Mario.initTouchControls = function() {
    if (!wantsTouchUI()) return;
    if (document.getElementById(ROOT_ID)) return;

    document.documentElement.classList.add('touch-ui');
    document.body.classList.add('touch-ui');

    var root = el('div', 'touch-controls', document.body);
    root.id = ROOT_ID;

    // Left half: floating joystick
    var joyZone = el('div', 'touch-joy-zone', root);
    var joyBase = el('div', 'touch-joy-base', joyZone);
    var joyKnob = el('div', 'touch-joy-knob', joyBase);
    setupJoystick(joyZone, joyBase, joyKnob);

    // Right actions
    var actions = el('div', 'touch-actions', root);
    var btnJump = el('button', 'touch-btn touch-btn-jump', actions);
    btnJump.type = 'button';
    btnJump.setAttribute('aria-label', 'Jump');
    btnJump.innerHTML = '<span>JUMP</span>';
    bindButton(btnJump, 'JUMP');

    var btnShoot = el('button', 'touch-btn touch-btn-shoot', actions);
    btnShoot.type = 'button';
    btnShoot.setAttribute('aria-label', 'Shoot / Run');
    btnShoot.innerHTML = '<span>SHOOT</span>';
    bindButton(btnShoot, 'RUN');

    // Pause / restart
    var btnPause = el('button', 'touch-btn touch-btn-pause', root);
    btnPause.type = 'button';
    btnPause.setAttribute('aria-label', 'Pause');
    btnPause.textContent = 'Ⅱ';
    bindButton(btnPause, 'PAUSE');

    // Block page scroll / pinch while playing
    document.addEventListener('touchmove', function(e) {
      if (e.target.closest && e.target.closest('#' + ROOT_ID)) {
        e.preventDefault();
      }
    }, { passive: false });
  };
})();
