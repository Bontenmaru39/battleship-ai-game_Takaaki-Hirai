# Battleship — Human vs AI

A small Battleship game that runs in the browser. You play against the computer.
It is written in plain HTML, CSS and JavaScript: **no framework, no build step**.

## How to play

1. Download or clone this repository.
2. Open `index.html` in any modern browser (double-clicking the file is enough).
   If your browser blocks local modules, run `npm start` and open <http://localhost:8000>.
3. Place your five ships on the left board, then press **Start battle**.
4. Click a square on the right board to fire. Red = hit, dark red = sunk ship, white dot = miss.
5. First side to sink all five enemy ships wins.

### Controls

| Control | What it does |
| --- | --- |
| **AI difficulty** | `Easy` = the computer fires at random. `Normal` = it hunts and then targets. Changing it starts a new game. |
| **Rotate ship** | Switches between horizontal and vertical placement. |
| **Place my ships randomly** | Fills your board for you. |
| **Start battle** | Enabled once all five ships are placed. |
| **New game** | Restarts from ship placement. |

## The fleet

| Ship | Length |
| --- | --- |
| Carrier | 5 |
| Battleship | 4 |
| Cruiser | 3 |
| Submarine | 3 |
| Destroyer | 2 |

## How the AI works

* **Easy** — it picks any square it has not fired at yet, completely at random.
* **Normal** — "hunt and target":
  * *Hunt*: it fires on a checkerboard pattern (only squares where `x + y` is even).
    The smallest ship is 2 squares long, so this pattern cannot miss a ship while
    using only half as many shots.
  * *Target*: as soon as it hits something, it queues the four neighbouring squares
    and fires at those until the ship sinks. Then it clears the queue and hunts again.

## Project layout

```
index.html        the page itself
src/board.js      one board: ships, placement rules, shots
src/ai.js         the computer opponent (easy / normal)
src/game.js       the rules of a whole match: turns, win condition, battle log
src/ui.js         draws the boards and connects the buttons
src/style.css     styling
tests/            automated tests for board.js, ai.js and game.js
BUGS.md           bugs found during testing and how they were fixed
```

Each file does one job, so you can read them one at a time.

## Running the tests

```bash
npm install   # only needed once, only for running the tests
npm test
```

The tests check the rules (placement, hits, misses, sinking, turn order, winning)
and the AI behaviour. They do not need a browser.
