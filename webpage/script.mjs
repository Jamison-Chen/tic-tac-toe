const cellDivs = document.querySelectorAll("[data-cell]");
const board = document.getElementById("main-board");
const winningMessageDiv = document.getElementById("winning-message");
const winningMessageText = document.querySelector("[data-winning-message-text]");
let xTurn;
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

startGame("O");
document.getElementById("restart-btn").addEventListener("click", e => {
    startGame("O");
});


function startGame(firstPlayer = "") {
    xTurn = (firstPlayer == "X");
    board.classList.remove("X");
    board.classList.remove("O");
    board.classList.add(firstPlayer);
    cellDivs.forEach(each => {
        each.classList.remove("O");
        each.classList.remove("X");
        each.removeEventListener("click", handleClick);
        each.addEventListener("click", handleClick, {
            once: true
        });
    });
    winningMessageDiv.className = "";
}

function handleClick(e) {
    const cell = e.target;
    const currentPlayer = xTurn ? "X" : "O";
    placeMark(cell, currentPlayer);
    if (hasWinner(currentPlayer)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurn(currentPlayer);
    }
}

function placeMark(cell, currentPlayer) {
    cell.classList.add(currentPlayer);
}

function hasWinner(currentPlayer) {
    return winningCombinations.some(each => {
        return each.every(i => {
            return cellDivs[i].classList.contains(currentPlayer);
        });
    });
}

function isDraw() {
    return [...cellDivs].every(each => {
        return each.classList.contains("X") ||
            each.classList.contains("O");
    });
}

function endGame(isDraw) {
    if (isDraw) {
        winningMessageText.innerHTML = "Draw!";
    } else {
        winningMessageText.innerHTML = `${xTurn ? "X" : "O"} wins!`;
    }
    winningMessageDiv.className = "show";
}

function swapTurn(currentPlayer) {
    board.className = (currentPlayer == "O") ? "X" : "O";
    xTurn = !xTurn;
}