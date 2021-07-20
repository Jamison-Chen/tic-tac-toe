import { MachinePlayer } from './machinePlayer.js';
import { RandomPlayer } from './randomPlayer.js';
export class TicTacToe {
    public winningMessageDiv: HTMLElement | null;
    public winningMessageText: HTMLElement | null;
    private p1: string;
    private p2: string;
    private p1Start: number;
    private p2Start: number;
    private p1Win: number;
    private p2Win: number;
    private totalGames: number;
    private tie: number;
    public virtualBoard: string[][];
    public gameRunning: boolean;
    public mover: number;
    public player: MachinePlayer;
    public rdPlayer: RandomPlayer;
    public constructor() {
        this.winningMessageDiv = document.getElementById("winning-message");
        this.winningMessageText = document.querySelector("[data-winning-message-text]");
        this.p1 = "";
        this.p2 = "";
        this.virtualBoard = this.genVirtualBoard();
        this.gameRunning = true;
        this.mover = 0;
        this.p1Start = 0;
        this.p2Start = 0;
        this.totalGames = 0;
        this.p1Win = 0;
        this.p2Win = 0;
        this.tie = 0;
        this.player = new MachinePlayer();
        this.rdPlayer = new RandomPlayer(
            [[0, 0], [0, 1], [0, 2],
            [1, 0], [1, 1], [1, 2],
            [2, 0], [2, 1], [2, 2]]
        );
    }

    private playerMakeMove(role: string, opponent: string): void {
        let playMark: "O" | "X" = this.mover == 1 ? "O" : "X";
        let pos: [number, number];
        if (role == "") pos = this.player.select(playMark);
        else pos = this.rdPlayer.select();
        if (pos instanceof Array) {
            this.virtualBoard[pos[0]][pos[1]] = playMark;
            if (this.mover == 1 && opponent == "random") this.rdPlayer.updateChoices(pos);
            else this.player.moveWithOpponent(this.virtualBoard);
        }
    }

    public judge(): void {
        let winner: string = "";
        let hasWinner: boolean = false;
        // Check each row
        for (let i = 0; i < this.virtualBoard.length; i++) {
            hasWinner = this.virtualBoard[i].every(e => e == this.virtualBoard[i][0] && this.virtualBoard[i][0] != " ");
            if (hasWinner) {
                winner = this.virtualBoard[i][0];
                break;
            }
        }
        if (!hasWinner) {
            // Check each column
            for (let i = 0; i < this.virtualBoard[0].length; i++) {
                hasWinner = this.virtualBoard.every(eachRow => eachRow[i] == this.virtualBoard[0][i] && this.virtualBoard[0][i] != " ");
                if (hasWinner) {
                    winner = this.virtualBoard[0][i];
                    break;
                }
            }
        }
        if (!hasWinner) {
            // Check each diagnal
            let diagnal1: string[] =
                [this.virtualBoard[0][0],
                this.virtualBoard[1][1],
                this.virtualBoard[2][2]];
            let diagnal2: string[] =
                [this.virtualBoard[0][2],
                this.virtualBoard[1][1],
                this.virtualBoard[2][0]];
            if (diagnal1.every(e => e == diagnal1[0] && diagnal1[0] != " ")) {
                winner = diagnal1[0];
                hasWinner = true;
            } else if (diagnal2.every(e => e == diagnal2[0] && diagnal2[0] != " ")) {
                winner = diagnal2[0];
                hasWinner = true;
            }
        }
        if (hasWinner) {
            if (winner == "O") this.p1Win++;
            else if (winner == "X") this.p2Win++;
            this.player.backPropagate(winner == "O" ? "firstMoverWin" : "firstMoverLose");
            this.player.clearPath();
            if (this.p2 == "random") this.rdPlayer.resetChoices();
            else this.endGameWithHuman(false, winner);
            this.gameRunning = false;
            this.totalGames++;
        } else if (!this.virtualBoard.some(r => r.some(e => e == " "))) {
            this.tie++;
            this.player.backPropagate("tie");
            this.player.clearPath();
            if (this.p2 == "random") this.rdPlayer.resetChoices();
            else this.endGameWithHuman(true);
            this.gameRunning = false;
            this.totalGames++;
        }
        this.mover = -1 * this.mover + 3;
    }

    private endGameWithHuman(isDraw: boolean, winner?: string): void {
        if (this.winningMessageText != null && this.winningMessageDiv != null) {
            this.winningMessageText.innerHTML = isDraw ? "Draw!" : `${winner} wins!`;
            this.winningMessageDiv.className = "show";
        }
    }

    private genVirtualBoard(): string[][] {
        return [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]];
    }

    private decideFirstMover(): void {
        if (this.p2 == "random") this.mover = 1;
        else this.mover = Math.floor(Math.random() * 2 + 1);
    }

    private recordFirstMover(): void {
        if (this.mover == 1) this.p1Start++;
        else this.p2Start++;
    }

    private newGame(): void {
        this.gameRunning = true;
        this.virtualBoard = this.genVirtualBoard();
        this.decideFirstMover();
        this.recordFirstMover();
    }

    public play(playTimes: number, p1: string, p2: string): void {
        this.p1 = p1;
        this.p2 = p2;
        this.refreshTrainStat();
        this.newGame();
        if (p2 == "random") {  // This loop is only designed for training.
            while (this.gameRunning) {
                if (this.mover == 1) {
                    this.playerMakeMove(p1, p2);
                    this.judge();
                    if (this.totalGames == playTimes) break;
                    if (!this.gameRunning) {
                        this.newGame();
                        if (this.mover == 1) continue;
                    }
                }
                this.playerMakeMove(p2, p1);
                this.judge();
                if (this.totalGames == playTimes) break;
                if (!this.gameRunning) this.newGame();
            }
        }
    }

    public trainMachine(trainTimes: number, batch: number, trainType: string): void {
        let epoch: number = Math.floor(trainTimes / batch);
        let remainder: number = trainTimes % batch;
        for (let i = 0; i < epoch; i++) {
            this.play(batch, "", trainType);
            this.printTrainResult();
        }
        if (remainder != 0) {
            this.play(remainder, "", trainType);
            this.printTrainResult();
        }
    }

    private printTrainResult(): void {
        console.log(`Game start with P1: ${this.p1Start} / P2: ${this.p2Start}`);
        let p1WinningRate = Math.round(this.p1Win / this.totalGames * 10000) / 100;
        let p2WinningRate = Math.round(this.p2Win / this.totalGames * 10000) / 100;
        let tieRate = Math.round(this.tie / this.totalGames * 10000) / 100;
        console.log(`P1 win: ${p1WinningRate}% | P2 win: ${p2WinningRate}% | Tie: ${tieRate}%`);
    }

    private refreshTrainStat(): void {
        this.p1Start = 0;
        this.p2Start = 0;
        this.totalGames = 0;
        this.p1Win = 0;
        this.p2Win = 0;
        this.tie = 0;
    }

    public machineMakeMove(machinesMark: "O" | "X"): [number, number] | null | "ROOT" {
        let pos = this.player.select(machinesMark);
        if (pos instanceof Array) this.virtualBoard[pos[0]][pos[1]] = machinesMark;
        return pos;
    }
}