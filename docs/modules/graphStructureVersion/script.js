import TicTacToe from "./ticTacToe.js";
import MachinePlayer from "./machinePlayer.js";
import RandomPlayer from "./randomPlayer.js";
import HumanPlayer from "./humanPlayer.js";
const game = new TicTacToe();
let machinePlayer;
let randomPlayer = new RandomPlayer([
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
]);
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
    [2, 4, 6],
];
multiplayerBtn.addEventListener("click", () => startMultiplayerMode());
naiveMachineBtn.addEventListener("click", (e) => startSinglePlayerMode(e, false));
trainedMachineBtn.addEventListener("click", (e) => startSinglePlayerMode(e, true));
reloadBtn.addEventListener("click", (e) => location.reload());
restartBtn.addEventListener("click", (e) => location.reload());
function disableBtns() {
    multiplayerBtn.disabled = true;
    naiveMachineBtn.disabled = true;
    trainedMachineBtn.disabled = true;
    controlBar.style.bottom = "0";
}
function startSinglePlayerMode(e, shouldTrain) {
    disableBtns();
    setTimeout(() => {
        board.classList.add("show");
        mode = "single";
        machinePlayer = new MachinePlayer();
        if (shouldTrain) {
            game.trainMachine(20000, 2000, machinePlayer, randomPlayer);
        }
        setupGameBoard();
        game.play(1, machinePlayer, new HumanPlayer(), false);
        if (game.mover === 1) {
            singleModeHumanMark = "X";
            singleModeMachineMark = "O";
            machineMakeMove(machinePlayer);
        }
        else {
            singleModeHumanMark = "O";
            singleModeMachineMark = "X";
        }
    });
}
function machineMakeMove(machinePlayer) {
    let pos = machinePlayer.select(singleModeMachineMark);
    game.virtualBoard[pos[0]][pos[1]] = singleModeMachineMark;
    const aCell = document.getElementById(`${pos[0]},${pos[1]}`);
    placeMark(aCell, singleModeMachineMark);
    aCell.removeEventListener("click", handleClickSingle);
    game.judge();
    // Human's turn
    board.classList.replace(singleModeMachineMark, singleModeHumanMark);
}
function startMultiplayerMode() {
    disableBtns();
    board.classList.add("show");
    mode = "multi";
    setupGameBoard();
}
function setupGameBoard() {
    board.classList.remove("X");
    board.classList.remove("O");
    board.classList.add("O");
    if (mode === "single") {
        cellDivs.forEach((each) => {
            each.classList.remove("O");
            each.classList.remove("X");
            each.removeEventListener("click", handleClickSingle);
            each.removeEventListener("click", handleClickMulti);
            each.addEventListener("click", handleClickSingle, {
                once: true,
            });
        });
    }
    else {
        xTurn = false;
        cellDivs.forEach((each) => {
            each.classList.remove("O");
            each.classList.remove("X");
            each.removeEventListener("click", handleClickMulti);
            each.removeEventListener("click", handleClickSingle);
            each.addEventListener("click", handleClickMulti, {
                once: true,
            });
        });
    }
    winningMessageDiv.className = "";
}
function handleClickSingle(e) {
    if (e.currentTarget instanceof HTMLElement) {
        placeMark(e.currentTarget, singleModeHumanMark);
        let pos = [
            parseInt(e.currentTarget.id.split(",")[0]),
            parseInt(e.currentTarget.id.split(",")[1]),
        ];
        game.virtualBoard[pos[0]][pos[1]] = singleModeHumanMark;
        machinePlayer.moveWithOpponent(pos, game.virtualBoard);
        game.judge();
        board.classList.replace(singleModeHumanMark, singleModeMachineMark);
        // Machine's turn
        if (game.gameRunning)
            machineMakeMove(machinePlayer);
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
    return winningCombinations.some((each) => {
        return each.every((i) => {
            return cellDivs[i].classList.contains(currentPlayer);
        });
    });
}
function isDraw() {
    return [...cellDivs].every((each) => {
        return each.classList.contains("X") || each.classList.contains("O");
    });
}
function multiplayerEndGame(isDraw) {
    if (isDraw)
        winningMessageText.innerHTML = "Draw!";
    else
        winningMessageText.innerHTML = `${xTurn ? "X" : "O"} wins!`;
    winningMessageDiv.className = "show";
}
function swapTurn(currentPlayer) {
    if (currentPlayer === "O")
        board.classList.replace("O", "X");
    else
        board.classList.replace("X", "O");
    xTurn = !xTurn;
}
