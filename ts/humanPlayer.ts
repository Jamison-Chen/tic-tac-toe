import { Player } from "./player.js";
import { Mark, Position } from "./playground.js";

export default class HumanPlayer extends Player {
    public markPlaying: Mark;
    public winCount: number;
    public constructor() {
        super();
        this.markPlaying = null;
        this.winCount = 0;
    }
    public select(position: Position): Position {
        this.dispatchEvent(position);
        return position;
    }
}
