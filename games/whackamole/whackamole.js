// DOM Elements
const moles = document.querySelectorAll('.mole');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const bestScoreDisplay = document.getElementById('bestScore');
const finalScoreDisplay = document.getElementById('finalScore');
const finalBestScoreDisplay = document.getElementById('finalBestScore');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('startBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const resetBtn = document.getElementById('resetBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const closeInstructionsBtn = document.getElementById('closeInstructions');
const instructionsModal = document.getElementById('instructionsModal');
const themeToggle = document.getElementById('theme-toggle');
const gameContainer = document.querySelector('.game-container');

// Game variables
let game;
let bestScore = localStorage.getItem('whackamole_bestScore') || 0;
let isDarkMode = document.documentElement.classList.contains('dark');

// Initialize best score display
bestScoreDisplay.textContent = bestScore;

// Create mole nose elements for all moles
moles.forEach(mole => {
    const nose = document.createElement('div');
    nose.classList.add('mole-nose');
    mole.appendChild(nose);
});

// Game class
class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.isRunning = true;
        this.activeMoles = new Set();
        this.gameSpeedMultiplier = 1;
        this.peepSpeed = 1000; // Base speed in ms
        this.hideSpeed = 800; // Base hide speed in ms
        this.maxActiveCount = 2; // Max moles active at once
        this.gameTick = null;
        this.timerTick = null;
        this.molesWhacked = 0;
        
        // Add event listeners to moles
        this.addMoleListeners();
        
        // Start the game loop
        this.startGameLoop();
    }
    
    addMoleListeners() {
        moles.forEach(mole => {
            ['mousedown', 'touchstart'].forEach(event => {
                mole.addEventListener(event, (e) => {
                    e.preventDefault(); // Prevent double-firing and zooming on mobile
                    this.whackMole(mole);
                }, { passive: false });
            });
        });
    }
    
    startGameLoop() {
        // Start the timer countdown
        this.timerTick = setInterval(() => {
            this.timeLeft--;
            timerDisplay.textContent = this.timeLeft;
            
            // Increase game speed over time
            if (this.timeLeft % 5 === 0 && this.timeLeft > 0) {
                this.gameSpeedMultiplier *= 1.1;
            }
            
            // End game when time is up
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
        
        // Game loop for showing moles
        this.gameTick = setInterval(() => {
            this.checkForNewMole();
        }, 500);
    }
    
    checkForNewMole() {
        // Don't add more moles if the game is over
        if (!this.isRunning) return;
        
        // Only add a new mole if we're under the max active count
        if (this.activeMoles.size < this.maxActiveCount) {
            // Determine if we should show a new mole based on game speed
            const shouldAddMole = Math.random() < 0.6 * this.gameSpeedMultiplier;
            
            if (shouldAddMole) {
                this.showRandomMole();
            }
        }
    }
    
    showRandomMole() {
        // Get all inactive moles
        const inactiveMoles = Array.from(moles).filter(mole => 
            !this.activeMoles.has(mole) && !mole.classList.contains('whacked')
        );
        
        // If all moles are active, don't do anything
        if (inactiveMoles.length === 0) return;
        
        // Pick a random inactive mole
        const randomIndex = Math.floor(Math.random() * inactiveMoles.length);
        const mole = inactiveMoles[randomIndex];
        
        // Determine mole type
        const typeRoll = Math.random();
        let moleType = 'normal';
        let staySecs = (this.hideSpeed / 1000) * (Math.random() * 0.5 + 0.7); // Vary the time mole stays up
        
        // 15% chance for golden mole (worth more points)
        if (typeRoll < 0.15) {
            moleType = 'golden';
            staySecs *= 0.6; // Golden moles hide faster
        }
        // 5% chance for bomb (lose points if hit)
        else if (typeRoll < 0.2) {
            moleType = 'bomb';
            staySecs *= 1.2; // Bombs stay up longer
        }
        
        // Reset mole classes and add appropriate type
        mole.className = 'mole';
        if (moleType === 'golden') {
            mole.classList.add('golden');
        } else if (moleType === 'bomb') {
            mole.classList.add('bomb');
        }
        
        // Show the mole
        mole.classList.add('active');
        this.activeMoles.add(mole);
        
        // Hide the mole after a delay
        const hideDelay = staySecs * 1000 / this.gameSpeedMultiplier;
        setTimeout(() => {
            if (this.isRunning && this.activeMoles.has(mole)) {
                mole.classList.remove('active', 'golden', 'bomb');
                this.activeMoles.delete(mole);
            }
        }, hideDelay);
    }
    
    whackMole(mole) {
        // Only proceed if the game is running and the mole is active
        if (!this.isRunning || !this.activeMoles.has(mole)) return;
        
        // Remove mole from active set
        this.activeMoles.delete(mole);
        
        // Handle special mole types
        if (mole.classList.contains('bomb')) {
            // Bomb - lose points
            this.score = Math.max(0, this.score - 10);
            gameContainer.classList.add('shake');
            setTimeout(() => {
                gameContainer.classList.remove('shake');
            }, 500);
        } else {
            // Add points based on mole type
            const points = mole.classList.contains('golden') ? 5 : 1;
            this.score += points;
            this.molesWhacked++;
            
            // Score popup effect
            this.showScorePopup(mole, points);
            
            // Apply whacked class for animation
            mole.classList.add('whacked');
        }
        
        // Update score display
        scoreDisplay.textContent = this.score;
        scoreDisplay.classList.add('score-up');
        setTimeout(() => {
            scoreDisplay.classList.remove('score-up');
        }, 300);
        
        // Remove active class and any special types
        mole.classList.remove('active', 'golden', 'bomb');
        
        // Remove whacked class after animation finishes
        setTimeout(() => {
            mole.classList.remove('whacked');
        }, 500);
    }
    
    showScorePopup(mole, points) {
        // Create score popup element
        const popup = document.createElement('div');
        popup.classList.add('score-popup');
        popup.textContent = `+${points}`;
        
        // Set color based on points
        if (points > 1) {
            popup.style.color = '#ffd700'; // Gold color for golden mole points
        }
        
        // Get mole position
        const rect = mole.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        // Position popup relative to the game container
        popup.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top - containerRect.top}px`;
        
        // Add to the game container and remove after animation
        gameContainer.appendChild(popup);
        setTimeout(() => {
            popup.remove();
        }, 800);
    }
    
    gameOver() {
        this.isRunning = false;
        
        // Clear intervals
        clearInterval(this.gameTick);
        clearInterval(this.timerTick);
        
        // Hide all active moles
        this.activeMoles.forEach(mole => {
            mole.classList.remove('active', 'golden', 'bomb');
        });
        this.activeMoles.clear();
        
        // Update best score
        if (this.score > bestScore) {
            bestScore = this.score;
            localStorage.setItem('whackamole_bestScore', bestScore);
        }
        
        // Update displays
        finalScoreDisplay.textContent = this.score;
        finalBestScoreDisplay.textContent = bestScore;
        bestScoreDisplay.textContent = bestScore;
        
        // Show game over screen
        gameOverScreen.classList.remove('hidden');
    }
    
    reset() {
        // Reset game variables
        this.score = 0;
        this.timeLeft = 30;
        this.isRunning = true;
        this.activeMoles.clear();
        this.gameSpeedMultiplier = 1;
        this.molesWhacked = 0;
        
        // Update displays
        scoreDisplay.textContent = this.score;
        timerDisplay.textContent = this.timeLeft;
        bestScoreDisplay.textContent = bestScore;
        
        // Hide game over screen
        gameOverScreen.classList.add('hidden');
        
        // Remove any classes from moles
        moles.forEach(mole => {
            mole.classList.remove('active', 'golden', 'bomb', 'whacked');
        });
        
        // Start the game loop again
        this.startGameLoop();
    }
}

// Event listeners
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    game = new WhackAMoleGame();
    scoreDisplay.textContent = '0';
});

playAgainBtn.addEventListener('click', () => {
    if (game) {
        game.reset();
    } else {
        game = new WhackAMoleGame();
    }
});

resetBtn.addEventListener('click', () => {
    if (game) {
        game.reset();
    } else {
        game = new WhackAMoleGame();
        startScreen.classList.add('hidden');
    }
});

// Instructions modal controls
instructionsBtn.addEventListener('click', () => {
    instructionsModal.classList.remove('hidden');
});

closeInstructionsBtn.addEventListener('click', () => {
    instructionsModal.classList.add('hidden');
});

// Theme Toggle Functionality
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    isDarkMode = document.documentElement.classList.contains('dark');
    
    // Save preference to localStorage
    if (isDarkMode) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Initialize theme based on localStorage
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    isDarkMode = true;
} else {
    document.documentElement.classList.remove('dark');
    isDarkMode = false;
}
