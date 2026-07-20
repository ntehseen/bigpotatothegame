(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  // Big Potato — unique desert platformer hero (not a Mario sprite clone)
  var GROUND_Y = 208;
  var DRAW_W = 20;
  var DRAW_H = 30;
  var HIT_W = 12;
  var HIT_H = 20;

  var Player = Mario.Player = function(pos) {
    this.power = 0; // 0 normal, 1 big, 2 fire
    this.coins = 0;
    this.score = 0;
    this.powering = [];
    this.bounce = false;
    this.jumping = 0;
    this.canJump = true;
    this.invincibility = 0;
    this.crouching = false;
    this.fireballs = 0;
    this.runheld = false;
    this.noInput = false;
    this.targetPos = [];
    this.maxSpeed = 1.5;
    this.moveAcc = 0.07;

    Mario.Entity.call(this, {
      pos: pos || [56, GROUND_Y - HIT_H],
      sprite: Mario.potatoSprite(),
      hitbox: [2, 0, HIT_W, HIT_H]
    });

    this.sprite.size = [DRAW_W, DRAW_H];
    this.sprite.setAnim('idle');
    this.standing = true;
  };

  Mario.Util.inherits(Player, Mario.Entity);

  Player.prototype.plantFeet = function(groundY) {
    groundY = groundY == null ? GROUND_Y : groundY;
    this.pos[1] = groundY - this.hitbox[3] - this.hitbox[1];
    this.vel[1] = 0;
    this.acc[1] = 0;
    this.standing = true;
    this.jumping = 0;
  };

  Player.prototype.run = function() {
    this.maxSpeed = 2.5;
    if (this.power === 2 && !this.runheld) this.shoot();
    this.runheld = true;
  };

  Player.prototype.shoot = function() {
    if (this.fireballs >= 2) return;
    this.fireballs += 1;
    var fb = new Mario.Fireball([this.pos[0] + 8, this.pos[1] + 4]);
    fb.spawn(this.left);
    this.shooting = 8;
  };

  Player.prototype.noRun = function() {
    this.maxSpeed = 1.5;
    this.moveAcc = 0.07;
    this.runheld = false;
  };

  Player.prototype.moveRight = function() {
    if (this.crouching && this.standing) {
      this.noWalk();
      return;
    }
    this.acc[0] = this.moveAcc;
    this.left = false;
  };

  Player.prototype.moveLeft = function() {
    if (this.crouching && this.standing) {
      this.noWalk();
      return;
    }
    this.acc[0] = -this.moveAcc;
    this.left = true;
  };

  Player.prototype.noWalk = function() {
    this.maxSpeed = 0;
    if (this.vel[0] === 0) return;
    if (Math.abs(this.vel[0]) <= 0.1) {
      this.vel[0] = 0;
      this.acc[0] = 0;
    }
  };

  Player.prototype.crouch = function() {
    if (this.standing) this.crouching = true;
  };

  Player.prototype.noCrouch = function() {
    this.crouching = false;
  };

  Player.prototype.jump = function() {
    if (this.vel[1] > 0) return;
    if (this.jumping) {
      this.jumping -= 1;
    } else if (this.standing && this.canJump) {
      this.jumping = 20;
      this.canJump = false;
      this.standing = false;
      this.vel[1] = -6;
      if (this.power === 0) {
        sounds.smallJump.currentTime = 0;
        sounds.smallJump.play();
      } else {
        sounds.bigJump.currentTime = 0;
        sounds.bigJump.play();
      }
    }
  };

  Player.prototype.noJump = function() {
    this.canJump = true;
    if (this.jumping) {
      if (this.jumping <= 16) {
        this.vel[1] = 0;
        this.jumping = 0;
      } else {
        this.jumping -= 1;
      }
    }
  };

  Player.prototype.setAnimation = function() {
    if (this.dying) {
      this.sprite.setAnim('death', { loop: false, speed: 6 });
      // Atlas frames face right; flip when moving left
      this.sprite.flipX = !!this.left;
      return;
    }

    if (this.starTime) {
      var index = this.starTime > 60
        ? Math.floor(this.starTime / 2) % 3
        : Math.floor(this.starTime / 8) % 3;
      this.starTime -= 1;
      this.sprite.setAnim('invuln' + (index + 1), { speed: 12 });
      this.sprite.flipX = !!this.left;
      return;
    }

    var anim = 'idle';
    var speed = 7;

    if (this.flagging) {
      anim = 'climb';
      speed = 10;
    } else if (this.exiting) {
      anim = 'victory';
      speed = 8;
    } else if (this.crouching && this.standing) {
      anim = 'duck';
      speed = 6;
    } else if (this.shooting) {
      anim = 'fire';
      speed = 14;
      this.shooting -= 1;
    } else if (!this.standing || this.jumping) {
      anim = this.vel[1] < 0 ? 'jump' : 'fall';
      speed = 10;
    } else if (Math.abs(this.vel[0]) > 0.08) {
      var skidding = (this.vel[0] > 0 && this.left) || (this.vel[0] < 0 && !this.left);
      if (skidding && this.acc[0] !== 0) {
        anim = 'skid';
        speed = 10;
      } else if (this.runheld && Math.abs(this.vel[0]) > 1.6) {
        anim = 'run';
        speed = 12 + Math.abs(this.vel[0]) * 2;
      } else {
        anim = 'walk';
        speed = 8 + Math.abs(this.vel[0]) * 3;
      }
    }

    this.sprite.setAnim(anim, { speed: speed });
    this.sprite.flipX = !!this.left;
  };

  Player.prototype.render = function(ctx, vX, vY) {
    // Align sprite feet to hitbox bottom
    var drawY = this.pos[1] + this.hitbox[3] - this.sprite.size[1] + 1;
    var drawX = this.pos[0] + this.hitbox[0] - (this.sprite.size[0] - this.hitbox[2]) / 2;
    this.sprite.render(ctx, drawX, drawY, vX, vY);
  };

  Player.prototype.update = function(dt, vX) {
    if (this.powering.length !== 0) {
      var next = this.powering.shift();
      if (next === 5) return;
      this.sprite.setAnim(next % 2 === 0 ? 'hurt' : 'idle', { speed: 16 });
      this.sprite.flipX = !!this.left;
      if (this.powering.length === 0) {
        delete level.items[this.touchedItem];
      }
      return;
    }

    if (this.invincibility) {
      this.invincibility -= Math.round(dt * 60);
    }

    if (this.waiting) {
      this.waiting -= dt;
      if (this.waiting <= 0) this.waiting = 0;
      else return;
    }

    if (this.bounce) {
      this.bounce = false;
      this.standing = false;
      this.vel[1] = -3;
    }

    if (this.pos[0] <= vX) {
      this.pos[0] = vX;
      this.vel[0] = Math.max(this.vel[0], 0);
    }

    if (Math.abs(this.vel[0]) > this.maxSpeed) {
      this.vel[0] -= 0.05 * this.vel[0] / Math.abs(this.vel[0]);
      this.acc[0] = 0;
    }

    if (this.dying) {
      if (this.pos[1] < this.targetPos[1]) this.vel[1] = 1;
      this.dying -= dt;
      if (this.dying <= 0) {
        Mario.endRun();
      }
    } else {
      this.acc[1] = 0.25;
      if (this.pos[1] > 240) this.die();
    }

    if (this.piping) {
      this.acc = [0, 0];
      var pos = [Math.round(this.pos[0]), Math.round(this.pos[1])];
      if (pos[0] === this.targetPos[0] && pos[1] === this.targetPos[1]) {
        this.piping = false;
        this.pipeLoc.call();
      }
    }

    if (this.flagging) this.acc = [0, 0];

    if (this.exiting) {
      this.left = false;
      this.flagging = false;
      this.vel[0] = 1.5;
      if (this.pos[0] >= this.targetPos[0]) {
        this.sprite.size = [0, 0];
        this.vel = [0, 0];
        // Short beat then keep the run going — score persists
        window.setTimeout(function() {
          player.sprite = Mario.potatoSprite();
          player.sprite.size = [DRAW_W, DRAW_H];
          player.exiting = false;
          player.noInput = false;
          Mario.advanceAfterFlag(level.next || level.loader);
          if (music.overworld) {
            music.overworld.currentTime = 0;
            music.overworld.play();
          }
        }, 900);
      }
    }

    this.vel[0] += this.acc[0];
    this.vel[1] += this.acc[1];
    this.pos[0] += this.vel[0];
    this.pos[1] += this.vel[1];

    // Cleared here; floor/pipe collisions re-set standing this frame
    if (!this.dying && !this.piping && !this.flagging) {
      this.standing = false;
    }
  };

  // Called from the game loop AFTER collisions so ground/air anims are correct
  Player.prototype.postUpdate = function(dt) {
    this.setAnimation();
    this.sprite.update(dt);
  };

  Player.prototype.checkCollisions = function() {
    if (this.piping || this.dying) return;

    var bottom = this.pos[1] + this.hitbox[1] + this.hitbox[3];
    var right = this.pos[0] + this.hitbox[0] + this.hitbox[2];
    var baseX = Math.floor((this.pos[0] + this.hitbox[0]) / 16);
    var baseY = Math.floor((this.pos[1] + this.hitbox[1]) / 16);
    var endX = Math.floor((right - 0.001) / 16);
    var endY = Math.floor((bottom - 0.001) / 16);

    for (var y = baseY; y <= endY; y++) {
      if (y < 0 || y >= 15) continue;
      for (var x = baseX; x <= endX; x++) {
        if (x < 0) continue;
        if (level.statics[y][x]) level.statics[y][x].isCollideWith(this);
        if (level.blocks[y][x]) level.blocks[y][x].isCollideWith(this);
      }
    }
  };

  Player.prototype.powerUp = function(idx) {
    sounds.powerup.play();
    this.touchedItem = idx;

    if (this.power === 0) {
      this.powering = [0, 5, 1, 5, 0, 5, 1];
      this.power = 1;
      Mario.addScore(1000, this.pos);
    } else if (this.power === 1) {
      this.powering = [0, 5, 1, 5, 0, 5, 1];
      this.power = 2;
      Mario.addScore(1000, this.pos);
    } else {
      this.powering = [];
      delete level.items[idx];
      Mario.addScore(5000, this.pos);
    }
  };

  Player.prototype.damage = function() {
    if (this.power === 0) {
      this.die();
    } else {
      sounds.pipe.play();
      this.powering = [0, 5, 1, 5, 0, 5, 1];
      this.invincibility = 120;
      this.power = 0;
    }
  };

  Player.prototype.die = function() {
    music.overworld.pause();
    music.underground.pause();
    music.overworld.currentTime = 0;
    music.death.play();
    this.noWalk();
    this.noRun();
    this.noJump();
    this.acc[0] = 0;
    this.sprite.setAnim('death', { loop: false, speed: 6 });
    this.power = 0;
    this.waiting = 0.5;
    this.dying = 2;

    if (this.pos[1] < 240) {
      this.targetPos = [this.pos[0], this.pos[1] - 128];
      this.vel = [0, -5];
    } else {
      this.vel = [0, 0];
      this.targetPos = [this.pos[0], this.pos[1] - 16];
    }
  };

  Player.prototype.star = function(idx) {
    delete level.items[idx];
    this.starTime = 660;
    Mario.addScore(1000, this.pos);
  };

  Player.prototype.pipe = function(direction, destination) {
    sounds.pipe.play();
    this.piping = true;
    this.pipeLoc = destination;
    switch (direction) {
      case 'LEFT':
        this.vel = [-1, 0];
        this.targetPos = [Math.round(this.pos[0] - 16), Math.round(this.pos[1])];
        break;
      case 'RIGHT':
        this.vel = [1, 0];
        this.targetPos = [Math.round(this.pos[0] + 16), Math.round(this.pos[1])];
        break;
      case 'DOWN':
        this.vel = [0, 1];
        this.targetPos = [Math.round(this.pos[0]), Math.round(this.pos[1] + this.hitbox[3])];
        break;
      case 'UP':
        this.vel = [0, -1];
        this.targetPos = [Math.round(this.pos[0]), Math.round(this.pos[1] - this.hitbox[3])];
        break;
    }
  };

  Player.prototype.flag = function() {
    this.noInput = true;
    this.flagging = true;
    this.vel = [0, 2];
    this.acc = [0, 0];

    var y = this.pos[1];
    var flagPoints = 100;
    if (y < 80) flagPoints = 5000;
    else if (y < 112) flagPoints = 2000;
    else if (y < 144) flagPoints = 800;
    else if (y < 176) flagPoints = 400;
    Mario.addScore(flagPoints, [this.pos[0], this.pos[1]]);
  };

  Player.prototype.exit = function() {
    this.pos[0] += 16;
    this.targetPos[0] = level.exit * 16;
    this.left = true;
    this.setAnimation();
    this.waiting = 1;
    this.exiting = true;
    if (levelTime > 0) {
      Mario.addScore(levelTime * 50);
      levelTime = 0;
    }
  };
})();
