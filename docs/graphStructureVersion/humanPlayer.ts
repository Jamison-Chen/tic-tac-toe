import { Player } from "./player";
import { MovePositionEvent } from "./ticTacToe";

export default class HumanPlayer implements Player {
    public markPlaying: "O" | "X" | null;
    public winCount: number;
    public constructor() {
        this.markPlaying = null;
        this.winCount = 0;
    }
    public select(position: [number, number]): [number, number] {
        setTimeout(() => {
            document.dispatchEvent(
                new CustomEvent<MovePositionEvent>("move", {
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
