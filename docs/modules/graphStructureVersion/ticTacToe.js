import MachinePlayer from "./machinePlayer.js";
import RandomPlayer from "./randomPlayer.js";
import HumanPlayer from "./humanPlayer.js";
class Board {
    constructor(matrix, div) {
        this.matrix = matrix;
        this.div = div;
        this.div.classList.remove("X");
        this.div.classList.add("O");
        this.div.classList.add("show");
    }
}
export class Cell {
    constructor(div, onClick) {
        this._div = div;
        this._mark = " ";
        this.onClick = onClick;
        this._div.classList.remove("O", "X");
        this._div.removeEventListener("click", this.onClick);
        this._div.addEventListener("click", this.onClick, { once: true });
    }
    setMark(mark) {
        this._mark = mark;
        this._div.classList.add(this._mark);
        this._div.removeEventListener("click", this.onClick);
    }
    get div() {
        return this._div;
    }
    get mark() {
        return this._mark;
    }
}
export default class TicTacToe {
    constructor(player1, player2 = new RandomPlayer()) {
        this.endingScreenDiv = document.getElementById("ending-screen");
        this.endingMessageDiv = document.getElementById("ending-message");
        this.onClick = (e) => {
            const position = e.currentTarget.id
                .split(",")
                .map((e) => parseInt(e));
            this.currentPlayer.select(position);
        };
        this.onPlayerMove = (e) => {
            const [r, c] = e.detail.position;
            this.board.matrix[r][c].setMark(e.detail.markPlaying);
            const opponent = this.currentPlayer === this.player1 ? this.player2 : this.player1;
            if (!(opponent instanceof HumanPlayer)) {
                opponent.moveWithOpponent([r, c], this.board.matrix);
            }
            this.judge();
        };
        this.onCallNextPlayer = () => {
            const oldPlayerMark = this.currentPlayer.markPlaying;
            this.currentPlayer =
                this.currentPlayer === this.player1 ? this.player2 : this.player1;
            this.board.div.classList.replace(oldPlayerMark, this.currentPlayer.markPlaying);
            if (!(this.currentPlayer instanceof HumanPlayer)) {
                setTimeout(() => this.currentPlayer.select());
            }
        };
        this.onGameOver = (e) => {
            if (e.detail.winner)
                e.detail.winner.winCount++;
            for (const player of [this.player1, this.player2]) {
                if (player instanceof MachinePlayer) {
                    player.backPropagate(e.detail.winnerMark === "O"
                        ? "firstMoverWin"
                        : e.detail.winnerMark === "X"
                            ? "firstMoverLose"
                            : "tie");
                    player.clearPath();
                }
                else if (player instanceof RandomPlayer) {
                    player.resetChoices();
                }
                else if (player instanceof HumanPlayer) {
                    this.endingMessageDiv.innerHTML = e.detail.winner
                        ? `${e.detail.winnerMark} wins!`
                        : "Draw!";
                    this.endingScreenDiv.className = "show";
                }
            }
            this.remainingGames--;
            setTimeout(() => {
                if (this.remainingGames > 0)
                    this.start();
                else
                    document.dispatchEvent(new CustomEvent("stop"));
            });
        };
        this.onStop = () => {
            this.printTrainResult();
            for (const player of [this.player1, this.player2]) {
                if (player instanceof MachinePlayer)
                    player.printDatabaseInfo();
            }
            if (this.isTraining) {
                document.dispatchEvent(new CustomEvent("completeTraining"));
            }
        };
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = null;
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.isTraining = false;
        this.totalGames = 0;
        this.remainingGames = 0;
        document.addEventListener("move", this.onPlayerMove);
        document.addEventListener("callNextPlayer", this.onCallNextPlayer);
        document.addEventListener("gameOver", this.onGameOver);
        document.addEventListener("stop", this.onStop);
    }
    judge() {
        let winnerMark = null;
        // Check each row
        for (let i = 0; i < this.board.matrix.length; i++) {
            if (this.board.matrix[i].every((cell) => {
                return (cell.mark === this.board.matrix[i][0].mark &&
                    this.board.matrix[i][0].mark !== " ");
            })) {
                winnerMark = this.board.matrix[i][0].mark;
                break;
            }
        }
        if (winnerMark === null) {
            // Check each column
            for (let i = 0; i < this.board.matrix[0].length; i++) {
                if (this.board.matrix.every((row) => {
                    return (row[i].mark === this.board.matrix[0][i].mark &&
                        this.board.matrix[0][i].mark !== " ");
                })) {
                    winnerMark = this.board.matrix[0][i].mark;
                    break;
                }
            }
        }
        if (winnerMark === null) {
            // Check each diagnal
            const diagnal1 = [
                this.board.matrix[0][0].mark,
                this.board.matrix[1][1].mark,
                this.board.matrix[2][2].mark,
            ];
            const diagnal2 = [
                this.board.matrix[0][2].mark,
                this.board.matrix[1][1].mark,
                this.board.matrix[2][0].mark,
            ];
            if (diagnal1.every((mark) => mark === diagnal1[0] && diagnal1[0] !== " ")) {
                winnerMark = diagnal1[0];
            }
            else if (diagnal2.every((mark) => mark === diagnal2[0] && diagnal2[0] !== " ")) {
                winnerMark = diagnal2[0];
            }
        }
        if (winnerMark) {
            for (const player of [this.player1, this.player2]) {
                if (player.markPlaying === winnerMark) {
                    setTimeout(() => document.dispatchEvent(new CustomEvent("gameOver", {
                        detail: { winner: player, winnerMark },
                    })));
                    break;
                }
            }
        }
        else if (!this.board.matrix.some((row) => row.some((cell) => cell.mark === " "))) {
            setTimeout(() => document.dispatchEvent(new CustomEvent("gameOver", {
                detail: { winner: null, winnerMark },
            })));
        }
        else {
            setTimeout(() => document.dispatchEvent(new CustomEvent("callNextPlayer")));
        }
    }
    initBoard() {
        const matrix = new Array(3)
            .fill(null)
            .map(() => new Array(3).fill(null));
        const boardDiv = document.getElementById("board");
        for (const cellDiv of boardDiv.children) {
            const [r, c] = cellDiv.id.split(",").map((e) => parseInt(e));
            matrix[r][c] = new Cell(cellDiv, this.onClick);
        }
        return new Board(matrix, boardDiv);
    }
    start(isTraining = this.isTraining) {
        this.isTraining = isTraining;
        if (!this.isTraining) {
            this.totalGames = 1;
            this.remainingGames = 1;
            this.player1.winCount = 0;
            this.player2.winCount = 0;
        }
        this.endingScreenDiv.classList.remove("show");
        this.board = this.initBoard();
        // Choose and record first player
        if (this.player2 instanceof RandomPlayer) {
            this.currentPlayer = this.player1;
            this.player1.markPlaying = "O";
            this.player2.markPlaying = "X";
            this.p1StartCount++;
        }
        else {
            if (Math.random() > 0.5) {
                this.currentPlayer = this.player1;
                this.player1.markPlaying = "O";
                this.player2.markPlaying = "X";
                this.p1StartCount++;
            }
            else {
                this.currentPlayer = this.player2;
                this.player1.markPlaying = "X";
                this.player2.markPlaying = "O";
                this.p2StartCount++;
            }
        }
        if (!(this.currentPlayer instanceof HumanPlayer)) {
            setTimeout(() => this.currentPlayer.select());
        }
    }
    trainMachine(trainTimes, batch) {
        const epoch = Math.floor(trainTimes / batch);
        const remainder = trainTimes % batch;
        // for (let i = 0; i < epoch; i++) {
        this.totalGames = batch;
        this.remainingGames = batch;
        this.start(true);
        // }
        // if (remainder !== 0) {
        //     this.totalGames = remainder;
        //     this.remainingGames = remainder;
        //     this.start();
        // }
    }
    printTrainResult() {
        console.log(`Game start with P1: ${this.p1StartCount} / P2: ${this.p2StartCount}`);
        const p1WinningRate = Math.round((this.player1.winCount / this.totalGames) * 10000) / 100;
        const p2WinningRate = Math.round((this.player2.winCount / this.totalGames) * 10000) / 100;
        const drawRate = Math.round(((this.totalGames -
            (this.player1.winCount + this.player2.winCount)) /
            this.totalGames) *
            10000) / 100;
        console.log(`P1 win: ${p1WinningRate}% | P2 win: ${p2WinningRate}% | Tie: ${drawRate}%`);
    }
    resetTrainResult() {
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.totalGames = 0;
        this.player1.winCount = 0;
        this.player2.winCount = 0;
    }
}
