import { Cell } from "./ticTacToe";

export default interface Player {
    markPlaying: "O" | "X" | null;
    winCount: number;
    select(...arg: any): [number, number];
    moveWithOpponent(position: [number, number], latestBoard: Cell[][]): void;
}
