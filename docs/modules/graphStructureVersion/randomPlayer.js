export default class RandomPlayer {
    constructor(initChoices) {
        this._allChoices = initChoices;
        this._availableChoices = this._allChoices;
    }
    resetChoices() {
        this._availableChoices = this._allChoices;
    }
    moveWithOpponent(position, latestBoard = []) {
        this._availableChoices = this._availableChoices.filter((each) => {
            return each[0] !== position[0] || each[1] !== position[1];
        });
    }
    select() {
        let position = this._availableChoices[Math.floor(Math.random() * this._availableChoices.length)];
        this.moveWithOpponent(position);
        return position;
    }
}
