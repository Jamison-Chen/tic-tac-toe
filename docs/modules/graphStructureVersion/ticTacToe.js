import MachinePlayer from "./machinePlayer.js";
import RandomPlayer from "./randomPlayer.js";
import HumanPlayer from "./humanPlayer.js";
export default class TicTacToe {
    constructor() {
        this.winningMessageDiv = document.getElementById("winning-message");
        this.winningMessageText = document.querySelector("[data-winning-message-text]");
        this.virtualBoard = this.genVirtualBoard();
        this.gameRunning = true;
        this.mover = 0;
        this.p1Start = 0;
        this.p2Start = 0;
        this.totalGames = 0;
        this.p1Win = 0;
        this.p2Win = 0;
        this.tie = 0;
    }
    playerMakeMove(playerInTurn, opponent) {
        let playMark = this.mover === 1 ? "O" : "X";
        let pos;
        pos = playerInTurn.select(playMark);
        this.virtualBoard[pos[0]][pos[1]] = playMark;
        opponent.moveWithOpponent(pos, this.virtualBoard);
    }
    judge() {
        let winner = null;
        // Check each row
        for (let i = 0; i < this.virtualBoard.length; i++) {
            if (this.virtualBoard[i].every((e) => e === this.virtualBoard[i][0] &&
                this.virtualBoard[i][0] !== " ")) {
                winner = this.virtualBoard[i][0];
                break;
            }
        }
        if (winner === null) {
            // Check each column
            for (let i = 0; i < this.virtualBoard[0].length; i++) {
                if (this.virtualBoard.every((eachRow) => eachRow[i] === this.virtualBoard[0][i] &&
                    this.virtualBoard[0][i] !== " ")) {
                    winner = this.virtualBoard[0][i];
                    break;
                }
            }
        }
        if (winner === null) {
            // Check each diagnal
            let diagnal1 = [
                this.virtualBoard[0][0],
                this.virtualBoard[1][1],
                this.virtualBoard[2][2],
            ];
            let diagnal2 = [
                this.virtualBoard[0][2],
                this.virtualBoard[1][1],
                this.virtualBoard[2][0],
            ];
            if (diagnal1.every((e) => e === diagnal1[0] && diagnal1[0] !== " ")) {
                winner = diagnal1[0];
            }
            else if (diagnal2.every((e) => e === diagnal2[0] && diagnal2[0] !== " ")) {
                winner = diagnal2[0];
            }
        }
        if (winner !== null) {
            if (winner === "O")
                this.p1Win++;
            else
                this.p2Win++;
            if (this.player1 instanceof MachinePlayer) {
                this.player1.backPropagate(winner === "O" ? "firstMoverWin" : "firstMoverLose");
                this.player1.clearPath();
            }
            else if (this.player1 instanceof RandomPlayer) {
                this.player1.resetChoices();
            }
            else if (this.player1 instanceof HumanPlayer) {
                this.endGameWithHuman(false, winner);
            }
            if (this.player2 instanceof MachinePlayer) {
                this.player2.backPropagate(winner === "O" ? "firstMoverWin" : "firstMoverLose");
                this.player2.clearPath();
            }
            else if (this.player2 instanceof RandomPlayer) {
                this.player2.resetChoices();
            }
            else if (this.player2 instanceof HumanPlayer) {
                this.endGameWithHuman(false, winner);
            }
            this.gameRunning = false;
            this.totalGames++;
        }
        else if (!this.virtualBoard.some((r) => r.some((e) => e === " "))) {
            this.tie++;
            if (this.player1 instanceof MachinePlayer) {
                this.player1.backPropagate("tie");
                this.player1.clearPath();
            }
            else if (this.player1 instanceof RandomPlayer) {
                this.player1.resetChoices();
            }
            else if (this.player1 instanceof HumanPlayer) {
                this.endGameWithHuman(true);
            }
            if (this.player2 instanceof MachinePlayer) {
                this.player2.backPropagate("tie");
                this.player2.clearPath();
            }
            else if (this.player2 instanceof RandomPlayer) {
                this.player2.resetChoices();
            }
            else if (this.player2 instanceof HumanPlayer) {
                this.endGameWithHuman(true);
            }
            this.gameRunning = false;
            this.totalGames++;
        }
        this.mover = -1 * this.mover + 3;
    }
    endGameWithHuman(isDraw, winner) {
        this.winningMessageText.innerHTML = isDraw
            ? "Draw!"
            : `${winner} wins!`;
        this.winningMessageDiv.className = "show";
    }
    genVirtualBoard() {
        return [
            [" ", " ", " "],
            [" ", " ", " "],
            [" ", " ", " "],
        ];
    }
    decideFirstMover() {
        if (this.player2 instanceof RandomPlayer)
            this.mover = 1;
        else
            this.mover = Math.floor(Math.random() * 2 + 1);
    }
    recordFirstMover() {
        if (this.mover === 1)
            this.p1Start++;
        else
            this.p2Start++;
    }
    newGame() {
        this.gameRunning = true;
        this.virtualBoard = this.genVirtualBoard();
        this.decideFirstMover();
        this.recordFirstMover();
    }
    play(playTimes, p1, p2, isTraining) {
        this.player1 = p1;
        this.player2 = p2;
        this.refreshTrainStat();
        this.newGame();
        if (isTraining) {
            // This loop is only designed for training.
            while (this.gameRunning) {
                if (this.mover === 1) {
                    this.playerMakeMove(this.player1, this.player2);
                    this.judge();
                    if (this.totalGames === playTimes)
                        break;
                    if (!this.gameRunning) {
                        this.newGame();
                        if (this.mover === 1)
                            continue;
                    }
                }
                this.playerMakeMove(this.player2, this.player1);
                this.judge();
                if (this.totalGames === playTimes)
                    break;
                if (!this.gameRunning)
                    this.newGame();
            }
        }
    }
    trainMachine(trainTimes, batch, trainee, trainer) {
        let epoch = Math.floor(trainTimes / batch);
        let remainder = trainTimes % batch;
        for (let i = 0; i < epoch; i++) {
            this.play(batch, trainee, trainer, true);
            this.printTrainResult();
        }
        if (remainder !== 0) {
            this.play(remainder, trainee, trainer, true);
            this.printTrainResult();
        }
    }
    printTrainResult() {
        console.log(`Game start with P1: ${this.p1Start} / P2: ${this.p2Start}`);
        let p1WinningRate = Math.round((this.p1Win / this.totalGames) * 10000) / 100;
        let p2WinningRate = Math.round((this.p2Win / this.totalGames) * 10000) / 100;
        let tieRate = Math.round((this.tie / this.totalGames) * 10000) / 100;
        console.log(`P1 win: ${p1WinningRate}% | P2 win: ${p2WinningRate}% | Tie: ${tieRate}%`);
        this.player1.printDatabaseInfo();
    }
    refreshTrainStat() {
        this.p1Start = 0;
        this.p2Start = 0;
        this.totalGames = 0;
        this.p1Win = 0;
        this.p2Win = 0;
        this.tie = 0;
    }
}
