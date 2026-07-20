// Pipe pocket — always belongs to the world you just warped into
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  var COIN_LAYOUTS = [
    [[5,5],[6,5],[7,5],[8,5],[9,5],
     [4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],
     [4,9],[5,9],[6,9],[7,9],[8,9],[9,9],[10,9]],
    [[5,5],[7,5],[9,5],
     [4,6],[6,6],[8,6],[10,6],
     [5,8],[6,8],[7,8],[8,8],[9,8],
     [6,10],[7,10],[8,10]],
    [[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],
     [4,8],[10,8],
     [5,9],[6,9],[7,9],[8,9],[9,9],
     [6,7],[7,7],[8,7]]
  ];

  Mario.buildUnderground = function(theme) {
    theme = theme || Mario.pickUndergroundTheme();
    var kitFn = theme.kit || Mario.undergroundKit;
    var label = Mario.worldLabel();
    if (theme.label) label = theme.label;

    level = new Mario.Level(Mario.mergeLevel(kitFn(), {
      playerPos: [40, 176],
      loader: Mario.warpViaPipe,
      scrolling: false,
      world: label
    }));

    player.pos[0] = level.playerPos[0];
    player.pos[1] = level.playerPos[1];
    vX = 0;

    // Solid room shell so it never reads as an empty black void
    level.putFloor(0, 16);
    level.putWall(0, 13, 11);
    level.putWall(15, 13, 11);
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14].forEach(function(x) {
      level.putWall(x, 3, 1); // ceiling
    });
    [4,5,6,7,8,9,10].forEach(function(loc) {
      level.putWall(loc, 13, 3);
    });

    // A few blocks so the pocket has readable structure
    level.putBrick(5, 9, null);
    level.putBrick(6, 9, null);
    level.putQBlock(7, 9, new Mario.Bcoin([112, 144]));
    level.putBrick(8, 9, null);
    level.putBrick(9, 9, null);

    var coins = COIN_LAYOUTS[Math.floor(Math.random() * COIN_LAYOUTS.length)];
    // Keep only about half the pocket coins so the room stays readable
    coins.forEach(function(pos) {
      if (Math.random() > 0.5) return;
      if (Math.random() < 0.35) level.putLoot(pos[0], pos[1]);
      else level.putCoin(pos[0], pos[1]);
    });
    level.scatterLoot({ count: 2, minX: 4, maxX: 11, spacing: 4 });

    // Side exit drops you into the NEW world overworld
    level.putRealPipe(13, 11, 3, 'RIGHT', Mario.exitPipeToWorld);
    level.putPipe(15, 13, 13);

    music.overworld.pause();
    music.underground.currentTime = 0;
    music.underground.play();
  };

  // Back-compat aliases
  Mario.enterRandomUnderground = Mario.warpViaPipe;
  Mario.oneonetunnel = Mario.warpViaPipe;
  Mario.returnFromUnderground = function() {
    Mario.exitPipeToWorld();
  };
})();
