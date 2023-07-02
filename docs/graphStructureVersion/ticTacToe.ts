import Player from "./player.js";
import MachinePlayer from "./machinePlayer.js";
import RandomPlayer from "./randomPlayer.js";
import HumanPlayer from "./humanPlayer.js";

export interface MovePositionEvent {
    position: [number, number];
    markPlaying: "O" | "X";
}

interface GameOverEvent {
    winner: Player | null;
    winnerMark: "O" | "X" | null;
}

class Board {
    public matrix: Cell[][];
    public div: HTMLDivElement;
    public constructor(matrix: Cell[][], div: HTMLDivElement) {
        this.matrix = matrix;
        this.div = div;
        this.div.classList.remove("X");
        this.div.classList.add("O");
        this.div.classList.add("show");
    }
}

export class Cell {
    private _div: HTMLDivElement;
    private _mark: " " | "O" | "X";
    private onClick: EventListener;
    public constructor(div: HTMLDivElement, onClick: EventListener) {
        this._div = div;
        this._mark = " ";
        this.onClick = onClick;
        this._div.classList.remove("O", "X");
        this._div.removeEventListener("click", this.onClick);
        this._div.addEventListener("click", this.onClick, { once: true });
    }
    public setMark(mark: "O" | "X"): void {
        this._mark = mark;
        this._div.classList.add(this._mark);
        this._div.removeEventListener("click", this.onClick);
    }
    public get mark(): " " | "O" | "X" {
        return this._mark;
    }
}

export default class TicTacToe {
    public endingScreenDiv: HTMLElement =
        document.getElementById("ending-screen")!;
    public endingMessageDiv: HTMLElement =
        document.getElementById("ending-message")!;
    public player1: Player;
    public player2: Player;
    private p1StartCount: number;
    private p2StartCount: number;
    private isTraining: boolean;
    private nonStopping: boolean;
    private remainingEpoch: number;
    private gamesPerEpoch: number;
    private remainingGames: number;
    public board?: Board;
    public currentPlayer: Player | null;
    public constructor(player1: Player, player2: Player = new RandomPlayer()) {
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
        document.addEventListener("move", this.onPlayerMove as EventListener);
        document.addEventListener("callNextPlayer", this.onCallNextPlayer);
        document.addEventListener("gameOver", this.onGameOver as EventListener);
        document.addEventListener("stop", this.onStop);
    }
    private onClick = (e: Event) => {
        const position: [number, number] = (
            e.currentTarget as HTMLDivElement
        ).id
            .split(",")
            .map((e) => parseInt(e)) as [number, number];
        (this.currentPlayer as HumanPlayer).select(position);
    };
    private onPlayerMove = (e: CustomEvent<MovePositionEvent>): void => {
        const [r, c] = e.detail.position;
        this.board?.matrix[r][c].setMark(e.detail.markPlaying);

        const opponent =
            this.currentPlayer === this.player1 ? this.player2 : this.player1;
        if (!(opponent instanceof HumanPlayer)) {
            opponent.moveWithOpponent([r, c], this.board!.matrix);
        }
        this.judge();
    };
    private onCallNextPlayer = (): void => {
        const oldPlayerMark: string = this.currentPlayer?.markPlaying!;
        this.currentPlayer =
            this.currentPlayer === this.player1 ? this.player2 : this.player1;
        this.board?.div.classList.replace(
            oldPlayerMark,
            this.currentPlayer.markPlaying!
        );

        if (!(this.currentPlayer instanceof HumanPlayer)) {
            setTimeout(() => this.currentPlayer?.select());
        }
    };
    private onGameOver = (e: CustomEvent<GameOverEvent>): void => {
        if (e.detail.winner) e.detail.winner.winCount++;

        for (const player of [this.player1, this.player2]) {
            if (player instanceof MachinePlayer) {
                player.backPropagate(
                    e.detail.winnerMark === player.markPlaying
                        ? "win"
                        : e.detail.winnerMark === null
                        ? "tie"
                        : "lose"
                );
                player.clearPath();
            } else if (player instanceof RandomPlayer) {
                player.resetChoices();
            } else if (player instanceof HumanPlayer) {
                this.endingMessageDiv.innerHTML = e.detail.winner
                    ? `${e.detail.winnerMark} wins!`
                    : "Draw!";
                this.endingScreenDiv.className = "show";
            }
        }

        this.remainingGames--;
        setTimeout(() => {
            if (this.remainingGames > 0) this.start();
            else document.dispatchEvent(new CustomEvent("stop"));
        });
    };
    private onStop = (): void => {
        this.printTrainResult();
        for (const player of [this.player1, this.player2]) {
            if (player instanceof MachinePlayer) player.printDatabaseInfo();
        }
        this.resetTrainResultOfCurrentEpoch();
        this.remainingEpoch--;
        setTimeout(() => {
            if (this.isTraining && this.remainingEpoch <= 0) {
                document.dispatchEvent(new CustomEvent("completeTraining"));
            } else if (this.nonStopping || this.remainingEpoch > 0) {
                this.remainingGames = this.gamesPerEpoch;
                this.start();
            }
        });
    };
    public judge() {
        let winnerMark: "O" | "X" | null = null;

        // Check each row
        for (let i = 0; i < this.board!.matrix.length; i++) {
            if (
                this.board?.matrix[i].every((cell) => {
                    return (
                        cell.mark === this.board?.matrix[i][0].mark &&
                        this.board.matrix[i][0].mark !== " "
                    );
                })
            ) {
                winnerMark = this.board.matrix[i][0].mark as "O" | "X";
                break;
            }
        }
        if (winnerMark === null) {
            // Check each column
            for (let i = 0; i < this.board!.matrix[0].length; i++) {
                if (
                    this.board?.matrix.every((row) => {
                        return (
                            row[i].mark === this.board?.matrix[0][i].mark &&
                            this.board.matrix[0][i].mark !== " "
                        );
                    })
                ) {
                    winnerMark = this.board.matrix[0][i].mark as "O" | "X";
                    break;
                }
            }
        }
        if (winnerMark === null) {
            // Check each diagnal
            const diagnal1: ("O" | "X" | " ")[] = [
                this.board!.matrix[0][0].mark,
                this.board!.matrix[1][1].mark,
                this.board!.matrix[2][2].mark,
            ];
            const diagnal2: ("O" | "X" | " ")[] = [
                this.board!.matrix[0][2].mark,
                this.board!.matrix[1][1].mark,
                this.board!.matrix[2][0].mark,
            ];
            if (
                diagnal1.every(
                    (mark) => mark === diagnal1[0] && diagnal1[0] !== " "
                )
            ) {
                winnerMark = diagnal1[0] as "O" | "X";
            } else if (
                diagnal2.every(
                    (mark) => mark === diagnal2[0] && diagnal2[0] !== " "
                )
            ) {
                winnerMark = diagnal2[0] as "O" | "X";
            }
        }

        if (winnerMark) {
            for (const player of [this.player1, this.player2]) {
                if (player.markPlaying === winnerMark) {
                    setTimeout(() =>
                        document.dispatchEvent(
                            new CustomEvent<GameOverEvent>("gameOver", {
                                detail: { winner: player, winnerMark },
                            })
                        )
                    );
                    break;
                }
            }
        } else if (
            !this.board?.matrix.some((row) =>
                row.some((cell) => cell.mark === " ")
            )
        ) {
            setTimeout(() =>
                document.dispatchEvent(
                    new CustomEvent<GameOverEvent>("gameOver", {
                        detail: { winner: null, winnerMark },
                    })
                )
            );
        } else {
            setTimeout(() =>
                document.dispatchEvent(new CustomEvent("callNextPlayer"))
            );
        }
    }
    private initBoard(): Board {
        const matrix: Cell[][] = new Array(3)
            .fill(null)
            .map(() => new Array(3).fill(null));
        const boardDiv = document.getElementById("board") as HTMLDivElement;
        for (const cellDiv of boardDiv.children) {
            const [r, c] = cellDiv.id.split(",").map((e) => parseInt(e));
            matrix[r][c] = new Cell(cellDiv as HTMLDivElement, this.onClick);
        }
        return new Board(matrix, boardDiv);
    }
    public start(
        isTraining: boolean = this.isTraining,
        nonStopping: boolean = this.nonStopping
    ): void {
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
        } else {
            this.currentPlayer = this.player2;
            this.player1.markPlaying = "X";
            this.player2.markPlaying = "O";
            this.p2StartCount++;
        }
        if (!(this.currentPlayer instanceof HumanPlayer)) {
            setTimeout(() => this.currentPlayer?.select());
        }
    }
    public trainMachine(trainTimes: number, batch: number): void {
        this.remainingEpoch = Math.floor(trainTimes / batch);
        this.gamesPerEpoch = batch;
        this.remainingGames = batch;
        this.start(true);
    }
    private printTrainResult(): void {
        console.log(
            `Game start with P1: ${this.p1StartCount} / P2: ${this.p2StartCount}`
        );
        const p1WinningRate =
            Math.round((this.player1.winCount / this.gamesPerEpoch) * 10000) /
            100;
        const p2WinningRate =
            Math.round((this.player2.winCount / this.gamesPerEpoch) * 10000) /
            100;
        const drawRate =
            Math.round(
                ((this.gamesPerEpoch -
                    (this.player1.winCount + this.player2.winCount)) /
                    this.gamesPerEpoch) *
                    10000
            ) / 100;
        console.log(
            `P1 win: ${p1WinningRate}% | P2 win: ${p2WinningRate}% | Tie: ${drawRate}%`
        );
    }
    private resetTrainResultOfCurrentEpoch(): void {
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.player1.winCount = 0;
        this.player2.winCount = 0;
    }
}
