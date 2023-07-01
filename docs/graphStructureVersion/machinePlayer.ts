import Node from "./node.js";
import Player from "./player.js";
import { Cell, MovePositionEvent } from "./ticTacToe.js";

export default class MachinePlayer implements Player {
    private path: string[];
    private database: any;
    public markPlaying: "O" | "X" | null;
    public winCount: number;
    public constructor() {
        this.database = { BBBBBBBBB: new Node() };
        this.path = ["BBBBBBBBB"];
        this.markPlaying = null;
        this.winCount = 0;
    }
    // private isKeyInDB(key: string): boolean {
    //     if (this.getEquivalentKeyInDB(key) === null) return false;
    //     return true;
    // }
    // private getEquivalentKeyInDB(key: string): string | null {
    //     for (let i = 0; i < 4; i++) {
    //         key = this.rotateKey(key);
    //         if (key in this.database) return key;
    //     }
    //     return null;
    // }
    // private rotateKey(key: string): string {
    //     let newOrder = [2, 5, 8, 1, 4, 7, 0, 3, 6];
    //     let newKey = "";
    //     for (let idx of newOrder) newKey += key[idx];
    //     return newKey;
    // }
    private calcHashVal(board: Cell[][]): string {
        let hashVal: string = "";
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                if (board[r][c].mark === " ") hashVal += "B";
                else hashVal += board[r][c].mark;
            }
        }
        return hashVal;
    }
    private translateHashDiffToMove(
        hashBefore: string,
        hashAfter: string
    ): [number, number] {
        for (let i = 0; i < hashBefore.length; i++) {
            if (hashBefore[i] !== hashAfter[i]) {
                return [Math.floor(i / 3), i % 3];
            }
        }
        throw "something wrong!";
    }
    private genAllPossibleNextStateHash(
        currentHashVal: string,
        forWhom: "self" | "opponent"
    ): string[] {
        let allPosiibility: string[] = [];
        for (let i = 0; i < currentHashVal.length; i++) {
            if (currentHashVal[i] === "B") {
                if (forWhom === "self") {
                    allPosiibility.push(
                        currentHashVal.slice(0, i) +
                            this.markPlaying +
                            currentHashVal.slice(i + 1)
                    );
                } else {
                    let opponentMark = this.markPlaying === "O" ? "X" : "O";
                    allPosiibility.push(
                        currentHashVal.slice(0, i) +
                            opponentMark +
                            currentHashVal.slice(i + 1)
                    );
                }
            }
        }
        return allPosiibility;
    }
    private isExternal(hashVal: string): boolean {
        return this.database[hashVal].childrenList.length === 0;
    }
    private updatePath(hashVal: string): void {
        this.path.push(hashVal);
    }
    public moveWithOpponent(
        position: [number, number],
        latestBoard: Cell[][]
    ): void {
        if (this.isExternal(this.path[this.path.length - 1])) {
            this.expand("opponent");
        }
        this.updatePath(this.calcHashVal(latestBoard));
    }
    public clearPath(): void {
        this.path = ["BBBBBBBBB"];
    }
    private shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    public select(): [number, number] {
        let currentHashVal = this.path[this.path.length - 1];
        if (this.isExternal(currentHashVal)) this.expand("self");
        let currentNode = this.database[currentHashVal];
        this.shuffle(currentNode.childrenList);
        this.database[currentHashVal].value = this.evaluateByMinimax(
            this.database[currentHashVal],
            this.markPlaying === "O"
        );
        let bestNextHash: string | undefined;
        for (let eachChildHash of currentNode.childrenList) {
            if (this.database[eachChildHash].value === currentNode.value) {
                bestNextHash = eachChildHash;
                break;
            }
        }
        let position: [number, number];
        if (typeof bestNextHash === "string") {
            position = this.translateHashDiffToMove(
                currentHashVal,
                bestNextHash
            );
            this.updatePath(bestNextHash);
        } else throw "no bestNextHash was found";
        setTimeout(() => {
            document.dispatchEvent(
                new CustomEvent<MovePositionEvent>("move", {
                    detail: { position, markPlaying: this.markPlaying! },
                })
            );
        });
        return position;
    }
    private expand(forWhom: "self" | "opponent"): void {
        let currentHashVal = this.path[this.path.length - 1];
        let allPossibleNextStateHash = this.genAllPossibleNextStateHash(
            currentHashVal,
            forWhom
        );
        for (let each of allPossibleNextStateHash) {
            this.database[this.path[this.path.length - 1]].appendChild(each);
            if (
                this.database[each] === undefined ||
                this.database[each] === null
            ) {
                this.database[each] = new Node();
            }
        }
        this.backPropagate("forExpansion");
    }
    public backPropagate(
        state: "forExpansion" | "firstMoverWin" | "firstMoverLose" | "tie"
    ): void {
        let currentNode: Node = this.database[this.path[this.path.length - 1]];
        let depth: number = this.path.length - 1;

        // First, et all values along the path to null.
        for (let eachHashVal of this.path) {
            this.database[eachHashVal].value = null;
        }

        // Then, re-fill in all the values that's been set to null
        // Using the less steps to win, the better.
        // Using the more steps to lose, the better.
        if (state === "firstMoverWin") currentNode.value = 100 / depth;
        else if (state === "firstMoverLose") currentNode.value = -100 / depth;
        else if (state === "tie") currentNode.value = 0;
    }
    private hasNullValueChild(aListOfHashes: string[]): {
        hasNullChild: boolean;
        nullIdxList: number[];
    } {
        let hasNullChild: boolean = false;
        let nullIdxList: number[] = [];
        for (let i = 0; i < aListOfHashes.length; i++) {
            if (this.database[aListOfHashes[i]].value === null) {
                hasNullChild = true;
                nullIdxList.push(i);
            }
        }
        return {
            hasNullChild: hasNullChild,
            nullIdxList: nullIdxList,
        };
    }
    private evaluateByMinimax(
        nodeEvaluated: Node,
        isMaximizer: boolean
    ): number {
        let currentChildrenList = nodeEvaluated.childrenList;
        let aboutThisNode = this.hasNullValueChild(currentChildrenList);
        if (aboutThisNode["hasNullChild"]) {
            for (let i of aboutThisNode["nullIdxList"]) {
                this.database[currentChildrenList[i]].value =
                    this.evaluateByMinimax(
                        this.database[currentChildrenList[i]],
                        !isMaximizer
                    );
            }
        }
        let childrenValueList: number[] = [];
        for (let each of currentChildrenList) {
            childrenValueList.push(this.database[each].value);
        }
        function ascendingSort(a: number, b: number): number {
            if (a === b) return 0;
            else return a < b ? -1 : 1;
        }
        function descendingSort(a: number, b: number): number {
            if (a === b) return 0;
            else return a < b ? 1 : -1;
        }
        let v = isMaximizer
            ? childrenValueList.sort(descendingSort)[0]
            : childrenValueList.sort(ascendingSort)[0];
        return v;
    }
    public printDatabaseInfo(): void {
        console.log(`Database size: ${Object.keys(this.database).length}`);
    }
}
