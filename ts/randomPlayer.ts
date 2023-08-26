import { AutoPlayer } from "./player.js";
import { Mark, Position } from "./playground.js";

export default class RandomPlayer extends AutoPlayer {
    private availableChoices: Position[];
    public markPlaying: Mark;
    public winCount: number;
    public constructor() {
        super();
        this.availableChoices = structuredClone(this.allChoices);
        this.markPlaying = null;
        this.winCount = 0;
    }
    private get allChoices(): Position[] {
        const result: Position[] = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) result.push([i, j] as Position);
        }
        return result;
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
