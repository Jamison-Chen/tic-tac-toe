export default class Node {
    constructor(v = 0) {
        this._value = v;
        this._childrenList = [];
    }
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
    }
    get childrenList() {
        return this._childrenList;
    }
    appendChild(hashVal) {
        this._childrenList.push(hashVal);
    }
}
