// ai.js
// The computer opponent. Two difficulty levels:
// - 'easy':   fires at a random cell it has not tried yet.
// - 'normal': "hunt and target". It hunts on a checkerboard pattern until it hits
//             something, then it attacks the neighbouring cells until the ship sinks.

import { BOARD_SIZE } from './board.js';

export const EASY = 'easy';
export const NORMAL = 'normal';

export function createAI(difficulty = NORMAL, size = BOARD_SIZE) {
  return {
    difficulty,
    size,
    tried: new Set(), // cells already fired at, stored as "x,y"
    targets: [], // cells worth trying next (normal mode only)
  };
}

function key(x, y) {
  return `${x},${y}`;
}

function untriedCells(ai) {
  const cells = [];
  for (let y = 0; y < ai.size; y++) {
    for (let x = 0; x < ai.size; x++) {
      if (!ai.tried.has(key(x, y))) cells.push({ x, y });
    }
  }
  return cells;
}

// Picks the next cell to fire at. Returns null when every cell has been used.
export function chooseMove(ai, random = Math.random) {
  if (ai.difficulty === NORMAL) {
    while (ai.targets.length > 0) {
      const target = ai.targets.shift();
      if (!ai.tried.has(key(target.x, target.y))) return target;
    }
  }

  const free = untriedCells(ai);
  if (free.length === 0) return null;

  if (ai.difficulty === NORMAL) {
    // Ships are at least 2 cells long, so half of the board is enough to find them.
    const checkerboard = free.filter((cell) => (cell.x + cell.y) % 2 === 0);
    if (checkerboard.length > 0) {
      return checkerboard[Math.floor(random() * checkerboard.length)];
    }
  }

  return free[Math.floor(random() * free.length)];
}

// Tells the AI what happened, so it can plan its next move.
// `outcome` is the object returned by receiveShot(): { result, ship, sunk }.
export function recordResult(ai, move, outcome) {
  ai.tried.add(key(move.x, move.y));

  if (ai.difficulty !== NORMAL) return;

  if (outcome.sunk) {
    // The ship is gone, so the queued neighbours are no longer interesting.
    ai.targets = [];
    return;
  }

  if (outcome.result === 'hit') {
    const neighbours = [
      { x: move.x + 1, y: move.y },
      { x: move.x - 1, y: move.y },
      { x: move.x, y: move.y + 1 },
      { x: move.x, y: move.y - 1 },
    ];
    for (const cell of neighbours) {
      const inside = cell.x >= 0 && cell.y >= 0 && cell.x < ai.size && cell.y < ai.size;
      const queued = ai.targets.some((t) => t.x === cell.x && t.y === cell.y);
      if (inside && !ai.tried.has(key(cell.x, cell.y)) && !queued) {
        ai.targets.push(cell);
      }
    }
  }
}
