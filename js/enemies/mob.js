// Craftpix mobs — shared body + distinct attack styles per kind
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  var WALK_SPEED = {
    zombie: 0.32,
    wraith: 0.45,
    minotaur: 0.4,
    satyr: 0.5
  };

  var SCORE = {
    zombie: 200,
    wraith: 400,
    minotaur: 500,
    satyr: 300
  };

  function setAnim(mob, name, speed) {
    if (mob.anim === name && !mob.animRestart) return;
    mob.anim = name;
    mob.animRestart = false;
    mob.sprite = Mario.enemySprite(mob.kind, name);
    mob.sprite.speed = speed != null ? speed : 10;
    mob.sprite.flipX = mob.faceRight ? false : true;
    // Art faces right; flip when facing left
    if (Mario.EnemyAnims[mob.kind] && Mario.EnemyAnims[mob.kind].facesRight) {
      mob.sprite.flipX = !mob.faceRight;
    }
  }

  var Mob = Mario.Mob = function(pos, kind) {
    kind = kind || 'zombie';
    var meta = Mario.EnemyAnims[kind] || {};
    var hb = (meta.hitbox || [4, 6, 16, 24]).slice();
    this.kind = kind;
    this.dying = false;
    this.state = 'walk';
    this.anim = '';
    this.faceRight = false;
    this.attackTimer = 0;
    this.cooldown = 40 + Math.floor(Math.random() * 40);
    this.walkSpeed = WALK_SPEED[kind] || 0.4;
    this.flipping = false;

    Mario.Entity.call(this, {
      pos: pos.slice ? pos.slice() : [pos[0], pos[1]],
      sprite: Mario.enemySprite(kind, 'walk'),
      hitbox: hb
    });
    this.vel[0] = -this.walkSpeed;
    this.faceRight = false;
    setAnim(this, 'walk', 9);
    this.idx = level.enemies.length;
  };

  Mario.Util.inherits(Mob, Mario.Entity);

  Mob.prototype.render = function(ctx, vX, vY) {
    // Align feet to hitbox bottom
    var drawH = this.sprite.size[1];
    var drawY = this.pos[1] + this.hitbox[1] + this.hitbox[3] - drawH;
    var drawX = this.pos[0] + this.hitbox[0] - (this.sprite.size[0] - this.hitbox[2]) / 2;
    this.sprite.render(ctx, drawX, drawY, vX, vY);
  };

  Mob.prototype.setFacing = function() {
    if (this.vel[0] > 0.05) this.faceRight = true;
    else if (this.vel[0] < -0.05) this.faceRight = false;
    if (this.sprite) {
      this.sprite.flipX = !this.faceRight;
    }
  };

  Mob.prototype.update = function(dt, vX) {
    if (this.pos[0] - vX > 336) return;
    if (this.pos[0] - vX < -48) {
      delete level.enemies[this.idx];
      return;
    }

    if (this.dying) {
      this.dying -= 1;
      this.sprite.update(dt);
      if (this.dying <= 0) delete level.enemies[this.idx];
      return;
    }

    if (this.flipping) {
      this.acc[1] = 0.25;
      this.vel[1] += this.acc[1];
      this.pos[0] += this.vel[0];
      this.pos[1] += this.vel[1];
      this.sprite.update(dt);
      if (this.pos[1] > 260) delete level.enemies[this.idx];
      return;
    }

    this.cooldown = Math.max(0, this.cooldown - 1);
    this.ai();

    this.acc[1] = (this.kind === 'wraith' && this.state === 'cast') ? 0.05 : 0.2;
    this.vel[1] += this.acc[1];
    this.pos[0] += this.vel[0];
    this.pos[1] += this.vel[1];
    this.setFacing();
    this.sprite.update(dt);
  };

  // Default: walk and flip on walls. Sub-behaviors override via kind switches.
  Mob.prototype.ai = function() {
    if (this.state === 'walk') {
      if (Math.abs(this.vel[0]) < 0.05) this.vel[0] = this.faceRight ? this.walkSpeed : -this.walkSpeed;
      setAnim(this, 'walk', 9);
      if (this.cooldown === 0) this.trySpecial();
      return;
    }

    if (this.state === 'attack') {
      this.attackTimer -= 1;
      setAnim(this, 'attack', 14);
      if (this.attackTimer <= 0) {
        this.state = 'walk';
        this.vel[0] = this.faceRight ? this.walkSpeed : -this.walkSpeed;
        this.cooldown = 50 + Math.floor(Math.random() * 40);
      }
      return;
    }

    if (this.state === 'charge') {
      this.attackTimer -= 1;
      setAnim(this, 'attack', 16);
      if (this.attackTimer <= 0) {
        this.state = 'walk';
        this.vel[0] = this.faceRight ? this.walkSpeed : -this.walkSpeed;
        this.cooldown = 70;
      }
      return;
    }

    if (this.state === 'cast') {
      this.attackTimer -= 1;
      setAnim(this, 'cast', 12);
      if (this.attackTimer === 20) {
        Mario.spawnSpell(this);
      }
      if (this.attackTimer <= 0) {
        this.state = 'walk';
        this.vel[0] = this.faceRight ? this.walkSpeed : -this.walkSpeed;
        this.cooldown = 90;
      }
      return;
    }

    if (this.state === 'jump') {
      this.attackTimer -= 1;
      setAnim(this, 'jump', 12);
      if (this.standing && this.attackTimer < 20) {
        this.state = 'walk';
        this.vel[0] = this.faceRight ? this.walkSpeed : -this.walkSpeed;
        this.cooldown = 60;
      }
      return;
    }
  };

  Mob.prototype.trySpecial = function() {
    if (!player || player.dying || player.piping || player.flagging) return;
    var dx = (player.pos[0] + player.hitbox[0]) - (this.pos[0] + this.hitbox[0]);
    var dy = (player.pos[1] + player.hitbox[1]) - (this.pos[1] + this.hitbox[1]);
    var adx = Math.abs(dx);
    var ady = Math.abs(dy);

    if (this.kind === 'zombie') {
      if (adx < 42 && ady < 28) {
        this.state = 'attack';
        this.attackTimer = 28;
        this.vel[0] = (dx >= 0 ? 1.1 : -1.1);
        this.faceRight = dx >= 0;
      }
      return;
    }

    if (this.kind === 'wraith') {
      if (adx < 36 && ady < 40) {
        this.state = 'attack';
        this.attackTimer = 30;
        this.vel[0] = 0;
        this.faceRight = dx >= 0;
      } else if (adx < 100 && ady < 50) {
        this.state = 'cast';
        this.attackTimer = 36;
        this.vel[0] = 0;
        this.faceRight = dx >= 0;
      }
      return;
    }

    if (this.kind === 'minotaur') {
      var facingPlayer = (dx >= 0 && this.faceRight) || (dx < 0 && !this.faceRight);
      if (adx < 110 && ady < 36 && (facingPlayer || adx < 60)) {
        this.state = 'charge';
        this.attackTimer = 36;
        this.faceRight = dx >= 0;
        this.vel[0] = this.faceRight ? 2.4 : -2.4;
      }
      return;
    }

    if (this.kind === 'satyr') {
      if (adx < 72 && ady < 48) {
        this.state = 'jump';
        this.attackTimer = 40;
        this.faceRight = dx >= 0;
        this.vel[0] = this.faceRight ? 1.4 : -1.4;
        this.vel[1] = -4.2;
        this.standing = false;
      }
    }
  };

  Mob.prototype.collideWall = function(wall) {
    Mario.Entity.prototype.collideWall.call(this, wall);
    if (this.state === 'walk' || this.state === 'charge') {
      this.vel[0] = -this.vel[0];
      this.faceRight = this.vel[0] > 0;
      if (this.state === 'charge') {
        this.state = 'walk';
        this.vel[0] = this.faceRight ? this.walkSpeed : -this.walkSpeed;
        this.cooldown = 40;
      }
    }
  };

  Mob.prototype.checkCollisions = function() {
    if (this.flipping) return;
    // Taller than goombas — scan enough tiles to reach the floor under their feet
    var h = Math.ceil((this.hitbox[1] + this.hitbox[3]) / 16) + 1;
    var w = this.pos[0] % 16 === 0 ? 1 : 2;
    var baseX = Math.floor(this.pos[0] / 16);
    var baseY = Math.floor(this.pos[1] / 16);
    if (baseY + h > 15) {
      delete level.enemies[this.idx];
      return;
    }
    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        if (level.statics[baseY + i] && level.statics[baseY + i][baseX + j]) {
          level.statics[baseY + i][baseX + j].isCollideWith(this);
        }
        if (level.blocks[baseY + i] && level.blocks[baseY + i][baseX + j]) {
          level.blocks[baseY + i][baseX + j].isCollideWith(this);
        }
      }
    }
    var that = this;
    level.enemies.forEach(function(enemy) {
      if (enemy === that || !enemy) return;
      if (enemy.pos[0] - vX > 336) return;
      that.isCollideWith(enemy);
    });
    this.isCollideWith(player);
  };

  Mob.prototype.isCollideWith = function(ent) {
    if (ent instanceof Mario.Player && (this.dying || ent.invincibility)) return;

    var hpos1 = [this.pos[0] + this.hitbox[0], this.pos[1] + this.hitbox[1]];
    var hpos2 = [ent.pos[0] + ent.hitbox[0], ent.pos[1] + ent.hitbox[1]];

    if (!(hpos1[0] > hpos2[0] + ent.hitbox[2] || (hpos1[0] + this.hitbox[2] < hpos2[0]))) {
      if (!(hpos1[1] > hpos2[1] + ent.hitbox[3] || (hpos1[1] + this.hitbox[3] < hpos2[1]))) {
        if (ent instanceof Mario.Player) {
          if (ent.vel[1] > 0 && ent.pos[1] + ent.hitbox[1] < this.pos[1] + this.hitbox[1] + 6) {
            this.stomp();
          } else if (ent.starTime) {
            this.bump();
          } else {
            ent.damage();
          }
        } else if (ent instanceof Mario.Mob || ent instanceof Mario.Goomba || ent instanceof Mario.Koopa) {
          if (this.state === 'walk') {
            this.vel[0] = -this.vel[0];
            this.faceRight = this.vel[0] > 0;
          }
        }
      }
    }
  };

  Mob.prototype.stomp = function() {
    sounds.stomp.play();
    player.bounce = true;
    this.vel[0] = 0;
    this.dying = 24;
    this.state = 'die';
    setAnim(this, 'die', 12);
    this.sprite.once = true;
    Mario.addScore(SCORE[this.kind] || 200, this.pos);
  };

  Mob.prototype.bump = function() {
    sounds.kick.play();
    this.flipping = true;
    this.vel[0] = player.left ? -2 : 2;
    this.vel[1] = -2.5;
    Mario.addScore(SCORE[this.kind] || 200, this.pos);
  };

  // ---- Wraith spell orb ----
  if (!window.enemyProjectiles) window.enemyProjectiles = [];

  Mario.spawnSpell = function(mob) {
    var orb = new Mario.SpellOrb([
      mob.pos[0] + (mob.faceRight ? 18 : -4),
      mob.pos[1] + 10
    ], mob.faceRight);
    orb.idx = enemyProjectiles.length;
    enemyProjectiles.push(orb);
  };

  var SpellOrb = Mario.SpellOrb = function(pos, right) {
    Mario.Entity.call(this, {
      pos: pos,
      sprite: Mario.scaledSprite('sprites/enemies/spell.png', 10, 10, 12, 12),
      hitbox: [0, 0, 10, 10]
    });
    this.vel[0] = right ? 2.2 : -2.2;
    this.life = 90;
    this.idx = 0;
  };

  Mario.Util.inherits(SpellOrb, Mario.Entity);

  SpellOrb.prototype.render = function(ctx, vX, vY) {
    this.sprite.render(ctx, this.pos[0], this.pos[1], vX, vY);
  };

  SpellOrb.prototype.update = function(dt) {
    this.life -= 1;
    this.pos[0] += this.vel[0];
    this.sprite.update(dt);
    if (this.life <= 0 || this.pos[0] < vX - 16 || this.pos[0] > vX + 280) {
      delete enemyProjectiles[this.idx];
    }
  };

  SpellOrb.prototype.checkCollisions = function() {
    if (!player || player.dying || player.invincibility) return;
    var hpos1 = [this.pos[0], this.pos[1]];
    var hpos2 = [player.pos[0] + player.hitbox[0], player.pos[1] + player.hitbox[1]];
    if (!(hpos1[0] > hpos2[0] + player.hitbox[2] || hpos1[0] + 10 < hpos2[0])) {
      if (!(hpos1[1] > hpos2[1] + player.hitbox[3] || hpos1[1] + 10 < hpos2[1])) {
        if (!player.starTime) player.damage();
        delete enemyProjectiles[this.idx];
      }
    }
  };
})();
