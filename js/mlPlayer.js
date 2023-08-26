import { AutoPlayer } from "./player.js";
import Utils from "./utils.js";
class Node {
    constructor(key) {
        this._key = key;
        this.score = null;
        this.children = [];
        this.isEndGame = false;
    }
    get key() {
        return this._key;
    }
    get isExternal() {
        return this.children.length === 0;
    }
    markAsEndGame() {
        this.isEndGame = true;
        this.children = [];
    }
}
export class GraphPlayer extends AutoPlayer {
    constructor() {
        super();
        this.database = { BBBBBBBBB: new Node("BBBBBBBBB") };
        this.path = [];
        this.markPlaying = null;
        this.winCount = 0;
        this.clearPath();
    }
    boardToKey(board) {
        let key = "";
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                if (!board[r][c].mark)
                    key += "B";
                else
                    key += board[r][c].mark;
            }
        }
        return key;
    }
    keyDiffToMovePosition(prevKey, currentKey) {
        for (let i = 0; i < prevKey.length; i++) {
            if (prevKey[i] !== currentKey[i]) {
                return [Math.floor(i / 3), i % 3];
            }
        }
        throw Error("Failed to translate key difference to move posititon...");
    }
    getClockwiseRotatedPosition(position, rotateCount) {
        rotateCount %= 4;
        if (rotateCount < 0)
            rotateCount += 4;
        let [r, c] = position;
        for (let i = 0; i < rotateCount; i++)
            [r, c] = [c, 2 - r];
        return [r, c];
    }
    genAllNextStateKeys(currentKey) {
        const markCount = { O: 0, X: 0, B: 0 };
        for (const mark of currentKey)
            markCount[mark]++;
        const nextStateMark = markCount["O"] > markCount["X"] ? "X" : "O";
        const result = [];
        for (let i = 0; i < currentKey.length; i++) {
            if (currentKey[i] === "B") {
                result.push(`${currentKey.substring(0, i)}${nextStateMark}${currentKey.substring(i + 1)}`);
            }
        }
        return result;
    }
    getEqivalentPathInfo(key) {
        let newKey = key;
        for (let i = 0; i < 4; i++) {
            if (this.database.hasOwnProperty(newKey)) {
                return { rotatedKey: newKey, rotateCount: i };
            }
            newKey = this.getClockwiseRotatedKey(newKey, 1);
        }
        throw Error(`Failed to get rotated key of: ${key}`);
    }
    getClockwiseRotatedKey(key, rotateCount) {
        rotateCount %= 4;
        if (rotateCount < 0)
            rotateCount += 4;
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
    moveWithOpponent(info) {
        const currentNode = this.database[this.path[this.path.length - 1].rotatedKey];
        this.expand(currentNode);
        this.path.push(this.getEqivalentPathInfo(this.boardToKey(info.board)));
    }
    clearPath() {
        this.path = [{ rotatedKey: "BBBBBBBBB", rotateCount: 0 }];
    }
    select(shouldDispatchEvent = true) {
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
        let bestChildNodeWithRotateCount = childNodesWithRotateCount.find((n) => n.node.score === null);
        if (!bestChildNodeWithRotateCount) {
            if (this.markPlaying === "O") {
                bestChildNodeWithRotateCount = childNodesWithRotateCount.reduce((max, n) => (max.node.score > n.node.score ? max : n), childNodesWithRotateCount[0]);
            }
            else {
                bestChildNodeWithRotateCount = childNodesWithRotateCount.reduce((min, n) => (min.node.score < n.node.score ? min : n), childNodesWithRotateCount[0]);
            }
        }
        this.path.push({
            rotatedKey: bestChildNodeWithRotateCount.node.key,
            rotateCount: bestChildNodeWithRotateCount.rotateCount + rotateCount,
        });
        const rotatedBestChildNodeKey = this.getClockwiseRotatedKey(bestChildNodeWithRotateCount.node.key, -bestChildNodeWithRotateCount.rotateCount);
        let position = this.keyDiffToMovePosition(currentNode.key, rotatedBestChildNodeKey);
        position = this.getClockwiseRotatedPosition(position, -rotateCount);
        if (shouldDispatchEvent)
            this.dispatchEvent(position);
        return position;
    }
    expand(targetNode) {
        if (!targetNode.isEndGame && targetNode.isExternal) {
            for (const key of this.genAllNextStateKeys(targetNode.key)) {
                let keyToAdd = { rotatedKey: key, rotateCount: 0 };
                try {
                    keyToAdd = this.getEqivalentPathInfo(key);
                }
                catch {
                    this.database[key] = new Node(key);
                }
                if (!targetNode.children
                    .map((e) => e.rotatedKey)
                    .includes(keyToAdd.rotatedKey)) {
                    targetNode.children.push(keyToAdd);
                }
            }
        }
    }
    backpropagate(state) {
        const depth = this.path.length - 1;
        const endGameNode = this.database[this.path[depth].rotatedKey];
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
            const parentKey = remainingPath.pop().rotatedKey;
            const childScores = this.database[parentKey].children
                .map((child) => this.database[child.rotatedKey])
                .map((node) => node.score);
            if (!Utils.isNonNullArray(childScores)) {
                this.database[parentKey].score = null;
            }
            else {
                if (remainingPath.length % 2 === 1) {
                    this.database[parentKey].score = Math.min(...childScores);
                }
                else {
                    this.database[parentKey].score = Math.max(...childScores);
                }
            }
        }
    }
    printDatabaseInfo() {
        const scale = ["bytes", "KB", "MB", "GB", "TB"];
        let size = Utils.getSizeOfObject(this.database);
        let i = 0;
        while (size / 1024 > 1) {
            size /= 1024;
            i++;
        }
        console.log(`Database size: ${Object.keys(this.database).length} (${Math.round(size * 100) / 100} ${scale[i]})`);
    }
}
