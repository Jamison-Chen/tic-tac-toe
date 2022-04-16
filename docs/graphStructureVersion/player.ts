export default interface Player {
    select(arg?: any): [number, number];
    moveWithOpponent(
        position: [number, number],
        latestBoard: (" " | "X" | "O")[][]
    ): void;
}
