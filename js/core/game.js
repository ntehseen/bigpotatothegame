var requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();

//create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
var updateables = [];
var fireballs = [];
var enemyProjectiles = [];
var scorePopups = [];
var player = new Mario.Player([0,0]);

//we might have to get the size and calculate the scaling
//but this method should let us make it however big.
//Cool!
//TODO: Automatically scale the game to work and look good on widescreen.
//TODO: fiddling with scaled sprites looks BETTER, but not perfect. Hmm.
canvas.width = 762;
canvas.height = 720;
ctx.imageSmoothingEnabled = false;
ctx.scale(3,3);
var gameFrame = document.getElementById('game-frame') || document.body;
gameFrame.appendChild(canvas);

// Classic stage timer (counts down like SMB)
var levelTime = 400;
var timeTick = 0;

function resetLevelTimer() {
  levelTime = 400;
  timeTick = 0;
}

//viewport
var vX = 0,
    vY = 0,
    vWidth = 256,
    vHeight = 240;

//load our images
resources.load([
  'sprites/player.png',
  'sprites/enemy.png',
  'sprites/tiles.png',
  'sprites/playerl.png',
  'sprites/items.png',
  'sprites/enemyr.png',
  'sprites/bigpotato.png',
  'sprites/bigpotato-hud.png',
  'sprites/bigpotato-atlas.png?v=30',
  'sprites/desert/bg.png',
  'sprites/desert/tile-1.png',
  'sprites/desert/tile-2.png',
  'sprites/desert/tile-3.png',
  'sprites/desert/tile-4.png',
  'sprites/desert/tile-5.png',
  'sprites/desert/tile-6.png',
  'sprites/desert/tile-7.png',
  'sprites/desert/tile-8.png',
  'sprites/desert/tile-9.png',
  'sprites/desert/tile-10.png',
  'sprites/desert/tile-11.png',
  'sprites/desert/tile-12.png',
  'sprites/desert/tile-13.png',
  'sprites/desert/tile-14.png',
  'sprites/desert/tile-15.png',
  'sprites/desert/tile-16.png',
  'sprites/desert/bush-1.png',
  'sprites/desert/bush-2.png',
  'sprites/desert/cactus-1.png',
  'sprites/desert/cactus-2.png',
  'sprites/desert/cactus-3.png',
  'sprites/desert/crate.png',
  'sprites/desert/grass-1.png',
  'sprites/desert/grass-2.png',
  'sprites/desert/sign.png',
  'sprites/desert/sign-arrow.png',
  'sprites/desert/skeleton.png',
  'sprites/desert/stone.png',
  'sprites/desert/stone-block.png',
  'sprites/desert/tree.png',
  'sprites/desert/well-top.png',
  'sprites/desert/well-mid.png',
  'sprites/desert/well-l-end.png',
  'sprites/desert/well-r-end.png',
  'sprites/desert/well-l-mid.png',
  'sprites/desert/well-r-mid.png',
  'sprites/desert/well-side-end.png',
  'sprites/desert/well-side-mid.png',
  'sprites/desert/well-h-l-top.png',
  'sprites/desert/well-h-l-bot.png',
  'sprites/desert/well-h-m-top.png',
  'sprites/desert/well-h-m-bot.png',
  'sprites/desert/well-h-r-top.png',
  'sprites/desert/well-h-r-bot.png',
  'sprites/desert/gem.png',
  'sprites/desert/gem-hud.png',
  'sprites/desert/coin.png',
  'sprites/loot/coins.png',
  'sprites/loot/goldbar.png',
  'sprites/loot/ring.png',
  'sprites/loot/amulet.png',
  'sprites/loot/ruby.png',
  'sprites/loot/garnet.png',
  'sprites/loot/ember.png',
  'sprites/loot/orb.png',
  'sprites/loot/sapphire.png',
  'sprites/loot/azure.png',
  'sprites/worlds/cave/bg.png',
  'sprites/worlds/cave/bush-1.png',
  'sprites/worlds/cave/bush-2.png',
  'sprites/worlds/cave/cactus-1.png',
  'sprites/worlds/cave/cactus-2.png',
  'sprites/worlds/cave/cactus-3.png',
  'sprites/worlds/cave/coin.png',
  'sprites/worlds/cave/crate.png',
  'sprites/worlds/cave/gem.png',
  'sprites/worlds/cave/sign.png',
  'sprites/worlds/cave/skeleton.png',
  'sprites/worlds/cave/stone-block.png',
  'sprites/worlds/cave/stone.png',
  'sprites/worlds/cave/tile-1.png',
  'sprites/worlds/cave/tile-10.png',
  'sprites/worlds/cave/tile-11.png',
  'sprites/worlds/cave/tile-12.png',
  'sprites/worlds/cave/tile-2.png',
  'sprites/worlds/cave/tile-3.png',
  'sprites/worlds/cave/tile-4.png',
  'sprites/worlds/cave/tile-5.png',
  'sprites/worlds/cave/tile-6.png',
  'sprites/worlds/cave/tile-7.png',
  'sprites/worlds/cave/tile-8.png',
  'sprites/worlds/cave/tile-9.png',
  'sprites/worlds/cave/tree.png',
  'sprites/worlds/field/bg.png',
  'sprites/worlds/field/bush-1.png',
  'sprites/worlds/field/bush-2.png',
  'sprites/worlds/field/cactus-1.png',
  'sprites/worlds/field/cactus-2.png',
  'sprites/worlds/field/cactus-3.png',
  'sprites/worlds/field/coin.png',
  'sprites/worlds/field/crate.png',
  'sprites/worlds/field/gem.png',
  'sprites/worlds/field/sign.png',
  'sprites/worlds/field/skeleton.png',
  'sprites/worlds/field/stone-block.png',
  'sprites/worlds/field/stone.png',
  'sprites/worlds/field/tile-1.png',
  'sprites/worlds/field/tile-2.png',
  'sprites/worlds/field/tile-3.png',
  'sprites/worlds/field/tile-4.png',
  'sprites/worlds/field/tile-5.png',
  'sprites/worlds/field/tile-6.png',
  'sprites/worlds/field/tile-7.png',
  'sprites/worlds/field/tile-8.png',
  'sprites/worlds/field/tile-9.png',
  'sprites/worlds/field/tree.png',
  'sprites/worlds/graveyard/bg.png',
  'sprites/worlds/graveyard/bush-1.png',
  'sprites/worlds/graveyard/bush-2.png',
  'sprites/worlds/graveyard/cactus-1.png',
  'sprites/worlds/graveyard/cactus-2.png',
  'sprites/worlds/graveyard/cactus-3.png',
  'sprites/worlds/graveyard/coin.png',
  'sprites/worlds/graveyard/crate.png',
  'sprites/worlds/graveyard/gem.png',
  'sprites/worlds/graveyard/sign.png',
  'sprites/worlds/graveyard/skeleton.png',
  'sprites/worlds/graveyard/stone-block.png',
  'sprites/worlds/graveyard/stone.png',
  'sprites/worlds/graveyard/tile-1.png',
  'sprites/worlds/graveyard/tile-2.png',
  'sprites/worlds/graveyard/tile-3.png',
  'sprites/worlds/graveyard/tile-4.png',
  'sprites/worlds/graveyard/tile-5.png',
  'sprites/worlds/graveyard/tile-6.png',
  'sprites/worlds/graveyard/tile-7.png',
  'sprites/worlds/graveyard/tile-8.png',
  'sprites/worlds/graveyard/tile-9.png',
  'sprites/worlds/graveyard/tree.png',
  'sprites/worlds/market/bg.png',
  'sprites/worlds/market/bush-1.png',
  'sprites/worlds/market/bush-2.png',
  'sprites/worlds/market/cactus-1.png',
  'sprites/worlds/market/cactus-2.png',
  'sprites/worlds/market/cactus-3.png',
  'sprites/worlds/market/coin.png',
  'sprites/worlds/market/crate.png',
  'sprites/worlds/market/gem.png',
  'sprites/worlds/market/sign.png',
  'sprites/worlds/market/skeleton.png',
  'sprites/worlds/market/stone-block.png',
  'sprites/worlds/market/stone.png',
  'sprites/worlds/market/tile-1.png',
  'sprites/worlds/market/tile-2.png',
  'sprites/worlds/market/tile-3.png',
  'sprites/worlds/market/tile-4.png',
  'sprites/worlds/market/tile-5.png',
  'sprites/worlds/market/tile-6.png',
  'sprites/worlds/market/tile-7.png',
  'sprites/worlds/market/tile-8.png',
  'sprites/worlds/market/tile-9.png',
  'sprites/worlds/market/tree.png',
  'sprites/desert/bg-under.png',
  'sprites/worlds/cave/bg-under.png',
  'sprites/worlds/graveyard/bg-under.png',
  'sprites/worlds/market/bg-under.png',
  'sprites/worlds/field/bg-under.png',
  // Craftpix enemy packs
  'sprites/enemies/spell.png',
  'sprites/enemies/wraith/walk.png',
  'sprites/enemies/wraith/attack.png',
  'sprites/enemies/wraith/die.png',
  'sprites/enemies/wraith/cast.png',
  'sprites/enemies/zombie/walk.png',
  'sprites/enemies/zombie/attack.png',
  'sprites/enemies/zombie/die.png',
  'sprites/enemies/zombie/jump.png',
  'sprites/enemies/minotaur/walk.png',
  'sprites/enemies/minotaur/attack.png',
  'sprites/enemies/minotaur/die.png',
  'sprites/enemies/minotaur/jump.png',
  'sprites/enemies/satyr/walk.png',
  'sprites/enemies/satyr/attack.png',
  'sprites/enemies/satyr/die.png',
  'sprites/enemies/satyr/jump.png',
]);

resources.onReady(function() {
  var start = function() { init(); };
  if (document.fonts && document.fonts.load) {
    document.fonts.load('700 10px Fredoka').then(start).catch(start);
  } else {
    start();
  }
});
var level;
var sounds;
var music;

//initialize
var lastTime;
function init() {
  music = {
    overworld: new Audio('sounds/aboveground_bgm.ogg'),
    underground: new Audio('sounds/underground_bgm.ogg'),
    clear: new Audio('sounds/stage_clear.wav'),
    death: new Audio('sounds/mariodie.wav')
  };
  sounds = {
    smallJump: new Audio('sounds/jump-small.wav'),
    bigJump: new Audio('sounds/jump-super.wav'),
    breakBlock: new Audio('sounds/breakblock.wav'),
    bump: new Audio('sounds/bump.wav'),
    coin: new Audio('sounds/coin.wav'),
    fireball: new Audio('sounds/fireball.wav'),
    flagpole: new Audio('sounds/flagpole.wav'),
    kick: new Audio('sounds/kick.wav'),
    pipe: new Audio('sounds/pipe.wav'),
    itemAppear: new Audio('sounds/itemAppear.wav'),
    powerup: new Audio('sounds/powerup.wav'),
    stomp: new Audio('sounds/stomp.wav')
  };
  Mario.COURSES = [Mario.oneone, Mario.onetwo, Mario.onethree];
  Mario.startRun();
  if (Mario.initTouchControls) Mario.initTouchControls();
  if (Mario.startResponsiveStage) Mario.startResponsiveStage();
  lastTime = Date.now();
  window.addEventListener('blur', function() {
    if (!Mario.runOver && !paused) setPaused(true);
  });
  main();
}

var gameTime = 0;
var paused = false;
var pauseHeld = false;
var musicPausedTrack = null;

//set up the game loop
function main() {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  handlePauseInput();
  if (!paused) {
    update(dt);
  }
  render();

  lastTime = now;
  requestAnimFrame(main);
}

function handlePauseInput() {
  var down = input.isDown('PAUSE') || (Mario.runOver && input.isDown('JUMP'));
  if (Mario.runOver) {
    if (down && !pauseHeld) {
      Mario.startRun();
      paused = false;
      musicPausedTrack = null;
      lastTime = Date.now();
    }
    pauseHeld = !!down;
    return;
  }
  if (down && !pauseHeld) {
    setPaused(!paused);
  }
  pauseHeld = !!down;
}

function setPaused(value) {
  if (paused === value) return;
  paused = value;
  if (paused) {
    if (music.overworld && !music.overworld.paused && !music.overworld.ended) {
      music.overworld.pause();
      musicPausedTrack = 'overworld';
    } else if (music.underground && !music.underground.paused && !music.underground.ended) {
      music.underground.pause();
      musicPausedTrack = 'underground';
    } else {
      musicPausedTrack = null;
    }
    input.reset();
  } else {
    if (musicPausedTrack && music[musicPausedTrack]) {
      music[musicPausedTrack].play();
    }
    musicPausedTrack = null;
    lastTime = Date.now();
  }
}

function update(dt) {
  if (Mario.runOver) return;
  gameTime += dt;

  handleInput(dt);
  updateEntities(dt, gameTime);
  updateTimer(dt);

  checkCollisions();
  if (player && player.postUpdate) player.postUpdate(dt);
}

function updateTimer(dt) {
  if (!level || player.dying || player.flagging || player.exiting || player.piping || player.noInput) {
    return;
  }
  timeTick += dt;
  // 1 unit/sec — a 400 timer lasts about 6.5 minutes
  while (timeTick >= 1) {
    timeTick -= 1;
    levelTime -= 1;
    if (levelTime <= 0) {
      levelTime = 0;
      player.die();
      break;
    }
  }
}

function handleInput(dt) {
  if (player.piping || player.dying || player.noInput) return; //don't accept input

  if (input.isDown('RUN')){
    player.run();
  } else {
    player.noRun();
  }
  if (input.isDown('JUMP')) {
    player.jump();
  } else {
    //we need this to handle the timing for how long you hold it
    player.noJump();
  }

  if (input.isDown('DOWN')) {
    player.crouch();
  } else {
    player.noCrouch();
  }

  if (input.isDown('LEFT')) { // 'd' or left arrow
    player.moveLeft();
  }
  else if (input.isDown('RIGHT')) { // 'k' or right arrow
    player.moveRight();
  } else {
    player.noWalk();
  }
}

//update all the moving stuff
function updateEntities(dt, gameTime) {
  player.update(dt, vX);
  updateables.forEach (function(ent) {
    ent.update(dt, gameTime);
  });

  //This should stop the jump when he switches sides on the flag.
  if (player.exiting) {
    if (player.pos[0] > vX + 96)
      vX = player.pos[0] - 96
  }else if (level.scrolling && player.pos[0] > vX + 80) {
    vX = player.pos[0] - 80;
  }

  if (player.powering.length !== 0 || player.dying) { return; }
  level.items.forEach (function(ent) {
    ent.update(dt);
  });

  level.enemies.forEach (function(ent) {
    ent.update(dt, vX);
  });

  fireballs.forEach(function(fireball) {
    fireball.update(dt);
  });
  enemyProjectiles.forEach(function(proj) {
    proj.update(dt);
  });
  level.pipes.forEach (function(pipe) {
    pipe.update(dt);
  });
  scorePopups.forEach(function(popup) {
    popup.update(dt);
  });
}

//scan for collisions
function checkCollisions() {
  if (player.powering.length !== 0 || player.dying) { return; }
  player.checkCollisions();

  //Apparently for each will just skip indices where things were deleted.
  level.items.forEach(function(item) {
    item.checkCollisions();
  });
  level.enemies.forEach (function(ent) {
    ent.checkCollisions();
  });
  fireballs.forEach(function(fireball){
    fireball.checkCollisions();
  });
  enemyProjectiles.forEach(function(proj) {
    proj.checkCollisions();
  });
  level.pipes.forEach (function(pipe) {
    pipe.checkCollisions();
  });
}

//draw the game!
function render() {
  updateables = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderBackground();

  //scenery gets drawn first to get layering right.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (level.scenery[i][j]) {
        renderEntity(level.scenery[i][j]);
      }
    }
  }

  //then items
  level.items.forEach (function (item) {
    renderEntity(item);
  });

  level.enemies.forEach (function(enemy) {
    renderEntity(enemy);
  });



  fireballs.forEach(function(fireball) {
    renderEntity(fireball);
  });
  enemyProjectiles.forEach(function(proj) {
    renderEntity(proj);
  });

  //then we draw every static object.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (level.statics[i][j]) {
        renderEntity(level.statics[i][j]);
      }
      if (level.blocks[i][j]) {
        renderEntity(level.blocks[i][j]);
        updateables.push(level.blocks[i][j]);
      }
    }
  }

  //then the player
  if (player.invincibility % 2 === 0) {
    renderEntity(player);
  }

  //Mario goes INTO pipes, so naturally they go after.
  level.pipes.forEach (function(pipe) {
    renderEntity(pipe);
  });

  scorePopups.forEach(function(popup) {
    popup.render(ctx, vX, vY);
  });

  renderHud();
  if (Mario.runOver) renderRunOverOverlay();
  else if (paused) renderPauseOverlay();
}

function renderBackground() {
  var bgImg = level.backgroundImage && resources.get(level.backgroundImage);
  if (bgImg) {
    ctx.imageSmoothingEnabled = true;
    var screenW = 256;
    var screenH = 240;
    var scale = screenH / bgImg.height;
    var drawW = bgImg.width * scale;
    var parallax = (vX * 0.35) % drawW;
    if (parallax < 0) parallax += drawW;
    var ox = -parallax;
    ctx.drawImage(bgImg, ox, 0, drawW, screenH);
    ctx.drawImage(bgImg, ox + drawW, 0, drawW, screenH);
    if (ox + drawW * 2 < screenW) {
      ctx.drawImage(bgImg, ox + drawW * 2, 0, drawW, screenH);
    }
    ctx.imageSmoothingEnabled = false;
  } else {
    // Context is already scaled to logical 256×240
    ctx.fillStyle = level.background || '#203040';
    ctx.fillRect(0, 0, 256, 240);
  }
}

function renderEntity(entity) {
  entity.render(ctx, vX, vY);
}

function padScore(n, width) {
  var s = String(Math.max(0, Math.floor(n || 0)));
  while (s.length < width) s = '0' + s;
  return s;
}

var HUD_FONT = '"Fredoka", "Nunito", system-ui, sans-serif';

function roundRectPath(x, y, w, h, r) {
  var rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Light candy plaque — pink / cream / gold accents
function drawHudPlaque(x, y, w, h, fillTop, fillBot, stroke) {
  ctx.save();
  ctx.fillStyle = 'rgba(122, 47, 110, 0.08)';
  roundRectPath(x + 1, y + 1, w, h, 8);
  ctx.fill();

  var grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, fillTop);
  grad.addColorStop(1, fillBot);
  roundRectPath(x, y, w, h, 8);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = stroke || '#ff9fd0';
  ctx.stroke();

  roundRectPath(x + 2, y + 1.5, w - 4, Math.max(3, h * 0.28), 5);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fill();
  ctx.restore();
}

function drawHudLabel(text, x, y, color) {
  ctx.font = 'bold 6px ' + HUD_FONT;
  ctx.fillStyle = color || '#7a2f6e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
}

function drawHudValue(text, x, y, color) {
  ctx.font = 'bold 10px ' + HUD_FONT;
  ctx.fillStyle = color || '#4a2040';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function renderPauseOverlay() {
  ctx.save();
  ctx.fillStyle = 'rgba(74, 32, 64, 0.4)';
  ctx.fillRect(0, 0, 256, 240);
  drawHudPlaque(58, 88, 140, 56, '#fff7fb', '#ffc2e0', '#ff4fa3');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px ' + HUD_FONT;
  ctx.fillStyle = '#5c1f55';
  ctx.fillText('Paused', 128, 108);
  ctx.font = 'bold 8px ' + HUD_FONT;
  ctx.fillStyle = '#d63384';
  ctx.fillText('Press Enter', 128, 126);
  ctx.restore();
}

function renderRunOverOverlay() {
  ctx.save();
  ctx.fillStyle = 'rgba(74, 32, 64, 0.48)';
  ctx.fillRect(0, 0, 256, 240);
  drawHudPlaque(40, 70, 176, 100, '#fff7fb', '#ffb6d9', '#ff4fa3');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px ' + HUD_FONT;
  ctx.fillStyle = '#7a2f6e';
  ctx.fillText('Run Over', 128, 92);
  ctx.font = 'bold 8px ' + HUD_FONT;
  ctx.fillStyle = '#d63384';
  ctx.fillText('Score', 128, 112);
  ctx.font = 'bold 18px ' + HUD_FONT;
  ctx.fillStyle = '#5c1f55';
  ctx.fillText(padScore(Mario.runFinalScore || 0, 6), 128, 132);
  ctx.font = 'bold 7px ' + HUD_FONT;
  ctx.fillStyle = '#a84a90';
  ctx.fillText('Enter to run again', 128, 152);
  ctx.restore();
}

function renderHud() {
  var world = (level && level.world) ? level.world : '1-1';
  var score = player.score || 0;
  var coins = player.coins || 0;
  var icon = resources.get('sprites/bigpotato-hud.png');
  var gem = resources.get('sprites/desert/gem.png');

  ctx.save();
  ctx.imageSmoothingEnabled = true;

  // —— Player / score (cream + pink)
  drawHudPlaque(4, 3, 86, 28, '#fff7fb', '#ffd0e8', '#ff9fd0');
  ctx.beginPath();
  ctx.arc(18, 17, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe4f2';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ff4fa3';
  ctx.stroke();
  if (icon) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(18, 17, 8.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(icon, 9, 8, 18, 18);
    ctx.restore();
  }
  drawHudLabel('POTATO', 30, 5, '#7a2f6e');
  drawHudValue(padScore(score, 6), 30, 13, '#4a2040');

  // —— Coin (gold)
  drawHudPlaque(94, 6, 42, 22, '#fff4c8', '#ffd84a', '#e0a820');
  if (gem) {
    ctx.drawImage(gem, 16, 0, 16, 16, 98, 10, 12, 12);
  } else {
    ctx.beginPath();
    ctx.arc(104, 17, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd84a';
    ctx.fill();
    ctx.strokeStyle = '#e0a820';
    ctx.stroke();
  }
  drawHudValue(padScore(coins, 2), 112, 10, '#5c1f55');

  // —— World (pink)
  drawHudPlaque(140, 3, 58, 28, '#ffe4f2', '#ff9fd0', '#ff4fa3');
  drawHudLabel('WORLD', 148, 5, '#7a2f6e');
  drawHudValue(String(world), 148, 13, '#5c1f55');

  // —— Time (plum)
  drawHudPlaque(202, 6, 50, 22, '#f3e0f4', '#c98bc0', '#7a2f6e');
  drawHudLabel('TIME', 208, 7, '#5c1f55');
  drawHudValue(padScore(levelTime, 3), 208, 14, '#4a2040');

  ctx.restore();
}
