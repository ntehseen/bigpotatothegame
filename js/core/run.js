// Endless score run — flag keeps you going; death ends the run.
(function() {
  if (typeof Mario === 'undefined') window.Mario = {};

  Mario.runOver = false;
  Mario.runFinalScore = 0;
  Mario.pipeReturn = null;

  Mario.startRun = function() {
    Mario.runOver = false;
    Mario.runFinalScore = 0;
    Mario.pipeReturn = null;
    scorePopups = [];
    fireballs = [];
    enemyProjectiles = [];
    player = new Mario.Player([0, 0]);
    player.score = 0;
    player.coins = 0;
    input.reset();
    if (music) {
      if (music.clear) { music.clear.pause(); music.clear.currentTime = 0; }
      if (music.death) { music.death.pause(); music.death.currentTime = 0; }
      if (music.underground) music.underground.pause();
      if (music.overworld) {
        music.overworld.currentTime = 0;
        music.overworld.play();
      }
    }
    Mario.pickWorld();
    Mario.courseIndex = 0;
    Mario.oneone();
  };

  Mario.endRun = function() {
    if (Mario.runOver) return;
    Mario.runOver = true;
    Mario.runFinalScore = player.score || 0;
    if (Mario.scores && Mario.scores.submit) {
      Mario.scores.submit(Mario.runFinalScore).catch(function(err) {
        console.warn('[BIG POTATO] score submission failed', err);
      });
    }
    var scoresButton = document.getElementById('bp-run-scores');
    if (scoresButton) scoresButton.hidden = false;
    if (music) {
      if (music.overworld) music.overworld.pause();
      if (music.underground) music.underground.pause();
    }
  };

  // Remember pipe entry is unused for world warps (exit lands in the new world)
  Mario.rememberPipeReturn = function(tileX, tileY, height) {
    Mario.pipeReturn = {
      worldId: Mario.currentWorld && Mario.currentWorld.id,
      loader: (level && level.loader) ? level.loader : Mario.oneone,
      pos: [tileX * 16, (tileY - height) * 16 - 16]
    };
  };

  Mario.returnFromUnderground = function() {
    Mario.exitPipeToWorld();
  };
})();
