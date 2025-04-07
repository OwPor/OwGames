// DOM Elements
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const finalScoreDisplay = document.getElementById('finalScore');
const winScoreDisplay = document.getElementById('winScore');
const resetBtn = document.getElementById('resetBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const closeInstructionsBtn = document.getElementById('closeInstructions');
const instructionsModal = document.getElementById('instructionsModal');
const gameOverModal = document.getElementById('gameOverModal');
const winModal = document.getElementById('winModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const keepPlayingBtn = document.getElementById('keepPlayingBtn');
const newGameBtn = document.getElementById('newGameBtn');
const themeToggle = document.getElementById('theme-toggle');

// Game variables
const GRID_SIZE = 4;
let grid = [];
let score = 0;
let bestScore = localStorage.getItem('2048_bestScore') || 0;
let gameActive = true;
let won = false;

// Initialize the game
function initializeGame() {
    // Reset board state
    grid = createGrid();
    score = 0;
    gameActive = true;
    won = false;
    
    // Update displays
    scoreDisplay.textContent = score;
    bestScoreDisplay.textContent = bestScore;
    
    // Clear game board HTML
    gameBoard.innerHTML = '';
    
    // Create empty cells
    createEmptyCells();
    
    // Add initial tiles
    addRandomTile();
    addRandomTile();
    
    // Hide modals
    gameOverModal.classList.add('hidden');
    winModal.classList.add('hidden');
}

// Create a 4x4 grid
function createGrid() {
    let newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        newGrid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            newGrid[i][j] = 0;
        }
    }
    return newGrid;
}

// Create empty cells on board
function createEmptyCells() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('empty-cell');
            gameBoard.appendChild(emptyCell);
        }
    }
}

// Calculate tile position based on row and column
function calculatePosition(row, col) {
    // Size of cell plus the gap
    const cellSize = (100 / GRID_SIZE);
    const gapSize = 10; // Gap in pixels
    const padding = 10; // Padding in pixels
    
    // Calculate position in percentages
    const top = padding + row * cellSize + '%';
    const left = padding + col * cellSize + '%';
    
    return { top, left };
}

// Add a random tile (2 or 4) to an empty cell
function addRandomTile() {
    // Get all empty cells
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    
    // If no empty cells, return
    if (emptyCells.length === 0) return;
    
    // Choose a random empty cell
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // Set value (90% chance for 2, 10% chance for 4)
    const value = Math.random() < 0.9 ? 2 : 4;
    grid[randomCell.row][randomCell.col] = value;
    
    // Create tile element
    createTileElement(randomCell.row, randomCell.col, value, true);
}

// Create a tile element
function createTileElement(row, col, value, isNew = false) {
    const tile = document.createElement('div');
    tile.classList.add('tile', `tile-${value}`);
    tile.textContent = value;
    
    // Calculate position (in percentage of parent container)
    const cellSize = 25; // Each cell is 25% of container (4x4 grid)
    const gapSize = 10; // Gap in pixels
    
    // Position using absolute positioning
    tile.style.top = `calc(${row * cellSize}% + ${gapSize}px)`;
    tile.style.left = `calc(${col * cellSize}% + ${gapSize}px)`;
    
    // Animation for new tiles
    if (isNew) {
        tile.classList.add('tile-new');
    }
    
    gameBoard.appendChild(tile);
}

// Update the UI based on the grid data
function updateBoard() {
    // Remove all tiles
    document.querySelectorAll('.tile').forEach(tile => {
        tile.remove();
    });
    
    // Create tiles based on grid data
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] !== 0) {
                createTileElement(i, j, grid[i][j]);
            }
        }
    }
}

// Move tiles in specified direction
function moveTiles(direction) {
    if (!gameActive) return;
    
    // Store original grid to check if it changed
    const originalGrid = JSON.parse(JSON.stringify(grid));
    
    // Process tiles based on direction
    let moved = false;
    
    if (direction === 'up') {
        moved = moveUp();
    } else if (direction === 'down') {
        moved = moveDown();
    } else if (direction === 'left') {
        moved = moveLeft();
    } else if (direction === 'right') {
        moved = moveRight();
    }
    
    // If no tiles moved, return
    if (!moved) return;
    
    // Update the board
    updateBoard();
    
    // Add a new random tile
    addRandomTile();
    
    // Check for game over or win
    if (checkForWin() && !won) {
        handleWin();
    } else if (checkForGameOver()) {
        handleGameOver();
    }
}

// Move tiles up
function moveUp() {
    let moved = false;
    
    for (let col = 0; col < GRID_SIZE; col++) {
        // Process column from top to bottom
        for (let row = 1; row < GRID_SIZE; row++) {
            if (grid[row][col] !== 0) {
                let currentRow = row;
                
                // Move tile up as far as possible
                while (currentRow > 0 && grid[currentRow - 1][col] === 0) {
                    grid[currentRow - 1][col] = grid[currentRow][col];
                    grid[currentRow][col] = 0;
                    currentRow--;
                    moved = true;
                }
                
                // Merge with tile above if same value
                if (currentRow > 0 && grid[currentRow - 1][col] === grid[currentRow][col]) {
                    grid[currentRow - 1][col] *= 2;
                    grid[currentRow][col] = 0;
                    score += grid[currentRow - 1][col];
                    moved = true;
                    
                    // Update score
                    scoreDisplay.textContent = score;
                    if (score > bestScore) {
                        bestScore = score;
                        bestScoreDisplay.textContent = bestScore;
                        localStorage.setItem('2048_bestScore', bestScore);
                    }
                }
            }
        }
    }
    
    return moved;
}

// Move tiles down
function moveDown() {
    let moved = false;
    
    for (let col = 0; col < GRID_SIZE; col++) {
        // Process column from bottom to top
        for (let row = GRID_SIZE - 2; row >= 0; row--) {
            if (grid[row][col] !== 0) {
                let currentRow = row;
                
                // Move tile down as far as possible
                while (currentRow < GRID_SIZE - 1 && grid[currentRow + 1][col] === 0) {
                    grid[currentRow + 1][col] = grid[currentRow][col];
                    grid[currentRow][col] = 0;
                    currentRow++;
                    moved = true;
                }
                
                // Merge with tile below if same value
                if (currentRow < GRID_SIZE - 1 && grid[currentRow + 1][col] === grid[currentRow][col]) {
                    grid[currentRow + 1][col] *= 2;
                    grid[currentRow][col] = 0;
                    score += grid[currentRow + 1][col];
                    moved = true;
                    
                    // Update score
                    scoreDisplay.textContent = score;
                    if (score > bestScore) {
                        bestScore = score;
                        bestScoreDisplay.textContent = bestScore;
                        localStorage.setItem('2048_bestScore', bestScore);
                    }
                }
            }
        }
    }
    
    return moved;
}

// Move tiles left
function moveLeft() {
    let moved = false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
        // Process row from left to right
        for (let col = 1; col < GRID_SIZE; col++) {
            if (grid[row][col] !== 0) {
                let currentCol = col;
                
                // Move tile left as far as possible
                while (currentCol > 0 && grid[row][currentCol - 1] === 0) {
                    grid[row][currentCol - 1] = grid[row][currentCol];
                    grid[row][currentCol] = 0;
                    currentCol--;
                    moved = true;
                }
                
                // Merge with tile to the left if same value
                if (currentCol > 0 && grid[row][currentCol - 1] === grid[row][currentCol]) {
                    grid[row][currentCol - 1] *= 2;
                    grid[row][currentCol] = 0;
                    score += grid[row][currentCol - 1];
                    moved = true;
                    
                    // Update score
                    scoreDisplay.textContent = score;
                    if (score > bestScore) {
                        bestScore = score;
                        bestScoreDisplay.textContent = bestScore;
                        localStorage.setItem('2048_bestScore', bestScore);
                    }
                }
            }
        }
    }
    
    return moved;
}

// Move tiles right
function moveRight() {
    let moved = false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
        // Process row from right to left
        for (let col = GRID_SIZE - 2; col >= 0; col--) {
            if (grid[row][col] !== 0) {
                let currentCol = col;
                
                // Move tile right as far as possible
                while (currentCol < GRID_SIZE - 1 && grid[row][currentCol + 1] === 0) {
                    grid[row][currentCol + 1] = grid[row][currentCol];
                    grid[row][currentCol] = 0;
                    currentCol++;
                    moved = true;
                }
                
                // Merge with tile to the right if same value
                if (currentCol < GRID_SIZE - 1 && grid[row][currentCol + 1] === grid[row][currentCol]) {
                    grid[row][currentCol + 1] *= 2;
                    grid[row][currentCol] = 0;
                    score += grid[row][currentCol + 1];
                    moved = true;
                    
                    // Update score
                    scoreDisplay.textContent = score;
                    if (score > bestScore) {
                        bestScore = score;
                        bestScoreDisplay.textContent = bestScore;
                        localStorage.setItem('2048_bestScore', bestScore);
                    }
                }
            }
        }
    }
    
    return moved;
}

// Check if player has won (2048 tile created)
function checkForWin() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 2048) {
                return true;
            }
        }
    }
    return false;
}

// Check if game is over (no valid moves left)
function checkForGameOver() {
    // Check if any empty cells exist
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }
    
    // Check if any adjacent cells have the same value
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const value = grid[i][j];
            
            // Check adjacent cells
            if ((i < GRID_SIZE - 1 && grid[i + 1][j] === value) ||
                (j < GRID_SIZE - 1 && grid[i][j + 1] === value)) {
                return false;
            }
        }
    }
    
    // If no empty cells and no possible merges, game over
    return true;
}

// Handle win event
function handleWin() {
    won = true;
    winScoreDisplay.textContent = score;
    winModal.classList.remove('hidden');
}

// Handle game over event
function handleGameOver() {
    gameActive = false;
    finalScoreDisplay.textContent = score;
    gameOverModal.classList.remove('hidden');
}

// Handle keyboard events
function handleKeyDown(e) {
    if (!gameActive) return;
    
    // Prevent default actions (e.g. scrolling)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowUp') {
        moveTiles('up');
    } else if (e.key === 'ArrowDown') {
        moveTiles('down');
    } else if (e.key === 'ArrowLeft') {
        moveTiles('left');
    } else if (e.key === 'ArrowRight') {
        moveTiles('right');
    }
}

// Handle touch events for swipe gestures
let touchStartX, touchStartY, touchEndX, touchEndY;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!touchStartX || !touchStartY) return;
    
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Determine swipe direction based on which delta is larger
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            moveTiles('right');
        } else {
            moveTiles('left');
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            moveTiles('down');
        } else {
            moveTiles('up');
        }
    }
    
    // Reset touch coordinates
    touchStartX = null;
    touchStartY = null;
    
    e.preventDefault();
}

// Event Listeners
document.addEventListener('keydown', handleKeyDown);
gameBoard.addEventListener('touchstart', handleTouchStart, false);
gameBoard.addEventListener('touchend', handleTouchEnd, false);
resetBtn.addEventListener('click', initializeGame);
playAgainBtn.addEventListener('click', initializeGame);
keepPlayingBtn.addEventListener('click', () => {
    winModal.classList.add('hidden');
});
newGameBtn.addEventListener('click', initializeGame);

// Instructions modal controls
instructionsBtn.addEventListener('click', () => {
    instructionsModal.classList.remove('hidden');
});

closeInstructionsBtn.addEventListener('click', () => {
    instructionsModal.classList.add('hidden');
});

// Theme Toggle Functionality
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    
    // Save preference to localStorage
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Initialize the game on load
initializeGame();
