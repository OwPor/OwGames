// DOM Elements
const playerChoiceDisplay = document.getElementById('playerChoice');
const computerChoiceDisplay = document.getElementById('computerChoice');
const resultDisplay = document.getElementById('result');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const finalScoreDisplay = document.getElementById('finalScore');
const winnerMessageDisplay = document.getElementById('winnerMessage');
const choiceButtons = document.querySelectorAll('.choice-btn');
const resetBtn = document.getElementById('resetBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const closeInstructionsBtn = document.getElementById('closeInstructions');
const instructionsModal = document.getElementById('instructionsModal');
const gameOverModal = document.getElementById('gameOverModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const themeToggle = document.getElementById('theme-toggle');

// Game variables
const WINNING_SCORE = 5;
let playerScore = 0;
let computerScore = 0;
let gameActive = true;

// Choice emojis
const choiceEmojis = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
};

// Initialize the game
function initializeGame() {
    playerScore = 0;
    computerScore = 0;
    gameActive = true;
    
    // Update scores
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
    
    // Reset choice displays
    playerChoiceDisplay.innerHTML = '<span class="text-4xl md:text-5xl">?</span>';
    computerChoiceDisplay.innerHTML = '<span class="text-4xl md:text-5xl">?</span>';
    
    // Remove winner/loser classes
    playerChoiceDisplay.classList.remove('winner', 'loser');
    computerChoiceDisplay.classList.remove('winner', 'loser');
    
    // Reset result text
    resultDisplay.innerHTML = '<p class="text-xl text-gray-700 dark:text-gray-300">Choose your move!</p>';
    
    // Hide game over modal
    gameOverModal.classList.add('hidden');
}

// Get random computer choice
function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    const randomIndex = Math.floor(Math.random() * 3);
    return choices[randomIndex];
}

// Determine winner of the round
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    }
    
    if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        return 'player';
    }
    
    return 'computer';
}

// Update score based on round result
function updateScore(result) {
    if (result === 'player') {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
    } else if (result === 'computer') {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
    }
    
    // Check if game is over
    if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
        endGame();
    }
}

// Update UI for round result
function updateUI(playerChoice, computerChoice, result) {
    // Update choice displays
    playerChoiceDisplay.innerHTML = `<span class="text-4xl md:text-5xl">${choiceEmojis[playerChoice]}</span>`;
    computerChoiceDisplay.innerHTML = `<span class="text-4xl md:text-5xl">${choiceEmojis[computerChoice]}</span>`;
    
    // Apply winner/loser classes
    if (result === 'player') {
        playerChoiceDisplay.classList.add('winner');
        computerChoiceDisplay.classList.add('loser');
        resultDisplay.innerHTML = `<p class="text-xl win-text">You win! ${choiceEmojis[playerChoice]} beats ${choiceEmojis[computerChoice]}</p>`;
    } else if (result === 'computer') {
        playerChoiceDisplay.classList.add('loser');
        computerChoiceDisplay.classList.add('winner');
        resultDisplay.innerHTML = `<p class="text-xl lose-text">You lose! ${choiceEmojis[computerChoice]} beats ${choiceEmojis[playerChoice]}</p>`;
    } else {
        playerChoiceDisplay.classList.remove('winner', 'loser');
        computerChoiceDisplay.classList.remove('winner', 'loser');
        resultDisplay.innerHTML = `<p class="text-xl draw-text">It's a draw! Both chose ${choiceEmojis[playerChoice]}</p>`;
    }
    
    // Add animations
    playerChoiceDisplay.classList.add('pulse');
    computerChoiceDisplay.classList.add('pulse');
    
    // Remove animations after they complete
    setTimeout(() => {
        playerChoiceDisplay.classList.remove('pulse');
        computerChoiceDisplay.classList.remove('pulse');
    }, 500);
}

// Handle player choice
function handleChoice(e) {
    if (!gameActive) return;
    
    // Get player choice
    const playerChoice = e.currentTarget.id;
    
    // Get computer choice
    const computerChoice = getComputerChoice();
    
    // Determine winner
    const result = determineWinner(playerChoice, computerChoice);
    
    // Update UI
    updateUI(playerChoice, computerChoice, result);
    
    // Update score
    updateScore(result);
}

// End the game
function endGame() {
    gameActive = false;
    
    // Update final score
    finalScoreDisplay.textContent = `${playerScore} - ${computerScore}`;
    
    // Update winner message
    if (playerScore > computerScore) {
        winnerMessageDisplay.textContent = 'You won the game!';
        winnerMessageDisplay.className = 'text-xl text-green-500 dark:text-green-400 mb-4';
    } else {
        winnerMessageDisplay.textContent = 'Computer won the game!';
        winnerMessageDisplay.className = 'text-xl text-red-500 dark:text-red-400 mb-4';
    }
    
    // Show game over modal
    gameOverModal.classList.remove('hidden');
    
    // Save high score to localStorage
    updateHighScore();
}

// Update high score in localStorage
function updateHighScore() {
    const currentHighScore = localStorage.getItem('rps_highScore') || 0;
    if (playerScore > currentHighScore) {
        localStorage.setItem('rps_highScore', playerScore);
    }
}

// Event Listeners
choiceButtons.forEach(button => {
    button.addEventListener('click', handleChoice);
});

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
