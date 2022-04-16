export class RandomPlayer {
    private _allChoices: [number, number][];
    private _availableChoices: [number, number][];
    public constructor(initChoices: [number, number][]) {
        this._allChoices = initChoices;
        this._availableChoices = this._allChoices;
    }
    public resetChoices(): void {
        this._availableChoices = this._allChoices;
    }
    public updateChoices(pos: [number, number]): void {
        this._availableChoices = this._availableChoices.filter((each) => {
            return each[0] !== pos[0] || each[1] !== pos[1];
        });
    }
    public select(): [number, number] {
        let pos: [number, number] =
            this._availableChoices[
                Math.floor(Math.random() * this._availableChoices.length)
            ];
        this.updateChoices(pos);
        return pos;
    }
}
