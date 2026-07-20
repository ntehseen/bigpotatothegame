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
  Mario.scaledSprite = function(img, displayW, displayH, srcW, srcH) {
    var sprite = new Mario.Sprite(img, [0, 0], [displayW, displayH], 0);
    sprite.srcSize = [srcW, srcH];
    sprite.smooth = true;
    return sprite;
  };

  // Big Potato atlas-backed animated sprite
  // Source art is painted (not NES pixel art) — smooth scale looks natural
  Mario.potatoSprite = function() {
    var sprite = new Mario.Sprite('sprites/bigpotato-atlas.png?v=30', [0, 0], [20, 30], 8, [0,1,2,3,4,5,6,7]);
    sprite.atlas = true;
    sprite.animName = 'idle';
    sprite.flipX = false;
    sprite.smooth = true;
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
    var img = resources.get(this.img);
    if (!img) return;

    // Atlas animation path (Big Potato)
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
      // Draw content bounds (not empty cell padding) so proportions look normal
      if (info.rects && info.rects[idx]) {
        var r = info.rects[idx];
        sx += r[0];
        sy += r[1];
        sw = r[2];
        sh = r[3];
      }
      var dx = Math.round(posx - vX);
      var dy = Math.round(posy - vY);
      var dw = this.size[0];
      var dh = this.size[1];

      ctx.save();
      ctx.imageSmoothingEnabled = !!this.smooth;
      if (this.flipX) {
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
      } else {
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
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

    if (this.smooth) ctx.imageSmoothingEnabled = true;

    if (this.srcSize) {
      var dx = Math.round(posx - vX);
      var dy = Math.round(posy - vY);
      var dw = this.size[0];
      var dh = this.size[1];
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
        Math.round(posx - vX), Math.round(posy - vY),
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
    sprite.smooth = true;
    sprite.flipX = false;
    sprite.once = (anim === 'die');
    return sprite;
  };
})();
