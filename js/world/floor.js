(function() {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  var Floor = Mario.Floor = function(pos, sprite) {
    Mario.Entity.call(this, {
      pos: pos,
      sprite: sprite,
      hitbox: [0, 0, 16, 16]
    });
  };

  Mario.Util.inherits(Floor, Mario.Entity);

  Floor.prototype.isCollideWith = function(ent) {
    var hpos1 = [Math.floor(this.pos[0] + this.hitbox[0]), Math.floor(this.pos[1] + this.hitbox[1])];
    var hpos2 = [Math.floor(ent.pos[0] + ent.hitbox[0]), Math.floor(ent.pos[1] + ent.hitbox[1])];

    if (hpos1[0] > hpos2[0] + ent.hitbox[2] || (hpos1[0] + this.hitbox[2] < hpos2[0])) return;
    if (hpos1[1] > hpos2[1] + ent.hitbox[3] || (hpos1[1] + this.hitbox[3] < hpos2[1])) return;

    if (!this.standing) {
      ent.bump();
      return;
    }

    var center = hpos2[0] + ent.hitbox[2] / 2;
    var feet = hpos2[1] + ent.hitbox[3];
    var head = hpos2[1];
    var floorTop = hpos1[1];
    var floorBot = hpos1[1] + this.hitbox[3];

    // Land on top (generous so fast falls / spawn overlaps still work)
    if (ent.vel[1] >= 0 && feet >= floorTop && feet <= floorTop + Math.max(8, ent.vel[1] + 2)) {
      // Only treat as floor if we approached from above (head was above floor top last feel)
      if (head + ent.hitbox[3] * 0.5 <= floorBot) {
        ent.vel[1] = 0;
        ent.pos[1] = floorTop - ent.hitbox[3] - ent.hitbox[1];
        ent.standing = true;
        if (ent instanceof Mario.Player) ent.jumping = 0;
        return;
      }
    }

    // Hit underside
    if (ent.vel[1] < 0 && head <= floorBot && head >= floorTop - 4 &&
        center + 2 >= hpos1[0] && center - 2 <= hpos1[0] + this.hitbox[2]) {
      ent.vel[1] = 0;
      ent.pos[1] = floorBot - ent.hitbox[1];
      if (ent instanceof Mario.Player) {
        this.bonk(ent.power);
        ent.jumping = 0;
      }
      return;
    }

    // Side wall
    ent.collideWall(this);
  };

  Floor.prototype.bonk = function() {;};
})();
