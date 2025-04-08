// DOM Elements
const targetColor = document.getElementById('target-color');
const currentColor = document.getElementById('current-color');
const matchBtn = document.getElementById('match-btn');
const timeBar = document.getElementById('time-bar');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const finalScoreDisplay = document.getElementById('finalScore');
const finalBestScoreDisplay = document.getElementById('finalBestScore');
const reactionTimeDisplay = document.getElementById('reaction-time');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('startBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const resetBtn = document.getElementById('resetBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const closeInstructionsBtn = document.getElementById('closeInstructions');
const instructionsModal = document.getElementById('instructionsModal');
const themeToggle = document.getElementById('theme-toggle');
const lifeElements = document.querySelectorAll('.life');

// Game variables
let game;
let bestScore = localStorage.getItem('colormatch_bestScore') || 0;
let isDarkMode = document.documentElement.classList.contains('dark');

// Define Game Colors
const COLORS = [
    '#FF5252', // Red
    '#FFEB3B', // Yellow
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#00BCD4', // Cyan
    '#E91E63'  // Pink
];

// Game class
class ColorMatchGame {
    constructor() {
        this.score = 0;
        this.lives = 3; // Start with 3 lives
        this.isRunning = true;
        this.targetColorIndex = this.getRandomColorIndex();
        this.currentColorIndex = this.getRandomColorIndex();
        this.timeRemaining = 100; // percentage
        this.timeDecrement = 0.5; // How fast the time bar decreases
        this.changeInterval = 2000; // Time between color changes in ms
        this.changeSpeedUp = 100; // How much to speed up color changes per point
        this.colorChangeTimer = null;
        this.timeBarTimer = null;
        this.reactionTimes = []; // Array to store reaction times
        this.matchTime = null; // When colors matched
        this.lastColorChangeTime = null; // When the last color change happened
        this.matchProbability = 0.4; // Increased from 0.3 to 0.4 for better gameplay
        this.lastLifeLost = 0; // Timestamp of last life lost to prevent multiple losses
        
        // Update displays
        this.updateDisplay();
        
        // Start game timers
        this.startTimers();
    }
    
    getRandomColorIndex() {
        return Math.floor(Math.random() * COLORS.length);
    }
    
    startTimers() {
        // Reset match time
        this.matchTime = null;
        
        // Start time bar countdown
        clearInterval(this.timeBarTimer);
        this.timeBarTimer = setInterval(() => {
            if (this.isRunning) {
                this.timeRemaining -= this.timeDecrement;
                timeBar.style.width = `${this.timeRemaining}%`;
                
                // Update time bar color based on time remaining
                if (this.timeRemaining > 60) {
                    timeBar.className = 'absolute left-0 top-0 h-full bg-green-500';
                } else if (this.timeRemaining > 30) {
                    timeBar.className = 'absolute left-0 top-0 h-full bg-yellow-500';
                } else {
                    timeBar.className = 'absolute left-0 top-0 h-full bg-red-500';
                }
                
                // Time's up - lose a life
                if (this.timeRemaining <= 0) {
                    this.loseLife();
                    // Reset time and change colors to prevent multiple life losses
                    this.timeRemaining = 100;
                    timeBar.style.width = '100%';
                    this.changeColors();
                }
            }
        }, 50);
        
        // Start color change timer
        this.scheduleNextColorChange();
    }
    
    scheduleNextColorChange() {
        clearTimeout(this.colorChangeTimer);
        
        // Calculate current interval based on score
        // Minimum interval of 500ms to keep the game playable
        const currentInterval = Math.max(500, this.changeInterval - (this.score * this.changeSpeedUp));
        
        this.colorChangeTimer = setTimeout(() => {
            if (this.isRunning) {
                this.changeColors();
            }
        }, currentInterval);
    }
    
    changeColors() {
        // Reset time bar
        this.timeRemaining = 100;
        timeBar.style.width = '100%';
        timeBar.className = 'absolute left-0 top-0 h-full bg-green-500';
        
        // Randomly decide whether to make colors match
        // Probability increases slightly with score to provide more opportunities
        const matchProbability = Math.min(0.7, this.matchProbability + (this.score * 0.01));
        const shouldMatch = Math.random() < matchProbability;
        
        if (shouldMatch) {
            // Make colors match
            this.targetColorIndex = this.getRandomColorIndex();
            this.currentColorIndex = this.targetColorIndex;
            this.matchTime = Date.now(); // Record when match occurred
        } else {
            // Make sure colors don't match
            this.targetColorIndex = this.getRandomColorIndex();
            do {
                this.currentColorIndex = this.getRandomColorIndex();
            } while (this.currentColorIndex === this.targetColorIndex);
            this.matchTime = null; // Reset match time
        }
        
        // Update the displayed colors
        this.updateDisplay();
        
        // Record when this color change happened
        this.lastColorChangeTime = Date.now();
        
        // Schedule next color change
        this.scheduleNextColorChange();
    }
    
    updateDisplay() {
        // Update colors
        targetColor.style.backgroundColor = COLORS[this.targetColorIndex];
        currentColor.style.backgroundColor = COLORS[this.currentColorIndex];
        
        // Update score
        scoreDisplay.textContent = this.score;
        
        // Update lives display - fixed to properly show/hide heart icons
        lifeElements.forEach((life, index) => {
            if (index < this.lives) {
                life.classList.remove('lost');
            } else {
                life.classList.add('lost');
            }
        });
    }
    
    checkMatch() {
        if (!this.isRunning) return;
        
        if (this.targetColorIndex === this.currentColorIndex) {
            // Correct match!
            this.score++;
            scoreDisplay.textContent = this.score;
            scoreDisplay.classList.add('score-up');
            setTimeout(() => {
                scoreDisplay.classList.remove('score-up');
            }, 300);
            
            // Add visual feedback
            matchBtn.classList.add('pulse');
            setTimeout(() => {
                matchBtn.classList.remove('pulse');
            }, 500);
            
            // Record reaction time if this was a match
            if (this.matchTime) {
                const reactionTime = Date.now() - this.matchTime;
                this.reactionTimes.push(reactionTime);
            }
            
            // Change colors immediately
            this.changeColors();
        } else {
            // Wrong match - lose a life
            this.loseLife();
            
            // Add shake animation
            matchBtn.classList.add('shake');
            setTimeout(() => {
                matchBtn.classList.remove('shake');
            }, 500);
        }
    }
    
    loseLife() {
        const now = Date.now();
        if (now - this.lastLifeLost < 500) return; // Prevent multiple losses in a short time
        
        this.lives--;
        this.lastLifeLost = now;
        
        // Visual feedback when losing a life
        const heartToLose = lifeElements[this.lives];
        if (heartToLose) {
            heartToLose.classList.add('lost');
            heartToLose.classList.add('pulse-red');
            setTimeout(() => {
                heartToLose.classList.remove('pulse-red');
            }, 500);
        }
        
        // Check if game over
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.isRunning = false;
        
        // Clear all timers
        clearInterval(this.timeBarTimer);
        clearTimeout(this.colorChangeTimer);
        
        // Update best score
        if (this.score > bestScore) {
            bestScore = this.score;
            localStorage.setItem('colormatch_bestScore', bestScore);
        }
        
        // Calculate average reaction time
        let avgReactionTime = 0;
        if (this.reactionTimes.length > 0) {
            avgReactionTime = Math.round(
                this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
            );
        }
        
        // Update displays
        finalScoreDisplay.textContent = this.score;
        finalBestScoreDisplay.textContent = bestScore;
        bestScoreDisplay.textContent = bestScore;
        reactionTimeDisplay.querySelector('span').textContent = avgReactionTime;
        
        // Show game over screen
        gameOverScreen.classList.remove('hidden');
    }
    
    reset() {
        this.score = 0;
        this.lives = 3;
        this.isRunning = true;
        this.timeRemaining = 100;
        this.reactionTimes = [];
        
        // Update displays
        scoreDisplay.textContent = this.score;
        bestScoreDisplay.textContent = bestScore;
        timeBar.style.width = '100%';
        timeBar.className = 'absolute left-0 top-0 h-full bg-green-500';
        
        // Reset lives display
        lifeElements.forEach(life => life.classList.remove('lost'));
        
        // Hide game over screen
        gameOverScreen.classList.add('hidden');
        
        // Change colors and start timers
        this.changeColors();
        this.startTimers();
    }
}

// Event listeners
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    game = new ColorMatchGame();
    scoreDisplay.textContent = '0';
});

playAgainBtn.addEventListener('click', () => {
    if (game) {
        game.reset();
    } else {
        game = new ColorMatchGame();
    }
});

resetBtn.addEventListener('click', () => {
    if (game) {
        game.reset();
    } else {
        game = new ColorMatchGame();
        startScreen.classList.add('hidden');
    }
});

matchBtn.addEventListener('click', () => {
    if (game && game.isRunning) {
        game.checkMatch();
    }
});

// Touch and click event for match button
['touchstart', 'click'].forEach(eventType => {
    matchBtn.addEventListener(eventType, (e) => {
        e.preventDefault(); // Prevent double-firing on mobile
        if (game && game.isRunning) {
            game.checkMatch();
        }
    }, { passive: false });
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

// Initialize best score
bestScoreDisplay.textContent = bestScore;
