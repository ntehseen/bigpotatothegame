// Shared tileset/sprite kits so new levels stay short.
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  var D = 'sprites/desert/';

  function desertTile(n, dw, dh) {
    var srcH = (n >= 14) ? 93 : 128;
    return Mario.scaledSprite(D + 'tile-' + n + '.png', dw || 16, dh || 16, 128, srcH);
  }

  function desertObj(file, dw, dh, sw, sh) {
    return Mario.scaledSprite(D + file, dw, dh, sw, sh);
  }

  // Classic Mario overworld (kept for reference / fallback)
  Mario.overworldKit = function() {
    return {
      scrolling: true,
      invincibility: [144, 192, 240],
      floorSprite:  new Mario.Sprite('sprites/tiles.png', [0,0],[16,16],0),
      cloudSprite:  new Mario.Sprite('sprites/tiles.png', [0,320],[48,32],0),
      wallSprite: new Mario.Sprite('sprites/tiles.png', [0, 16],[16,16],0),
      brickSprite: new Mario.Sprite('sprites/tiles.png', [16, 0], [16,16], 0),
      brickBounceSprite: new Mario.Sprite('sprites/tiles.png',[32,0],[16,16],0),
      rubbleSprite: function () {
        return new Mario.Sprite('sprites/items.png', [64,0], [8,8], 3, [0,1])
      },
      ublockSprite: new Mario.Sprite('sprites/tiles.png', [48, 0], [16,16],0),
      superShroomSprite: new Mario.Sprite('sprites/items.png', [0,0], [16,16], 0),
      fireFlowerSprite: new Mario.Sprite('sprites/items.png', [0,32], [16,16], 20, [0,1,2,3]),
      starSprite: new Mario.Sprite('sprites/items.png', [0,48], [16,16], 20, [0,1,2,3]),
      pipeLEndSprite: new Mario.Sprite('sprites/tiles.png', [0, 128], [16,16], 0),
      pipeREndSprite: new Mario.Sprite('sprites/tiles.png', [16, 128], [16,16], 0),
      pipeLMidSprite: new Mario.Sprite('sprites/tiles.png', [0, 144], [16,16], 0),
      pipeRMidSprite: new Mario.Sprite('sprites/tiles.png', [16, 144], [16,16], 0),
      pipeUpMid: new Mario.Sprite('sprites/tiles.png', [0, 144], [32,16], 0),
      pipeSideMid: new Mario.Sprite('sprites/tiles.png', [48, 128], [16,32], 0),
      pipeLeft: new Mario.Sprite('sprites/tiles.png', [32, 128], [16,32], 0),
      pipeTop: new Mario.Sprite('sprites/tiles.png', [0, 128], [32,16], 0),
      qblockSprite: new Mario.Sprite('sprites/tiles.png', [384, 0], [16,16], 8, [0,0,0,0,1,2,1]),
      bcoinSprite: function() {
        return new Mario.Sprite('sprites/items.png', [0,112],[16,16], 20,[0,1,2,3]);
      },
      cloudSprites:[
        new Mario.Sprite('sprites/tiles.png', [0,320],[16,32],0),
        new Mario.Sprite('sprites/tiles.png', [16,320],[16,32],0),
        new Mario.Sprite('sprites/tiles.png', [32,320],[16,32],0)
      ],
      hillSprites: [
        new Mario.Sprite('sprites/tiles.png', [128,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [144,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [160,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [128,144],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [144,144],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [160,144],[16,16],0)
      ],
      bushSprite: new Mario.Sprite('sprites/tiles.png', [176, 144], [48, 16], 0),
      bushSprites: [
        new Mario.Sprite('sprites/tiles.png', [176,144], [16,16],0),
        new Mario.Sprite('sprites/tiles.png', [192,144], [16,16],0),
        new Mario.Sprite('sprites/tiles.png', [208,144], [16,16],0)
      ],
      goombaSprite: function() {
        return new Mario.Sprite('sprites/enemy.png', [0, 16], [16,16], 3, [0,1]);
      },
      koopaSprite: function() {
        return new Mario.Sprite('sprites/enemy.png', [96,0], [16,32], 2, [0,1]);
      },
      flagPoleSprites: [
        new Mario.Sprite('sprites/tiles.png', [256, 128], [16,16], 0),
        new Mario.Sprite('sprites/tiles.png', [256, 144], [16,16], 0),
        new Mario.Sprite('sprites/items.png', [128, 32], [16,16], 0)
      ]
    };
  };

  // Desert overworld — sand tiles, crates, cacti, parallax dunes
  Mario.desertKit = function() {
    var crate = desertObj('crate.png', 16, 16, 101, 101);
    var stoneBlock = desertObj('stone-block.png', 16, 16, 101, 99);
    var platform = desertTile(15, 16, 12);

    return {
      scrolling: true,
      desert: true,
      background: '#87b8e0',
      backgroundImage: D + 'bg.png',
      invincibility: [144, 192, 240],

      floorSprite: desertTile(2),
      floorFillSprite: desertTile(5),
      wallSprite: desertTile(5),
      brickSprite: stoneBlock,
      brickBounceSprite: desertObj('stone-block.png', 16, 16, 101, 99),
      ublockSprite: desertTile(8),
      qblockSprite: crate,

      rubbleSprite: function () {
        return new Mario.Sprite('sprites/items.png', [64,0], [8,8], 3, [0,1]);
      },
      superShroomSprite: new Mario.Sprite('sprites/items.png', [0,0], [16,16], 0),
      fireFlowerSprite: new Mario.Sprite('sprites/items.png', [0,32], [16,16], 20, [0,1,2,3]),
      starSprite: new Mario.Sprite('sprites/items.png', [0,48], [16,16], 20, [0,1,2,3]),
      bcoinSprite: function() {
        return new Mario.Sprite('sprites/desert/gem.png', [0,0],[16,16], 12,[0,1,2,3]);
      },
      coinSprite: function() {
        return new Mario.Sprite('sprites/desert/coin.png', [0,0],[16,16], 8,[0,1,2,3]);
      },

      // Classic Mario pipes (desert wells were temporary)
      pipeLEndSprite: new Mario.Sprite('sprites/tiles.png', [0, 128], [16,16], 0),
      pipeREndSprite: new Mario.Sprite('sprites/tiles.png', [16, 128], [16,16], 0),
      pipeLMidSprite: new Mario.Sprite('sprites/tiles.png', [0, 144], [16,16], 0),
      pipeRMidSprite: new Mario.Sprite('sprites/tiles.png', [16, 144], [16,16], 0),
      pipeUpMid: new Mario.Sprite('sprites/tiles.png', [0, 144], [32,16], 0),
      pipeSideMid: new Mario.Sprite('sprites/tiles.png', [48, 128], [16,32], 0),
      pipeLeft: new Mario.Sprite('sprites/tiles.png', [32, 128], [16,32], 0),
      pipeTop: new Mario.Sprite('sprites/tiles.png', [0, 128], [32,16], 0),
      LPipeSprites:[
        new Mario.Sprite('sprites/tiles.png', [32,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [32,144],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [48,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [48,144],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [64,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [64,144],[16,16],0)
      ],

      // Scenery props (drawn as single oversized sprites)
      bushSprite: desertObj('bush-1.png', 40, 24, 145, 88),
      bushSprites: [
        desertObj('bush-1.png', 40, 24, 145, 88),
        desertObj('bush-2.png', 36, 20, 131, 74),
        desertObj('grass-1.png', 28, 14, 102, 50)
      ],
      treeSprite: desertObj('tree.png', 56, 46, 313, 260),
      stoneSprite: desertObj('stone.png', 36, 22, 124, 73),
      cactusSprite: desertObj('cactus-1.png', 22, 28, 108, 111),
      cactusSmallSprite: desertObj('cactus-2.png', 18, 12, 70, 45),
      cactusMedSprite: desertObj('cactus-3.png', 20, 24, 86, 96),
      skeletonSprite: desertObj('skeleton.png', 40, 14, 150, 51),
      signSprite: desertObj('sign-arrow.png', 18, 18, 84, 87),
      platformSprite: platform,

      // Clouds baked into BG — no-op placeholders so callers don't crash
      cloudSprite: desertObj('grass-2.png', 1, 1, 102, 50),
      cloudSprites: [
        desertObj('grass-2.png', 1, 1, 102, 50),
        desertObj('grass-2.png', 1, 1, 102, 50),
        desertObj('grass-2.png', 1, 1, 102, 50)
      ],
      hillSprites: [
        desertObj('stone.png', 36, 22, 124, 73),
        desertObj('stone.png', 36, 22, 124, 73),
        desertObj('stone.png', 36, 22, 124, 73),
        desertObj('stone.png', 36, 22, 124, 73),
        desertObj('stone.png', 36, 22, 124, 73),
        desertObj('stone.png', 36, 22, 124, 73)
      ],

      goombaSprite: function() {
        return new Mario.Sprite('sprites/enemy.png', [0, 16], [16,16], 3, [0,1]);
      },
      koopaSprite: function() {
        return new Mario.Sprite('sprites/enemy.png', [96,0], [16,32], 2, [0,1]);
      },
      flagPoleSprites: [
        desertObj('sign.png', 16, 16, 85, 88),
        desertObj('cactus-1.png', 12, 16, 108, 111),
        new Mario.Sprite('sprites/items.png', [128, 32], [16,16], 0)
      ]
    };
  };

  // Darker desert cave — sand fill tiles, dimmed dunes BG
  Mario.undergroundKit = function() {
    var kit = Mario.desertKit();
    kit.background = '#2a1810';
    kit.backgroundImage = 'sprites/desert/bg-under.png';
    kit.desert = true;
    kit.floorSprite = desertTile(5);
    kit.floorFillSprite = desertTile(8);
    kit.wallSprite = desertTile(8);
    kit.brickSprite = desertObj('stone-block.png', 16, 16, 101, 99);
    kit.ublockSprite = desertTile(10);
    kit.qblockSprite = desertObj('crate.png', 16, 16, 101, 101);
    kit.coinSprite = function() {
      return new Mario.Sprite('sprites/desert/coin.png', [0,0],[16,16], 8,[0,1,2,3]);
    };
    kit.bcoinSprite = function() {
      return new Mario.Sprite('sprites/desert/gem.png', [0,0],[16,16], 12,[0,1,2,3]);
    };
    return kit;
  };

  // Deeper ruin tones + classic Mario coins
  Mario.ruinsUndergroundKit = function() {
    var kit = Mario.undergroundKit();
    kit.background = '#1a1218';
    kit.backgroundImage = 'sprites/desert/bg-under.png';
    kit.floorSprite = desertTile(10);
    kit.floorFillSprite = desertTile(11);
    kit.wallSprite = desertTile(11);
    kit.brickSprite = desertTile(8);
    kit.ublockSprite = desertTile(5);
    kit.qblockSprite = desertObj('stone-block.png', 16, 16, 101, 99);
    kit.coinSprite = function() {
      return new Mario.Sprite('sprites/items.png', [0,96],[16,16], 6,[0,0,0,0,1,2,1]);
    };
    kit.bcoinSprite = function() {
      return new Mario.Sprite('sprites/items.png', [0,112],[16,16], 20,[0,1,2,3]);
    };
    return kit;
  };

  // Mixed collectibles — gems and coins interleaved
  Mario.vaultUndergroundKit = function() {
    var kit = Mario.undergroundKit();
    kit.background = '#201810';
    kit.backgroundImage = 'sprites/desert/bg-under.png';
    kit.floorSprite = desertTile(6);
    kit.floorFillSprite = desertTile(9);
    kit.wallSprite = desertTile(9);
    var n = 0;
    kit.coinSprite = function() {
      n += 1;
      if (n % 2 === 0) {
        return new Mario.Sprite('sprites/desert/coin.png', [0,0],[16,16], 8,[0,1,2,3]);
      }
      return new Mario.Sprite('sprites/items.png', [0,96],[16,16], 6,[0,0,0,0,1,2,1]);
    };
    kit.bcoinSprite = function() {
      return new Mario.Sprite('sprites/desert/gem.png', [0,0],[16,16], 12,[0,1,2,3]);
    };
    return kit;
  };

  Mario.undergroundThemes = [
    { id: 'cave',  label: 'CAVE',  kit: Mario.undergroundKit },
    { id: 'ruins', label: 'RUINS', kit: Mario.ruinsUndergroundKit },
    { id: 'vault', label: 'VAULT', kit: Mario.vaultUndergroundKit }
  ];

  Mario.mergeLevel = function(kit, options) {
    var out = {};
    var k;
    for (k in kit) if (kit.hasOwnProperty(k)) out[k] = kit[k];
    for (k in options) if (options.hasOwnProperty(k)) out[k] = options[k];
    return out;
  };
})();
