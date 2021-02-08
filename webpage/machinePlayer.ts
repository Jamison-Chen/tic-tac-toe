import { Node } from './node.js';
import { Player } from './player.js';
export class MachinePlayer implements Player {
    private _root: Node;
    private _temp: Node;
    private _allChoices: [number, number][];
    private _path: [[number, number] | "ROOT", string][];
    public constructor() {
        this._root = new Node(null, "ROOT", [null, Infinity]);
        this._temp = this._root;
        this._allChoices = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
        this._path = [];
    }
    public root(): Node {
        return this._root;
    }
    // public isRoot(n: Node): Boolean {
    //     return n.parent == null;
    // }
    public isExternal(n: Node): Boolean {
        return n.childrenList == [];
    }
    public isInternal(n: Node): Boolean {
        return !(n.childrenList == []);
    }
    public updatePath(pos: [number, number] | "ROOT", playerName: string): void {
        this._allChoices.filter(each => { each != pos });
        this._path.push([pos, playerName]);
    }
    public moveWithOpponent(opponentName: string, opponentMovePos: [number, number]): void {
        if (this.isExternal(this._temp)) {
            this.expand();
        }
        let tempChildrenList: Node[] = this._temp.childrenList;
        tempChildrenList.some(each => {
            if (each.name == opponentMovePos) {
                this._temp = each;
                this.updatePath(opponentMovePos, opponentName);
                return true;
            }
        });
    }
    public clearPath(): void {
        this._path = [];
        this._allChoices = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
    }
    public select(playerName: string): [number, number] | "ROOT" | null {
        if (this.isExternal(this._temp)) {
            this.expand();
        }
        let tempChildrenList: Node[] = this._temp.childrenList;
        let pos: [number, number] | "ROOT" | null = null;
        tempChildrenList.find(each => {
            if (each.name == this._temp.value[0]) {
                this._temp = each;
                pos = this._temp.name;
                this.updatePath(pos, playerName);
                return true;
            }
        });
        return pos;
    }
    private shuffle(array: any[]): void {
        for (let i: number = array.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    public expand(): void {
        this.shuffle(this._allChoices);
        this._allChoices.forEach(each => {
            this._temp.appendChild(new Node(this._temp, each, [null, Infinity]));
        });
        this.backPropagate("2");
    }
    public backPropagate(state: string): void {
        // states: "2" means that this' for expanding,
        //         "1" means that the first mover won,
        //         "-1" means that the first mover lost,
        //         "0" means that this game went tie.
        let probe: Node;
        if (state == "2") {
            probe = this._temp.childrenList[0];
        } else {
            probe = this._temp;
        }
        let depth: number = 0;
        while (probe.parent != null) {
            probe = probe.parent;
            probe.value = [null, null];
            depth++;
        }
        if (state == "1") {
            this._temp.value = [null, 100 / depth];
        } else if (state == "-1") {
            this._temp.value = [null, -100 / depth];
        } else if (state == "0") {
            this._temp.value = [null, 0];
        }
        this.minimax(probe, true);
        if (state != "2") {
            this._temp = probe;
        }
    }
    public hasNullValue(aListOfNodes: Node[]): [Boolean, number[]] {
        let hasNull: Boolean = false;
        let items: number[] = [];
        for (let i: number = 0; i < aListOfNodes.length; i++) {
            if (aListOfNodes[i].value == [null, null]) {
                hasNull = true;
                items.push(i);
            }
        }
        return [hasNull, items];
    }
    public minimax(aTree: Node, isMaximizer: Boolean): void {
        let needRecursion: [Boolean, number[]] = this.hasNullValue(aTree.childrenList);
        if (needRecursion[0]) {
            needRecursion[1].forEach(each => {
                this.minimax(aTree.childrenList[each], !isMaximizer);
            });
        }
        let cInfo: ["ROOT" | [number, number], null | number][] = [];
        aTree.childrenList.forEach(each => {
            cInfo.push([each.name, each.value[1]]);
        });
        function ascendingSort(a: ["ROOT" | [number, number], any], b: ["ROOT" | [number, number], any]): number {
            if (a[1] == b[1]) {
                return 0;
            } else {
                return (a[1] < b[1]) ? -1 : 1;
            }
        }
        function descendingSort(a: ["ROOT" | [number, number], any], b: ["ROOT" | [number, number], any]): number {
            if (a[1] == b[1]) {
                return 0;
            } else {
                return (a[1] < b[1]) ? 1 : -1;
            }
        }
        let v: ["ROOT" | [number, number], null | number];
        if (isMaximizer) {
            v = cInfo.sort(descendingSort)[0];
        } else {
            v = cInfo.sort(ascendingSort)[0];
        }
        aTree.value = v;
    }
}