var onethree = Mario.onethree = function() {
  // Course C — athletic platforms; kit from active world
  Mario.ensureWorld();
  level = new Mario.Level(Mario.mergeLevel(Mario.activeOverworldKit(), {
    playerPos: [56,192],
    loader: Mario.onethree,
    next: Mario.oneone,
    exit: 174,
    world: Mario.worldLabel()
  }));

  player.pos[0] = level.playerPos[0];
  vX = 0;
  resetLevelTimer();
  scorePopups = [];
  enemyProjectiles = [];

  [[0, 30], [34, 58], [62, 95], [100, 130], [136, 196]].forEach(function(loc) {
    level.putFloor(loc[0], loc[1]);
  });
  player.plantFeet(208);

  // Scenery
  [[8,3],[40,2],[78,3],[120,2],[160,3]].forEach(function(c) {
    level.putCloud(c[0], c[1]);
  });
  [[20,2],[90,2],[150,2]].forEach(function(c) {
    level.putTwoCloud(c[0], c[1]);
  });
  [0, 64, 128].forEach(function(h) { level.putBigHill(h, 12); });
  [24, 88, 152].forEach(function(h) { level.putSmallHill(h, 12); });
  [12, 70, 140].forEach(function(b) { level.putBush(b, 12); });
  [32, 100].forEach(function(b) { level.putThreeBush(b, 12); });

  // Opening blocks
  level.putQBlock(14, 9, new Mario.Bcoin([224, 144]));
  level.putBrick(15, 9, null);
  level.putQBlock(16, 9, new Mario.Mushroom([256, 144]));
  level.putBrick(17, 9, null);

  level.putRandomWarpWells([
    [22, 13, 2],
    [66, 13, 3]
  ], Mario.warpViaPipe, 1);
  level.putGoomba(26, 12);
  level.putKoopa(28, 11);
  level.scatterMobs([
    [56, 12], [108, 12], [135, 12]
  ]);

  // Floating platforms over first pit
  level.putBrick(36, 10, null);
  level.putBrick(37, 10, null);
  level.putQBlock(38, 10, new Mario.Bcoin([608, 160]));
  level.putBrick(39, 10, null);
  level.putBrick(40, 10, null);

  level.putBrick(44, 7, null);
  level.putBrick(45, 7, null);
  level.putBrick(46, 7, null);

  // Mid stretch
  level.putGoomba(72, 12);
  level.putQBlock(76, 9, new Mario.Bcoin([1216, 144]));
  level.putBrick(77, 9, null);
  level.putBrick(78, 9, new Mario.Star([1248, 144]));
  level.putBrick(79, 9, null);

  // High floating row
  for (var i = 84; i <= 92; i++) {
    level.putBrick(i, 5, null);
  }
  level.putQBlock(88, 5, new Mario.Mushroom([1408, 80]));
  level.putKoopa(86, 3);

  // Stairs then pit
  level.putWall(104, 13, 1);
  level.putWall(105, 13, 2);
  level.putWall(106, 13, 3);
  level.putWall(107, 13, 4);

  level.putBrick(112, 8, null);
  level.putBrick(113, 8, null);
  level.putBrick(114, 8, null);
  level.putBrick(118, 6, null);
  level.putBrick(119, 6, null);
  level.putQBlock(120, 6, new Mario.Bcoin([1920, 96]));
  level.putBrick(121, 6, null);

  level.putGoomba(126, 12);
  level.putKoopa(128, 11);

  // End staircase with landing, flag right after
  level.putWall(148, 13, 1);
  level.putWall(149, 13, 2);
  level.putWall(150, 13, 3);
  level.putWall(151, 13, 4);
  level.putWall(152, 13, 5);
  level.putWall(153, 13, 6);
  level.putWall(154, 13, 7);
  level.putWall(155, 13, 8);
  level.putWall(156, 13, 8);
  level.putWall(157, 13, 8); // landing
  level.putFlagpole(159);
  level.scatterLoot({ count: 6, minX: 16, maxX: 145, spacing: 16 });

  music.underground.pause();
  music.overworld.currentTime = 0;
  music.overworld.play();
};
