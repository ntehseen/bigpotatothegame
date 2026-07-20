var onetwo = Mario.onetwo = function() {
  // Course B — pit / pipe run with active world's underground look
  Mario.ensureWorld();
  level = new Mario.Level(Mario.mergeLevel(Mario.activeUndergroundKit(), {
    playerPos: [56,192],
    loader: Mario.onetwo,
    next: Mario.onethree,
    exit: 186,
    world: Mario.worldLabel()
  }));

  player.pos[0] = level.playerPos[0];
  vX = 0;
  resetLevelTimer();
  scorePopups = [];
  enemyProjectiles = [];

  // Floor with several pits
  [[0, 40], [44, 72], [76, 110], [114, 148], [152, 204]].forEach(function(loc) {
    level.putFloor(loc[0], loc[1]);
  });
  player.plantFeet(208);

  // Ceiling / upper walls for underground feel
  for (var x = 0; x < 200; x++) {
    level.putWall(x, 2, 2);
  }

  // Early pipe corridor — some warp to another world
  level.putRandomWarpWells([
    [12, 13, 2],
    [18, 13, 3],
    [48, 13, 2],
    [88, 13, 4],
    [118, 13, 3]
  ], Mario.warpViaPipe, 1 + Math.floor(Math.random() * 2));
  level.putQBlock(22, 9, new Mario.Bcoin([352, 144]));
  level.putBrick(23, 9, null);
  level.putBrick(24, 9, null);
  level.putQBlock(25, 9, new Mario.Mushroom([400, 144]));
  level.putBrick(26, 9, null);

  // Coin shelf
  level.putBrick(32, 5, null);
  level.putBrick(33, 5, null);
  level.putQBlock(34, 5, new Mario.Bcoin([544, 80]));
  level.putBrick(35, 5, null);
  level.putBrick(36, 5, null);

  // After first pit
  level.putGoomba(52, 12);
  level.putKoopa(58, 11);
  level.scatterMobs([
    [30, 12], [70, 12], [98, 12], [140, 12], [155, 12]
  ]);

  level.putBrick(62, 9, null);
  level.putQBlock(63, 9, new Mario.Bcoin([1008, 144]));
  level.putBrick(64, 9, null);
  level.putBrick(65, 9, new Mario.Star([1040, 144]));

  // Mid stairs down into a pit approach
  level.putWall(80, 13, 1);
  level.putWall(81, 13, 2);
  level.putWall(82, 13, 3);
  level.putWall(83, 13, 4);

  level.putGoomba(96, 12);

  // High brick runway
  for (var i = 102; i <= 112; i++) {
    level.putBrick(i, 5, null);
  }
  level.putQBlock(107, 5, new Mario.Bcoin([1712, 80]));

  // Second pit section
  level.putQBlock(124, 9, new Mario.Mushroom([1984, 144]));
  level.putBrick(125, 9, null);
  level.putBrick(126, 9, null);
  level.putKoopa(133, 11);

  // Pyramid stairs + landing, flag immediately after for high grabs
  level.putWall(160, 13, 1);
  level.putWall(161, 13, 2);
  level.putWall(162, 13, 3);
  level.putWall(163, 13, 4);
  level.putWall(164, 13, 5);
  level.putWall(165, 13, 6);
  level.putWall(166, 13, 7);
  level.putWall(167, 13, 8);
  level.putWall(168, 13, 8);
  level.putWall(169, 13, 8); // landing
  level.putFlagpole(171);

  // Loose enemies near start
  level.putGoomba(28, 12);
  level.scatterLoot({ count: 6, minX: 16, maxX: 160, spacing: 16 });

  music.overworld.pause();
  music.underground.currentTime = 0;
  music.underground.play();
};
