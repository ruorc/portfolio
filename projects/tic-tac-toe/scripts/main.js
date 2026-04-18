const boardButtons = document.querySelectorAll('.cell');
const gameStatusText = document.querySelector('.status-box h2');
const showCurrentPlayerName = document.querySelector('.current-player');
const resetBtn = document.querySelector('.reset-btn');
const gameInfo = document.querySelector('.game-info');
const actions = document.querySelector('.actions');
const SIZE = 3;
const winingMasks = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let currentPlayer = "X";
let hasWinner = false;
let moves = [];

// Initialize game events once
init();

function init() {
    boardButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => handleBoardButtonClick(index, event));
    });

    resetBtn.addEventListener('click', handleResetButtonClick);
}

function handleBoardButtonClick(index, event) {
    const button = event.currentTarget;

    // Prevent clicking on already occupied cells
    if (button.innerText !== "" || hasWinner) return;

    // Show reset button on the first move
    if (moves.length === 0) toggleUI(true);

    makeMove(button, index);

    if (moves.length >= SIZE * 2 - 1) {
        const winningCombo = getWiningMask(index);

        if (winningCombo) {
            hasWinner = true;

            endGame(winningCombo);

            return;
        }
    }

    if (moves.length === SIZE * SIZE) {
        endGame(null);

        return;
    }

    // Switch turn
    changeCurrentPlayer();
}

function makeMove(button, index) {
    // Add visual symbols and classes
    addVisibleEffects(button);

    // Track the move
    moves.push({ index, player: currentPlayer, name: button.name });

    // Lock the cell
    disableButton(button);
}

function addVisibleEffects(button) {
    const playerClass = currentPlayer === "X" ? "x-player" : "o-player";
    button.classList.add(playerClass);

    // Insert the player's symbol wrapped in a span for CSS animations
    button.innerHTML = `<span>${currentPlayer}</span>`;
}

function changeCurrentPlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";

    // UI update for current player display
    showCurrentPlayerName.classList.toggle("o-color", currentPlayer === "O");
    showCurrentPlayerName.textContent = currentPlayer;
}

function handleResetButtonClick() {
    // Reset core logic
    currentPlayer = "X";
    hasWinner = false;
    moves = [];

    // Clear board visually and functionally
    boardButtons.forEach(button => {
        button.innerHTML = "";
        button.innerText = "";
        button.className = 'cell';
        button.disabled = false;
    });

    // Reset status display
    gameStatusText.innerText = "תור נוכחי";
    showCurrentPlayerName.classList.remove("o-color");
    showCurrentPlayerName.textContent = "X";

    // Show instruction, hide reset button
    toggleUI(false);
}

function toggleUI(isGameStarted) {
    gameInfo.classList.toggle("hidden", isGameStarted);
    actions.classList.toggle("hidden", !isGameStarted);
}

function disableButton(button) {
    button.disabled = true;

    // Optional 
    button.classList.add('disabled');
}

function getWiningMask(lastIndex) {
    if (moves.length < 5) return null;

    // Take only those masks that include the current cell
    const relevantMasks = winingMasks.filter(mask => mask.includes(lastIndex));
    const playerIndexes = moves.filter(item => item.player === currentPlayer).map(item => item.index);

    return relevantMasks.find(mask =>
        mask.every(index => playerIndexes.includes(index))
    ) || null;
}

function endGame(winningCombo) {
    boardButtons.forEach((button) => {
        disableButton(button);
    });

    if (hasWinner && winningCombo) {
        // Highlight only the winning cells
        winningCombo.forEach(index => {
            boardButtons[index].classList.add('winner-cell');
        });
    } 
    
    gameStatusText.innerText = "!מזל טוב";
    showCurrentPlayerName.innerText = (hasWinner ? `ניצח במשחק ${currentPlayer}` : 'זה תיקו');
}
