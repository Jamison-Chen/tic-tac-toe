export class Player {
    dispatchEvent(position, delay) {
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent("move", {
                detail: { position, markPlaying: this.markPlaying },
            }));
        }, delay);
    }
}
export class AutoPlayer extends Player {
    dispatchEvent(position, delay = 100) {
        super.dispatchEvent(position, delay);
    }
}
