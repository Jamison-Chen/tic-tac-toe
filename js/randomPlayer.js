import { AutoPlayer } from "./player.js";
export default class RandomPlayer extends AutoPlayer {
    constructor() {
        super();
        this.allChoices = [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 0],
            [1, 1],
            [1, 2],
            [2, 0],
            [2, 1],
            [2, 2],
        ];
        this.availableChoices = structuredClone(this.allChoices);
        this.markPlaying = null;
        this.winCount = 0;
    }
    resetChoices() {
        this.availableChoices = structuredClone(this.allChoices);
    }
    moveWithOpponent(info) {
        this.availableChoices = this.availableChoices.filter((each) => {
            return each[0] !== info.position[0] || each[1] !== info.position[1];
        });
    }
    select(shouldDispatchEvent = true) {
        const position = this.availableChoices[Math.floor(Math.random() * this.availableChoices.length)];
        this.moveWithOpponent({ position });
        if (shouldDispatchEvent)
            this.dispatchEvent(position);
        return position;
    }
}
