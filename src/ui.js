// ui.js
// Draws the two boards in the browser and connects the buttons to the game rules.

import { HORIZONTAL, VERTICAL, canPlaceShip, shipAt, isSunk, BOARD_SIZE } from './board.js';
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
} from './game.js';

const playerBoardEl = document.getElementById('player-board');
const enemyBoardEl = document.getElementById('enemy-board');
const statusEl = document.getElementById('status');
const logEl = document.getElementById('log');
const difficultyEl = document.getElementById('difficulty');
const rotateButton = document.getElementById('rotate-button');
const randomButton = document.getElementById('random-button');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

let game = createGame(difficultyEl.value);
let orientation = HORIZONTAL;
let aiThinking = false; // true while the computer's shot is on a short delay

// --- drawing -------------------------------------------------------------

function buildGrid(container, onClick, onHover, onLeave) {
  container.replaceChildren();
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      cell.setAttribute('aria-label', `${String.fromCharCode(65 + x)}${y + 1}`);
      if (onClick) cell.addEventListener('click', () => onClick(x, y));
      if (onHover) cell.addEventListener('mouseenter', () => onHover(x, y));
      if (onLeave) cell.addEventListener('mouseleave', onLeave);
      container.appendChild(cell);
    }
  }
}

function cellAt(container, x, y) {
  return container.querySelector(`[data-x="${x}"][data-y="${y}"]`);
}

function paintBoard(container, board, { showShips }) {
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const el = cellAt(container, x, y);
      const shot = board.shots[y][x];
      const ship = shipAt(board, x, y);
      el.className = 'cell';
      el.textContent = '';

      if (shot === 'hit') {
        el.classList.add(ship && isSunk(ship) ? 'sunk' : 'hit');
        el.textContent = '✕';
      } else if (shot === 'miss') {
        el.classList.add('miss');
        el.textContent = '•';
      } else if (ship && showShips) {
        el.classList.add('ship');
      }
    }
  }
}

function render() {
  paintBoard(playerBoardEl, game.playerBoard, { showShips: true });
  paintBoard(enemyBoardEl, game.enemyBoard, { showShips: game.phase === OVER });

  const playerCells = playerBoardEl.querySelectorAll('.cell');
  const enemyCells = enemyBoardEl.querySelectorAll('.cell');
  playerCells.forEach((cell) => {
    cell.disabled = game.phase !== PLACEMENT;
  });
  enemyCells.forEach((cell) => {
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    const used = game.enemyBoard.shots[y][x] !== null;
    cell.disabled =
      game.phase !== PLAYING || game.turn !== 'player' || aiThinking || used;
  });

  rotateButton.disabled = game.phase !== PLACEMENT;
  randomButton.disabled = game.phase !== PLACEMENT;
  startButton.disabled = game.phase !== PLACEMENT || !isPlacementComplete(game);
  difficultyEl.disabled = game.phase !== PLACEMENT;
  rotateButton.textContent = `Rotate ship (${orientation})`;

  logEl.replaceChildren();
  // Newest message first, so the important line is always visible.
  for (const line of game.log.slice().reverse()) {
    const item = document.createElement('li');
    item.textContent = line;
    logEl.appendChild(item);
  }

  statusEl.textContent = statusText();
}

function statusText() {
  if (game.phase === PLACEMENT) {
    const ship = nextShipToPlace(game);
    if (ship === null) return 'All ships are placed. Press "Start battle".';
    return `Place your ${ship.name} (${ship.size} cells): click a square on your board.`;
  }
  if (game.phase === PLAYING) {
    if (aiThinking || game.turn === 'ai') return 'The computer is taking its shot…';
    return 'Your turn: click a square on the enemy board.';
  }
  return game.winner === 'player'
    ? 'You win! Press "New game" to play again.'
    : 'The computer wins. Press "New game" to try again.';
}

// --- placement preview ---------------------------------------------------

function showPreview(x, y) {
  if (game.phase !== PLACEMENT) return;
  const ship = nextShipToPlace(game);
  if (ship === null) return;
  const allowed = canPlaceShip(game.playerBoard, x, y, ship.size, orientation);
  for (let i = 0; i < ship.size; i++) {
    const cx = orientation === HORIZONTAL ? x + i : x;
    const cy = orientation === HORIZONTAL ? y : y + i;
    const el = cellAt(playerBoardEl, cx, cy);
    if (el) el.classList.add(allowed ? 'preview' : 'invalid');
  }
}

function clearPreview() {
  playerBoardEl.querySelectorAll('.cell').forEach((el) => {
    el.classList.remove('preview', 'invalid');
  });
}

// --- actions -------------------------------------------------------------

function handlePlayerBoardClick(x, y) {
  if (game.phase !== PLACEMENT) return;
  const placed = placePlayerShip(game, x, y, orientation);
  if (!placed) {
    statusEl.textContent = 'That ship does not fit there. Try another square.';
    return;
  }
  render();
}

function handleEnemyBoardClick(x, y) {
  if (game.phase !== PLAYING || game.turn !== 'player' || aiThinking) return;
  const outcome = playerFire(game, x, y);
  if (outcome === null || outcome.result === 'repeat') return;
  render();

  if (game.phase === OVER) return;

  aiThinking = true;
  render();
  window.setTimeout(() => {
    aiFire(game);
    aiThinking = false;
    render();
  }, 700);
}

function newGame() {
  game = createGame(difficultyEl.value);
  orientation = HORIZONTAL;
  aiThinking = false;
  render();
}

rotateButton.addEventListener('click', () => {
  orientation = orientation === HORIZONTAL ? VERTICAL : HORIZONTAL;
  clearPreview();
  render();
});

randomButton.addEventListener('click', () => {
  placePlayerShipsRandomly(game);
  render();
});

startButton.addEventListener('click', () => {
  if (startBattle(game)) render();
});

restartButton.addEventListener('click', newGame);
difficultyEl.addEventListener('change', newGame);

buildGrid(playerBoardEl, handlePlayerBoardClick, showPreview, clearPreview);
buildGrid(enemyBoardEl, handleEnemyBoardClick, null, null);
render();
