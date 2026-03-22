const GRID_SIZE = 16;
const INITIAL_SNAKE = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const TICK_MS = 140;

function cloneSegment(segment) {
  return { x: segment.x, y: segment.y };
}

function isSamePosition(a, b) {
  return a.x === b.x && a.y === b.y;
}

function createInitialState() {
  const snake = INITIAL_SNAKE.map(cloneSegment);
  return {
    gridSize: GRID_SIZE,
    snake,
    direction: { ...INITIAL_DIRECTION },
    pendingDirection: { ...INITIAL_DIRECTION },
    food: pickFoodPosition(snake, GRID_SIZE, [0.17, 0.63]),
    score: 0,
    started: false,
    gameOver: false,
  };
}

function isOppositeDirection(current, next) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

function setDirection(state, nextDirection) {
  if (state.gameOver) {
    return state;
  }

  if (
    (nextDirection.x === 0 && nextDirection.y === 0) ||
    isOppositeDirection(state.direction, nextDirection)
  ) {
    return state;
  }

  return {
    ...state,
    started: true,
    pendingDirection: { ...nextDirection },
  };
}

function stepState(state, randomValues = [Math.random(), Math.random()]) {
  if (!state.started || state.gameOver) {
    return state;
  }

  const direction = state.pendingDirection;
  const nextHead = {
    x: state.snake[0].x + direction.x,
    y: state.snake[0].y + direction.y,
  };

  const hitsWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  const ateFood = isSamePosition(nextHead, state.food);
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);
  const hitsBody = collisionBody.some((segment) => isSamePosition(segment, nextHead));

  if (hitsWall || hitsBody) {
    return {
      ...state,
      direction,
      gameOver: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake.map(cloneSegment)];

  if (!ateFood) {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: ateFood
      ? pickFoodPosition(nextSnake, state.gridSize, randomValues)
      : state.food,
    score: ateFood ? state.score + 1 : state.score,
  };
}

function pickFoodPosition(snake, gridSize, randomValues = [Math.random(), Math.random()]) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const available = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return snake[0];
  }

  const [rx = Math.random(), ry = Math.random()] = randomValues;
  const seed = (Math.abs(rx) + Math.abs(ry)) % 1;
  const index = Math.floor(seed * available.length) % available.length;
  return available[index];
}

function createBoard(boardElement, gridSize) {
  const cells = [];
  for (let index = 0; index < gridSize * gridSize; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    boardElement.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function render(state, cells, scoreElement, statusElement) {
  cells.forEach((cell) => {
    cell.className = "cell";
  });

  const foodIndex = state.food.y * state.gridSize + state.food.x;
  cells[foodIndex].classList.add("cell--food");

  state.snake.forEach((segment) => {
    const index = segment.y * state.gridSize + segment.x;
    cells[index].classList.add("cell--snake");
  });

  scoreElement.textContent = String(state.score);

  if (state.gameOver) {
    statusElement.textContent = "Game over. Press restart to play again.";
  } else if (!state.started) {
    statusElement.textContent = "Press an arrow key or WASD to start.";
  } else {
    statusElement.textContent = "Use arrow keys or WASD to steer the snake.";
  }
}

function mountGame() {
  const boardElement = document.querySelector("#board");
  const scoreElement = document.querySelector("#score");
  const statusElement = document.querySelector("#status");
  const restartButton = document.querySelector("#restart");
  const controlButtons = document.querySelectorAll("[data-direction]");

  if (!boardElement || !scoreElement || !statusElement || !restartButton) {
    return;
  }

  let state = createInitialState();
  const cells = createBoard(boardElement, state.gridSize);
  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  function restart() {
    state = createInitialState();
    render(state, cells, scoreElement, statusElement);
  }

  function handleDirectionChange(direction) {
    state = setDirection(state, direction);
    render(state, cells, scoreElement, statusElement);
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const direction = directions[key];
    if (!direction) {
      return;
    }
    event.preventDefault();
    handleDirectionChange(direction);
  });

  controlButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const directionMap = {
        up: directions.ArrowUp,
        down: directions.ArrowDown,
        left: directions.ArrowLeft,
        right: directions.ArrowRight,
      };
      handleDirectionChange(directionMap[button.dataset.direction]);
    });
  });

  restartButton.addEventListener("click", restart);

  window.setInterval(() => {
    state = stepState(state);
    render(state, cells, scoreElement, statusElement);
  }, TICK_MS);

  render(state, cells, scoreElement, statusElement);
}

if (typeof document !== "undefined") {
  mountGame();
}

export {
  GRID_SIZE,
  INITIAL_SNAKE,
  INITIAL_DIRECTION,
  TICK_MS,
  createInitialState,
  isOppositeDirection,
  pickFoodPosition,
  setDirection,
  stepState,
};
