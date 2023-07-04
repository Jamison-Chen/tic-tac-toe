import { Node } from './node.js';
export interface Player {
    isExternal(n: Node): boolean;
    clearPath(): void;
    updatePath(pos: [number, number] | "ROOT", playerName: string): void;
    select(playerName: string): [number, number] | "ROOT" | null;
    expand(): void;
    backPropagate(state: string): void;
}