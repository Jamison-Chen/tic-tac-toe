import HumanPlayer from "./humanPlayer.js";
import { GraphPlayer } from "./mlPlayer.js";
import { AutoPlayer } from "./player.js";
import RandomPlayer from "./randomPlayer.js";
class Board {
    constructor(matrix, div) {
        this.matrix = matrix;
        this.div = div;
        this.div.classList.remove("X");
        this.div.classList.add("O");
    }
    get diagnal1() {
        const result = [];
        for (let i = 0; i < 3; i++)
            result.push(this.matrix[i][i].mark);
        return result;
    }
    get diagnal2() {
        const result = [];
        for (let i = 0; i < 3; i++)
            result.push(this.matrix[i][2 - i].mark);
        return result;
    }
    show() {
        this.div.classList.add("show");
    }
    hide() {
        this.div.classList.remove("show");
    }
    changeMarkTheme(oldTheme, newTheme) {
        this.div.classList.replace(oldTheme, newTheme);
    }
}
export class Cell {
    constructor(div, onClick) {
        this.div = div;
        this._mark = null;
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
            if (this.currentPlayer instanceof HumanPlayer) {
                const position = e.currentTarget.id
                    .split(",")
                    .map((e) => parseInt(e));
                this.currentPlayer.select(position);
            }
            else
                throw Error("A cell can only be clicked by a human.");
        };
        this.onPlayerMove = (e) => {
            const [r, c] = e.detail.position;
            this.board?.matrix[r][c].setMark(e.detail.markPlaying);
            const opponent = this.currentPlayer === this.player1 ? this.player2 : this.player1;
            if (opponent instanceof AutoPlayer) {
                opponent.moveWithOpponent({
                    position: [r, c],
                    board: this.board.matrix,
                });
            }
            this.judge();
        };
        this.onCallNextPlayer = () => {
            const oldPlayerMark = this.currentPlayer.markPlaying;
            this.currentPlayer =
                this.currentPlayer === this.player1 ? this.player2 : this.player1;
            this.board.changeMarkTheme(oldPlayerMark, this.currentPlayer.markPlaying);
            if (!(this.currentPlayer instanceof HumanPlayer)) {
                setTimeout(() => this.currentPlayer.select());
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
                    Playground.showEndingMessage(e.detail.winner);
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
    static showEndingMessage(winner) {
        Playground.endingMessageDiv.innerHTML = winner
            ? `${winner.markPlaying} wins!`
            : "Draw!";
        Playground.endingScreenDiv.className = "show";
    }
    static hideEndingMessage() {
        Playground.endingScreenDiv.classList.remove("show");
    }
    judge() {
        const winnerMark = this.getWinnerMark();
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
        else if (!this.board?.matrix.some((row) => row.some((cell) => !cell.mark))) {
            setTimeout(() => document.dispatchEvent(new CustomEvent("gameOver", {
                detail: { winner: null },
            })));
        }
        else {
            setTimeout(() => document.dispatchEvent(new CustomEvent("callNextPlayer")));
        }
    }
    getWinnerMark() {
        let winnerMark = null;
        for (let i = 0; i < this.board.matrix.length; i++) {
            if (this.board?.matrix[i].every((cell) => this.board?.matrix[i][0].mark &&
                cell.mark === this.board.matrix[i][0].mark)) {
                return this.board.matrix[i][0].mark;
            }
        }
        for (let i = 0; i < this.board.matrix[0].length; i++) {
            if (this.board?.matrix.every((row) => this.board?.matrix[0][i].mark &&
                row[i].mark === this.board?.matrix[0][i].mark)) {
                return this.board.matrix[0][i].mark;
            }
        }
        if (this.board.diagnal1.every((m) => this.board?.diagnal1[0] && m === this.board.diagnal1[0])) {
            return this.board.diagnal1[0];
        }
        else if (this.board.diagnal2.every((m) => this.board?.diagnal2[0] && m === this.board.diagnal2[0])) {
            return this.board.diagnal2[0];
        }
        return winnerMark;
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
        Playground.hideEndingMessage();
        this.board = this.initBoard();
        if (!isTraining)
            this.board.show();
        else
            this.board.hide();
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
            setTimeout(() => this.currentPlayer?.select());
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
        document.dispatchEvent(new CustomEvent("completeTraining"));
    }
    startTrainEpoch() {
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
                this.currentPlayer =
                    this.currentPlayer === this.player1
                        ? this.player2
                        : this.player1;
            }
        }
    }
    prepare() {
        this.board = this.initBoard();
        this.board.hide();
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
        const [r, c] = this.currentPlayer?.select(false);
        this.board?.matrix[r][c].setMark(this.currentPlayer?.markPlaying);
        const opponent = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        if (opponent instanceof AutoPlayer) {
            opponent.moveWithOpponent({
                position: [r, c],
                board: this.board.matrix,
            });
        }
    }
    judge() {
        const winnerMark = this.getWinnerMark();
        if (winnerMark) {
            this.isGameRunning = false;
            for (const player of [this.player1, this.player2]) {
                if (player.markPlaying === winnerMark)
                    return player;
            }
            throw Error(`Cannot find winner with mark: ${winnerMark}`);
        }
        else if (!this.board?.matrix.some((row) => row.some((cell) => !cell.mark))) {
            this.isGameRunning = false;
        }
        return null;
    }
}
