// Craftpix loot pickups — each type has its own point value
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  // Weighted pool: common currency → rare jewels
  Mario.LootTypes = [
    { id: 'coins',    points: 100,  coin: true,  weight: 28, file: 'sprites/loot/coins.png' },
    { id: 'goldbar',  points: 200,  coin: true,  weight: 22, file: 'sprites/loot/goldbar.png' },
    { id: 'ring',     points: 300,  coin: true,  weight: 16, file: 'sprites/loot/ring.png' },
    { id: 'amulet',   points: 400,  coin: false, weight: 12, file: 'sprites/loot/amulet.png' },
    { id: 'ruby',     points: 500,  coin: false, weight: 9,  file: 'sprites/loot/ruby.png' },
    { id: 'garnet',   points: 600,  coin: false, weight: 6,  file: 'sprites/loot/garnet.png' },
    { id: 'ember',    points: 700,  coin: false, weight: 4,  file: 'sprites/loot/ember.png' },
    { id: 'orb',      points: 800,  coin: false, weight: 2,  file: 'sprites/loot/orb.png' },
    { id: 'sapphire', points: 1000, coin: false, weight: 1,  file: 'sprites/loot/sapphire.png' },
    { id: 'azure',    points: 1200, coin: false, weight: 1,  file: 'sprites/loot/azure.png' }
  ];

  Mario.LootById = {};
  Mario.LootTypes.forEach(function(t) { Mario.LootById[t.id] = t; });

  Mario.pickLootType = function() {
    var total = 0;
    var i;
    for (i = 0; i < Mario.LootTypes.length; i++) total += Mario.LootTypes[i].weight;
    var roll = Math.random() * total;
    for (i = 0; i < Mario.LootTypes.length; i++) {
      roll -= Mario.LootTypes[i].weight;
      if (roll <= 0) return Mario.LootTypes[i];
    }
    return Mario.LootTypes[0];
  };

  Mario.lootSprite = function(type) {
    type = typeof type === 'string' ? Mario.LootById[type] : type;
    type = type || Mario.LootTypes[0];
    var sprite = new Mario.Sprite(type.file, [0, 0], [16, 16], 8, [0, 1, 2, 3]);
    sprite.smooth = true;
    return sprite;
  };

  var Loot = Mario.Loot = function(pos, type) {
    type = typeof type === 'string' ? Mario.LootById[type] : type;
    type = type || Mario.pickLootType();
    this.lootId = type.id;
    this.points = type.points;
    this.countsAsCoin = !!type.coin;
    Mario.Entity.call(this, {
      pos: pos.slice ? pos.slice() : [pos[0], pos[1]],
      sprite: Mario.lootSprite(type),
      hitbox: [1, 1, 14, 14]
    });
    this.idx = level.items.length;
    this.bob = Math.random() * Math.PI * 2;
    this.baseY = this.pos[1];
  };

  Mario.Util.inherits(Loot, Mario.Entity);

  Loot.prototype.render = function(ctx, vX, vY) {
    this.sprite.render(ctx, this.pos[0], this.pos[1], vX, vY);
  };

  Loot.prototype.update = function(dt) {
    this.bob += dt * 6;
    this.pos[1] = this.baseY + Math.sin(this.bob) * 1.5;
    this.sprite.update(dt);
  };

  Loot.prototype.checkCollisions = function() {
    if (!player || player.dying) return;
    var hpos1 = [this.pos[0] + this.hitbox[0], this.pos[1] + this.hitbox[1]];
    var hpos2 = [player.pos[0] + player.hitbox[0], player.pos[1] + player.hitbox[1]];
    if (hpos1[0] > hpos2[0] + player.hitbox[2] || hpos1[0] + this.hitbox[2] < hpos2[0]) return;
    if (hpos1[1] > hpos2[1] + player.hitbox[3] || hpos1[1] + this.hitbox[3] < hpos2[1]) return;
    this.collect();
  };

  Loot.prototype.collect = function() {
    if (sounds && sounds.coin) {
      sounds.coin.currentTime = 0.05;
      sounds.coin.play();
    }
    Mario.collectLoot(this.lootId, this.pos);
    delete level.items[this.idx];
  };
})();
