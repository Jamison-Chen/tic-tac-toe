export default class RandomPlayer {
    constructor(initChoices) {
        this._allChoices = initChoices;
        this._availableChoices = this._allChoices;
    }
    resetChoices() {
        this._availableChoices = this._allChoices;
    }
    updateChoices(pos) {
        this._availableChoices = this._availableChoices.filter((each) => {
            return each[0] !== pos[0] || each[1] !== pos[1];
        });
    }
    select() {
        let pos = this._availableChoices[Math.floor(Math.random() * this._availableChoices.length)];
        this.updateChoices(pos);
        return pos;
    }
}
