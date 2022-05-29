export default interface Player {
    playMark: "O" | "X" | null;
    select(arg?: any): [number, number];
    moveWithOpponent(
        position: [number, number],
        latestBoard: (" " | "X" | "O")[][]
    ): void;
}
