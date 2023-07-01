export default class HumanPlayer {
    constructor() {
        this.markPlaying = null;
        this.winCount = 0;
    }
    moveWithOpponent(position, latestBoard = []) { }
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
