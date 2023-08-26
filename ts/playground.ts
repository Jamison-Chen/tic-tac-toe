import HumanPlayer from "./humanPlayer.js";
import { GraphPlayer } from "./mlPlayer.js";
import { AutoPlayer, type Player } from "./player.js";
import RandomPlayer from "./randomPlayer.js";

export type Position = [0 | 1 | 2, 0 | 1 | 2];

export interface MoveEvent {
    position: Position;
    markPlaying: NonNullable<Mark>;
}

interface CompleteTrainingEvent {}

interface GameOverEvent {
    winner: Player | null;
}

class Board {
    public matrix: Cell[][];
    private div: HTMLDivElement;
    public constructor(matrix: Cell[][], div: HTMLDivElement) {
        this.matrix = matrix;
        this.div = div;
        this.div.classList.remove("X");
        this.div.classList.add("O");
    }
    public get diagnal1(): Mark[] {
        const result: Mark[] = [];
        for (let i = 0; i < 3; i++) result.push(this.matrix[i][i].mark);
        return result;
    }
    public get diagnal2(): Mark[] {
        const result: Mark[] = [];
        for (let i = 0; i < 3; i++) result.push(this.matrix[i][2 - i].mark);
        return result;
    }
    public show(): void {
        this.div.classList.add("show");
    }
    public hide(): void {
        this.div.classList.remove("show");
    }
    public changeMarkTheme(
        oldTheme: NonNullable<Mark>,
        newTheme: NonNullable<Mark>
    ): void {
        this.div.classList.replace(oldTheme, newTheme);
    }
}

export class Cell {
    private div: HTMLDivElement;
    private _mark: Mark;
    private onClick: EventListener;
    public constructor(div: HTMLDivElement, onClick: EventListener) {
        this.div = div;
        this._mark = null;
        this.onClick = onClick;
        this.div.classList.remove("O", "X");
        this.div.removeEventListener("click", this.onClick);
        this.div.addEventListener("click", this.onClick, { once: true });
    }
    public setMark(mark: NonNullable<Mark>): void {
        this._mark = mark;
        this.div.classList.add(this._mark);
        this.div.removeEventListener("click", this.onClick);
    }
    public get mark(): typeof this._mark {
        return this._mark;
    }
}

export type Mark = "O" | "X" | null;

export class Playground {
    public static endingScreenDiv: HTMLElement =
        document.getElementById("ending-screen")!;
    public static endingMessageDiv: HTMLElement =
        document.getElementById("ending-message")!;
    public player1: Player;
    public player2: Player;
    protected p1StartCount: number;
    protected p2StartCount: number;
    protected isTraining: boolean;
    private nonStopping: boolean;
    protected remainingEpoch: number;
    protected gamesPerEpoch: number;
    protected remainingGames: number;
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
    private onClick = (e: Event): void => {
        if (this.currentPlayer instanceof HumanPlayer) {
            const position = (e.currentTarget as HTMLDivElement).id
                .split(",")
                .map((e) => parseInt(e)) as Position;
            this.currentPlayer.select(position);
        } else throw Error("A cell can only be clicked by a human.");
    };
    protected onPlayerMove = (e: CustomEvent<MoveEvent>): void => {
        const [r, c] = e.detail.position;
        this.board?.matrix[r][c].setMark(e.detail.markPlaying);

        const opponent =
            this.currentPlayer === this.player1 ? this.player2 : this.player1;
        if (opponent instanceof AutoPlayer) {
            opponent.moveWithOpponent({
                position: [r, c],
                board: this.board!.matrix,
            });
        }
        this.judge();
    };
    protected onCallNextPlayer = (): void => {
        const oldPlayerMark = this.currentPlayer!.markPlaying!;
        this.currentPlayer =
            this.currentPlayer === this.player1 ? this.player2 : this.player1;
        this.board!.changeMarkTheme(
            oldPlayerMark,
            this.currentPlayer.markPlaying!
        );

        if (!(this.currentPlayer instanceof HumanPlayer)) {
            setTimeout(() => this.currentPlayer!.select());
        }
    };
    protected onGameOver = (e: CustomEvent<GameOverEvent>): void => {
        if (e.detail.winner) e.detail.winner.winCount++;

        for (const player of [this.player1, this.player2]) {
            if (player instanceof GraphPlayer) {
                player.backpropagate(
                    e.detail.winner === null
                        ? "tie"
                        : e.detail.winner.markPlaying === player.markPlaying
                        ? "win"
                        : "lose"
                );
                player.clearPath();
            } else if (player instanceof RandomPlayer) {
                player.resetChoices();
            } else if (player instanceof HumanPlayer) {
                Playground.showEndingMessage(e.detail.winner);
            }
        }

        this.remainingGames--;
        setTimeout(() => {
            if (this.remainingGames > 0) this.start();
            else document.dispatchEvent(new CustomEvent("stop"));
        });
    };
    private static showEndingMessage(winner: Player | null): void {
        Playground.endingMessageDiv.innerHTML = winner
            ? `${winner.markPlaying} wins!`
            : "Draw!";
        Playground.endingScreenDiv.className = "show";
    }
    private static hideEndingMessage(): void {
        Playground.endingScreenDiv.classList.remove("show");
    }
    protected onStop = (): void => {
        if (this.isTraining) {
            this.printResultOfCurrentEpoch();
            this.resetResultOfCurrentEpoch();
        }
        this.remainingEpoch--;
        setTimeout(() => {
            if (this.isTraining && this.remainingEpoch === 0) {
                this.isTraining = false;
                document.dispatchEvent(
                    new CustomEvent<CompleteTrainingEvent>("completeTraining")
                );
            } else if (this.nonStopping || this.remainingEpoch > 0) {
                this.remainingGames = this.gamesPerEpoch;
                this.start();
            }
        });
    };
    protected judge(): void {
        const winnerMark = this.getWinnerMark();
        if (winnerMark) {
            for (const player of [this.player1, this.player2]) {
                if (player.markPlaying === winnerMark) {
                    setTimeout(() =>
                        document.dispatchEvent(
                            new CustomEvent<GameOverEvent>("gameOver", {
                                detail: { winner: player },
                            })
                        )
                    );
                    return;
                }
            }
            throw Error(`Cannot find winner with mark: ${winnerMark}`);
        } else if (
            !this.board?.matrix.some((row) => row.some((cell) => !cell.mark))
        ) {
            setTimeout(() =>
                document.dispatchEvent(
                    new CustomEvent<GameOverEvent>("gameOver", {
                        detail: { winner: null },
                    })
                )
            );
        } else {
            setTimeout(() =>
                document.dispatchEvent(new CustomEvent("callNextPlayer"))
            );
        }
    }
    protected getWinnerMark(): Mark {
        let winnerMark: Mark = null;

        // Check each row
        for (let i = 0; i < this.board!.matrix.length; i++) {
            if (
                this.board?.matrix[i].every(
                    (cell) =>
                        this.board?.matrix[i][0].mark &&
                        cell.mark === this.board.matrix[i][0].mark
                )
            ) {
                return this.board.matrix[i][0].mark;
            }
        }

        // Check each column
        for (let i = 0; i < this.board!.matrix[0].length; i++) {
            if (
                this.board?.matrix.every(
                    (row) =>
                        this.board?.matrix[0][i].mark &&
                        row[i].mark === this.board?.matrix[0][i].mark
                )
            ) {
                return this.board.matrix[0][i].mark;
            }
        }

        // Check each diagnal
        if (
            this.board!.diagnal1.every(
                (m) => this.board?.diagnal1[0] && m === this.board.diagnal1[0]
            )
        ) {
            return this.board!.diagnal1[0];
        } else if (
            this.board!.diagnal2.every(
                (m) => this.board?.diagnal2[0] && m === this.board.diagnal2[0]
            )
        ) {
            return this.board!.diagnal2[0];
        }
        return winnerMark;
    }
    protected initBoard(): Board {
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
        Playground.hideEndingMessage();
        this.board = this.initBoard();
        if (!isTraining) this.board.show();
        else this.board.hide();

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
    protected printResultOfCurrentEpoch(): void {
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
        for (const player of [this.player1, this.player2]) {
            if (player instanceof GraphPlayer) player.printDatabaseInfo();
        }
    }
    protected resetResultOfCurrentEpoch(): void {
        this.p1StartCount = 0;
        this.p2StartCount = 0;
        this.player1.winCount = 0;
        this.player2.winCount = 0;
    }
}

export class TrainingGround extends Playground {
    private isGameRunning: boolean;
    public constructor(player1: Player, player2: Player) {
        super(player1, player2);
        document.removeEventListener(
            "move",
            this.onPlayerMove as EventListener
        );
        document.removeEventListener("callNextPlayer", this.onCallNextPlayer);
        document.removeEventListener(
            "gameOver",
            this.onGameOver as EventListener
        );
        document.removeEventListener("stop", this.onStop);
        this.isGameRunning = false;
    }
    public override trainMachine(trainTimes: number, batch: number): void {
        this.isTraining = true;
        this.gamesPerEpoch = batch;
        this.remainingEpoch = Math.floor(trainTimes / batch);
        const remainder: number = trainTimes % batch;
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
        document.dispatchEvent(
            new CustomEvent<CompleteTrainingEvent>("completeTraining")
        );
    }
    private startTrainEpoch(): void {
        this.prepare();
        while (this.remainingGames > 0) {
            this.playerMove();
            const winner = this.judge();
            if (!this.isGameRunning) {
                if (winner) winner.winCount++;
                for (const player of [this.player1, this.player2]) {
                    if (player instanceof GraphPlayer) {
                        player.backpropagate(
                            winner === null
                                ? "tie"
                                : winner.markPlaying === player.markPlaying
                                ? "win"
                                : "lose"
                        );
                        player.clearPath();
                    } else if (player instanceof RandomPlayer) {
                        player.resetChoices();
                    }
                }
                this.remainingGames--;
                if (this.remainingGames > 0) this.prepare();
                else break;
            } else {
                this.currentPlayer =
                    this.currentPlayer === this.player1
                        ? this.player2
                        : this.player1;
            }
        }
    }
    private prepare(): void {
        this.board = this.initBoard();
        this.board.hide();
        this.isGameRunning = true;
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
    }
    private playerMove(): void {
        const [r, c] = this.currentPlayer?.select(false)!;
        this.board?.matrix[r][c].setMark(this.currentPlayer?.markPlaying!);

        const opponent =
            this.currentPlayer === this.player1 ? this.player2 : this.player1;
        if (opponent instanceof AutoPlayer) {
            opponent.moveWithOpponent({
                position: [r, c],
                board: this.board!.matrix,
            });
        }
    }
    protected override judge(): Player | null {
        const winnerMark = this.getWinnerMark();
        if (winnerMark) {
            this.isGameRunning = false;
            for (const player of [this.player1, this.player2]) {
                if (player.markPlaying === winnerMark) return player;
            }
            throw Error(`Cannot find winner with mark: ${winnerMark}`);
        } else if (
            !this.board?.matrix.some((row) => row.some((cell) => !cell.mark))
        ) {
            this.isGameRunning = false;
        }
        return null;
    }
}
