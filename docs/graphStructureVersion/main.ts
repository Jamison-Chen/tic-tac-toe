import TicTacToe from "./ticTacToe.js";
import MachinePlayer from "./machinePlayer.js";
import RandomPlayer from "./randomPlayer.js";
import HumanPlayer from "./humanPlayer.js";

const controlBar: HTMLElement = document.getElementById(
    "control-bar"
) as HTMLElement;
const restartBtn: HTMLButtonElement = document.getElementById(
    "restart-btn"
) as HTMLButtonElement;
const reloadBtn: HTMLButtonElement = document.getElementById(
    "reload-btn"
) as HTMLButtonElement;
const multiplayerBtn: HTMLButtonElement = document.getElementById(
    "multiplayer-btn"
) as HTMLButtonElement;
const naiveMachineBtn: HTMLButtonElement = document.getElementById(
    "naive-machine-btn"
) as HTMLButtonElement;
const trainedMachineBtn: HTMLButtonElement = document.getElementById(
    "trained-machine-btn"
) as HTMLButtonElement;
const cellDivs = document.querySelectorAll("[data-cell]");
const board: HTMLElement = document.getElementById("main-board") as HTMLElement;
const winningMessageDiv: HTMLElement = document.getElementById(
    "winning-message"
) as HTMLElement;
const winningMessageText: HTMLElement = document.querySelector(
    "[data-winning-message-text]"
) as HTMLElement;

const game: TicTacToe = new TicTacToe();
let machinePlayer = new MachinePlayer();
let randomPlayer = new RandomPlayer();
let xTurn: boolean;
let mode: "single" | "multi";
let singleModeHumanMark: "O" | "X";
let singleModeMachineMark: "O" | "X";
const winningCombinations: number[][] = [
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
naiveMachineBtn.addEventListener("click", () => startSinglePlayerMode(false));
trainedMachineBtn.addEventListener("click", () => startSinglePlayerMode(true));
reloadBtn.addEventListener("click", () => location.reload());
restartBtn.addEventListener("click", () => location.reload());

function startSinglePlayerMode(shouldTrain: boolean): void {
    disableBtns();
    setTimeout(() => {
        board.classList.add("show");
        mode = "single";
        if (shouldTrain) {
            game.trainMachine(20000, 2000, machinePlayer, randomPlayer);
        }
        setupGameBoard();
        game.startGame(machinePlayer, new HumanPlayer());
        if (game.currentMover === 1) {
            singleModeHumanMark = "X";
            singleModeMachineMark = "O";
            machineMakeMove(machinePlayer);
        } else {
            singleModeHumanMark = "O";
            singleModeMachineMark = "X";
        }
    });
}

function disableBtns(): void {
    multiplayerBtn.disabled = true;
    naiveMachineBtn.disabled = true;
    trainedMachineBtn.disabled = true;
    controlBar.style.bottom = "0";
}

function machineMakeMove(machinePlayer: MachinePlayer): void {
    machinePlayer.playMark = singleModeMachineMark;
    let pos = machinePlayer.select();
    game.board[pos[0]][pos[1]] = singleModeMachineMark;
    const aCell = document.getElementById(`${pos[0]},${pos[1]}`) as HTMLElement;
    placeMark(aCell, singleModeMachineMark);
    aCell.removeEventListener("click", singleModeClickCellListener);
    game.judge();

    // Human's turn
    board.classList.replace(singleModeMachineMark, singleModeHumanMark);
}

function startMultiplayerMode(): void {
    disableBtns();
    board.classList.add("show");
    mode = "multi";
    setupGameBoard();
}

// Game always starts with "O"
function setupGameBoard(): void {
    board.classList.remove("X");
    board.classList.add("O");
    if (mode === "single") {
        cellDivs.forEach((each) => {
            each.classList.remove("O");
            each.classList.remove("X");
            each.removeEventListener("click", singleModeClickCellListener);
            each.removeEventListener("click", multiModeClickCellListener);
            each.addEventListener("click", singleModeClickCellListener, {
                once: true,
            });
        });
    } else {
        xTurn = false;
        cellDivs.forEach((each) => {
            each.classList.remove("O");
            each.classList.remove("X");
            each.removeEventListener("click", multiModeClickCellListener);
            each.removeEventListener("click", singleModeClickCellListener);
            each.addEventListener("click", multiModeClickCellListener, {
                once: true,
            });
        });
    }
    winningMessageDiv.className = "";
}

function singleModeClickCellListener(e: Event): void {
    if (e.currentTarget instanceof HTMLElement) {
        placeMark(e.currentTarget, singleModeHumanMark);
        let pos: [number, number] = [
            parseInt(e.currentTarget.id.split(",")[0]),
            parseInt(e.currentTarget.id.split(",")[1]),
        ];
        game.board[pos[0]][pos[1]] = singleModeHumanMark;
        machinePlayer.moveWithOpponent(pos, game.board);
        game.judge();
        board.classList.replace(singleModeHumanMark, singleModeMachineMark);

        // Machine's turn
        if (game.gameRunning) machineMakeMove(machinePlayer);
    }
}

function multiModeClickCellListener(e: Event): void {
    let playMark: "O" | "X" = xTurn ? "X" : "O";
    placeMark(e.currentTarget as HTMLElement, playMark);
    if (hasWinner(playMark)) multiplayerEndGame(false);
    else if (isDraw()) multiplayerEndGame(true);
    else swapTurn(playMark);
}

function placeMark(cell: HTMLElement, playMark: string): void {
    cell.classList.add(playMark);
}

function hasWinner(playMark: "O" | "X"): boolean {
    return winningCombinations.some((each) => {
        return each.every((i) => {
            return cellDivs[i].classList.contains(playMark);
        });
    });
}

function isDraw(): boolean {
    return [...cellDivs].every((each) => {
        return each.classList.contains("X") || each.classList.contains("O");
    });
}

function multiplayerEndGame(isDraw: boolean): void {
    if (isDraw) winningMessageText.innerHTML = "Draw!";
    else winningMessageText.innerHTML = `${xTurn ? "X" : "O"} wins!`;
    winningMessageDiv.className = "show";
}

function swapTurn(playMark: string): void {
    if (playMark === "O") board.classList.replace("O", "X");
    else board.classList.replace("X", "O");
    xTurn = !xTurn;
}
