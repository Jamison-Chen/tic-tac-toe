import { Cell, Mark } from "./playground.js";

export abstract class Player {
    public abstract markPlaying: Mark;
    public abstract winCount: number;
    public abstract select(...arg: any): [number, number];
}

export abstract class AutoPlayer extends Player {
    public abstract moveWithOpponent(info: {
        position?: [number, number];
        board?: Cell[][];
    }): void;
}
