import { Player } from "./player.js";
export default class HumanPlayer extends Player {
    constructor() {
        super();
        this.markPlaying = null;
        this.winCount = 0;
    }
    select(position) {
        this.dispatchEvent(position);
        return position;
    }
}
