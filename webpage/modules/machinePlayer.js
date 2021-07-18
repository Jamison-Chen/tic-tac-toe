import { Node } from './node.js';
export class MachinePlayer {
    constructor() {
        this._root = new Node(null, "ROOT", [null, Infinity]);
        this._temp = this._root;
        this._allChoices = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
        this._path = [];
    }
    isExternal(n) {
        return n.childrenList.length == 0;
    }
    updatePath(pos, playerName) {
        this._allChoices = this._allChoices.filter(each => {
            return (each[0] != pos[0] || each[1] != pos[1]);
        });
        this._path.push([pos, playerName]);
    }
    moveWithOpponent(opponentName, opponentMovePos) {
        if (this.isExternal(this._temp))
            this.expand();
        let tempChildrenList = this._temp.childrenList;
        for (let i = 0; i < tempChildrenList.length; i++) {
            if (tempChildrenList[i].name[0] == opponentMovePos[0] && tempChildrenList[i].name[1] == opponentMovePos[1]) {
                this._temp = tempChildrenList[i];
                this.updatePath(opponentMovePos, opponentName);
                break;
            }
        }
    }
    clearPath() {
        this._path = [];
        this._allChoices = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
    }
    select(playerName) {
        if (this.isExternal(this._temp))
            this.expand();
        let tempChildrenList = this._temp.childrenList;
        let pos = null;
        for (let i = 0; i < tempChildrenList.length; i++) {
            if (tempChildrenList[i].name == this._temp.value[0]) {
                this._temp = tempChildrenList[i];
                pos = this._temp.name;
                this.updatePath(pos, playerName);
                break;
            }
        }
        return pos;
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    expand() {
        this.shuffle(this._allChoices);
        this._allChoices.forEach(each => {
            this._temp.appendChild(new Node(this._temp, each, [null, Infinity]));
        });
        this.backPropagate("2");
    }
    backPropagate(state) {
        // states: "2" means that this' for expanding,
        //         "1" means that the first mover won,
        //         "-1" means that the first mover lost,
        //         "0" means that this game went tie.
        let probe;
        probe = state == "2" ? this._temp.childrenList[0] : this._temp;
        let depth = 0;
        while (probe.parent != null) {
            probe = probe.parent;
            probe.value = [null, null];
            depth++;
        }
        if (state == "1")
            this._temp.value = [null, 100 / depth];
        else if (state == "-1")
            this._temp.value = [null, -100 / depth];
        else if (state == "0")
            this._temp.value = [null, 0];
        this.minimax(probe, true);
        if (state != "2")
            this._temp = probe;
    }
    hasNullValue(aListOfNodes) {
        let hasNull = false;
        let items = [];
        for (let i = 0; i < aListOfNodes.length; i++) {
            if (aListOfNodes[i].value[0] == null && aListOfNodes[i].value[1] == null) {
                hasNull = true;
                items.push(i);
            }
        }
        return [hasNull, items];
    }
    minimax(aTree, isMaximizer) {
        let needRecursion = this.hasNullValue(aTree.childrenList);
        if (needRecursion[0]) {
            needRecursion[1].forEach(each => {
                this.minimax(aTree.childrenList[each], !isMaximizer);
            });
        }
        let cInfo = [];
        aTree.childrenList.forEach(each => {
            cInfo.push([each.name, each.value[1]]);
        });
        function ascendingSort(a, b) {
            if (a[1] == b[1])
                return 0;
            else
                return a[1] < b[1] ? -1 : 1;
        }
        function descendingSort(a, b) {
            if (a[1] == b[1])
                return 0;
            else
                return (a[1] < b[1]) ? 1 : -1;
        }
        let v;
        v = isMaximizer ? cInfo.sort(descendingSort)[0] : cInfo.sort(ascendingSort)[0];
        aTree.value = v;
    }
}
