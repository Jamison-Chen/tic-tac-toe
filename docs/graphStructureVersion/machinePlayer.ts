import Node from "./node.js";
import Player from "./player.js";
export default class MachinePlayer implements Player {
    private _path: string[];
    private _database: any;
    public myMark: string;
    public constructor() {
        this._database = { BBBBBBBBB: new Node(0) };
        this._path = ["BBBBBBBBB"];
        this.myMark = "";
    }
    private calcHashVal(board: string[][]): string {
        let hashVal = "";
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] == " ") hashVal += "B";
                else hashVal += board[i][j];
            }
        }
        return hashVal;
    }
    private translateHashToMove(
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
        forWhom: "mySelf" | "opponent"
    ): string[] {
        let allPosiibility: string[] = [];
        for (let i = 0; i < currentHashVal.length; i++) {
            if (currentHashVal[i] == "B") {
                if (forWhom == "mySelf") {
                    allPosiibility.push(
                        currentHashVal.slice(0, i) +
                            this.myMark +
                            currentHashVal.slice(i + 1)
                    );
                } else {
                    let opponentMark = this.myMark == "O" ? "X" : "O";
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
        return this._database[hashVal].childrenList.length == 0;
    }
    private updatePath(hashVal: string): void {
        this._path.push(hashVal);
    }
    public moveWithOpponent(board: string[][]): void {
        if (this.isExternal(this._path[this._path.length - 1])) {
            this.expand("opponent");
        }
        this.updatePath(this.calcHashVal(board));
    }
    public clearPath(): void {
        this._path = ["BBBBBBBBB"];
    }
    private shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    public select(myMark: "O" | "X"): [number, number] {
        this.myMark = myMark;
        let currentHashVal = this._path[this._path.length - 1];
        if (this.isExternal(currentHashVal)) this.expand("mySelf");
        let currentNode = this._database[currentHashVal];
        this.shuffle(currentNode.childrenList);
        this.evalValByMinimax(this._database[currentHashVal], myMark == "O");
        let bestNextHash: string | undefined;
        for (let eachChildHash of currentNode.childrenList) {
            if (this._database[eachChildHash].value == currentNode.value) {
                bestNextHash = eachChildHash;
                break;
            }
        }
        let pos: [number, number];
        if (typeof bestNextHash == "string") {
            pos = this.translateHashToMove(currentHashVal, bestNextHash);
            this.updatePath(bestNextHash);
        } else throw "no bestNextHash was found";
        return pos;
    }
    private expand(forWhom: "mySelf" | "opponent"): void {
        let currentHashVal = this._path[this._path.length - 1];
        let allPossibleNextStateHash = this.genAllPossibleNextStateHash(
            currentHashVal,
            forWhom
        );
        for (let each of allPossibleNextStateHash) {
            this._database[this._path[this._path.length - 1]].appendChild(each);
            if (
                this._database[each] == undefined ||
                this._database[each] == null
            ) {
                this._database[each] = new Node(0);
            }
        }
        this.backPropagate("forExpansion");
    }
    public backPropagate(
        state: "forExpansion" | "firstMoverWin" | "firstMoverLose" | "tie"
    ): void {
        let currentNode: Node =
            this._database[this._path[this._path.length - 1]];
        let depth: number = this._path.length - 1;
        // Set all values along the path to null.
        for (let eachHashVal of this._path)
            this._database[eachHashVal].value = null;
        if (state == "firstMoverWin") currentNode.value = 100 / depth;
        // Using the less steps to win, the better.
        else if (state == "firstMoverLose") currentNode.value = -100 / depth;
        // Using the more steps to lose, the better.
        else if (state == "tie") currentNode.value = 0; // Use minimax to re-fill in all the values that's been set to null.
    }
    private hasNullValueChild(aListOfHashes: string[]): {
        hasNullChild: boolean;
        nullIdxList: number[];
    } {
        let hasNullChild: boolean = false;
        let nullIdxList: number[] = [];
        for (let i = 0; i < aListOfHashes.length; i++) {
            if (this._database[aListOfHashes[i]].value == null) {
                hasNullChild = true;
                nullIdxList.push(i);
            }
        }
        return {
            hasNullChild: hasNullChild,
            nullIdxList: nullIdxList,
        };
    }
    private evalValByMinimax(nodeEvaluated: Node, isMaximizer: boolean): void {
        let currentChildrenList = nodeEvaluated.childrenList;
        let aboutThisNode = this.hasNullValueChild(currentChildrenList);
        if (aboutThisNode["hasNullChild"]) {
            for (let i of aboutThisNode["nullIdxList"]) {
                this.evalValByMinimax(
                    this._database[currentChildrenList[i]],
                    !isMaximizer
                );
            }
        }
        let childrenValueList: number[] = [];
        for (let each of currentChildrenList)
            childrenValueList.push(this._database[each].value);
        function ascendingSort(a: number, b: number): number {
            if (a == b) return 0;
            else return a < b ? -1 : 1;
        }
        function descendingSort(a: number, b: number): number {
            if (a == b) return 0;
            else return a < b ? 1 : -1;
        }
        let v = isMaximizer
            ? childrenValueList.sort(descendingSort)[0]
            : childrenValueList.sort(ascendingSort)[0];
        nodeEvaluated.value = v;
    }
    public printDatabaseInfo(): void {
        console.log(Object.keys(this._database).length);
    }
}
