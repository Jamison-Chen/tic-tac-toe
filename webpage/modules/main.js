var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MachinePlayer } from './machinePlayer.js';
import { RandomPlayer } from './randomPlayer.js';
class TicTacToe {
    constructor() {
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
        this.rdPlayer = new RandomPlayer([[0, 0], [0, 1], [0, 2],
            [1, 0], [1, 1], [1, 2],
            [2, 0], [2, 1], [2, 2]]);
        this.humanMoved = false;
        this.humanInput = null;
    }
    playerMakeMove(playerNum, role = "", opponent = "") {
        return __awaiter(this, void 0, void 0, function* () {
            let playMark;
            let playerName;
            if (playerNum == "player1") {
                playMark = "O";
                playerName = "1";
            }
            else {
                playMark = "X";
                playerName = "2";
            }
            let pos = null;
            if (role == "") {
                pos = this.player.select(playerName);
            }
            else if (role == "random") {
                if (playerNum == "player1") {
                    pos = this.rdPlayer.select();
                }
            }
            else if (role == "human") {
                pos = yield this.waitHumanInput();
            }
            let cell = this.cellDivs[this.posToCellIdx(pos)];
            this.placeMark(cell, playMark);
        });
    }
    waitHumanInput() {
        return new Promise(resolve => {
            if (!this.humanMoved) {
                setTimeout(this.waitHumanInput, 0);
            }
            else {
                if (this.humanInput != null) {
                    resolve(this.humanInput);
                }
            }
        });
    }
    posToCellIdx(pos) {
        if (pos instanceof Array) {
            return 1 * pos[0] + 3 * pos[1];
        }
        return 404;
    }
    placeMark(cell, currentPlayer) {
        cell === null || cell === void 0 ? void 0 : cell.classList.add(currentPlayer);
    }
}
