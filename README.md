Implemented a minimal, dependency-free Snake game in the empty project folder using plain HTML, CSS, and ES modules. The UI lives in index.html, the styling is in styles.css, and the deterministic game logic plus browser loop are in snake.js. The logic is split into pure helpers like createInitialState, setDirection, stepState, and pickFoodPosition so the movement, growth, and collision rules are testable independently from the DOM.

Run it with:

1. cd /Users/XYZ/Documents/Codex/SnakeGame
2. python3 -m http.server 8000
3. Open http://localhost:8000

Manual verification:

Start with arrow keys or WASD; on mobile-width screens, use the on-screen buttons.
Confirm the snake moves one grid cell per tick and cannot reverse directly into itself.
Confirm eating food increases score and length by 1.
Confirm hitting a wall or the body ends the game and shows the game-over status.
Confirm Restart resets score, snake position, and food placement.
