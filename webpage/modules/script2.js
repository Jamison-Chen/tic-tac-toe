import { TicTacToe } from './trainField2.js';
const game = new TicTacToe();
const controlBar = document.getElementById("control-bar");
const restartBtn = document.getElementById("restart-btn");
const reloadBtn = document.getElementById("reload-btn");
const multiplayerBtn = document.getElementById("multiplayer-btn");
const naiveMachineBtn = document.getElementById("naive-machine-btn");
const trainedMachineBtn = document.getElementById("trained-machine-btn");
const cellDivs = document.querySelectorAll("[data-cell]");
const board = document.getElementById("main-board");
const winningMessageDiv = document.getElementById("winning-message");
const winningMessageText = document.querySelector("[data-winning-message-text]");
let xTurn;
let mode;
let singleModeHumanMark;
let singleModeMachineMark;
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
multiplayerBtn === null || multiplayerBtn === void 0 ? void 0 : multiplayerBtn.addEventListener("click", multiplayerMode);
naiveMachineBtn === null || naiveMachineBtn === void 0 ? void 0 : naiveMachineBtn.addEventListener("click", (e) => { singlePlayerMode(e, false); });
trainedMachineBtn === null || trainedMachineBtn === void 0 ? void 0 : trainedMachineBtn.addEventListener("click", (e) => { singlePlayerMode(e, true); });
reloadBtn === null || reloadBtn === void 0 ? void 0 : reloadBtn.addEventListener("click", (e) => { location.reload(); });
restartBtn === null || restartBtn === void 0 ? void 0 : restartBtn.addEventListener("click", (e) => { location.reload(); });
function disableBtns() {
    if (trainedMachineBtn instanceof HTMLButtonElement && multiplayerBtn instanceof HTMLButtonElement && naiveMachineBtn instanceof HTMLButtonElement && board != null && controlBar instanceof HTMLElement) {
        multiplayerBtn.disabled = true;
        naiveMachineBtn.disabled = true;
        trainedMachineBtn.disabled = true;
        controlBar.style.bottom = "0";
    }
}
function singlePlayerMode(e, shouldTrain) {
    disableBtns();
    setTimeout(() => {
        board === null || board === void 0 ? void 0 : board.classList.add("show");
        mode = "single";
        if (shouldTrain)
            game.trainMachine(60000, 6000, "random");
        game.play(1, "", "human");
        setupGameBoard();
        if (game.mover == 1) {
            singleModeHumanMark = "X";
            singleModeMachineMark = "O";
            machineMakeMove();
        }
        else {
            singleModeHumanMark = "O";
            singleModeMachineMark = "X";
        }
    });
}
function machineMakeMove() {
    let pos = game.machineMakeMove(singleModeMachineMark);
    if (pos instanceof Array) {
        const aCell = document.getElementById(`${pos[0]},${pos[1]}`);
        if (aCell != null) {
            placeMark(aCell, singleModeMachineMark);
            aCell.removeEventListener("click", handleClickSingle);
        }
    }
    game.judge(singleModeMachineMark);
    // Human's turn
    board === null || board === void 0 ? void 0 : board.classList.replace(singleModeMachineMark, singleModeHumanMark);
}
function multiplayerMode() {
    disableBtns();
    board === null || board === void 0 ? void 0 : board.classList.add("show");
    mode = "multi";
    setupGameBoard();
}
function setupGameBoard() {
    if (board != null && winningMessageDiv != null) {
        board.classList.remove("X");
        board.classList.remove("O");
        board.classList.add("O");
        if (mode == "single") {
            cellDivs.forEach(each => {
                each.classList.remove("O");
                each.classList.remove("X");
                each.removeEventListener("click", handleClickSingle);
                each.removeEventListener("click", handleClickMulti);
                each.addEventListener("click", handleClickSingle, { once: true });
            });
        }
        else {
            xTurn = false;
            cellDivs.forEach(each => {
                each.classList.remove("O");
                each.classList.remove("X");
                each.removeEventListener("click", handleClickMulti);
                each.removeEventListener("click", handleClickSingle);
                each.addEventListener("click", handleClickMulti, { once: true });
            });
        }
        winningMessageDiv.className = "";
    }
}
function handleClickSingle(e) {
    if (e.currentTarget instanceof HTMLElement) {
        placeMark(e.currentTarget, singleModeHumanMark);
        let pos = [parseInt(e.currentTarget.id.split(",")[0]),
            parseInt(e.currentTarget.id.split(",")[1])];
        game.virtualBoard[pos[0]][pos[1]] = singleModeHumanMark;
        game.player.moveWithOpponent(game.virtualBoard);
        game.judge(singleModeMachineMark);
        // Machine's turn
        board === null || board === void 0 ? void 0 : board.classList.replace(singleModeHumanMark, singleModeMachineMark);
        if (game.gameRunning)
            machineMakeMove();
    }
}
function handleClickMulti(e) {
    if (e.currentTarget instanceof HTMLElement) {
        const currentPlayer = xTurn ? "X" : "O";
        placeMark(e.currentTarget, currentPlayer);
        if (hasWinner(currentPlayer))
            multiplayerEndGame(false);
        else if (isDraw())
            multiplayerEndGame(true);
        else
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
        return each.classList.contains("X") || each.classList.contains("O");
    });
}
function multiplayerEndGame(isDraw) {
    if (winningMessageText != null && winningMessageDiv != null) {
        if (isDraw)
            winningMessageText.innerHTML = "Draw!";
        else
            winningMessageText.innerHTML = `${xTurn ? "X" : "O"} wins!`;
        winningMessageDiv.className = "show";
    }
}
function swapTurn(currentPlayer) {
    if (currentPlayer == "O")
        board === null || board === void 0 ? void 0 : board.classList.replace("O", "X");
    else
        board === null || board === void 0 ? void 0 : board.classList.replace("X", "O");
    xTurn = !xTurn;
}
