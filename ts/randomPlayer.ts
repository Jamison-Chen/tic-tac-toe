import { AutoPlayer } from "./player.js";
import { Mark, Position } from "./playground.js";

export default class RandomPlayer extends AutoPlayer {
    private allChoices: Position[];
    private availableChoices: Position[];
    public markPlaying: Mark;
    public winCount: number;
    public constructor() {
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
    public resetChoices(): void {
        this.availableChoices = structuredClone(this.allChoices);
    }
    public moveWithOpponent(info: { position: Position }): void {
        this.availableChoices = this.availableChoices.filter((each) => {
            return each[0] !== info.position[0] || each[1] !== info.position[1];
        });
    }
    public select(shouldDispatchEvent: boolean = true): Position {
        const position: Position =
            this.availableChoices[
                Math.floor(Math.random() * this.availableChoices.length)
            ];
        this.moveWithOpponent({ position });
        if (shouldDispatchEvent) this.dispatchEvent(position);
        return position;
    }
}
