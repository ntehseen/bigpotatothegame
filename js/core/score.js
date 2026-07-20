(function() {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  // Floating point values that rise and fade after scoring.
  var ScorePopup = Mario.ScorePopup = function(pos, value) {
    this.pos = [pos[0], pos[1]];
    this.value = value;
    this.life = 40;
    this.idx = scorePopups.length;
    scorePopups.push(this);
  };

  ScorePopup.prototype.update = function(dt) {
    this.pos[1] -= 0.7;
    this.life -= 1;
    if (this.life <= 0) {
      delete scorePopups[this.idx];
    }
  };

  ScorePopup.prototype.render = function(ctx, vX, vY) {
    var x = Math.round(this.pos[0] - vX);
    var y = Math.round(this.pos[1] - vY);
    ctx.save();
    ctx.font = 'bold 9px "Fredoka", "Nunito", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(92, 31, 85, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeText(String(this.value), x + 8, y);
    ctx.fillStyle = '#ffd84a';
    ctx.fillText(String(this.value), x + 8, y);
    ctx.restore();
  };

  Mario.addScore = function(points, pos) {
    if (!player.score) player.score = 0;
    player.score += points;
    if (pos) {
      new Mario.ScorePopup(pos, points);
    }
  };

  // Standard world coin (floating kit coin)
  Mario.COIN_POINTS = 200;
  // Block-pop gem / jewel
  Mario.GEM_POINTS = 500;

  Mario.collectCoin = function(pos, points) {
    points = points != null ? points : Mario.COIN_POINTS;
    player.coins += 1;
    Mario.addScore(points, pos);
    if (player.coins >= 100) {
      player.coins -= 100;
      Mario.addScore(1000, pos);
    }
  };

  Mario.collectGem = function(pos) {
    Mario.collectCoin(pos, Mario.GEM_POINTS);
  };

  Mario.collectLoot = function(lootId, pos) {
    var type = (Mario.LootById && Mario.LootById[lootId]) || null;
    var points = type ? type.points : Mario.COIN_POINTS;
    if (type && type.coin) {
      player.coins += 1;
      if (player.coins >= 100) {
        player.coins -= 100;
        Mario.addScore(1000, pos);
      }
    }
    Mario.addScore(points, pos);
  };
})();
