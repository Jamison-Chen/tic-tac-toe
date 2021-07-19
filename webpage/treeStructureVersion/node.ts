export class Node {
    private _parent: null | Node;
    private _name: "ROOT" | [number, number];
    private _value: ["ROOT" | null | [number, number], null | number];
    private _childrenList: Node[];
    public constructor(p: null | Node, n: "ROOT" | [number, number], v: [null | [number, number], number]) {
        this._parent = p;
        this._name = n;
        this._value = v;
        this._childrenList = [];
    }

    get parent() {
        return this._parent;
    }

    get name() {
        return this._name;
    }

    get value() {
        return this._value;
    }

    get childrenList() {
        return this._childrenList;
    }

    public childrenListString(): string {
        let s: string = "";
        this._childrenList.forEach(each => {
            s += each.name.toString();
            s += ", ";
        });
        return s;
    }

    set parent(p: null | Node) {
        this._parent = p;
    }

    set name(n: "ROOT" | [number, number]) {
        this._name = n;
    }

    set value(v: ["ROOT" | null | [number, number], null | number]) {
        this._value = v;
    }

    public appendChild(c: Node): void {
        this._childrenList.push(c);
    }
}