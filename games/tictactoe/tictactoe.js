// DOM Elements
const cells = document.querySelectorAll('.cell');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const gameModeSelect = document.getElementById('gameMode');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const scoreDrawDisplay = document.getElementById('scoreDraw');
const resultModal = document.getElementById('resultModal');
const resultMessage = document.getElementById('resultMessage');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const closeInstructionsBtn = document.getElementById('closeInstructions');
const instructionsModal = document.getElementById('instructionsModal');
const themeToggle = document.getElementById('theme-toggle');

// Game variables
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'twoPlayer';
let scores = {
    X: parseInt(localStorage.getItem('tictactoe_scoreX')) || 0,
    O: parseInt(localStorage.getItem('tictactoe_scoreO')) || 0,
    draw: parseInt(localStorage.getItem('tictactoe_scoreDraw')) || 0
};

// Winning combinations
const winPatterns = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
];

// Initialize the game
function initializeGame() {
    // Reset board
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    currentPlayerDisplay.textContent = currentPlayer;
    
    // Clear cells
    cells.forEach(cell => {
        cell.className = 'cell';
        cell.innerHTML = '';
    });
    
    // Hide result modal
    resultModal.classList.add('hidden');
    
    // Update score displays
    updateScoreDisplay();
}

// Update score displays
function updateScoreDisplay() {
    scoreXDisplay.textContent = scores.X;
    scoreODisplay.textContent = scores.O;
    scoreDrawDisplay.textContent = scores.draw;
}

// Handle cell click
function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));
    
    // Check if cell is already filled or game is not active
    if (board[index] !== '' || !gameActive) {
        return;
    }
    
    // Update board and UI
    board[index] = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    
    // Check for win or draw
    if (checkWin()) {
        endGame(false);
    } else if (isBoardFull()) {
        endGame(true);
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        currentPlayerDisplay.textContent = currentPlayer;
        
        // If vs computer and it's computer's turn (O)
        if (gameMode === 'vsComputer' && currentPlayer === 'O') {
            // Slight delay for computer's move
            setTimeout(computerMove, 500);
        }
    }
}

// Computer move (simple AI)
function computerMove() {
    if (!gameActive) return;
    
    // Try to win
    const winMove = findBestMove('O');
    if (winMove !== -1) {
        makeMove(winMove);
        return;
    }
    
    // Try to block player's winning move
    const blockMove = findBestMove('X');
    if (blockMove !== -1) {
        makeMove(blockMove);
        return;
    }
    
    // Try to take center
    if (board[4] === '') {
        makeMove(4);
        return;
    }
    
    // Take any available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === '');
    if (availableCorners.length > 0) {
        const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        makeMove(randomCorner);
        return;
    }
    
    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => board[i] === '');
    if (availableSides.length > 0) {
        const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
        makeMove(randomSide);
        return;
    }
}

// Find best move for a player (simple AI helper)
function findBestMove(player) {
    // Check for any winning move
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        // If two cells are filled by player and third is empty
        if (
            board[a] === player && 
            board[b] === player && 
            board[c] === '') {
            return c;
        }
        if (
            board[a] === player && 
            board[c] === player && 
            board[b] === '') {
            return b;
        }
        if (
            board[b] === player && 
            board[c] === player && 
            board[a] === '') {
            return a;
        }
    }
    return -1;
}

// Make a move
function makeMove(index) {
    board[index] = currentPlayer;
    cells[index].classList.add(currentPlayer.toLowerCase());
    
    // Check for win or draw
    if (checkWin()) {
        endGame(false);
    } else if (isBoardFull()) {
        endGame(true);
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        currentPlayerDisplay.textContent = currentPlayer;
    }
}

// Check for win
function checkWin() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
            // Highlight winning cells
            cells[a].classList.add('bg-green-200', 'dark:bg-green-800');
            cells[b].classList.add('bg-green-200', 'dark:bg-green-800');
            cells[c].classList.add('bg-green-200', 'dark:bg-green-800');
            return true;
        }
    }
    return false;
}

// Check if board is full (draw)
function isBoardFull() {
    return board.every(cell => cell !== '');
}

// End the game
function endGame(isDraw) {
    gameActive = false;
    
    if (isDraw) {
        resultMessage.textContent = "It's a Draw!";
        scores.draw++;
        localStorage.setItem('tictactoe_scoreDraw', scores.draw);
    } else {
        resultMessage.textContent = `Player ${currentPlayer} Wins!`;
        scores[currentPlayer]++;
        localStorage.setItem(`tictactoe_score${currentPlayer}`, scores[currentPlayer]);
    }
    
    updateScoreDisplay();
    resultModal.classList.remove('hidden');
}

// Event Listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetBtn.addEventListener('click', initializeGame);
playAgainBtn.addEventListener('click', initializeGame);

// Game mode change
gameModeSelect.addEventListener('change', function() {
    gameMode = this.value;
    initializeGame();
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
});

// Initialize the game on load
initializeGame();
