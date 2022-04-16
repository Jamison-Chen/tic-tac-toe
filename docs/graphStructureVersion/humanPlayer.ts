import Player from "./player";
export default class HumanPlayer implements Player {
    public moveWithOpponent(
        position: [number, number],
        latestBoard: (" " | "X" | "O")[][] = []
    ): void {}
    public select(posIn: [number, number]): [number, number] {
        return posIn;
    }
}
