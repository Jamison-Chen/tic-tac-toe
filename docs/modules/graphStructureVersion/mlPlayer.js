class Node {
    constructor(hashVal) {
        this._hashVal = hashVal;
        this.score = null;
        this.children = [];
        this.isEndGame = false;
    }
    get hashVal() {
        return this._hashVal;
    }
    get isExternal() {
        return this.children.length === 0;
    }
    markAsEndGame() {
        this.isEndGame = true;
        this.children = [];
    }
}
export default class MLPlayer {
    constructor() {
        this.database = { BBBBBBBBB: new Node("BBBBBBBBB") };
        this.path = ["BBBBBBBBB"];
        this.markPlaying = null;
        this.winCount = 0;
    }
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
    translateHashDiffToMovePos(hashBefore, hashAfter) {
        for (let i = 0; i < hashBefore.length; i++) {
            if (hashBefore[i] !== hashAfter[i]) {
                return [Math.floor(i / 3), i % 3];
            }
        }
        throw Error("Cannot translate hash difference to move posititon...");
    }
    genAllPossibleNextStateHashVals(currentHashVal) {
        const markOccurance = {
            O: 0,
            X: 0,
            " ": 0,
        };
        for (const mark of currentHashVal)
            markOccurance[mark]++;
        const nextStateMark = markOccurance["O"] > markOccurance["X"] ? "X" : "O";
        const result = [];
        for (let i = 0; i < currentHashVal.length; i++) {
            if (currentHashVal[i] === "B") {
                result.push(`${currentHashVal.substring(0, i)}${nextStateMark}${currentHashVal.substring(i + 1)}`);
            }
        }
        return result;
    }
    moveWithOpponent(position, board) {
        const currentNode = this.database[this.path[this.path.length - 1]];
        this.expand(currentNode);
        this.path.push(this.calcHashVal(board));
    }
    clearPath() {
        this.path = ["BBBBBBBBB"];
    }
    inPlaceShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    select() {
        const currentHashVal = this.path[this.path.length - 1];
        const currentNode = this.database[currentHashVal];
        this.expand(currentNode);
        this.inPlaceShuffle(currentNode.children);
        const childNodes = currentNode.children.map((hashVal) => this.database[hashVal]);
        let bestChildNode = childNodes.find((node) => node.score === null);
        if (!bestChildNode) {
            if (this.markPlaying === "O") {
                bestChildNode = childNodes.reduce((max, node) => (max.score > node.score ? max : node), childNodes[0]);
            }
            else {
                bestChildNode = childNodes.reduce((min, node) => (min.score < node.score ? min : node), childNodes[0]);
            }
        }
        this.path.push(bestChildNode.hashVal);
        const position = this.translateHashDiffToMovePos(currentHashVal, bestChildNode.hashVal);
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent("move", {
                detail: { position, markPlaying: this.markPlaying },
            }));
        });
        return position;
    }
    expand(targetNode) {
        if (!targetNode.isEndGame && targetNode.isExternal) {
            for (const hashVal of this.genAllPossibleNextStateHashVals(targetNode.hashVal)) {
                targetNode.children.push(hashVal);
                if (!this.database.hasOwnProperty(hashVal)) {
                    this.database[hashVal] = new Node(hashVal);
                }
            }
        }
    }
    backPropagate(state) {
        const depth = this.path.length - 1;
        const endGameNode = this.database[this.path[depth]];
        endGameNode.markAsEndGame();
        if (state === "win") {
            endGameNode.score =
                ((this.markPlaying === "O" ? 1 : -1) * 100) / depth;
        }
        else if (state === "lose") {
            endGameNode.score =
                ((this.markPlaying === "O" ? -1 : 1) * 100) / depth;
        }
        else if (state === "tie")
            endGameNode.score = 0;
        const remainingPath = this.path.slice(0, -1);
        while (remainingPath.length > 0) {
            const parentHashVal = remainingPath.pop();
            const childScores = this.database[parentHashVal].children
                .map((chv) => this.database[chv])
                .map((node) => node.score);
            if (childScores.find((score) => score === null)) {
                this.database[parentHashVal].score = null;
            }
            else {
                if (remainingPath.length % 2 === 1) {
                    this.database[parentHashVal].score = Math.min(...childScores);
                }
                else {
                    this.database[parentHashVal].score = Math.max(...childScores);
                }
            }
        }
    }
    printDatabaseInfo() {
        console.log(`Database size: ${Object.keys(this.database).length}`);
    }
}
