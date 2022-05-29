import MachinePlayer from "./machinePlayer.js";
import RandomPlayer from "./randomPlayer.js";
import Player from "./player.js";
import HumanPlayer from "./humanPlayer.js";
export default class TicTacToe {
    public winningMessageDiv: HTMLElement;
    public winningMessageText: HTMLElement;
    public player1: Player | undefined;
    public player2: Player | undefined;
    private p1StartCount: number;
    private p2StartCount: number;
    private p1WinCount: number;
    private p2WinCount: number;
    private totalGames: number;
    private tieCount: number;
    public board: (" " | "X" | "O")[][];
    public gameRunning: boolean;
    public currentMover: number;
    public constructor() {
        this.winningMessageDiv = document.getElementById(
            "winning-message"
        ) as HTMLElement;
        this.winningMessageText = document.querySelector(
            "[data-winning-message-text]"
        ) as HTMLElement;
        this.board = this.initBoard();
        this.gameRunning = true;
        this.currentMover = 0;
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.totalGames = 0;
        this.p1WinCount = 0;
        this.p2WinCount = 0;
        this.tieCount = 0;
    }

    private playerMakeMove(playerInTurn: Player, opponent: Player): void {
        let playMark: "O" | "X" = this.currentMover === 1 ? "O" : "X";
        let pos: [number, number];
        playerInTurn.playMark = playMark;
        pos = playerInTurn.select();
        this.board[pos[0]][pos[1]] = playMark;
        opponent.moveWithOpponent(pos, this.board);
    }

    public judge(): void {
        let winner: "O" | "X" | null = null;

        // Check each row
        for (let i = 0; i < this.board.length; i++) {
            if (
                this.board[i].every(
                    (e) => e === this.board[i][0] && this.board[i][0] !== " "
                )
            ) {
                winner = this.board[i][0] as "O" | "X";
                break;
            }
        }
        if (winner === null) {
            // Check each column
            for (let i = 0; i < this.board[0].length; i++) {
                if (
                    this.board.every(
                        (eachRow) =>
                            eachRow[i] === this.board[0][i] &&
                            this.board[0][i] !== " "
                    )
                ) {
                    winner = this.board[0][i] as "O" | "X";
                    break;
                }
            }
        }
        if (winner === null) {
            // Check each diagnal
            let diagnal1: ("O" | "X" | " ")[] = [
                this.board[0][0],
                this.board[1][1],
                this.board[2][2],
            ];
            let diagnal2: ("O" | "X" | " ")[] = [
                this.board[0][2],
                this.board[1][1],
                this.board[2][0],
            ];
            if (
                diagnal1.every((e) => e === diagnal1[0] && diagnal1[0] !== " ")
            ) {
                winner = diagnal1[0] as "O" | "X";
            } else if (
                diagnal2.every((e) => e === diagnal2[0] && diagnal2[0] !== " ")
            ) {
                winner = diagnal2[0] as "O" | "X";
            }
        }
        if (winner !== null) {
            if (winner === "O") this.p1WinCount++;
            else this.p2WinCount++;
            if (this.player1 instanceof MachinePlayer) {
                this.player1.backPropagate(
                    winner === "O" ? "firstMoverWin" : "firstMoverLose"
                );
                this.player1.clearPath();
            } else if (this.player1 instanceof RandomPlayer) {
                this.player1.resetChoices();
            } else if (this.player1 instanceof HumanPlayer) {
                this.endGameWithHuman(false, winner);
            }
            if (this.player2 instanceof MachinePlayer) {
                this.player2.backPropagate(
                    winner === "O" ? "firstMoverWin" : "firstMoverLose"
                );
                this.player2.clearPath();
            } else if (this.player2 instanceof RandomPlayer) {
                this.player2.resetChoices();
            } else if (this.player2 instanceof HumanPlayer) {
                this.endGameWithHuman(false, winner);
            }
            this.gameRunning = false;
            this.totalGames++;
        } else if (!this.board.some((r) => r.some((e) => e === " "))) {
            this.tieCount++;
            if (this.player1 instanceof MachinePlayer) {
                this.player1.backPropagate("tie");
                this.player1.clearPath();
            } else if (this.player1 instanceof RandomPlayer) {
                this.player1.resetChoices();
            } else if (this.player1 instanceof HumanPlayer) {
                this.endGameWithHuman(true);
            }
            if (this.player2 instanceof MachinePlayer) {
                this.player2.backPropagate("tie");
                this.player2.clearPath();
            } else if (this.player2 instanceof RandomPlayer) {
                this.player2.resetChoices();
            } else if (this.player2 instanceof HumanPlayer) {
                this.endGameWithHuman(true);
            }
            this.gameRunning = false;
            this.totalGames++;
        }
        this.currentMover = -1 * this.currentMover + 3;
    }

    private endGameWithHuman(isDraw: boolean, winner?: "O" | "X"): void {
        this.winningMessageText.innerHTML = isDraw
            ? "Draw!"
            : `${winner} wins!`;
        this.winningMessageDiv.className = "show";
    }

    private initBoard(): (" " | "X" | "O")[][] {
        return [
            [" ", " ", " "],
            [" ", " ", " "],
            [" ", " ", " "],
        ];
    }

    private decideFirstMover(): void {
        if (this.player2 instanceof RandomPlayer) this.currentMover = 1;
        else this.currentMover = Math.floor(Math.random() * 2 + 1);
    }

    private recordFirstMover(): void {
        if (this.currentMover === 1) this.p1StartCount++;
        else this.p2StartCount++;
    }

    private prepare(): void {
        this.gameRunning = true;
        this.board = this.initBoard();
        this.decideFirstMover();
        this.recordFirstMover();
    }

    public startGame(
        p1: Player,
        p2: Player,
        playTimes: number = 1,
        isTraining: boolean = false
    ): void {
        this.player1 = p1;
        this.player2 = p2;
        this.resetTrainResult();
        this.prepare();
        if (isTraining) {
            // This loop is only designed for training.
            while (this.gameRunning) {
                if (this.currentMover === 1) {
                    this.playerMakeMove(this.player1, this.player2);
                    this.judge();
                    if (this.totalGames === playTimes) break;
                    if (!this.gameRunning) {
                        this.prepare();
                        if (this.currentMover === 1) continue;
                    }
                }
                this.playerMakeMove(this.player2, this.player1);
                this.judge();
                if (this.totalGames === playTimes) break;
                if (!this.gameRunning) this.prepare();
            }
        }
    }

    public trainMachine(
        trainTimes: number,
        batch: number,
        trainee: MachinePlayer,
        trainer: Player
    ): void {
        let epoch: number = Math.floor(trainTimes / batch);
        let remainder: number = trainTimes % batch;
        for (let i = 0; i < epoch; i++) {
            this.startGame(trainee, trainer, batch, true);
            this.printTrainResult();
        }
        if (remainder !== 0) {
            this.startGame(trainee, trainer, remainder, true);
            this.printTrainResult();
        }
    }

    private printTrainResult(): void {
        console.log(
            `Game start with P1: ${this.p1StartCount} / P2: ${this.p2StartCount}`
        );
        let p1WinningRate =
            Math.round((this.p1WinCount / this.totalGames) * 10000) / 100;
        let p2WinningRate =
            Math.round((this.p2WinCount / this.totalGames) * 10000) / 100;
        let tieRate =
            Math.round((this.tieCount / this.totalGames) * 10000) / 100;
        console.log(
            `P1 win: ${p1WinningRate}% | P2 win: ${p2WinningRate}% | Tie: ${tieRate}%`
        );
        (this.player1 as MachinePlayer).printDatabaseInfo();
    }

    private resetTrainResult(): void {
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.totalGames = 0;
        this.p1WinCount = 0;
        this.p2WinCount = 0;
        this.tieCount = 0;
    }
}
