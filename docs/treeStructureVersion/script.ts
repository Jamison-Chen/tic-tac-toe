import { TicTacToe } from './trainField.js';

const game: TicTacToe = new TicTacToe();

const controlBar: HTMLElement | null = document.getElementById("control-bar");
const restartBtn: HTMLElement | null = document.getElementById("restart-btn");
const reloadBtn: HTMLElement | null = document.getElementById("reload-btn");
const multiplayerBtn: HTMLElement | null = document.getElementById("multiplayer-btn");
const naiveMachineBtn: HTMLElement | null = document.getElementById("naive-machine-btn");
const trainedMachineBtn: HTMLElement | null = document.getElementById("trained-machine-btn");
const cellDivs = document.querySelectorAll("[data-cell]");
const board: HTMLElement | null = document.getElementById("main-board");
const winningMessageDiv: HTMLElement | null = document.getElementById("winning-message");
const winningMessageText: HTMLElement | null = document.querySelector("[data-winning-message-text]");

let xTurn: boolean;
let mode: string;

const winningCombinations: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

multiplayerBtn?.addEventListener("click", multiplayerMode)
naiveMachineBtn?.addEventListener("click", (e) => { singlePlayerMode(e, false) });
trainedMachineBtn?.addEventListener("click", (e) => { singlePlayerMode(e, true) });
reloadBtn?.addEventListener("click", (e) => { location.reload() });
restartBtn?.addEventListener("click", (e) => { location.reload() });

function disableBtns(): void {
    if (trainedMachineBtn instanceof HTMLButtonElement && multiplayerBtn instanceof HTMLButtonElement && naiveMachineBtn instanceof HTMLButtonElement && board != null && controlBar instanceof HTMLElement) {
        multiplayerBtn.disabled = true;
        naiveMachineBtn.disabled = true;
        trainedMachineBtn.disabled = true;
        controlBar.style.bottom = "0";
    }
}

function singlePlayerMode(e: Event, shouldTrain: boolean): void {
    disableBtns();
    setTimeout(() => {
        board?.classList.add("show");
        mode = "single";
        if (shouldTrain) game.trainMachine(100000, 10000, "random");
        game.play(1, "", "human");
        startGame(game.mover == 1 ? "O" : "X");
        if (game.mover == 1) machineMakeMove();
    });
}

function machineMakeMove(): void {
    let pos = game.machineMakeMove();
    if (pos instanceof Array) {
        const aCell = document.getElementById(`${pos[0]},${pos[1]}`);
        if (aCell != null) {
            placeMark(aCell, "O");
            aCell.removeEventListener("click", handleClickSingle);
        }
    }
    game.judge();
    // Human's turn
    board?.classList.replace("O", "X");
}

function multiplayerMode(): void {
    disableBtns();
    board?.classList.add("show");
    mode = "multi";
    startGame("O");
}

function startGame(firstPlayer: string): void {
    if (board != null && winningMessageDiv != null) {
        board.classList.remove("X");
        board.classList.remove("O");
        board.classList.add(firstPlayer);
        if (mode == "single") {
            cellDivs.forEach(each => {
                each.classList.remove("O");
                each.classList.remove("X");
                each.removeEventListener("click", handleClickSingle);
                each.removeEventListener("click", handleClickMulti);
                each.addEventListener("click", handleClickSingle, { once: true });
            });
        } else {
            xTurn = (firstPlayer == "X");
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

function handleClickSingle(e: Event): void {
    if (e.currentTarget instanceof HTMLElement) {
        placeMark(e.currentTarget, "X");
        let pos: [number, number] =
            [parseInt(e.currentTarget.id.split(",")[0]),
            parseInt(e.currentTarget.id.split(",")[1])];
        game.virtualBoard[pos[1]][pos[0]] = "X";
        game.player.moveWithOpponent("2", pos);
        game.judge();
        // Machine's turn
        board?.classList.replace("X", "O");
        if (game.gameRunning) machineMakeMove();
    }
}

function handleClickMulti(e: Event): void {
    if (e.currentTarget instanceof HTMLElement) {
        const currentPlayer = xTurn ? "X" : "O";
        placeMark(e.currentTarget, currentPlayer);
        if (hasWinner(currentPlayer)) multiplayerEndGame(false);
        else if (isDraw()) multiplayerEndGame(true);
        else swapTurn(currentPlayer);
    }
}

function placeMark(cell: HTMLElement, currentPlayer: string): void {
    cell.classList.add(currentPlayer);
}

function hasWinner(currentPlayer: string): boolean {
    return winningCombinations.some(each => {
        return each.every(i => {
            return cellDivs[i].classList.contains(currentPlayer);
        });
    });
}

function isDraw(): boolean {
    return [...cellDivs].every(each => {
        return each.classList.contains("X") || each.classList.contains("O");
    });
}

function multiplayerEndGame(isDraw: boolean): void {
    if (winningMessageText != null && winningMessageDiv != null) {
        if (isDraw) winningMessageText.innerHTML = "Draw!";
        else winningMessageText.innerHTML = `${xTurn ? "X" : "O"} wins!`;
        winningMessageDiv.className = "show";
    }
}

function swapTurn(currentPlayer: string): void {
    if (currentPlayer == "O") board?.classList.replace("O", "X");
    else board?.classList.replace("X", "O");
    xTurn = !xTurn;
}