import { Player } from "./player";
export default class HumanPlayer extends Player {
    constructor() {
        super();
        this.markPlaying = null;
        this.winCount = 0;
    }
    select(position) {
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent("move", {
                detail: {
                    position: position,
                    markPlaying: this.markPlaying,
                },
            }));
        });
        return position;
    }
}
