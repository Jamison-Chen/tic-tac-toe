import Node from "./node.js";
export default class MachinePlayer {
    constructor() {
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
    calcHashVal(board) {
        let hashVal = "";
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                if (board[r][c].mark === " ")
                    hashVal += "B";
                else
                    hashVal += board[r][c].mark;
            }
        }
        return hashVal;
    }
    translateHashDiffToMove(hashBefore, hashAfter) {
        for (let i = 0; i < hashBefore.length; i++) {
            if (hashBefore[i] !== hashAfter[i]) {
                return [Math.floor(i / 3), i % 3];
            }
        }
        throw "something wrong!";
    }
    genAllPossibleNextStateHash(currentHashVal, forWhom) {
        let allPosiibility = [];
        for (let i = 0; i < currentHashVal.length; i++) {
            if (currentHashVal[i] === "B") {
                if (forWhom === "self") {
                    allPosiibility.push(currentHashVal.slice(0, i) +
                        this.markPlaying +
                        currentHashVal.slice(i + 1));
                }
                else {
                    let opponentMark = this.markPlaying === "O" ? "X" : "O";
                    allPosiibility.push(currentHashVal.slice(0, i) +
                        opponentMark +
                        currentHashVal.slice(i + 1));
                }
            }
        }
        return allPosiibility;
    }
    isExternal(hashVal) {
        return this.database[hashVal].childrenList.length === 0;
    }
    updatePath(hashVal) {
        this.path.push(hashVal);
    }
    moveWithOpponent(position, latestBoard) {
        if (this.isExternal(this.path[this.path.length - 1])) {
            this.expand("opponent");
        }
        this.updatePath(this.calcHashVal(latestBoard));
    }
    clearPath() {
        this.path = ["BBBBBBBBB"];
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    select() {
        let currentHashVal = this.path[this.path.length - 1];
        if (this.isExternal(currentHashVal))
            this.expand("self");
        let currentNode = this.database[currentHashVal];
        this.shuffle(currentNode.childrenList);
        this.database[currentHashVal].value = this.evaluateByMinimax(this.database[currentHashVal], this.markPlaying === "O");
        let bestNextHash;
        for (let eachChildHash of currentNode.childrenList) {
            if (this.database[eachChildHash].value === currentNode.value) {
                bestNextHash = eachChildHash;
                break;
            }
        }
        let position;
        if (typeof bestNextHash === "string") {
            position = this.translateHashDiffToMove(currentHashVal, bestNextHash);
            this.updatePath(bestNextHash);
        }
        else
            throw "no bestNextHash was found";
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent("move", {
                detail: { position, markPlaying: this.markPlaying },
            }));
        });
        return position;
    }
    expand(forWhom) {
        let currentHashVal = this.path[this.path.length - 1];
        let allPossibleNextStateHash = this.genAllPossibleNextStateHash(currentHashVal, forWhom);
        for (let each of allPossibleNextStateHash) {
            this.database[this.path[this.path.length - 1]].appendChild(each);
            if (this.database[each] === undefined ||
                this.database[each] === null) {
                this.database[each] = new Node();
            }
        }
        this.backPropagate("forExpansion");
    }
    backPropagate(state) {
        let currentNode = this.database[this.path[this.path.length - 1]];
        let depth = this.path.length - 1;
        // First, et all values along the path to null.
        for (let eachHashVal of this.path) {
            this.database[eachHashVal].value = null;
        }
        // Then, re-fill in all the values that's been set to null
        // Using the less steps to win, the better.
        // Using the more steps to lose, the better.
        if (state === "firstMoverWin")
            currentNode.value = 100 / depth;
        else if (state === "firstMoverLose")
            currentNode.value = -100 / depth;
        else if (state === "tie")
            currentNode.value = 0;
    }
    hasNullValueChild(aListOfHashes) {
        let hasNullChild = false;
        let nullIdxList = [];
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
    evaluateByMinimax(nodeEvaluated, isMaximizer) {
        let currentChildrenList = nodeEvaluated.childrenList;
        let aboutThisNode = this.hasNullValueChild(currentChildrenList);
        if (aboutThisNode["hasNullChild"]) {
            for (let i of aboutThisNode["nullIdxList"]) {
                this.database[currentChildrenList[i]].value =
                    this.evaluateByMinimax(this.database[currentChildrenList[i]], !isMaximizer);
            }
        }
        let childrenValueList = [];
        for (let each of currentChildrenList) {
            childrenValueList.push(this.database[each].value);
        }
        function ascendingSort(a, b) {
            if (a === b)
                return 0;
            else
                return a < b ? -1 : 1;
        }
        function descendingSort(a, b) {
            if (a === b)
                return 0;
            else
                return a < b ? 1 : -1;
        }
        let v = isMaximizer
            ? childrenValueList.sort(descendingSort)[0]
            : childrenValueList.sort(ascendingSort)[0];
        return v;
    }
    printDatabaseInfo() {
        console.log(`Database size: ${Object.keys(this.database).length}`);
    }
}
