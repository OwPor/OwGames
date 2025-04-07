// DOM Elements
const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const bestTimeDisplay = document.getElementById('bestTime');
const difficultySelect = document.getElementById('difficulty');
const resetBtn = document.getElementById('resetBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const closeInstructionsBtn = document.getElementById('closeInstructions');
const instructionsModal = document.getElementById('instructionsModal');
const victoryModal = document.getElementById('victoryModal');
const finalTimeDisplay = document.getElementById('finalTime');
const finalMovesDisplay = document.getElementById('finalMoves');
const playAgainBtn = document.getElementById('playAgainBtn');
const themeToggle = document.getElementById('theme-toggle');

// Game variables
let cards = [];
let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let totalPairs = 0;
let timerInterval;
let startTime;
let elapsedTime = 0;
let difficulty = 'easy';
let bestTimes = {
    easy: localStorage.getItem('memory_bestTime_easy') || null,
    medium: localStorage.getItem('memory_bestTime_medium') || null,
    hard: localStorage.getItem('memory_bestTime_hard') || null
};

// Card symbols (emojis)
const symbols = [
    '🚀', '🌟', '🎮', '🎲', '🎯', '🏆', 
    '🎸', '🎭', '🎨', '🎪', '🎟️', '🎠',
    '🧩', '🎪', '🏅', '🎡', '🎻', '🎬'
];

// Initialize the game
function initializeGame() {
    clearInterval(timerInterval);
    moves = 0;
    matchedPairs = 0;
    elapsedTime = 0;
    movesDisplay.textContent = moves;
    timerDisplay.textContent = '00:00';
    gameBoard.innerHTML = '';
    lockBoard = false;
    
    // Set difficulty
    difficulty = difficultySelect.value;
    gameBoard.className = `bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg grid gap-2 sm:gap-3 ${difficulty}`;
    
    // Determine number of pairs based on difficulty
    if (difficulty === 'easy') {
        totalPairs = 6; // 4x3 grid = 12 cards (6 pairs)
    } else if (difficulty === 'medium') {
        totalPairs = 8; // 4x4 grid = 16 cards (8 pairs)
    } else {
        totalPairs = 12; // 6x4 grid = 24 cards (12 pairs)
    }
    
    // Display best time if available
    if (bestTimes[difficulty]) {
        bestTimeDisplay.textContent = formatTime(parseInt(bestTimes[difficulty]));
    } else {
        bestTimeDisplay.textContent = '--:--';
    }
    
    // Create array of pairs
    const selectedSymbols = symbols.slice(0, totalPairs);
    cards = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle cards
    shuffleArray(cards);
    
    // Create card elements
    createCards();
    
    // Hide victory modal
    victoryModal.classList.add('hidden');
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create card elements
function createCards() {
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.symbol = symbol;
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        
        const symbolElem = document.createElement('div');
        symbolElem.classList.add('card-symbol');
        symbolElem.textContent = symbol;
        cardFront.appendChild(symbolElem);
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
        
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// Start the timer
function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        timerDisplay.textContent = formatTime(elapsedTime);
    }, 1000);
}

// Format time as MM:SS
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Flip card
function flipCard() {
    // Start timer on first card flip
    if (moves === 0) {
        startTimer();
    }
    
    // Return if board is locked or same card is clicked twice
    if (lockBoard) return;
    if (this === firstCard) return;
    
    // Flip the card
    this.classList.add('flipped');
    
    // First card flipped
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    
    // Second card flipped
    secondCard = this;
    moves++;
    movesDisplay.textContent = moves;
    
    // Check for match
    checkForMatch();
}

// Check if cards match
function checkForMatch() {
    // Store card references before they might be reset
    const firstCardRef = firstCard;
    const secondCardRef = secondCard;
    const isMatch = firstCardRef.dataset.symbol === secondCardRef.dataset.symbol;
    
    if (isMatch) {
        // Disable cards first
        disableCards();
        matchedPairs++;
        
        // Add visual feedback for match - using stored references
        if (firstCardRef.classList) {
            firstCardRef.classList.add('matched', 'pulse');
        }
        if (secondCardRef.classList) {
            secondCardRef.classList.add('matched', 'pulse');
        }
        
        // Check if game is complete
        if (matchedPairs === totalPairs) {
            endGame();
        }
    } else {
        unflipCards();
    }
}

// Disable matched cards
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    resetBoard();
}

// Unflip cards if no match
function unflipCards() {
    lockBoard = true;
    
    setTimeout(() => {
        if (firstCard.classList) {
            firstCard.classList.remove('flipped');
        }
        if (secondCard.classList) {
            secondCard.classList.remove('flipped');
        }
        
        resetBoard();
    }, 1000);
}

// Reset board after a turn
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// End the game
function endGame() {
    clearInterval(timerInterval);
    
    // Update final stats
    finalTimeDisplay.textContent = formatTime(elapsedTime);
    finalMovesDisplay.textContent = moves;
    
    // Check for best time
    if (!bestTimes[difficulty] || elapsedTime < parseInt(bestTimes[difficulty])) {
        bestTimes[difficulty] = elapsedTime.toString();
        localStorage.setItem(`memory_bestTime_${difficulty}`, elapsedTime);
        bestTimeDisplay.textContent = formatTime(elapsedTime);
    }
    
    // Show victory modal
    setTimeout(() => {
        victoryModal.classList.remove('hidden');
    }, 500);
}

// Event Listeners
difficultySelect.addEventListener('change', initializeGame);
resetBtn.addEventListener('click', initializeGame);
playAgainBtn.addEventListener('click', initializeGame);

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
