(function() {
  var Level = Mario.Level = function(options) {
    this.playerPos = options.playerPos;
    this.scrolling = options.scrolling;
    this.loader = options.loader;
    this.next = options.next; // optional next level after flag
    this.background = options.background;
    this.exit = options.exit;
    this.world = options.world || '1-1';

    this.floorSprite = options.floorSprite;
    this.floorFillSprite = options.floorFillSprite;
    this.cloudSprite = options.cloudSprite;
    this.wallSprite = options.wallSprite;
    this.brickSprite = options.brickSprite;
    this.rubbleSprite = options.rubbleSprite;
    this.brickBounceSprite = options.brickBounceSprite;
    this.ublockSprite = options.ublockSprite;
    this.superShroomSprite = options.superShroomSprite;
    this.fireFlowerSprite = options.fireFlowerSprite;
    this.starSprite = options.starSprite;
    this.coinSprite = options.coinSprite;
    this.bcoinSprite = options.bcoinSprite;
    this.goombaSprite = options.goombaSprite;
    this.koopaSprite = options.koopaSprite;

    //prop pipe sprites, to be phased out
    this.pipeLEndSprite = options.pipeLEndSprite;
    this.pipeREndSprite = options.pipeREndSprite;
    this.pipeLMidSprite = options.pipeLMidSprite;
    this.pipeRMidSprite = options.pipeRMidSprite;

    //real pipe sprites, use these.
    this.pipeUpMid = options.pipeUpMid;
    this.pipeSideMid = options.pipeSideMid;
    this.pipeLeft = options.pipeLeft;
    this.pipeTop = options.pipeTop;

    this.flagpoleSprites = options.flagPoleSprites;

    this.LPipeSprites = options.LPipeSprites;
    this.cloudSprites = options.cloudSprites;
    this.hillSprites = options.hillSprites;
    this.bushSprite = options.bushSprite;
    this.bushSprites = options.bushSprites;
    this.qblockSprite = options.qblockSprite;

    // Desert scenery
    this.desert = options.desert;
    this.backgroundImage = options.backgroundImage;
    this.treeSprite = options.treeSprite;
    this.stoneSprite = options.stoneSprite;
    this.cactusSprite = options.cactusSprite;
    this.cactusSmallSprite = options.cactusSmallSprite;
    this.cactusMedSprite = options.cactusMedSprite;
    this.skeletonSprite = options.skeletonSprite;
    this.signSprite = options.signSprite;

    this.invincibility = options.invincibility;
    this.world = options.world || '1-1';
    this.statics = [];
    this.scenery = [];
    this.blocks = [];
    this.enemies = [];
    this.items = [];
    this.pipes = [];

    for (var i = 0; i < 15; i++) {
      this.statics[i] = [];
      this.scenery[i] = [];
      this.blocks[i] = [];
    }

  };

  Level.prototype.putFloor = function(start, end) {
    var top = this.floorSprite;
    var fill = this.floorFillSprite || this.floorSprite;
    for (var i = start; i < end; i++) {
      this.statics[13][i] = new Mario.Floor([16*i,208], top);
      this.statics[14][i] = new Mario.Floor([16*i,224], fill);
    }
  };

  Level.prototype.putGoomba = function(x, y) {
    this.enemies.push(new Mario.Goomba([16*x, 16*y], this.goombaSprite() ));
  };

  Level.prototype.putKoopa = function(x, y) {
    this.enemies.push(new Mario.Koopa([16*x, 16*y], this.koopaSprite(), false));
  };

  Level.prototype.putMob = function(x, y, kind) {
    kind = kind || 'zombie';
    var meta = (Mario.EnemyAnims && Mario.EnemyAnims[kind]) || {};
    var hb = meta.hitbox || [4, 6, 16, 24];
    // Plant feet on the top of the tile below (same convention as goomba y=12 on floor 13)
    var posY = (y + 1) * 16 - hb[1] - hb[3];
    this.enemies.push(new Mario.Mob([16 * x, posY], kind));
  };

  // Sprinkle craftpix mobs along the course; kinds lean on the active world theme
  Level.prototype.scatterMobs = function(spots) {
    var worldId = (Mario.currentWorld && Mario.currentWorld.id) || 'desert';
    var pool = {
      desert: ['satyr', 'minotaur', 'zombie'],
      graveyard: ['wraith', 'zombie', 'wraith'],
      market: ['zombie', 'satyr', 'minotaur'],
      field: ['satyr', 'minotaur', 'zombie'],
      cave: ['wraith', 'zombie', 'satyr']
    }[worldId] || ['zombie', 'satyr', 'wraith', 'minotaur'];

    spots = spots || [];
    var lastX = -999;
    for (var i = 0; i < spots.length; i++) {
      // Keep density low — most candidate spots stay empty
      if (Math.random() > 0.38) continue;
      var s = spots[i];
      var sx = s[0];
      // Prefer breathing room between craftpix mobs
      if (sx - lastX < 18) continue;
      var kind = pool[Math.floor(Math.random() * pool.length)];
      this.putMob(sx, s[1] != null ? s[1] : 12, kind);
      lastX = sx;
    }
  };

  Level.prototype.putWall = function(x, y, height) {
    //y is the bottom of the wall in this case.
    for (var i = y-height; i < y; i++) {
      this.statics[i][x] = new Mario.Floor([16*x, 16*i], this.wallSprite);
    }
  };

  // Decorative well/pipe. Pass destination to make it enterable (same look).
  Level.prototype.putPipe = function(x, y, height, destination) {
    for (var i = y - height; i < y; i++) {
      if (i === y - height) {
        this.statics[i][x] = new Mario.Floor([16*x, 16*i], this.pipeLEndSprite);
        this.statics[i][x+1] = new Mario.Floor([16*x+16, 16*i], this.pipeREndSprite);
      } else {
        this.statics[i][x] = new Mario.Floor([16*x, 16*i], this.pipeLMidSprite);
        this.statics[i][x+1] = new Mario.Floor([16*x+16, 16*i], this.pipeRMidSprite);
      }
    }
    if (destination) {
      // Invisible trigger only — statics already draw + collide like other wells
      var warpX = x;
      var warpY = y;
      var warpH = height;
      var dest = destination;
      this.pipes.push(new Mario.Pipe({
        pos: [16 * x, 16 * (y - height)],
        length: height,
        direction: 'DOWN',
        destination: function() {
          if (Mario.rememberPipeReturn) {
            Mario.rememberPipeReturn(warpX, warpY, warpH);
          }
          if (typeof dest === 'function') dest();
        },
        noRender: true,
        solid: false
      }));
    }
  };

  // Pick `count` random wells from a list and place them; `count` of them warp.
  // wells: [[x, y, height], ...]  — y is the floor row (usually 13)
  Level.prototype.putRandomWarpWells = function(wells, destination, count) {
    var i, j, t, picks, key, warped;
    var order = wells.slice();
    for (i = order.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = order[i]; order[i] = order[j]; order[j] = t;
    }
    count = Math.max(1, Math.min(count || 1, order.length));
    picks = order.slice(0, count);
    warped = {};
    for (i = 0; i < picks.length; i++) {
      warped[picks[i][0] + ',' + picks[i][1] + ',' + picks[i][2]] = true;
    }
    for (i = 0; i < wells.length; i++) {
      key = wells[i][0] + ',' + wells[i][1] + ',' + wells[i][2];
      this.putPipe(wells[i][0], wells[i][1], wells[i][2],
        warped[key] ? destination : undefined);
    }
  };

  //sometimes, pipes don't go straight up and down.
  Level.prototype.putLeftPipe = function(x,y) {
    this.statics[y][x] = new Mario.Floor([16*x, 16*y], this.LPipeSprites[0]);
    this.statics[y+1][x] = new Mario.Floor([16*x,16*(y+1)], this.LPipeSprites[1]);
    this.statics[y][x+1] = new Mario.Floor([16*(x+1),16*y], this.LPipeSprites[2]);
    this.statics[y+1][x+1] = new Mario.Floor([16*(x+1),16*(y+1)], this.LPipeSprites[3]);
    this.statics[y][x+2] = new Mario.Floor([16*(x+2),16*y], this.LPipeSprites[4]);
    this.statics[y+1][x+2] = new Mario.Floor([16*(x+2),16*(y+1)], this.LPipeSprites[5]);
  };

  Level.prototype.putCoin = function(x, y) {
    this.items.push(new Mario.Coin(
      [x*16, y*16],
      this.coinSprite()
    ));
  };

  Level.prototype.putLoot = function(x, y, typeId) {
    var type = typeId ? Mario.LootById[typeId] : Mario.pickLootType();
    this.items.push(new Mario.Loot([x * 16, y * 16], type));
  };

  // Sprinkle craftpix loot across open air above floors (weighted rare jewels)
  Level.prototype.scatterLoot = function(opts) {
    opts = opts || {};
    var count = opts.count != null ? opts.count : (6 + Math.floor(Math.random() * 4));
    var minX = opts.minX != null ? opts.minX : 8;
    var maxX = opts.maxX != null ? opts.maxX : 190;
    var spacing = opts.spacing != null ? opts.spacing : 14; // tiles between pickups
    var tries = count * 12;
    var placed = 0;
    var used = {};
    var placedXY = [];

    while (placed < count && tries-- > 0) {
      var x = minX + Math.floor(Math.random() * (maxX - minX + 1));
      var y = 5 + Math.floor(Math.random() * 6); // rows 5–10 (less sky clutter)
      var key = x + ',' + y;
      if (used[key]) continue;
      if (this.statics[y] && this.statics[y][x]) continue;
      if (this.blocks[y] && this.blocks[y][x]) continue;

      var tooClose = false;
      for (var i = 0; i < placedXY.length; i++) {
        var dx = placedXY[i][0] - x;
        var dy = placedXY[i][1] - y;
        if (dx * dx + dy * dy < spacing * spacing) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      // Prefer spots with ground somewhere below
      var grounded = false;
      var gy;
      for (gy = y + 1; gy <= 13; gy++) {
        if ((this.statics[gy] && this.statics[gy][x]) || (this.blocks[gy] && this.blocks[gy][x])) {
          grounded = true;
          break;
        }
      }
      if (!grounded) continue;
      used[key] = true;
      placedXY.push([x, y]);
      this.putLoot(x, y);
      placed++;
    }
    return placed;
  };

  Level.prototype.putCloud = function(x, y) {
    if (this.desert) return; // clouds live in the desert BG art
    this.scenery[y][x] = new Mario.Prop([x*16, y*16], this.cloudSprite);
  };

  Level.prototype.putQBlock = function(x, y, item) {
    this.blocks[y][x] = new Mario.Block( {
      pos: [x*16, y*16],
      item: item,
      sprite: this.qblockSprite,
      usedSprite: this.ublockSprite
    });
  };

  Level.prototype.putBrick = function(x,y,item) {
    this.blocks[y][x] = new Mario.Block({
      pos: [x*16, y*16],
      item: item,
      sprite: this.brickSprite,
      bounceSprite: this.brickBounceSprite,
      usedSprite: this.ublockSprite,
      breakable: !item
    });
  };

  Level.prototype._placeProp = function(x, y, sprite) {
    if (!sprite) return;
    var h = sprite.size[1];
    // Sit the prop on the top of the tile row (y is usually 12 for ground scenery)
    var px = x * 16;
    var py = (y + 1) * 16 - h;
    this.scenery[y][x] = new Mario.Prop([px, py], sprite);
  };

  Level.prototype.putBigHill = function(x, y) {
    if (this.desert) {
      this._placeProp(x, y, this.treeSprite || this.stoneSprite);
      return;
    }
    var px = x*16, py = y*16;
    this.scenery[y][x] = new Mario.Prop([px, py], this.hillSprites[0]);
    this.scenery[y][x+1] = new Mario.Prop([px+16, py], this.hillSprites[3]);
    this.scenery[y-1][x+1] = new Mario.Prop([px+16, py-16], this.hillSprites[0]);
    this.scenery[y][x+2] = new Mario.Prop([px+32, py], this.hillSprites[4]);
    this.scenery[y-1][x+2] = new Mario.Prop([px+32, py-16], this.hillSprites[3]);
    this.scenery[y-2][x+2] = new Mario.Prop([px+32, py-32], this.hillSprites[1]);
    this.scenery[y][x+3] = new Mario.Prop([px+48, py], this.hillSprites[5]);
    this.scenery[y-1][x+3] = new Mario.Prop([px+48, py-16], this.hillSprites[2]);
    this.scenery[y][x+4] = new Mario.Prop([px+64, py], this.hillSprites[2]);
  };

  Level.prototype.putBush = function(x, y) {
    if (this.desert) {
      this._placeProp(x, y, this.bushSprite);
      return;
    }
    this.scenery[y][x] = new Mario.Prop([x*16, y*16], this.bushSprite);
  };

  Level.prototype.putThreeBush = function(x,y) {
    if (this.desert) {
      this._placeProp(x, y, this.cactusSprite || this.bushSprites[0]);
      this._placeProp(x + 2, y, this.cactusMedSprite || this.bushSprites[1]);
      return;
    }
    px = x*16;
    py = y*16;
    this.scenery[y][x] = new Mario.Prop([px, py], this.bushSprites[0]);
    this.scenery[y][x+1] = new Mario.Prop([px+16, py], this.bushSprites[1]);
    this.scenery[y][x+2] = new Mario.Prop([px+32, py], this.bushSprites[1]);
    this.scenery[y][x+3] = new Mario.Prop([px+48, py], this.bushSprites[1]);
    this.scenery[y][x+4] = new Mario.Prop([px+64, py], this.bushSprites[2]);
  };

  Level.prototype.putTwoBush = function(x,y) {
    if (this.desert) {
      this._placeProp(x, y, this.cactusSmallSprite || this.bushSprites[1]);
      this._placeProp(x + 2, y, this.bushSprites[1] || this.bushSprite);
      return;
    }
    px = x*16;
    py = y*16;
    this.scenery[y][x] = new Mario.Prop([px, py], this.bushSprites[0]);
    this.scenery[y][x+1] = new Mario.Prop([px+16, py], this.bushSprites[1]);
    this.scenery[y][x+2] = new Mario.Prop([px+32, py], this.bushSprites[1]);
    this.scenery[y][x+3] = new Mario.Prop([px+48, py], this.bushSprites[2]);
  };

  Level.prototype.putSmallHill = function(x, y) {
    if (this.desert) {
      this._placeProp(x, y, this.stoneSprite || this.skeletonSprite);
      return;
    }
    var px = x*16, py = y*16;
    this.scenery[y][x] = new Mario.Prop([px, py], this.hillSprites[0]);
    this.scenery[y][x+1] = new Mario.Prop([px+16, py], this.hillSprites[3]);
    this.scenery[y-1][x+1] = new Mario.Prop([px+16, py-16], this.hillSprites[1]);
    this.scenery[y][x+2] = new Mario.Prop([px+32, py], this.hillSprites[2]);
  };

  Level.prototype.putTwoCloud = function(x,y) {
    if (this.desert) return;
    px = x*16;
    py = y*16;
    this.scenery[y][x] = new Mario.Prop([px, py], this.cloudSprites[0]);
    this.scenery[y][x+1] = new Mario.Prop([px+16, py], this.cloudSprites[1]);
    this.scenery[y][x+2] = new Mario.Prop([px+32, py], this.cloudSprites[1]);
    this.scenery[y][x+3] = new Mario.Prop([px+48, py], this.cloudSprites[2]);
  };

  Level.prototype.putThreeCloud = function(x,y) {
    if (this.desert) return;
    px = x*16;
    py = y*16;
    this.scenery[y][x] = new Mario.Prop([px, py], this.cloudSprites[0]);
    this.scenery[y][x+1] = new Mario.Prop([px+16, py], this.cloudSprites[1]);
    this.scenery[y][x+2] = new Mario.Prop([px+32, py], this.cloudSprites[1]);
    this.scenery[y][x+3] = new Mario.Prop([px+48, py], this.cloudSprites[1]);
    this.scenery[y][x+4] = new Mario.Prop([px+64, py], this.cloudSprites[2]);
  };

  Level.prototype.putRealPipe = function(x, y, length, direction, destination) {
    px = x*16;
    py = y*16;
    this.pipes.push(new Mario.Pipe({
      pos: [px, py],
      length: length,
      direction: direction,
      destination: destination
    }));
  }

  Level.prototype.putFlagpole = function(x) {
    // Base block + tall pole shaft. Place this 1–2 tiles after a stair landing
    // so jumps from high ground can still reach the pole.
    this.statics[12][x] = new Mario.Floor([16 * x, 192], this.wallSprite);
    for (var i = 3; i < 12; i++) {
      this.scenery[i][x] = new Mario.Prop([16 * x, 16 * i], this.flagpoleSprites[1]);
    }
    this.scenery[2][x] = new Mario.Prop([16 * x, 32], this.flagpoleSprites[0]);
    this.items.push(new Mario.Flag(16 * x));
  }
})();
