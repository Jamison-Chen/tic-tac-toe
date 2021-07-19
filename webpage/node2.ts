export class Node2 {
    private _value: number;
    private _childrenList: string[];
    // private _bestNextHash: string | null;
    public constructor(v: number) {
        this._value = v;
        this._childrenList = [];
        // this._bestNextHash = null;
    }
    get value(): number {
        return this._value;
    }
    set value(v: number) {
        this._value = v;
    }
    get childrenList(): string[] {
        return this._childrenList;
    }
    // get bestNextHash(): string | null {
    //     return this._bestNextHash;
    // }
    public appendChild(hashVal: string): void {
        this._childrenList.push(hashVal);
    }
}