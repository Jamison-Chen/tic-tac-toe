import { MachinePlayer } from './machinePlayer.js';
import { RandomPlayer } from './randomPlayer.js';
class TicTacToe {
    // public cellDivs: NodeListOf<HTMLElement>;
    // public board: HTMLElement | null;
    // public winningMessageDiv: HTMLElement | null;
    // public winningMessageText: HTMLElement | null;
    // public winningCombinations: number[][];
    public virtualBoard: string[][];
    public gameRunning: boolean;
    public mover: number;
    public p1Start: number;
    public p2Start: number;
    public totalGames: number;
    public p1Win: number;
    public p2Win: number;
    public tie: number;
    public player: MachinePlayer;
    public rdPlayer: RandomPlayer;
    // public humanHasMoved: boolean;
    // public humanInput: [number, number] | null;
    public constructor() {
        // this.cellDivs = document.querySelectorAll("[data-cell]");
        // this.board = document.getElementById("main-board");
        // this.winningMessageDiv = document.getElementById("winning-message");
        // this.winningMessageText = document.querySelector("[data-winning-message-text]");
        // this.winningCombinations =
        //     [[0, 1, 2],
        //     [3, 4, 5],
        //     [6, 7, 8],
        //     [0, 3, 6],
        //     [1, 4, 7],
        //     [2, 5, 8],
        //     [0, 4, 8],
        //     [2, 4, 6]];
        this.virtualBoard =
            [[" ", " ", " "],
            [" ", " ", " "],
            [" ", " ", " "]]
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
        // this.humanHasMoved = false;
        // this.humanInput = null;
    }
    public async playerMakeMove(role = "", opponent = ""): Promise<void> {
        let playMark: string;
        let playerName: string;
        if (this.mover == 1) {
            playMark = "O";
            playerName = "1";
        } else {
            playMark = "X";
            playerName = "2";
        }
        let pos: [number, number] | "ROOT" | null = null;
        if (role == "") {
            pos = this.player.select(playerName);
        } else if (role == "random") {
            if (this.mover == 2) {
                pos = this.rdPlayer.select();
            }
        }
        // else if (role == "human") {
        // pos = await this.waitHumanInput();
        // }
        // let cell: HTMLElement | null = this.cellDivs[this.posToCellIdx(pos)];
        // this.placeMark(cell, playMark);
        if (pos instanceof Array) {
            this.virtualBoard[pos[1]][pos[0]] = playMark;
            if (opponent == "random") {
                if (this.mover == 1) {
                    this.rdPlayer.updateChoices(pos);
                }
            } else if (opponent == "") {
                if (this.mover == 2) {
                    this.player.moveWithOpponent(playerName, pos);
                }
            }
        }
        // console.log(
        //     `
        //     ${this.virtualBoard[0][0]}|${this.virtualBoard[0][1]}|${this.virtualBoard[0][2]}
        //     ${this.virtualBoard[1][0]}|${this.virtualBoard[1][1]}|${this.virtualBoard[1][2]}
        //     ${this.virtualBoard[2][0]}|${this.virtualBoard[2][1]}|${this.virtualBoard[2][2]}`
        // );
    }
    // public waitHumanInput() {
    //     return new Promise<[number, number]>(resolve => {
    //         if (!this.humanHasMoved) {
    //             setTimeout(this.waitHumanInput, 0);
    //         } else {
    //             if (this.humanInput != null) {
    //                 resolve(this.humanInput);
    //             }
    //         }
    //     });
    // }
    // public posToCellIdx(pos: [number, number] | "ROOT" | null): number {
    //     if (pos instanceof Array) {
    //         return 1 * pos[0] + 3 * pos[1];
    //     }
    //     return 404;
    // }
    // public placeMark(cell: HTMLElement | null, currentPlayer: string): void {
    //     cell?.classList.add(currentPlayer);
    // }

    public judge(lastMover: number, p1 = "", p2 = ""): void {
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
            for (let i = 0; i < this.virtualBoard[0].length; i++) {
                hasWinner = this.virtualBoard.every(eachRow => {
                    return (eachRow[i] == this.virtualBoard[0][i] && this.virtualBoard[0][i] != " ");
                });
                if (hasWinner) {
                    winner = this.virtualBoard[0][i];
                    break;
                }
            }
        }
        if (!hasWinner) {
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
            // console.log(`${winner} wins`)
            if (winner == "O") {
                this.p1Win++;
                this.player.backPropagate("1");
                this.player.clearPath();
            } else if (winner == "X") {
                this.p2Win++;
                this.player.backPropagate("-1")
                this.player.clearPath();
            }
            if (p2 == "random") {
                this.rdPlayer.resetChoices();
            }
            this.gameRunning = false;
            this.totalGames++;
        } else if (!this.virtualBoard.some(r => r.some(e => e == " "))) {
            this.tie++;
            this.player.backPropagate("0");
            this.player.clearPath();
            if (p2 == "random") {
                this.rdPlayer.resetChoices();
            }
            this.gameRunning = false;
            this.totalGames++;
        }
        this.mover = -1 * lastMover + 3;
    }

    public newGame(p1: string, p2: string): void {
        this.gameRunning = true;
        this.virtualBoard =
            [[" ", " ", " "],
            [" ", " ", " "],
            [" ", " ", " "]];
        this.mover = 1;
        this.p1Start++;
    }

    public play(trainTimes: number, p1 = "", p2 = ""): void {
        this.trainStatisticsRefresh();
        this.newGame(p1, p2);
        while (this.gameRunning) {
            if (this.mover == 1) {
                this.playerMakeMove(p1, p2);
                this.judge(this.mover, p1, p2);
                if (this.totalGames == trainTimes) {
                    break;
                }
                if (!this.gameRunning) {
                    this.newGame(p1, p2);
                    if (this.mover == 1) {
                        continue;
                    }
                }
            }
            this.playerMakeMove(p2, p1);
            this.judge(this.mover, p1, p2);
            if (this.totalGames == trainTimes) {
                break;
            }
            if (!this.gameRunning) {
                this.newGame(p1, p2);
            }
        }
    }

    public printTrainResult(): void {
        console.log(`Game start with P1: ${this.p1Start} / P2: ${this.p2Start}`);
        console.log(`P1 winning rate: ${this.p1Win / this.totalGames * 100}`);
        console.log(`P2 winning rate: ${this.p2Win / this.totalGames * 100}`);
        console.log(`Tie rate: ${this.tie / this.totalGames * 100}`);
    }

    public trainStatisticsRefresh(): void {
        this.p1Start = 0;
        this.p2Start = 0;
        this.totalGames = 0;
        this.p1Win = 0;
        this.p2Win = 0;
        this.tie = 0;
    }

    public trainMachine(trainTimes: number, batch: number, trainType: string): void {
        let epoch: number = Math.floor(trainTimes / batch);
        let mod: number = trainTimes % batch;
        for (let i = 0; i < epoch; i++) {
            this.play(batch, "", trainType);
            this.printTrainResult();
        }
        if (mod != 0) {
            this.play(mod, "", trainType);
            this.printTrainResult();
        }
    }
}

let game: TicTacToe = new TicTacToe();
game.trainMachine(100000, 10000, "random");