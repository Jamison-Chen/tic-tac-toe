import { AutoPlayer } from "./player.js";
import type { Cell, Mark, Position } from "./playground.js";
import Utils from "./utils.js";

class Node {
    private _key: string;
    public score: number | null;
    public children: PathInfo[];
    public isEndGame: boolean;
    public constructor(key: string) {
        this._key = key;
        this.score = null;
        this.children = [];
        this.isEndGame = false;
    }
    public get key(): typeof this._key {
        return this._key;
    }
    public get isExternal(): boolean {
        return this.children.length === 0;
    }
    public markAsEndGame(): void {
        this.isEndGame = true;
        this.children = [];
    }
}

type Graph = { [key: string]: Node };

type PathInfo = {
    rotatedKey: string;
    rotateCount: number;
};

type NodeWithRotateCount = {
    node: Node;
    rotateCount: number;
};

export class GraphPlayer extends AutoPlayer {
    private path: PathInfo[];
    private database: Graph;
    public markPlaying: Mark;
    public winCount: number;
    public constructor() {
        super();
        this.database = { BBBBBBBBB: new Node("BBBBBBBBB") };
        this.path = [];
        this.markPlaying = null;
        this.winCount = 0;
        this.clearPath();
    }
    private boardToKey(board: Cell[][]): string {
        let key = "";
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                if (!board[r][c].mark) key += "B";
                else key += board[r][c].mark;
            }
        }
        return key;
    }
    private keyDiffToMovePosition(
        prevKey: string,
        currentKey: string
    ): Position {
        for (let i = 0; i < prevKey.length; i++) {
            if (prevKey[i] !== currentKey[i]) {
                return [Math.floor(i / 3), i % 3] as Position;
            }
        }
        throw Error("Failed to translate key difference to move posititon...");
    }
    private getClockwiseRotatedPosition(
        position: Position,
        rotateCount: number
    ): Position {
        rotateCount %= 4;
        if (rotateCount < 0) rotateCount += 4;
        let [r, c] = position;
        for (let i = 0; i < rotateCount; i++) [r, c] = [c, 2 - r] as Position;
        return [r, c];
    }
    private genAllNextStateKeys(currentKey: string): string[] {
        const markCount: { [mark: string]: number } = { O: 0, X: 0, B: 0 };
        for (const mark of currentKey) markCount[mark]++;
        const nextStateMark = markCount["O"] > markCount["X"] ? "X" : "O";
        const result: string[] = [];
        for (let i = 0; i < currentKey.length; i++) {
            if (currentKey[i] === "B") {
                result.push(
                    `${currentKey.substring(
                        0,
                        i
                    )}${nextStateMark}${currentKey.substring(i + 1)}`
                );
            }
        }
        return result;
    }
    private getEqivalentPathInfo(key: string): PathInfo {
        let newKey = key;
        for (let i = 0; i < 4; i++) {
            if (this.database.hasOwnProperty(newKey)) {
                return { rotatedKey: newKey, rotateCount: i };
            }
            newKey = this.getClockwiseRotatedKey(newKey, 1);
        }
        throw Error(`Failed to get rotated key of: ${key}`);
    }
    private getClockwiseRotatedKey(key: string, rotateCount: number): string {
        rotateCount %= 4;
        if (rotateCount < 0) rotateCount += 4;
        let newKey = key;
        for (let i = 0; i < rotateCount; i++) {
            const keyArray = newKey.split("");
            const newKeyArray = Array(keyArray.length);
            for (let j = 0; j < keyArray.length; j++) {
                newKeyArray[3 * (j % 3) + 2 - Math.floor(j / 3)] = keyArray[j];
                newKey = newKeyArray.join("");
            }
        }
        return newKey;
    }
    public moveWithOpponent(info: { board: Cell[][] }): void {
        const currentNode =
            this.database[this.path[this.path.length - 1].rotatedKey];
        this.expand(currentNode);
        this.path.push(this.getEqivalentPathInfo(this.boardToKey(info.board)));
    }
    public clearPath(): void {
        this.path = [{ rotatedKey: "BBBBBBBBB", rotateCount: 0 }];
    }
    public select(shouldDispatchEvent: boolean = true): Position {
        const { rotatedKey, rotateCount } = this.path[this.path.length - 1];
        const currentNode = this.database[rotatedKey];

        this.expand(currentNode);

        Utils.inPlaceShuffle(currentNode.children);
        const childNodesWithRotateCount = currentNode.children.map((child) => {
            return {
                node: this.database[child.rotatedKey],
                rotateCount: child.rotateCount,
            };
        });

        let bestChildNodeWithRotateCount: NodeWithRotateCount | undefined =
            childNodesWithRotateCount.find((n) => n.node.score === null);
        if (!bestChildNodeWithRotateCount) {
            if (this.markPlaying === "O") {
                bestChildNodeWithRotateCount = childNodesWithRotateCount.reduce(
                    (max, n) => (max.node.score! > n.node.score! ? max : n),
                    childNodesWithRotateCount[0]
                );
            } else {
                bestChildNodeWithRotateCount = childNodesWithRotateCount.reduce(
                    (min, n) => (min.node.score! < n.node.score! ? min : n),
                    childNodesWithRotateCount[0]
                );
            }
        }
        this.path.push({
            rotatedKey: bestChildNodeWithRotateCount.node.key,
            rotateCount: bestChildNodeWithRotateCount.rotateCount + rotateCount,
        });
        const rotatedBestChildNodeKey = this.getClockwiseRotatedKey(
            bestChildNodeWithRotateCount.node.key,
            -bestChildNodeWithRotateCount.rotateCount
        );
        let position = this.keyDiffToMovePosition(
            currentNode.key,
            rotatedBestChildNodeKey
        );
        position = this.getClockwiseRotatedPosition(position, -rotateCount);
        if (shouldDispatchEvent) this.dispatchEvent(position);
        return position;
    }
    private expand(targetNode: Node): void {
        if (!targetNode.isEndGame && targetNode.isExternal) {
            for (const key of this.genAllNextStateKeys(targetNode.key)) {
                let keyToAdd: PathInfo = { rotatedKey: key, rotateCount: 0 };
                try {
                    keyToAdd = this.getEqivalentPathInfo(key);
                } catch {
                    this.database[key] = new Node(key);
                }
                if (
                    !targetNode.children
                        .map((e) => e.rotatedKey)
                        .includes(keyToAdd.rotatedKey)
                ) {
                    targetNode.children.push(keyToAdd);
                }
            }
        }
    }
    public backpropagate(state: "win" | "lose" | "tie"): void {
        const depth = this.path.length - 1;
        const endGameNode = this.database[this.path[depth].rotatedKey];
        endGameNode.markAsEndGame();

        if (state === "win") {
            endGameNode.score =
                ((this.markPlaying === "O" ? 1 : -1) * 100) / depth;
        } else if (state === "lose") {
            endGameNode.score =
                ((this.markPlaying === "O" ? -1 : 1) * 100) / depth;
        } else if (state === "tie") endGameNode.score = 0;

        const remainingPath = this.path.slice(0, -1);
        while (remainingPath.length > 0) {
            const parentKey = remainingPath.pop()!.rotatedKey;
            const childScores = this.database[parentKey].children
                .map((child) => this.database[child.rotatedKey])
                .map((node) => node.score);
            if (!Utils.isNonNullArray(childScores)) {
                this.database[parentKey].score = null;
            } else {
                if (remainingPath.length % 2 === 1) {
                    this.database[parentKey].score = Math.min(...childScores);
                } else {
                    this.database[parentKey].score = Math.max(...childScores);
                }
            }
        }
    }
    public printDatabaseInfo(): void {
        const scale = ["bytes", "KB", "MB", "GB", "TB"];
        let size = Utils.getSizeOfObject(this.database);
        let i = 0;
        while (size / 1024 > 1) {
            size /= 1024;
            i++;
        }
        console.log(
            `Database size: ${Object.keys(this.database).length} (${
                Math.round(size * 100) / 100
            } ${scale[i]})`
        );
    }
}
