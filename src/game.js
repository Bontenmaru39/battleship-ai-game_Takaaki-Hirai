// game.js
// Rules of a whole match: who owns which board, whose turn it is, and who won.

import {
  createBoard,
  placeShip,
  placeShipsRandomly,
  receiveShot,
  allShipsSunk,
  SHIP_TYPES,
  HORIZONTAL,
} from './board.js';
import { createAI, chooseMove, recordResult, NORMAL } from './ai.js';

export const PLACEMENT = 'placement';
export const PLAYING = 'playing';
export const OVER = 'over';

export function createGame(difficulty = NORMAL, random = Math.random) {
  const game = {
    difficulty,
    random,
    phase: PLACEMENT,
    turn: 'player',
    winner: null,
    playerBoard: createBoard(),
    enemyBoard: createBoard(),
    ai: createAI(difficulty),
    shipsToPlace: SHIP_TYPES.slice(),
    log: [],
  };
  placeShipsRandomly(game.enemyBoard, SHIP_TYPES, random);
  return game;
}

export function nextShipToPlace(game) {
  return game.shipsToPlace[game.playerBoard.ships.length] || null;
}

// Places the player's next ship. Returns true when it worked.
export function placePlayerShip(game, x, y, orientation = HORIZONTAL) {
  if (game.phase !== PLACEMENT) return false;
  const type = nextShipToPlace(game);
  if (type === null) return false;
  return placeShip(game.playerBoard, type.name, x, y, type.size, orientation) !== null;
}

export function placePlayerShipsRandomly(game) {
  if (game.phase !== PLACEMENT) return false;
  game.playerBoard = createBoard();
  placeShipsRandomly(game.playerBoard, SHIP_TYPES, game.random);
  return true;
}

export function isPlacementComplete(game) {
  return game.playerBoard.ships.length === game.shipsToPlace.length;
}

export function startBattle(game) {
  if (!isPlacementComplete(game)) return false;
  game.phase = PLAYING;
  game.turn = 'player';
  return true;
}

function describe(who, x, y, outcome) {
  const column = String.fromCharCode(65 + x);
  const cell = `${column}${y + 1}`;
  if (outcome.result === 'miss') return `${who} fired at ${cell}: miss.`;
  if (outcome.sunk) return `${who} fired at ${cell}: hit and sank the ${outcome.ship.name}!`;
  return `${who} fired at ${cell}: hit!`;
}

function finishIfWon(game) {
  if (allShipsSunk(game.enemyBoard)) {
    game.phase = OVER;
    game.winner = 'player';
    game.log.push('You win! Every enemy ship is sunk.');
    return true;
  }
  if (allShipsSunk(game.playerBoard)) {
    game.phase = OVER;
    game.winner = 'ai';
    game.log.push('The computer wins. All of your ships are sunk.');
    return true;
  }
  return false;
}

// The player fires at the enemy board.
export function playerFire(game, x, y) {
  if (game.phase !== PLAYING || game.turn !== 'player') return null;

  const outcome = receiveShot(game.enemyBoard, x, y);
  if (outcome.result === 'repeat') return outcome; // wasted click, still the player's turn

  game.log.push(describe('You', x, y, outcome));
  if (finishIfWon(game)) return outcome;

  game.turn = 'ai';
  return outcome;
}

// The computer fires at the player's board.
export function aiFire(game) {
  if (game.phase !== PLAYING || game.turn !== 'ai') return null;

  const move = chooseMove(game.ai, game.random);
  if (move === null) return null;

  const outcome = receiveShot(game.playerBoard, move.x, move.y);
  recordResult(game.ai, move, outcome);

  game.log.push(describe('Computer', move.x, move.y, outcome));
  if (finishIfWon(game)) return { move, outcome };

  game.turn = 'player';
  return { move, outcome };
}
