# BIG POTATO

Endless HTML5 canvas platformer — a desert/world-hopping score run inspired by classic Mario clones.

**Controls:** ← → move · **X** jump · **Z** run/shoot · ↓ pipe · Enter pause

Death ends the run with your final score. Flags and pipes hop you between worlds (Dunes, Tomb, Bazaar, Field, Grotto).

## Layout

```text
index.html          page shell + script tags
css/game.css        UI chrome
js/
  core/             util, input, resources, sprite, entity, game, score, run, worlds
  player/           player + Big Potato anims
  items/            coins, loot, powerups, fireballs
  enemies/          goombas, koopas, craftpix mobs
  world/            floors, blocks, pipes, props, flag
  levels/           course builders + world kits
sprites/            art (desert/, worlds/, enemies/, loot/, classic sheets)
sounds/             SFX + BGM
```

Dev leftovers (backups, old notes) live in `_dev/` and are gitignored.

## Run locally

Serve the folder over HTTP (canvas/audio need a real origin):

```bash
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765/`.

## Credits

Built on the original [Mario.js](https://github.com/) HTML5 Canvas engine pattern. World/enemy/loot art from Craftpix packs. Big Potato character art is project-specific.
