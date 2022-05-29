import Player from "./player";
export default class RandomPlayer implements Player {
    private _allChoices: [number, number][];
    private _availableChoices: [number, number][];
    public playMark: "O" | "X" | null;
    public constructor(
        initChoices: [number, number][] = [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 0],
            [1, 1],
            [1, 2],
            [2, 0],
            [2, 1],
            [2, 2],
        ]
    ) {
        this._allChoices = initChoices;
        this._availableChoices = this._allChoices;
        this.playMark = null;
    }
    public resetChoices(): void {
        this._availableChoices = this._allChoices;
    }
    public moveWithOpponent(
        position: [number, number],
        latestBoard: (" " | "X" | "O")[][] = []
    ): void {
        this._availableChoices = this._availableChoices.filter((each) => {
            return each[0] !== position[0] || each[1] !== position[1];
        });
    }
    public select(): [number, number] {
        let position: [number, number] =
            this._availableChoices[
                Math.floor(Math.random() * this._availableChoices.length)
            ];
        this.moveWithOpponent(position);
        return position;
    }
}
