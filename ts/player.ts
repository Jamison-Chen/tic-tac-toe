import { Cell, Mark, MoveEvent, Position } from "./playground.js";

export abstract class Player {
    public abstract markPlaying: Mark;
    public abstract winCount: number;
    public abstract select(...arg: any): Position;
    public dispatchEvent(position: Position, delay?: number): void {
        setTimeout(() => {
            document.dispatchEvent(
                new CustomEvent<MoveEvent>("move", {
                    detail: { position, markPlaying: this.markPlaying! },
                })
            );
        }, delay);
    }
}

export abstract class AutoPlayer extends Player {
    public abstract moveWithOpponent(info: {
        position?: Position;
        board?: Cell[][];
    }): void;
    public abstract override select(shouldDispatchEvent: boolean): Position;
    public override dispatchEvent(
        position: Position,
        delay: number = 100
    ): void {
        super.dispatchEvent(position, delay);
    }
}
