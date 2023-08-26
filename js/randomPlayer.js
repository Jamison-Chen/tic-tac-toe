import { AutoPlayer } from "./player.js";
export default class RandomPlayer extends AutoPlayer {
    constructor() {
        super();
        this.availableChoices = structuredClone(this.allChoices);
        this.markPlaying = null;
        this.winCount = 0;
    }
    get allChoices() {
        const result = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++)
                result.push([i, j]);
        }
        return result;
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
