export class RandomPlayer {
    constructor(initChoices) {
        this._allChoices = initChoices;
        this._availableChoices = this._allChoices;
    }
    resetChoices() {
        this._availableChoices = this._allChoices;
    }
    updateChoices(pos) {
        this._availableChoices.filter(each => {
            each != pos;
        });
    }
    select() {
        let pos = this._availableChoices[Math.floor(Math.random() * this._availableChoices.length)];
        this.updateChoices(pos);
        return pos;
    }
}
