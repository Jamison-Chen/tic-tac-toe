export class Node {
    private _value: number;
    private _childrenList: string[];
    public constructor(v: number) {
        this._value = v;
        this._childrenList = [];
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
    public appendChild(hashVal: string): void {
        this._childrenList.push(hashVal);
    }
}