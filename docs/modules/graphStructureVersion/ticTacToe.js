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
            var _a;
            const [r, c] = e.detail.position;
            (_a = this.board) === null || _a === void 0 ? void 0 : _a.matrix[r][c].setMark(e.detail.markPlaying);
            const opponent = this.currentPlayer === this.player1 ? this.player2 : this.player1;
            if (!(opponent instanceof HumanPlayer)) {
                opponent.moveWithOpponent([r, c], this.board.matrix);
            }
            this.judge();
        };
        this.onCallNextPlayer = () => {
            var _a, _b;
            const oldPlayerMark = (_a = this.currentPlayer) === null || _a === void 0 ? void 0 : _a.markPlaying;
            this.currentPlayer =
                this.currentPlayer === this.player1 ? this.player2 : this.player1;
            (_b = this.board) === null || _b === void 0 ? void 0 : _b.div.classList.replace(oldPlayerMark, this.currentPlayer.markPlaying);
            if (!(this.currentPlayer instanceof HumanPlayer)) {
                setTimeout(() => { var _a; return (_a = this.currentPlayer) === null || _a === void 0 ? void 0 : _a.select(); });
            }
        };
        this.onGameOver = (e) => {
            if (e.detail.winner)
                e.detail.winner.winCount++;
            for (const player of [this.player1, this.player2]) {
                if (player instanceof MachinePlayer) {
                    player.backPropagate(e.detail.winnerMark === player.markPlaying
                        ? "win"
                        : e.detail.winnerMark === null
                            ? "tie"
                            : "lose");
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
            this.resetTrainResultOfCurrentEpoch();
            this.remainingEpoch--;
            setTimeout(() => {
                if (this.isTraining && this.remainingEpoch <= 0) {
                    document.dispatchEvent(new CustomEvent("completeTraining"));
                }
                else if (this.nonStopping || this.remainingEpoch > 0) {
                    this.remainingGames = this.gamesPerEpoch;
                    this.start();
                }
            });
        };
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = null;
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.isTraining = false;
        this.nonStopping = false;
        this.remainingEpoch = 0;
        this.gamesPerEpoch = 0;
        this.remainingGames = 0;
        document.addEventListener("move", this.onPlayerMove);
        document.addEventListener("callNextPlayer", this.onCallNextPlayer);
        document.addEventListener("gameOver", this.onGameOver);
        document.addEventListener("stop", this.onStop);
    }
    judge() {
        var _a, _b, _c;
        let winnerMark = null;
        // Check each row
        for (let i = 0; i < this.board.matrix.length; i++) {
            if ((_a = this.board) === null || _a === void 0 ? void 0 : _a.matrix[i].every((cell) => {
                var _a;
                return (cell.mark === ((_a = this.board) === null || _a === void 0 ? void 0 : _a.matrix[i][0].mark) &&
                    this.board.matrix[i][0].mark !== " ");
            })) {
                winnerMark = this.board.matrix[i][0].mark;
                break;
            }
        }
        if (winnerMark === null) {
            // Check each column
            for (let i = 0; i < this.board.matrix[0].length; i++) {
                if ((_b = this.board) === null || _b === void 0 ? void 0 : _b.matrix.every((row) => {
                    var _a;
                    return (row[i].mark === ((_a = this.board) === null || _a === void 0 ? void 0 : _a.matrix[0][i].mark) &&
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
        else if (!((_c = this.board) === null || _c === void 0 ? void 0 : _c.matrix.some((row) => row.some((cell) => cell.mark === " ")))) {
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
    start(isTraining = this.isTraining, nonStopping = this.nonStopping) {
        this.nonStopping = nonStopping;
        this.isTraining = isTraining;
        if (!this.isTraining) {
            this.remainingEpoch = 1;
            this.gamesPerEpoch = 1;
            this.remainingGames = 1;
            this.player1.winCount = 0;
            this.player2.winCount = 0;
        }
        this.endingScreenDiv.classList.remove("show");
        this.board = this.initBoard();
        // Choose and record first player
        if (Math.random() >= 0.5) {
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
        if (!(this.currentPlayer instanceof HumanPlayer)) {
            setTimeout(() => { var _a; return (_a = this.currentPlayer) === null || _a === void 0 ? void 0 : _a.select(); });
        }
    }
    trainMachine(trainTimes, batch) {
        this.remainingEpoch = Math.floor(trainTimes / batch);
        this.gamesPerEpoch = batch;
        this.remainingGames = batch;
        this.start(true);
    }
    printTrainResult() {
        console.log(`Game start with P1: ${this.p1StartCount} / P2: ${this.p2StartCount}`);
        const p1WinningRate = Math.round((this.player1.winCount / this.gamesPerEpoch) * 10000) /
            100;
        const p2WinningRate = Math.round((this.player2.winCount / this.gamesPerEpoch) * 10000) /
            100;
        const drawRate = Math.round(((this.gamesPerEpoch -
            (this.player1.winCount + this.player2.winCount)) /
            this.gamesPerEpoch) *
            10000) / 100;
        console.log(`P1 win: ${p1WinningRate}% | P2 win: ${p2WinningRate}% | Tie: ${drawRate}%`);
    }
    resetTrainResultOfCurrentEpoch() {
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.player1.winCount = 0;
        this.player2.winCount = 0;
    }
}
