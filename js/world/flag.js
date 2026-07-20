(function() {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  Flag = Mario.Flag = function(pos) {
    // Pole X; flag banner starts near the top of the shaft
    this.pos = [pos, 49];
    this.hitbox = [0, 0, 0, 0];
    this.vel = [0, 0];
    this.acc = [0, 0];
  }

  Flag.prototype.collideWall = function() {;
  }

  Flag.prototype.update = function(dt){
    if (!this.done && this.pos[1] >= 170) {
      this.vel = [0, 0];
      this.pos[1] = 170;
      player.exit();
      this.done = true;
    }
    this.pos[1] += this.vel[1];
  }

  Flag.prototype.checkCollisions = function() {
    this.isPlayerCollided();
  }

  Flag.prototype.isPlayerCollided = function() {
    if (this.hit) return;

    // Grab anywhere along the shaft — from high stair jumps or ground level.
    var poleX = this.pos[0];
    var px = player.pos[0] + player.hitbox[0];
    var pw = player.hitbox[2];
    var py = player.pos[1] + player.hitbox[1];
    var ph = player.hitbox[3];
    var feet = py + ph;

    // Horizontal: player overlaps / reaches the pole column
    var reachLeft = px + pw >= poleX - 2;
    var pastLeft = px <= poleX + 14;
    // Vertical: anywhere from above the ball to just above the base block
    var onPole = feet > 40 && py < 200;

    if (reachLeft && pastLeft && onPole) {
      music.overworld.pause();
      music.underground.pause();
      sounds.flagpole.play();
      this.hit = true;
      // Snap to pole so high grabs feel clean
      player.pos[0] = poleX - player.hitbox[0] - player.hitbox[2] / 2;
      player.flag();
      this.vel = [0, 2];
    }
  }

  Flag.prototype.render = function() {
    level.flagpoleSprites[2].render(ctx, this.pos[0] - 8, this.pos[1], vX, vY);
  }
})();
