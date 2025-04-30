// Card Counting Practice - Main Script

// Game state
let gameState = {
    suits: 4,
    decks: 1,
    cards: [],
    currentCount: 0,
    showCount: false,
    lastCardRevealed: false
};

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gameComplete = document.getElementById('game-complete');
const guessModal = document.getElementById('guess-modal');
const cardsRemainingText = document.getElementById('cards-remaining');
const cardStack = document.getElementById('card-stack');
const swipeInstruction = document.getElementById('swipe-instruction');
const revealBtn = document.getElementById('reveal-btn');

// Card data
const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Convert numeric value to display value (1 = A, 11 = J, etc.)
function getDisplayValue(value) {
    if (value === 1) return 'A';
    if (value === 11) return 'J';
    if (value === 12) return 'Q';
    if (value === 13) return 'K';
    return value.toString();
}

// Generate a deck of cards based on number of suits and decks
function generateDeck(numSuits, numDecks) {
    const deck = [];
    const selectedSuits = suits.slice(0, numSuits);
    
    for (let d = 0; d < numDecks; d++) {
        for (const suit of selectedSuits) {
            for (const value of values) {
                deck.push({
                    suit,
                    value,
                    displayValue: getDisplayValue(value)
                });
            }
        }
    }
    
    return deck;
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
    const newDeck = [...deck];
    
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    return newDeck;
}

// Calculate the count value of a card
function getCardCountValue(card) {
    if (card.value >= 2 && card.value <= 6) {
        return 1;
    } else if (card.value >= 10 || card.value === 1) { // 10, J, Q, K, A
        return -1;
    } else {
        return 0;
    }
}

// Start a new game
function startGame() {
    // Get selected options
    gameState.suits = parseInt(document.getElementById('suits').value);
    gameState.decks = parseInt(document.getElementById('decks').value);
    
    // Generate and shuffle deck
    const newDeck = generateDeck(gameState.suits, gameState.decks);
    gameState.cards = shuffleDeck(newDeck);
    gameState.currentCount = 0;
    gameState.showCount = false;
    gameState.lastCardRevealed = false;
    
    // Update UI
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameComplete.classList.add('hidden');
    guessModal.classList.add('hidden');
    
    updateCardsRemainingText();
    renderCardStack();
}

// Update the cards remaining text
function updateCardsRemainingText() {
    cardsRemainingText.textContent = `Cards Remaining: ${gameState.cards.length}`;
}

// Render the card stack
function renderCardStack() {
    // Clear the card stack
    cardStack.innerHTML = '';
    
    if (gameState.cards.length === 0) {
        return;
    }
    
    // Add background cards (max 3)
    for (let i = Math.min(gameState.cards.length - 1, 2); i >= 1; i--) {
        const bgCard = document.createElement('div');
        bgCard.className = 'card-stack-bg';
        bgCard.style.transform = `translateY(${i * 4}px) translateX(${i * 4}px) scale(${1 - i * 0.05})`;
        bgCard.style.zIndex = -i;
        cardStack.appendChild(bgCard);
    }
    
    // Add the top card
    const topCard = gameState.cards[0];
    const isLastCard = gameState.cards.length === 1;
    const showCardBack = isLastCard && !gameState.lastCardRevealed;
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.id = 'top-card';
    
    if (showCardBack) {
        // Show card back for the last card
        cardElement.className += ' card-back';
        cardElement.innerHTML = `
            <div class="card-back-inner">
                <span>?</span>
            </div>
        `;
    } else {
        // Show card face
        cardElement.innerHTML = `
            <img src="playing-cards-master/${topCard.suit}_${topCard.displayValue}.png" alt="${topCard.displayValue} of ${topCard.suit}">
        `;
        
        // Add drag events for swiping
        setupCardDragging(cardElement);
    }
    
    cardStack.appendChild(cardElement);
    
    // Show/hide swipe instruction
    swipeInstruction.style.display = showCardBack ? 'none' : 'block';
}

// Setup card dragging for swipe
function setupCardDragging(cardElement) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    // Mouse events
    cardElement.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events
    cardElement.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', endDrag);
    
    function startDrag(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        cardElement.style.transition = 'none';
        swipeInstruction.style.display = 'none';
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = clientX - startX;
        
        // Apply the transform
        cardElement.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;
    }
    
    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        
        const threshold = 100; // minimum distance to trigger a swipe
        
        if (Math.abs(currentX) > threshold) {
            // Animate the card flying off the screen
            const direction = currentX < 0 ? -1 : 1;
            cardElement.style.transition = 'transform 0.5s ease';
            cardElement.style.transform = `translateX(${direction * 1000}px) rotate(${direction * 45}deg)`;
            
            // Remove the card after animation
            setTimeout(() => {
                removeTopCard();
            }, 500);
        } else {
            // Return the card to the center
            cardElement.style.transition = 'transform 0.3s ease';
            cardElement.style.transform = 'translateX(0) rotate(0)';
            swipeInstruction.style.display = 'block';
        }
    }
}

// Remove the top card
function removeTopCard() {
    if (gameState.cards.length === 0) return;
    
    const card = gameState.cards[0];
    
    // Update the count based on the card value
    const countValue = getCardCountValue(card);
    gameState.currentCount += countValue;
    
    // Check if this is the second-to-last card
    if (gameState.cards.length === 2) {
        showGuessModal();
    }
    
    // Remove the card from the deck
    gameState.cards.shift();
    
    // Update UI
    updateCardsRemainingText();
    
    if (gameState.cards.length === 0) {
        // Game complete
        gameScreen.classList.add('hidden');
        gameComplete.classList.remove('hidden');
    } else {
        renderCardStack();
    }
}

// Show the guess modal
function showGuessModal() {
    guessModal.classList.remove('hidden');
}

// Handle user's guess for the last card
function handleGuess(guess) {
    gameState.lastCardRevealed = true;
    guessModal.classList.add('hidden');
    renderCardStack();
}

// Reset the game
function resetGame() {
    gameComplete.classList.add('hidden');
    setupScreen.classList.remove('hidden');
}

// Toggle showing the count
function toggleShowCount() {
    gameState.showCount = !gameState.showCount;
    
    if (gameState.showCount) {
        revealBtn.textContent = `Current Count: ${gameState.currentCount}`;
    } else {
        revealBtn.textContent = 'Reveal';
    }
}

// Event Listeners
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('play-again').addEventListener('click', resetGame);
document.getElementById('reveal-btn').addEventListener('click', toggleShowCount);

// Guess buttons
document.getElementById('guess-low').addEventListener('click', () => handleGuess('low'));
document.getElementById('guess-zero').addEventListener('click', () => handleGuess('zero'));
document.getElementById('guess-high').addEventListener('click', () => handleGuess('high'));