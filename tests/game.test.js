import { describe, it, expect } from 'vitest';
import {
  createGame,
  placePlayerShip,
  placePlayerShipsRandomly,
  isPlacementComplete,
  startBattle,
  playerFire,
  aiFire,
  nextShipToPlace,
  PLACEMENT,
  PLAYING,
  OVER,
} from '../src/game.js';
import { HORIZONTAL, SHIP_TYPES } from '../src/board.js';

function readyGame(difficulty = 'normal') {
  const game = createGame(difficulty);
  placePlayerShipsRandomly(game);
  startBattle(game);
  return game;
}

describe('game setup', () => {
  it('starts in the placement phase with a full enemy fleet', () => {
    const game = createGame();
    expect(game.phase).toBe(PLACEMENT);
    expect(game.enemyBoard.ships).toHaveLength(SHIP_TYPES.length);
    expect(game.playerBoard.ships).toHaveLength(0);
    expect(nextShipToPlace(game).name).toBe('Carrier');
  });

  it('places the player ships one by one, biggest first', () => {
    const game = createGame();
    expect(placePlayerShip(game, 0, 0, HORIZONTAL)).toBe(true);
    expect(game.playerBoard.ships[0]).toMatchObject({ name: 'Carrier', size: 5 });
    expect(nextShipToPlace(game).name).toBe('Battleship');
  });

  it('rejects an impossible placement without losing the turn order', () => {
    const game = createGame();
    expect(placePlayerShip(game, 9, 9, HORIZONTAL)).toBe(false);
    expect(game.playerBoard.ships).toHaveLength(0);
    expect(nextShipToPlace(game).name).toBe('Carrier');
  });

  it('cannot start the battle before all ships are placed', () => {
    const game = createGame();
    expect(startBattle(game)).toBe(false);
    expect(game.phase).toBe(PLACEMENT);

    placePlayerShipsRandomly(game);
    expect(isPlacementComplete(game)).toBe(true);
    expect(startBattle(game)).toBe(true);
    expect(game.phase).toBe(PLAYING);
  });

  it('replaces the fleet instead of stacking ships when randomising twice', () => {
    const game = createGame();
    placePlayerShipsRandomly(game);
    placePlayerShipsRandomly(game);
    expect(game.playerBoard.ships).toHaveLength(SHIP_TYPES.length);
  });
});

describe('taking turns', () => {
  it('passes the turn to the computer after the player fires', () => {
    const game = readyGame();
    playerFire(game, 0, 0);
    expect(game.turn).toBe('ai');
    aiFire(game);
    expect(game.turn).toBe('player');
  });

  it('ignores a repeated shot and keeps the turn with the player', () => {
    const game = readyGame();
    playerFire(game, 0, 0);
    game.turn = 'player';
    const again = playerFire(game, 0, 0);
    expect(again.result).toBe('repeat');
    expect(game.turn).toBe('player');
    expect(game.log).toHaveLength(1);
  });

  it('does not let the player fire out of turn', () => {
    const game = readyGame();
    playerFire(game, 0, 0);
    expect(playerFire(game, 5, 5)).toBeNull();
  });

  it('does not let anyone fire before the battle starts', () => {
    const game = createGame();
    expect(playerFire(game, 0, 0)).toBeNull();
    expect(aiFire(game)).toBeNull();
  });
});

describe('winning', () => {
  it('ends the game when the player sinks every enemy ship', () => {
    const game = readyGame();
    for (const ship of game.enemyBoard.ships) {
      for (const cell of ship.cells) {
        game.turn = 'player';
        playerFire(game, cell.x, cell.y);
      }
    }
    expect(game.phase).toBe(OVER);
    expect(game.winner).toBe('player');
    expect(game.log.at(-1)).toContain('You win');
    expect(playerFire(game, 0, 0)).toBeNull();
  });

  it('ends the game when the computer sinks every player ship', () => {
    const game = readyGame('easy');
    for (let i = 0; i < 200 && game.phase === PLAYING; i++) {
      game.turn = 'ai';
      aiFire(game);
    }
    expect(game.phase).toBe(OVER);
    expect(game.winner).toBe('ai');
  });

  it('writes readable log lines', () => {
    const game = readyGame();
    playerFire(game, 0, 0);
    expect(game.log[0]).toMatch(/^You fired at A1: (hit|miss)/);
  });
});
