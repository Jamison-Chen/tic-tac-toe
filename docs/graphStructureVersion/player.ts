import { Cell } from "./ticTacToe";

export interface Player {
    markPlaying: "O" | "X" | null;
    winCount: number;
    select(...arg: any): [number, number];
}

export interface AutoPlayer extends Player {
    moveWithOpponent(position: [number, number], latestBoard: Cell[][]): void;
}

export function isAutoPlayer(player: Player): player is AutoPlayer {
    return (
        "moveWithOpponent" in player &&
        typeof player.moveWithOpponent === "function"
    );
}
