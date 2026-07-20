// World rotation for the endless run — overworld themes + matching undergrounds
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  Mario.WORLD_DEFS = [
    {
      id: 'desert',
      label: 'DUNES',
      overworld: function() { return Mario.desertKit(); },
      underground: [
        { id: 'cave', label: 'CAVE', kit: function() { return Mario.undergroundKit(); } },
        { id: 'ruins', label: 'RUINS', kit: function() { return Mario.ruinsUndergroundKit(); } },
        { id: 'vault', label: 'VAULT', kit: function() { return Mario.vaultUndergroundKit(); } }
      ]
    },
    {
      id: 'graveyard',
      label: 'TOMB',
      overworld: function() { return Mario.graveyardKit(); },
      underground: [
        { id: 'crypt', label: 'CRYPT', kit: function() { return Mario.graveyardUnderKit(); } },
        { id: 'cave', label: 'CAVE', kit: function() { return Mario.caveUnderKit(); } }
      ]
    },
    {
      id: 'market',
      label: 'BAZAAR',
      overworld: function() { return Mario.marketKit(); },
      underground: [
        { id: 'cellar', label: 'CELLAR', kit: function() { return Mario.marketUnderKit(); } },
        { id: 'vault', label: 'VAULT', kit: function() { return Mario.vaultUndergroundKit(); } }
      ]
    },
    {
      id: 'field',
      label: 'FIELD',
      overworld: function() { return Mario.fieldKit(); },
      underground: [
        { id: 'root', label: 'ROOTS', kit: function() { return Mario.fieldUnderKit(); } },
        { id: 'cave', label: 'CAVE', kit: function() { return Mario.caveUnderKit(); } }
      ]
    },
    {
      id: 'cave',
      label: 'GROTTO',
      overworld: function() { return Mario.caveWorldKit(); },
      underground: [
        { id: 'deep', label: 'DEEP', kit: function() { return Mario.caveUnderKit(); } },
        { id: 'ruins', label: 'RUINS', kit: function() { return Mario.ruinsUndergroundKit(); } }
      ]
    }
  ];

  Mario.currentWorld = null;
  Mario.courseIndex = 0;

  Mario.pickWorld = function(excludeId) {
    var pool = Mario.WORLD_DEFS.filter(function(w) {
      return !excludeId || w.id !== excludeId;
    });
    if (!pool.length) pool = Mario.WORLD_DEFS;
    Mario.currentWorld = pool[Math.floor(Math.random() * pool.length)];
    return Mario.currentWorld;
  };

  Mario.ensureWorld = function() {
    if (!Mario.currentWorld) Mario.pickWorld();
    return Mario.currentWorld;
  };

  Mario.activeOverworldKit = function() {
    return Mario.ensureWorld().overworld();
  };

  Mario.activeUndergroundKit = function() {
    var w = Mario.ensureWorld();
    var list = w.underground || [];
    if (!list.length) return Mario.undergroundKit();
    return list[Math.floor(Math.random() * list.length)].kit();
  };

  Mario.pickUndergroundTheme = function() {
    var w = Mario.ensureWorld();
    var list = w.underground || Mario.undergroundThemes || [];
    if (!list.length) {
      return { label: 'CAVE', kit: Mario.undergroundKit };
    }
    return list[Math.floor(Math.random() * list.length)];
  };

  Mario.worldLabel = function() {
    return (Mario.currentWorld && Mario.currentWorld.label) || 'DUNES';
  };

  // Pipe warp: leave this world, enter another world's pocket, then exit into that world
  Mario.warpViaPipe = function() {
    Mario.pickWorld(Mario.currentWorld && Mario.currentWorld.id);
    Mario.buildUnderground(Mario.pickUndergroundTheme());
  };

  // After a flag: new world + next course layout
  Mario.COURSES = null; // filled after level scripts load

  Mario.advanceAfterFlag = function(fallbackNext) {
    Mario.pickWorld(Mario.currentWorld && Mario.currentWorld.id);
    var courses = Mario.COURSES || [Mario.oneone, Mario.onetwo, Mario.onethree];
    Mario.courseIndex = ((Mario.courseIndex || 0) + 1) % courses.length;
    var next = courses[Mario.courseIndex] || fallbackNext || Mario.oneone;
    next.call();
  };

  // Exit underground into the world you warped to (not back where you came from)
  Mario.exitPipeToWorld = function() {
    if (music.underground) music.underground.pause();
    if (music.overworld) {
      music.overworld.currentTime = 0;
      music.overworld.play();
    }
    var courses = Mario.COURSES || [Mario.oneone, Mario.onetwo, Mario.onethree];
    var course = courses[Mario.courseIndex || 0] || Mario.oneone;
    course.call();
    // Pop up near the start of the new world
    player.pos[0] = level.playerPos[0];
    player.pos[1] = Math.max(48, level.playerPos[1] - 32);
    player.pipe('UP', function() {});
  };
})();
