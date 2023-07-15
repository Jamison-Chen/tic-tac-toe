import { isAutoPlayer } from "./player.js";
import { GraphPlayer } from "./mlPlayer.js";
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
        this.div = div;
        this._mark = " ";
        this.onClick = onClick;
        this.div.classList.remove("O", "X");
        this.div.removeEventListener("click", this.onClick);
        this.div.addEventListener("click", this.onClick, { once: true });
    }
    setMark(mark) {
        this._mark = mark;
        this.div.classList.add(this._mark);
        this.div.removeEventListener("click", this.onClick);
    }
    get mark() {
        return this._mark;
    }
}
export class Playground {
    constructor(player1, player2 = new RandomPlayer()) {
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
            if (isAutoPlayer(opponent)) {
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
                if (player instanceof GraphPlayer) {
                    player.backpropagate(e.detail.winner === null
                        ? "tie"
                        : e.detail.winner.markPlaying === player.markPlaying
                            ? "win"
                            : "lose");
                    player.clearPath();
                }
                else if (player instanceof RandomPlayer) {
                    player.resetChoices();
                }
                else if (player instanceof HumanPlayer) {
                    Playground.endingMessageDiv.innerHTML = e.detail.winner
                        ? `${e.detail.winner.markPlaying} wins!`
                        : "Draw!";
                    Playground.endingScreenDiv.className = "show";
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
            if (this.isTraining) {
                this.printResultOfCurrentEpoch();
                this.resetResultOfCurrentEpoch();
            }
            this.remainingEpoch--;
            setTimeout(() => {
                if (this.isTraining && this.remainingEpoch === 0) {
                    this.isTraining = false;
                    document.dispatchEvent(new CustomEvent("completeTraining", {
                        detail: { game: this },
                    }));
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
                        detail: { winner: player },
                    })));
                    return;
                }
            }
            throw Error(`Cannot find winner with mark: ${winnerMark}`);
        }
        else if (!((_c = this.board) === null || _c === void 0 ? void 0 : _c.matrix.some((row) => row.some((cell) => cell.mark === " ")))) {
            setTimeout(() => document.dispatchEvent(new CustomEvent("gameOver", {
                detail: { winner: null },
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
        Playground.endingScreenDiv.classList.remove("show");
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
    printResultOfCurrentEpoch() {
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
        for (const player of [this.player1, this.player2]) {
            if (player instanceof GraphPlayer)
                player.printDatabaseInfo();
        }
    }
    resetResultOfCurrentEpoch() {
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.player1.winCount = 0;
        this.player2.winCount = 0;
    }
}
Playground.endingScreenDiv = document.getElementById("ending-screen");
Playground.endingMessageDiv = document.getElementById("ending-message");
export class TrainingGround extends Playground {
    constructor(player1, player2) {
        super(player1, player2);
        document.removeEventListener("move", this.onPlayerMove);
        document.removeEventListener("callNextPlayer", this.onCallNextPlayer);
        document.removeEventListener("gameOver", this.onGameOver);
        document.removeEventListener("stop", this.onStop);
        this.isGameRunning = false;
    }
    trainMachine(trainTimes, batch) {
        this.isTraining = true;
        this.gamesPerEpoch = batch;
        this.remainingEpoch = Math.floor(trainTimes / batch);
        const remainder = trainTimes % batch;
        while (this.remainingEpoch > 0) {
            this.remainingGames = batch;
            this.startTrainEpoch();
            this.printResultOfCurrentEpoch();
            this.resetResultOfCurrentEpoch();
            this.remainingEpoch--;
        }
        if (remainder > 0) {
            this.remainingGames = remainder;
            this.startTrainEpoch();
            this.printResultOfCurrentEpoch();
            this.resetResultOfCurrentEpoch();
        }
        document.dispatchEvent(new CustomEvent("completeTraining", {
            detail: { game: null },
        }));
    }
    startTrainEpoch() {
        var _a, _b;
        this.prepare();
        while (this.remainingGames > 0) {
            this.playerMove();
            const winner = this.judge();
            if (!this.isGameRunning) {
                if (winner)
                    winner.winCount++;
                for (const player of [this.player1, this.player2]) {
                    if (player instanceof GraphPlayer) {
                        player.backpropagate(winner === null
                            ? "tie"
                            : winner.markPlaying === player.markPlaying
                                ? "win"
                                : "lose");
                        player.clearPath();
                    }
                    else if (player instanceof RandomPlayer) {
                        player.resetChoices();
                    }
                }
                this.remainingGames--;
                if (this.remainingGames > 0)
                    this.prepare();
                else
                    break;
            }
            else {
                const oldPlayerMark = (_a = this.currentPlayer) === null || _a === void 0 ? void 0 : _a.markPlaying;
                this.currentPlayer =
                    this.currentPlayer === this.player1
                        ? this.player2
                        : this.player1;
                (_b = this.board) === null || _b === void 0 ? void 0 : _b.div.classList.replace(oldPlayerMark, this.currentPlayer.markPlaying);
            }
        }
    }
    prepare() {
        this.board = this.initBoard();
        this.isGameRunning = true;
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
    }
    playerMove() {
        var _a, _b, _c;
        const [r, c] = (_a = this.currentPlayer) === null || _a === void 0 ? void 0 : _a.select(false);
        (_b = this.board) === null || _b === void 0 ? void 0 : _b.matrix[r][c].setMark((_c = this.currentPlayer) === null || _c === void 0 ? void 0 : _c.markPlaying);
        const opponent = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        if (isAutoPlayer(opponent)) {
            opponent.moveWithOpponent([r, c], this.board.matrix);
        }
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
            this.isGameRunning = false;
            for (const player of [this.player1, this.player2]) {
                if (player.markPlaying === winnerMark)
                    return player;
            }
            throw Error(`Cannot find winner with mark: ${winnerMark}`);
        }
        else if (!((_c = this.board) === null || _c === void 0 ? void 0 : _c.matrix.some((row) => row.some((cell) => cell.mark === " ")))) {
            this.isGameRunning = false;
        }
        return null;
    }
}
