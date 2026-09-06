# Battleship — Human vs AI

A small Battleship game that runs in the browser. You play against the computer.
It is written in plain HTML, CSS and JavaScript: **no framework, no build step**.

Built as a technical take-home project. Two things beyond the game itself are
worth a look: the [bug report](BUGS.md) and the [testing](#testing) section.

## Play online

**<https://bontenmaru39.github.io/battleship-ai-game_Takaaki-Hirai/>**

Nothing to install — the link above runs the game straight from GitHub Pages.

## Run it locally

1. Download or clone this repository.
2. Open `index.html` in any modern browser (double-clicking the file is enough).
   If your browser blocks local modules, run `npm start` and open <http://localhost:8000>.

## How to play

1. Open the game (link above, or `index.html` locally).
2. Choose the AI difficulty: **Easy** or **Normal**.
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

Each file does one job, so you can read them one at a time. The rules
(`board.js`, `game.js`, `ai.js`) never touch the page, and the page (`ui.js`)
never contains rules — that split is what makes the rules easy to test.

## Testing

The game was tested in two ways.

**1. Automated tests — 29 Vitest tests, no browser needed.**

```bash
npm install   # only needed once, and only for running the tests
npm test
```

They cover ship placement (edges, overlaps), hits, misses, sinking, repeated
shots, turn order, both ways of winning, and the behaviour of both AI levels.

**2. Exploratory testing in a real browser.**

The game was also played by hand in Chrome, watching the console for errors:
placing and rotating every ship, trying invalid placements, random placement,
clicking during the computer's turn and on squares already fired at, restarting
mid-turn, and playing full matches through to both a player win and a computer
win. This is how the two bugs listed below were found — the automated tests
never saw them, because both lived in the screen-drawing layer.

## Debugging / Bug report

**See [BUGS.md](BUGS.md).**

Every defect found while building and testing the game is written up there in
the same three parts:

* **Symptom** — what you actually see going wrong.
* **Cause** — the line or design decision responsible for it.
* **Fix** — what was changed, and where.

It also lists the risky cases that were tested and turned out to be *correct*
(so the testing effort is visible, not just the failures), and the things that
were deliberately left untested.
