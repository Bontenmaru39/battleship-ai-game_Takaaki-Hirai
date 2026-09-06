import { describe, it, expect } from 'vitest';
import { createAI, chooseMove, recordResult, EASY, NORMAL } from '../src/ai.js';

const alwaysZero = () => 0;

describe('easy AI', () => {
  it('never fires at the same cell twice', () => {
    const ai = createAI(EASY);
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const move = chooseMove(ai);
      expect(move).not.toBeNull();
      const key = `${move.x},${move.y}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
      recordResult(ai, move, { result: 'miss', ship: null, sunk: false });
    }
    expect(chooseMove(ai)).toBeNull();
  });
});

describe('normal AI', () => {
  it('hunts on the checkerboard pattern while it has no lead', () => {
    const ai = createAI(NORMAL);
    for (let i = 0; i < 20; i++) {
      const move = chooseMove(ai, Math.random);
      expect((move.x + move.y) % 2).toBe(0);
      recordResult(ai, move, { result: 'miss', ship: null, sunk: false });
    }
  });

  it('attacks the neighbours of a hit', () => {
    const ai = createAI(NORMAL);
    recordResult(ai, { x: 4, y: 4 }, { result: 'hit', ship: { name: 'Cruiser' }, sunk: false });

    const neighbours = [
      { x: 5, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 5 },
      { x: 4, y: 3 },
    ];
    for (let i = 0; i < neighbours.length; i++) {
      const move = chooseMove(ai, alwaysZero);
      expect(neighbours).toContainEqual(move);
      recordResult(ai, move, { result: 'miss', ship: null, sunk: false });
    }
  });

  it('does not queue neighbours outside the board', () => {
    const ai = createAI(NORMAL);
    recordResult(ai, { x: 0, y: 0 }, { result: 'hit', ship: { name: 'Destroyer' }, sunk: false });
    expect(ai.targets).toEqual([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]);
  });

  it('forgets its queued targets once the ship is sunk', () => {
    const ai = createAI(NORMAL);
    recordResult(ai, { x: 4, y: 4 }, { result: 'hit', ship: { name: 'Destroyer' }, sunk: false });
    expect(ai.targets.length).toBe(4);
    recordResult(ai, { x: 5, y: 4 }, { result: 'hit', ship: { name: 'Destroyer' }, sunk: true });
    expect(ai.targets).toEqual([]);
  });

  it('never repeats a cell it already tried', () => {
    const ai = createAI(NORMAL);
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const move = chooseMove(ai);
      const key = `${move.x},${move.y}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
      recordResult(ai, move, { result: i % 3 === 0 ? 'hit' : 'miss', ship: null, sunk: false });
    }
    expect(chooseMove(ai)).toBeNull();
  });
});
