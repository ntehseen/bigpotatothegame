// Themed world kits built from Craftpix packs under sprites/worlds/
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  function marioPipes() {
    return {
      pipeLEndSprite: new Mario.Sprite('sprites/tiles.png', [0, 128], [16,16], 0),
      pipeREndSprite: new Mario.Sprite('sprites/tiles.png', [16, 128], [16,16], 0),
      pipeLMidSprite: new Mario.Sprite('sprites/tiles.png', [0, 144], [16,16], 0),
      pipeRMidSprite: new Mario.Sprite('sprites/tiles.png', [16, 144], [16,16], 0),
      pipeUpMid: new Mario.Sprite('sprites/tiles.png', [0, 144], [32,16], 0),
      pipeSideMid: new Mario.Sprite('sprites/tiles.png', [48, 128], [16,32], 0),
      pipeLeft: new Mario.Sprite('sprites/tiles.png', [32, 128], [16,32], 0),
      pipeTop: new Mario.Sprite('sprites/tiles.png', [0, 128], [32,16], 0),
      LPipeSprites: [
        new Mario.Sprite('sprites/tiles.png', [32,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [32,144],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [48,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [48,144],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [64,128],[16,16],0),
        new Mario.Sprite('sprites/tiles.png', [64,144],[16,16],0)
      ]
    };
  }

  function coinAnim(path, frames) {
    frames = frames || [0, 1, 2, 3];
    return function() {
      return new Mario.Sprite(path, [0, 0], [16, 16], 8, frames);
    };
  }

  function bcoinAnim(path, frames) {
    frames = frames || [0, 1, 2, 3];
    return function() {
      return new Mario.Sprite(path, [0, 0], [16, 16], 12, frames);
    };
  }

  // Generic scenic pack kit (graveyard / market / field / cave)
  Mario.packKit = function(opts) {
    var B = opts.base;
    var bg = opts.background || '#405070';
    var coinPath = B + (opts.coinFile || 'coin.png');
    var coinFrames = opts.coinFrames || [0, 1, 2, 3, 4, 5];
    var gemPath = B + (opts.gemFile || 'coin.png');
    var gemFrames = opts.gemFrames || coinFrames;

    function tile(n) {
      return Mario.scaledSprite(B + 'tile-' + n + '.png', 16, 16, 128, 128);
    }
    function prop(file, dw, dh, sw, sh) {
      return Mario.scaledSprite(B + file, dw, dh, sw || 128, sh || 128);
    }

    var pipes = marioPipes();
    var kit = {
      scrolling: true,
      desert: true, // prop-based scenery (hills/clouds skipped)
      scenicProps: true,
      background: bg,
      backgroundImage: B + 'bg.png',
      invincibility: [144, 192, 240],

      floorSprite: tile(opts.floorTile || 1),
      floorFillSprite: tile(opts.fillTile || 3),
      wallSprite: tile(opts.wallTile || 3),
      brickSprite: prop('stone-block.png', 16, 16, opts.blockSrc || 128, opts.blockSrc || 128),
      brickBounceSprite: prop('stone-block.png', 16, 16, opts.blockSrc || 128, opts.blockSrc || 128),
      ublockSprite: tile(opts.ublockTile || 5),
      qblockSprite: prop('crate.png', 16, 16, opts.crateSrc || 128, opts.crateSrc || 128),

      rubbleSprite: function() {
        return new Mario.Sprite('sprites/items.png', [64, 0], [8, 8], 3, [0, 1]);
      },
      superShroomSprite: new Mario.Sprite('sprites/items.png', [0, 0], [16, 16], 0),
      fireFlowerSprite: new Mario.Sprite('sprites/items.png', [0, 32], [16, 16], 20, [0, 1, 2, 3]),
      starSprite: new Mario.Sprite('sprites/items.png', [0, 48], [16, 16], 20, [0, 1, 2, 3]),

      coinSprite: coinAnim(coinPath, coinFrames),
      bcoinSprite: bcoinAnim(gemPath, gemFrames),

      bushSprite: prop('bush-1.png', 36, 24, opts.bush1W || 128, opts.bush1H || 128),
      bushSprites: [
        prop('bush-1.png', 36, 24, opts.bush1W || 128, opts.bush1H || 128),
        prop('bush-2.png', 32, 20, opts.bush2W || 128, opts.bush2H || 128),
        prop('bush-1.png', 28, 16, opts.bush1W || 128, opts.bush1H || 128)
      ],
      treeSprite: prop('tree.png', 52, 44, opts.treeW || 256, opts.treeH || 256),
      stoneSprite: prop('stone.png', 28, 22, opts.stoneW || 128, opts.stoneH || 128),
      cactusSprite: prop('cactus-1.png', 22, 28, opts.c1W || 128, opts.c1H || 128),
      cactusSmallSprite: prop('cactus-2.png', 18, 20, opts.c2W || 128, opts.c2H || 128),
      cactusMedSprite: prop('cactus-3.png', 18, 26, opts.c3W || 128, opts.c3H || 128),
      skeletonSprite: prop('skeleton.png', 36, 20, opts.skelW || 128, opts.skelH || 128),
      signSprite: prop('sign.png', 18, 18, opts.signW || 128, opts.signH || 128),

      cloudSprite: prop('bush-2.png', 1, 1, 128, 128),
      cloudSprites: [
        prop('bush-2.png', 1, 1, 128, 128),
        prop('bush-2.png', 1, 1, 128, 128),
        prop('bush-2.png', 1, 1, 128, 128)
      ],
      hillSprites: [
        prop('stone.png', 28, 22, 128, 128),
        prop('stone.png', 28, 22, 128, 128),
        prop('stone.png', 28, 22, 128, 128),
        prop('stone.png', 28, 22, 128, 128),
        prop('stone.png', 28, 22, 128, 128),
        prop('stone.png', 28, 22, 128, 128)
      ],

      goombaSprite: function() {
        return new Mario.Sprite('sprites/enemy.png', [0, 16], [16, 16], 3, [0, 1]);
      },
      koopaSprite: function() {
        return new Mario.Sprite('sprites/enemy.png', [96, 0], [16, 32], 2, [0, 1]);
      },
      flagPoleSprites: [
        prop('sign.png', 14, 16, opts.signW || 128, opts.signH || 128),
        prop('cactus-1.png', 12, 16, opts.c1W || 128, opts.c1H || 128),
        new Mario.Sprite('sprites/items.png', [128, 32], [16, 16], 0)
      ]
    };

    var k;
    for (k in pipes) if (pipes.hasOwnProperty(k)) kit[k] = pipes[k];
    return kit;
  };

  Mario.graveyardKit = function() {
    return Mario.packKit({
      base: 'sprites/worlds/graveyard/',
      background: '#2a2438',
      floorTile: 1, fillTile: 3, wallTile: 3, ublockTile: 6,
      coinFrames: [0, 1, 2, 3, 4, 5],
      gemFile: 'gem.png', gemFrames: [0, 1, 2, 3],
      treeW: 256, treeH: 232, c3W: 128, c3H: 256, crateSrc: 129
    });
  };

  Mario.graveyardUnderKit = function() {
    var kit = Mario.graveyardKit();
    kit.background = '#1c1828';
    kit.backgroundImage = 'sprites/worlds/graveyard/bg-under.png';
    kit.floorSprite = Mario.scaledSprite('sprites/worlds/graveyard/tile-1.png', 16, 16, 128, 128);
    kit.floorFillSprite = Mario.scaledSprite('sprites/worlds/graveyard/tile-3.png', 16, 16, 128, 128);
    kit.wallSprite = Mario.scaledSprite('sprites/worlds/graveyard/tile-6.png', 16, 16, 128, 128);
    kit.brickSprite = Mario.scaledSprite('sprites/worlds/graveyard/tile-6.png', 16, 16, 128, 128);
    kit.ublockSprite = Mario.scaledSprite('sprites/worlds/graveyard/tile-7.png', 16, 16, 128, 128);
    return kit;
  };

  Mario.marketKit = function() {
    return Mario.packKit({
      base: 'sprites/worlds/market/',
      background: '#7eb0d0',
      floorTile: 1, fillTile: 3, wallTile: 3, ublockTile: 5,
      coinFrames: [0, 1, 2, 3, 4, 5],
      gemFile: 'gem.png', gemFrames: [0, 1, 2, 3],
      bush1H: 64, bush2H: 64,
      treeW: 128, treeH: 128,
      c1W: 256, c1H: 256, c2W: 160, c2H: 160,
      signW: 160, signH: 160,
      skelW: 256, skelH: 256,
      crateSrc: 256, blockSrc: 256
    });
  };

  Mario.marketUnderKit = function() {
    var kit = Mario.marketKit();
    kit.background = '#2a2018';
    kit.backgroundImage = 'sprites/worlds/market/bg-under.png';
    kit.floorSprite = Mario.scaledSprite('sprites/worlds/market/tile-1.png', 16, 16, 128, 128);
    kit.floorFillSprite = Mario.scaledSprite('sprites/worlds/market/tile-3.png', 16, 16, 128, 128);
    kit.wallSprite = Mario.scaledSprite('sprites/worlds/market/tile-4.png', 16, 16, 128, 128);
    kit.brickSprite = Mario.scaledSprite('sprites/worlds/market/tile-5.png', 16, 16, 128, 128);
    kit.ublockSprite = Mario.scaledSprite('sprites/worlds/market/tile-6.png', 16, 16, 128, 128);
    return kit;
  };

  Mario.fieldKit = function() {
    return Mario.packKit({
      base: 'sprites/worlds/field/',
      background: '#88b868',
      floorTile: 1, fillTile: 3, wallTile: 3, ublockTile: 5,
      coinFrames: [0, 1, 2, 3, 4, 5],
      gemFile: 'gem.png', gemFrames: [0, 1, 2, 3],
      treeW: 256, treeH: 256,
      c1W: 256, c1H: 256,
      signW: 160, signH: 160,
      skelW: 256, skelH: 256,
      blockSrc: 256
    });
  };

  Mario.fieldUnderKit = function() {
    var kit = Mario.fieldKit();
    kit.background = '#1e2814';
    kit.backgroundImage = 'sprites/worlds/field/bg-under.png';
    kit.floorSprite = Mario.scaledSprite('sprites/worlds/field/tile-1.png', 16, 16, 128, 128);
    kit.floorFillSprite = Mario.scaledSprite('sprites/worlds/field/tile-3.png', 16, 16, 128, 128);
    kit.wallSprite = Mario.scaledSprite('sprites/worlds/field/tile-4.png', 16, 16, 128, 128);
    kit.brickSprite = Mario.scaledSprite('sprites/worlds/field/tile-5.png', 16, 16, 128, 128);
    kit.ublockSprite = Mario.scaledSprite('sprites/worlds/field/tile-6.png', 16, 16, 128, 128);
    return kit;
  };

  Mario.caveWorldKit = function() {
    return Mario.packKit({
      base: 'sprites/worlds/cave/',
      background: '#4a6a88',
      floorTile: 12, fillTile: 6, wallTile: 6, ublockTile: 4,
      coinFrames: [0, 1, 2, 3],
      gemFile: 'gem.png', gemFrames: [0, 1, 2, 3],
      treeW: 192, treeH: 128,
      bush1W: 200, bush1H: 113, bush2W: 200, bush2H: 113,
      c1W: 96, c1H: 96, c2W: 160, c2H: 106
    });
  };

  Mario.caveUnderKit = function() {
    var kit = Mario.caveWorldKit();
    kit.background = '#141820';
    kit.backgroundImage = 'sprites/worlds/cave/bg-under.png';
    kit.floorSprite = Mario.scaledSprite('sprites/worlds/cave/tile-12.png', 16, 16, 128, 128);
    kit.floorFillSprite = Mario.scaledSprite('sprites/worlds/cave/tile-6.png', 16, 16, 128, 128);
    kit.wallSprite = Mario.scaledSprite('sprites/worlds/cave/tile-4.png', 16, 16, 128, 128);
    kit.brickSprite = Mario.scaledSprite('sprites/worlds/cave/tile-9.png', 16, 16, 128, 128);
    kit.ublockSprite = Mario.scaledSprite('sprites/worlds/cave/tile-5.png', 16, 16, 128, 128);
    return kit;
  };
})();
