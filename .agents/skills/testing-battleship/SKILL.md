---
name: testing-battleship
description: Run local browser UI checks for Battleship placement, AI turns, and resets.
---

## Setup
- Serve the repo root with `python3 -m http.server 8000`; open `http://localhost:8000/index.html`.
- ES modules require HTTP rather than file URLs. Browser UI testing requires no npm install or build.
- No authentication is required.

## Devin Secrets Needed
None.

## UI testing
- Use `#player-board` for placement and `#enemy-board` for shots; both boards reuse coordinate aria-labels, so scope selectors.
- The five ship sizes total 17 cells. Random placement can put ships adjacent; count occupied cells rather than connected components.
- Read-only DOM counts supplement screenshots: placement uses `.ship`; after game over use the union `.ship,.hit,.sunk` because hit/sunk cells no longer have `.ship`.
- Normal AI targets available orthogonal neighbors after hits; Easy can fire far away after a hit. A single sequence demonstrates non-chasing, not statistical randomness.
- AI replies after about 700 ms. Test repeat/out-of-turn clicks and resetting during that pending delay.
- Status text can change layout height; recheck screenshot coordinates before batched mouse clicks.
- Capture a complete match, enemy reveal, inert post-game clicks, and a fresh placement reset; check browser console for errors.
- For a stationary-pointer preview check, click a placement cell, then use Shift+Tab to focus Rotate and Enter to activate it without moving the mouse. Confirm the next ship's length and both orientations.
- For a reset race, finish New game → random placement → Start → first new shot before the old 700 ms deadline. Timestamp the native clicks and DOM log updates: require the new reply about 700 ms after the new shot, not just an eventual count of one computer entry.
- To reach player victory efficiently without reading hidden fleet state, choose Easy and use visible hits/misses to hunt and target neighboring cells. Native mouse-click automation may read public DOM classes and wait at least 700 ms per AI reply; do not modify RNG or game state.
- Player victory should show all 17 enemy cells as `.sunk` and five separate `You fired ... sank the ...` messages. There are no unhit enemy ships left to reveal in this ending.
- Compare post-game log text and board classes rather than raw log HTML: browser inspection tools may add `offscreen` attributes to log entries.
