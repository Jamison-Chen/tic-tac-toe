import Player from "./player";
export default class HumanPlayer implements Player {
    public playMark: "O" | "X" | null;
    public constructor() {
        this.playMark = null;
    }
    public moveWithOpponent(
        position: [number, number],
        latestBoard: (" " | "X" | "O")[][] = []
    ): void {}
    public select(posIn: [number, number]): [number, number] {
        return posIn;
    }
}
