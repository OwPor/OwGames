// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const finalScoreDisplay = document.getElementById('finalScore');
const resetBtn = document.getElementById('resetBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const closeInstructionsBtn = document.getElementById('closeInstructions');
const instructionsModal = document.getElementById('instructionsModal');
const gameOverModal = document.getElementById('gameOverModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const themeToggle = document.getElementById('theme-toggle');

// Mobile control buttons
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Game variables
const gridSize = 15; // Size of grid cells
const gameSpeed = 150; // Milliseconds between updates
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let gameActive = false;
let lastRenderTime = 0;
let touchStartX = 0;
let touchStartY = 0;

// Set up the game board
function setupGame() {
    // Reset snake
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    
    // Create food at random position
    generateFood();
    
    // Reset score
    score = 0;
    scoreDisplay.textContent = score;
    highScoreDisplay.textContent = highScore;
    
    // Reset direction
    direction = 'right';
    nextDirection = 'right';
    
    // Start game
    gameActive = true;
    
    // Start game loop
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
    
    // Hide game over modal
    gameOverModal.classList.add('hidden');
}

// Generate new food at random position
function generateFood() {
    // Create a food position that doesn't overlap with the snake
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// Main game loop
function gameLoop() {
    // Move the snake
    moveSnake();
    
    // Check for collisions
    if (checkCollision()) {
        endGame();
        return;
    }
    
    // Check if snake ate food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Generate new food
        generateFood();
        
        // Increase score
        score++;
        scoreDisplay.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // No need to remove tail since the snake is growing
    } else {
        // Remove tail segment (snake moves forward)
        snake.pop();
    }
    
    // Draw game
    drawGame();
}

// Move the snake in the current direction
function moveSnake() {
    // Update direction from the next direction
    direction = nextDirection;
    
    // Create new head based on current direction
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Add new head to beginning of snake array
    snake.unshift(head);
}

// Check for collisions with walls or self
function checkCollision() {
    const head = snake[0];
    
    // Check for wall collisions
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width / gridSize ||
        head.y >= canvas.height / gridSize
    ) {
        return true;
    }
    
    // Check for self collisions (skip the head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Draw game elements on canvas
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get background color based on theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Different color for head
        if (index === 0) {
            ctx.fillStyle = isDarkMode ? '#8b5cf6' : '#6d28d9'; // Primary color
        } else {
            ctx.fillStyle = isDarkMode ? '#a78bfa' : '#8b5cf6'; // Lighter for body
        }
        
        ctx.fillRect(
            segment.x * gridSize,
            segment.y * gridSize,
            gridSize - 1,
            gridSize - 1
        );
    });
    
    // Draw food
    ctx.fillStyle = '#ef4444'; // Red color for food
    ctx.fillRect(
        food.x * gridSize,
        food.y * gridSize,
        gridSize - 1,
        gridSize - 1
    );
}

// End the game
function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    
    // Update final score
    finalScoreDisplay.textContent = score;
    
    // Show game over modal
    gameOverModal.classList.remove('hidden');
}

// Reset game
function resetGame() {
    setupGame();
}

// Handle keyboard input
function handleKeydown(e) {
    // Prevent arrow keys from scrolling the page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    // Only change direction if game is active
    if (!gameActive) return;
    
    // Prevent 180-degree turns (can't go directly opposite direction)
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// Handle mobile touch events for swipe control
function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(e) {
    if (!gameActive) return;
    
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Determine swipe direction based on larger delta
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 20 && direction !== 'left') {
            nextDirection = 'right';
        } else if (deltaX < -20 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // Vertical swipe
        if (deltaY > 20 && direction !== 'up') {
            nextDirection = 'down';
        } else if (deltaY < -20 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
}

// Event Listeners
document.addEventListener('keydown', handleKeydown);
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

// Mobile control buttons
upBtn.addEventListener('click', () => {
    if (direction !== 'down') nextDirection = 'up';
});

downBtn.addEventListener('click', () => {
    if (direction !== 'up') nextDirection = 'down';
});

leftBtn.addEventListener('click', () => {
    if (direction !== 'right') nextDirection = 'left';
});

rightBtn.addEventListener('click', () => {
    if (direction !== 'left') nextDirection = 'right';
});

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
    
    // Redraw game elements with updated theme colors
    if (gameActive) {
        drawGame();
    }
});

// Initialize the game
setupGame();
