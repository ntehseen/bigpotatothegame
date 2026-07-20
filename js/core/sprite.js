(function() {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  var Sprite = Mario.Sprite = function(img, pos, size, speed, frames, once) {
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this._index = 0;
    this.img = img;
    this.once = once;
    this.frames = frames;
  }

  // Draw a full image scaled to display size (for desert tiles/props).
  // Scale is baked once via resources.getScaled — no per-frame filtering.
  Mario.scaledSprite = function(img, displayW, displayH, srcW, srcH) {
    var sprite = new Mario.Sprite(img, [0, 0], [displayW, displayH], 0);
    sprite.srcSize = [srcW, srcH];
    sprite.smooth = false;
    sprite.bakeScale = true;
    return sprite;
  };

  // Big Potato atlas-backed animated sprite
  Mario.potatoSprite = function() {
    var sprite = new Mario.Sprite('sprites/bigpotato-atlas.png?v=30', [0, 0], [20, 30], 8, [0,1,2,3,4,5,6,7]);
    sprite.atlas = true;
    sprite.animName = 'idle';
    sprite.flipX = false;
    sprite.smooth = false;
    sprite.loop = true;
    return sprite;
  };

  Sprite.prototype.setAnim = function(name, opts) {
    opts = opts || {};
    if (this.animName === name && !opts.restart) return;
    this.animName = name;
    this._index = 0;
    this.loop = opts.loop !== false;
    this.speed = opts.speed != null ? opts.speed : 10;
    var info = Mario.BigPotatoAnims && Mario.BigPotatoAnims.anims[name];
    if (info) {
      var frames = [];
      for (var i = 0; i < info.frames; i++) frames.push(i);
      this.frames = frames;
    }
  };

  Sprite.prototype.update = function(dt, gameTime) {
    if (gameTime && gameTime == this.lastUpdated) return;
    this._index += this.speed*dt;
    if (gameTime) this.lastUpdated = gameTime;
  }

  Sprite.prototype.setFrame = function(frame) {
    this._index = frame;
  }

  Sprite.prototype.render = function(ctx, posx, posy, vX, vY) {
    var dx = Math.round(posx - vX);
    var dy = Math.round(posy - vY);
    var dw = this.size[0];
    var dh = this.size[1];

    // Atlas animation path (Big Potato) — bake each frame to draw size once
    if (this.atlas && Mario.BigPotatoAnims) {
      var meta = Mario.BigPotatoAnims;
      var info = meta.anims[this.animName] || meta.anims.idle;
      var cell = meta.cell;
      var max = info.frames;
      var idx = Math.floor(this._index);
      if (this.loop) {
        idx = idx % max;
      } else {
        if (idx >= max) {
          idx = max - 1;
          this.done = true;
        }
      }
      var sx = idx * cell;
      var sy = info.row * cell;
      var sw = cell;
      var sh = cell;
      if (info.rects && info.rects[idx]) {
        var r = info.rects[idx];
        sx += r[0];
        sy += r[1];
        sw = r[2];
        sh = r[3];
      }

      var baked = resources.getRegionScaled &&
        resources.getRegionScaled(this.img, sx, sy, sw, sh, dw, dh);
      var src = baked || resources.get(this.img);
      if (!src) return;

      ctx.save();
      if (!baked) ctx.imageSmoothingEnabled = !!this.smooth;
      if (this.flipX) {
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        if (baked) ctx.drawImage(src, 0, 0);
        else ctx.drawImage(src, sx, sy, sw, sh, 0, 0, dw, dh);
      } else if (baked) {
        ctx.drawImage(src, dx, dy);
      } else {
        ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
      }
      ctx.restore();
      return;
    }

    var frame;
    if (this.speed > 0) {
      var max = this.frames.length;
      var fidx = Math.floor(this._index);
      frame = this.frames[fidx % max];

      if (this.once && fidx >= max) {
        this.done = true;
        return;
      }
    } else {
      frame = 0;
    }

    var x = this.pos[0];
    var y = this.pos[1];
    var sw = this.srcSize ? this.srcSize[0] : this.size[0];
    var sh = this.srcSize ? this.srcSize[1] : this.size[1];
    x += frame * sw;

    // Full-image world tiles: draw pre-baked 16×16 (etc.) canvases
    if (this.bakeScale && this.srcSize && frame === 0 && this.speed === 0) {
      var tile = resources.getScaled && resources.getScaled(this.img, dw, dh);
      if (tile) {
        if (this.flipX) {
          ctx.save();
          ctx.translate(dx + dw, dy);
          ctx.scale(-1, 1);
          ctx.drawImage(tile, 0, 0);
          ctx.restore();
        } else {
          ctx.drawImage(tile, dx, dy);
        }
        return;
      }
    }

    // Animated strips (enemies/items): bake each source frame once
    if (this.srcSize && resources.getRegionScaled) {
      var strip = resources.getRegionScaled(this.img, x, y, sw, sh, dw, dh);
      if (strip) {
        if (this.flipX) {
          ctx.save();
          ctx.translate(dx + dw, dy);
          ctx.scale(-1, 1);
          ctx.drawImage(strip, 0, 0);
          ctx.restore();
        } else {
          ctx.drawImage(strip, dx, dy);
        }
        return;
      }
    }

    var img = resources.get(this.img);
    if (!img) return;

    if (this.smooth) ctx.imageSmoothingEnabled = true;

    if (this.srcSize) {
      if (this.flipX) {
        ctx.save();
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, x, y, sw, sh, 0, 0, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, sw, sh, dx, dy, dw, dh);
      }
    } else {
      ctx.drawImage(
        img,
        x + (1/3), y + (1/3), this.size[0] - (2/3), this.size[1] - (2/3),
        dx, dy,
        this.size[0], this.size[1]
      );
    }

    if (this.smooth) ctx.imageSmoothingEnabled = false;
  }

  // Craftpix enemy strip sprite (walk/attack/die/...)
  Mario.enemySprite = function(kind, anim) {
    var meta = Mario.EnemyAnims[kind];
    var n = (meta && meta.anims && meta.anims[anim]) || 4;
    var frames = [];
    for (var i = 0; i < n; i++) frames.push(i);
    var draw = (meta && meta.draw) ? meta.draw.slice() : [24, 30];
    var cell = (meta && meta.cell) ? meta.cell.slice() : [32, 40];
    var sprite = new Mario.Sprite(
      'sprites/enemies/' + kind + '/' + anim + '.png',
      [0, 0],
      draw,
      10,
      frames
    );
    sprite.srcSize = cell;
    sprite.smooth = false;
    sprite.flipX = false;
    sprite.once = (anim === 'die');
    return sprite;
  };
})();
