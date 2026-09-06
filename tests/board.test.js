import { describe, it, expect } from 'vitest';
import {
  createBoard,
  placeShip,
  canPlaceShip,
  receiveShot,
  allShipsSunk,
  placeShipsRandomly,
  shipCells,
  shipAt,
  SHIP_TYPES,
  HORIZONTAL,
  VERTICAL,
} from '../src/board.js';

describe('board setup', () => {
  it('creates an empty 10x10 board', () => {
    const board = createBoard();
    expect(board.size).toBe(10);
    expect(board.ships).toHaveLength(0);
    expect(board.shots.length).toBe(10);
    expect(board.shots[0]).toHaveLength(10);
    expect(board.shots.flat().every((cell) => cell === null)).toBe(true);
  });

  it('lists the cells a ship covers', () => {
    expect(shipCells(2, 3, 3, HORIZONTAL)).toEqual([
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ]);
    expect(shipCells(2, 3, 2, VERTICAL)).toEqual([
      { x: 2, y: 3 },
      { x: 2, y: 4 },
    ]);
  });

  it('places a ship inside the board', () => {
    const board = createBoard();
    const ship = placeShip(board, 'Destroyer', 0, 0, 2, HORIZONTAL);
    expect(ship).not.toBeNull();
    expect(board.ships).toHaveLength(1);
    expect(shipAt(board, 1, 0)).toBe(ship);
    expect(shipAt(board, 2, 0)).toBeNull();
  });

  it('refuses ships that hang off the edge', () => {
    const board = createBoard();
    expect(canPlaceShip(board, 8, 0, 5, HORIZONTAL)).toBe(false);
    expect(canPlaceShip(board, 0, 8, 5, VERTICAL)).toBe(false);
    expect(placeShip(board, 'Carrier', 8, 0, 5, HORIZONTAL)).toBeNull();
    expect(board.ships).toHaveLength(0);
  });

  it('refuses ships that overlap another ship', () => {
    const board = createBoard();
    placeShip(board, 'Cruiser', 3, 3, 3, HORIZONTAL);
    expect(canPlaceShip(board, 4, 1, 3, VERTICAL)).toBe(false);
    expect(placeShip(board, 'Submarine', 4, 1, 3, VERTICAL)).toBeNull();
    expect(board.ships).toHaveLength(1);
  });

  it('places all five ships randomly without overlapping', () => {
    for (let round = 0; round < 50; round++) {
      const board = placeShipsRandomly(createBoard());
      expect(board.ships).toHaveLength(SHIP_TYPES.length);
      const used = new Set();
      for (const ship of board.ships) {
        for (const cell of ship.cells) {
          expect(cell.x).toBeGreaterThanOrEqual(0);
          expect(cell.x).toBeLessThan(10);
          expect(cell.y).toBeGreaterThanOrEqual(0);
          expect(cell.y).toBeLessThan(10);
          used.add(`${cell.x},${cell.y}`);
        }
      }
      expect(used.size).toBe(5 + 4 + 3 + 3 + 2);
    }
  });
});

describe('shooting', () => {
  it('reports a miss on empty water', () => {
    const board = createBoard();
    expect(receiveShot(board, 5, 5)).toEqual({ result: 'miss', ship: null, sunk: false });
    expect(board.shots[5][5]).toBe('miss');
  });

  it('reports a hit and finally a sunk ship', () => {
    const board = createBoard();
    placeShip(board, 'Destroyer', 0, 0, 2, HORIZONTAL);

    const first = receiveShot(board, 0, 0);
    expect(first.result).toBe('hit');
    expect(first.sunk).toBe(false);

    const second = receiveShot(board, 1, 0);
    expect(second.result).toBe('hit');
    expect(second.sunk).toBe(true);
    expect(allShipsSunk(board)).toBe(true);
  });

  it('marks a repeated shot instead of counting it twice', () => {
    const board = createBoard();
    placeShip(board, 'Destroyer', 0, 0, 2, HORIZONTAL);
    receiveShot(board, 0, 0);
    const again = receiveShot(board, 0, 0);
    expect(again.result).toBe('repeat');
    expect(board.ships[0].hits).toBe(1);
  });

  it('ignores shots outside the board', () => {
    const board = createBoard();
    expect(receiveShot(board, -1, 4).result).toBe('repeat');
    expect(receiveShot(board, 10, 4).result).toBe('repeat');
  });

  it('does not treat an empty board as fully sunk', () => {
    expect(allShipsSunk(createBoard())).toBe(false);
  });
});
