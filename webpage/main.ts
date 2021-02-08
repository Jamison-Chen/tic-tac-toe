import { MachinePlayer } from './machinePlayer.js';
import { RandomPlayer } from './randomPlayer.js';
class TicTacToe {
    public cellDivs: NodeListOf<HTMLElement>;
    public board: HTMLElement | null;
    public winningMessageDiv: HTMLElement | null;
    public winningMessageText: HTMLElement | null;
    public winningCombinations: number[][];
    public gameRunning: Boolean;
    public mover: number;
    public p1Start: number;
    public p2Start: number;
    public totalGames: number;
    public p1Win: number;
    public p2Win: number;
    public tie: number;
    public player: MachinePlayer;
    public rdPlayer: RandomPlayer;
    public humanMoved: Boolean;
    public humanInput: [number, number] | null;
    public constructor() {
        this.cellDivs = document.querySelectorAll("[data-cell]");
        this.board = document.getElementById("main-board");
        this.winningMessageDiv = document.getElementById("winning-message");
        this.winningMessageText = document.querySelector("[data-winning-message-text]");
        this.winningCombinations =
            [[0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]];
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
        this.humanMoved = false;
        this.humanInput = null;
    }
    public async playerMakeMove(playerNum: string, role = "", opponent = ""): Promise<void> {
        let playMark: string;
        let playerName: string;
        if (playerNum == "player1") {
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
            if (playerNum == "player1") {
                pos = this.rdPlayer.select();
            }
        } else if (role == "human") {
            pos = await this.waitHumanInput();
        }
        let cell: HTMLElement | null = this.cellDivs[this.posToCellIdx(pos)];
        this.placeMark(cell, playMark);
    }
    public waitHumanInput() {
        return new Promise<[number, number]>(resolve => {
            if (!this.humanMoved) {
                setTimeout(this.waitHumanInput, 0);
            } else {
                if (this.humanInput != null) {
                    resolve(this.humanInput);
                }
            }
        });
    }
    public posToCellIdx(pos: [number, number] | "ROOT" | null): number {
        if (pos instanceof Array) {
            return 1 * pos[0] + 3 * pos[1];
        }
        return 404;
    }
    public placeMark(cell: HTMLElement | null, currentPlayer: string): void {
        cell?.classList.add(currentPlayer);
    }
}