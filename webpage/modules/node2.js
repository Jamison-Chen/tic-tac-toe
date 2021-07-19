export class Node2 {
    // private _bestNextHash: string | null;
    constructor(v) {
        this._value = v;
        this._childrenList = [];
        // this._bestNextHash = null;
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
    // get bestNextHash(): string | null {
    //     return this._bestNextHash;
    // }
    appendChild(hashVal) {
        this._childrenList.push(hashVal);
    }
}
