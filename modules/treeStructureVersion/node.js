export class Node {
    constructor(p, n, v) {
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
    childrenListString() {
        let s = "";
        this._childrenList.forEach(each => {
            s += each.name.toString();
            s += ", ";
        });
        return s;
    }
    set parent(p) {
        this._parent = p;
    }
    set name(n) {
        this._name = n;
    }
    set value(v) {
        this._value = v;
    }
    appendChild(c) {
        this._childrenList.push(c);
    }
}
