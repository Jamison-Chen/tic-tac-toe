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
    public isExternal(n: Node): boolean {
        return n.childrenList.length == 0;
    }
    public updatePath(pos: [number, number] | "ROOT", playerName: string): void {
        this._allChoices = this._allChoices.filter(each => {
            return (each[0] != pos[0] || each[1] != pos[1])
        });
        this._path.push([pos, playerName]);
    }
    public moveWithOpponent(opponentName: string, opponentMovePos: [number, number]): void {
        if (this.isExternal(this._temp)) this.expand();
        let tempChildrenList: Node[] = this._temp.childrenList;
        for (let i = 0; i < tempChildrenList.length; i++) {
            if (tempChildrenList[i].name[0] == opponentMovePos[0] && tempChildrenList[i].name[1] == opponentMovePos[1]) {
                this._temp = tempChildrenList[i];
                this.updatePath(opponentMovePos, opponentName);
                break;
            }
        }
    }
    public clearPath(): void {
        this._path = [];
        this._allChoices = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
    }
    public select(playerName: string): [number, number] | "ROOT" | null {
        if (this.isExternal(this._temp)) this.expand();
        let tempChildrenList: Node[] = this._temp.childrenList;
        let pos: [number, number] | "ROOT" | null = null;
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
        let probe: Node = state == "2" ? this._temp.childrenList[0] : this._temp;
        let depth: number = 0;
        // Move the probe to the top of tree(blank-board situation),
        // and set all values along the path to [mull, null]
        while (probe.parent != null) {
            probe = probe.parent;
            probe.value = [null, null];
            depth++;
        }
        if (state == "1") this._temp.value = [null, 100 / depth];   // Using the less steps to win, the better.
        else if (state == "-1") this._temp.value = [null, -100 / depth];    // Using the more steps to lose, the better.
        else if (state == "0") this._temp.value = [null, 0];
        this.minimax(probe, true);  // Use minimax() to re-fill in all the values that's been set to [null, null].
        if (state != "2") this._temp = probe;   // Back to the blank-board situation because the game has been over.
    }
    public hasNullValue(aListOfNodes: Node[]): [boolean, number[]] {
        let hasNull: boolean = false;
        let items: number[] = [];
        for (let i: number = 0; i < aListOfNodes.length; i++) {
            if (aListOfNodes[i].value[0] == null && aListOfNodes[i].value[1] == null) {
                hasNull = true;
                items.push(i);
            }
        }
        return [hasNull, items];
    }
    public minimax(aTree: Node, isMaximizer: boolean): void {
        let needRecursion: [boolean, number[]] = this.hasNullValue(aTree.childrenList);
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
            if (a[1] == b[1]) return 0;
            else return a[1] < b[1] ? -1 : 1;
        }
        function descendingSort(a: ["ROOT" | [number, number], any], b: ["ROOT" | [number, number], any]): number {
            if (a[1] == b[1]) return 0;
            else return (a[1] < b[1]) ? 1 : -1;
        }
        let v: ["ROOT" | [number, number], null | number];
        v = isMaximizer ? cInfo.sort(descendingSort)[0] : cInfo.sort(ascendingSort)[0];
        aTree.value = v;
    }
}