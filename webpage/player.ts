import { Node } from './node.js';
export interface Player {
    root(): Node;
    // isRoot(n: Node): Boolean;
    isExternal(n: Node): Boolean;
    isInternal(n: Node): Boolean;
    clearPath(): void;
    updatePath(pos: [number, number] | "ROOT", playerName: string): void;
    select(playerName: string): [number, number] | "ROOT" | null;
    expand(): void;
    backPropagate(state: string): void;
}