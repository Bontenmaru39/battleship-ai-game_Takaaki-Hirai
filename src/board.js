// board.js
// Everything about a single 10x10 board: the ships on it and the shots fired at it.

export const BOARD_SIZE = 10;

// The five classic Battleship ships.
export const SHIP_TYPES = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
];

export const HORIZONTAL = 'horizontal';
export const VERTICAL = 'vertical';

// A board holds:
// - ships: the ships placed on it
// - shots: a 10x10 grid where each cell is null (not fired at), 'hit' or 'miss'
export function createBoard(size = BOARD_SIZE) {
  const shots = [];
  for (let y = 0; y < size; y++) {
    shots.push(new Array(size).fill(null));
  }
  return { size, ships: [], shots };
}

export function isInsideBoard(board, x, y) {
  return x >= 0 && y >= 0 && x < board.size && y < board.size;
}

// The list of cells a ship would cover if it started at (x, y).
export function shipCells(x, y, size, orientation) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    cells.push(
      orientation === HORIZONTAL ? { x: x + i, y } : { x, y: y + i }
    );
  }
  return cells;
}

export function shipAt(board, x, y) {
  return (
    board.ships.find((ship) =>
      ship.cells.some((cell) => cell.x === x && cell.y === y)
    ) || null
  );
}

export function canPlaceShip(board, x, y, size, orientation) {
  const cells = shipCells(x, y, size, orientation);
  return cells.every(
    (cell) =>
      isInsideBoard(board, cell.x, cell.y) && shipAt(board, cell.x, cell.y) === null
  );
}

// Puts a ship on the board. Returns the ship, or null when the spot is not allowed.
export function placeShip(board, name, x, y, size, orientation) {
  if (!canPlaceShip(board, x, y, size, orientation)) return null;
  const ship = { name, size, orientation, cells: shipCells(x, y, size, orientation), hits: 0 };
  board.ships.push(ship);
  return ship;
}

export function isSunk(ship) {
  return ship.hits >= ship.size;
}

export function allShipsSunk(board) {
  return board.ships.length > 0 && board.ships.every(isSunk);
}

// Fires at one cell. Possible results: 'hit', 'miss', 'repeat' (that cell was already used).
export function receiveShot(board, x, y) {
  if (!isInsideBoard(board, x, y)) return { result: 'repeat', ship: null, sunk: false };
  if (board.shots[y][x] !== null) return { result: 'repeat', ship: null, sunk: false };

  const ship = shipAt(board, x, y);
  if (ship === null) {
    board.shots[y][x] = 'miss';
    return { result: 'miss', ship: null, sunk: false };
  }

  board.shots[y][x] = 'hit';
  ship.hits += 1;
  return { result: 'hit', ship, sunk: isSunk(ship) };
}

// Places the given ships on random free spots. `random` can be replaced in tests.
export function placeShipsRandomly(board, shipTypes = SHIP_TYPES, random = Math.random) {
  for (const type of shipTypes) {
    let placed = null;
    // Try random spots until one fits (a 10x10 board always has room for these ships).
    while (placed === null) {
      const orientation = random() < 0.5 ? HORIZONTAL : VERTICAL;
      const x = Math.floor(random() * board.size);
      const y = Math.floor(random() * board.size);
      placed = placeShip(board, type.name, x, y, type.size, orientation);
    }
  }
  return board;
}
