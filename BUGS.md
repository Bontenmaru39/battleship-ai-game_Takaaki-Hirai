# Bug log

Bugs found while building and testing the game, each written as
**Symptom → Cause → Fix**. Two kinds of testing were used:

* **Automated tests** (`npm test`, 29 tests) for the rules and the AI.
* **Browser testing** — a full recorded play-through in Chrome: manual ship
  placement, rotation, invalid placements, random placement, a complete match,
  post-game clicks, and "New game".

---

## Bug 1 — the placement preview disappeared until you moved the mouse

**Symptom.** During ship placement, the green/red preview under the mouse
pointer vanished right after you placed a ship, and after pressing
**Rotate ship**. It only came back once you moved the pointer to another
square, so you could not see where the *next* ship would go, and rotating gave
no visual feedback at all.

**Cause.** The preview is drawn by a `mouseenter` handler, but the whole board
is repainted by `render()`, which resets every cell's CSS classes
(`el.className = 'cell'` in `paintBoard`). Placing a ship and rotating both
call `render()` while the pointer stays still, so the preview classes were
wiped and no new `mouseenter` event ever fired to redraw them.

**Fix** (`src/ui.js`). Remember the square the pointer is on in `hoveredCell`
(set in `showPreview`, cleared in `clearPreview` on `mouseleave`), and redraw
the preview at the end of `render()`. The rotate button no longer calls
`clearPreview()`, so rotating now flips the preview immediately.

---

## Bug 2 — a shot scheduled by the previous game could still fire

**Symptom.** Latent race, found by code review while testing what happens when
you press **New game** during the computer's ~700 ms "thinking" delay. No wrong
shot was observed in the browser (the stale callback happened to land while the
new game was still in the placement phase, where `aiFire` refuses to act), but
if a new battle had started within that window, the old callback would have
made the computer fire an extra, unscheduled shot.

**Cause.** `handleEnemyBoardClick` scheduled the computer's reply with
`window.setTimeout(...)` and threw the timer id away. `newGame()` replaced the
`game` object but never cancelled the pending timer, so the callback survived
the reset and ran against the *new* game.

**Fix** (`src/ui.js`). Keep the timer id in `aiTimer` and call
`window.clearTimeout(aiTimer)` at the start of `newGame()`, so a reset always
throws away the shot the previous game had queued.

---

## Checks that did **not** find a bug

These were the risky spots we expected to break. They were tested and behaved
correctly, so they are listed here as evidence rather than as bugs:

| Checked | Result |
| --- | --- |
| Ships hanging off the edge or overlapping | Rejected (`canPlaceShip`), automated + browser |
| Pressing "Place my ships randomly" twice | Still exactly 5 ships / 17 cells — the board is rebuilt, not added to |
| Clicking a square you already fired at | Returns `'repeat'`, costs no turn, hit count not increased |
| Clicking during the computer's turn, or after the game ends | Ignored; the board and log stay unchanged |
| Sunk ships | Turn dark red on both boards; the enemy fleet is revealed when the game ends |
| Normal vs Easy AI | Normal chases the neighbours of a hit, Easy does not. Over 800 simulated games Normal needs ~62 shots to sink the whole fleet, Easy ~95 |
| Random placement, 500 boards | Always 5 ships, always 17 distinct in-board cells |
| 1000 simulated full games | Every game ended, no infinite loops, hit counters always matched the marked cells |
| Browser console | No JavaScript errors during a full recorded play-through |

## Not tested

* The **player-victory** ending was only covered by the automated tests
  (`tests/game.test.js`), not by a manual browser play-through — the recorded
  browser match ended in a computer victory.
* Easy mode's "does not chase" behaviour was observed in play, not measured
  statistically in the browser (it is covered by the simulation above).
