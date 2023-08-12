import { AutoPlayer } from "./player.js";
import { MoveEvent } from "./playground.js";

export default class RandomPlayer extends AutoPlayer {
    private allChoices: [number, number][];
    private availableChoices: [number, number][];
    public markPlaying: "O" | "X" | null;
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
        this.availableChoices = this.allChoices;
        this.markPlaying = null;
        this.winCount = 0;
    }
    public resetChoices(): void {
        this.availableChoices = this.allChoices;
    }
    public moveWithOpponent(info: { position: [number, number] }): void {
        this.availableChoices = this.availableChoices.filter((each) => {
            return each[0] !== info.position[0] || each[1] !== info.position[1];
        });
    }
    public select(): [number, number] {
        const position: [number, number] =
            this.availableChoices[
                Math.floor(Math.random() * this.availableChoices.length)
            ];
        this.moveWithOpponent({ position });
        setTimeout(() => {
            document.dispatchEvent(
                new CustomEvent<MoveEvent>("move", {
                    detail: { position, markPlaying: this.markPlaying! },
                })
            );
        });
        return position;
    }
}
