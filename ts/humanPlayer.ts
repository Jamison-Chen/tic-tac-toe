import { Player } from "./player.js";
import { Mark, MoveEvent } from "./playground.js";

export default class HumanPlayer extends Player {
    public markPlaying: Mark;
    public winCount: number;
    public constructor() {
        super();
        this.markPlaying = null;
        this.winCount = 0;
    }
    public select(position: [number, number]): [number, number] {
        setTimeout(() => {
            document.dispatchEvent(
                new CustomEvent<MoveEvent>("move", {
                    detail: {
                        position: position,
                        markPlaying: this.markPlaying!,
                    },
                })
            );
        });
        return position;
    }
}
