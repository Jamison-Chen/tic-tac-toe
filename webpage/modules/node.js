"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
var Node = /** @class */ (function () {
    function Node(p, n, v) {
        this._parent = p;
        this._name = n;
        this._value = v;
        this._childrenList = [];
    }
    Object.defineProperty(Node.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (p) {
            this._parent = p;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (n) {
            this._name = n;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (v) {
            this._value = v;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "childrenList", {
        get: function () {
            return this._childrenList;
        },
        enumerable: false,
        configurable: true
    });
    Node.prototype.childrenListString = function () {
        var s = "";
        this._childrenList.forEach(function (each) {
            s += each.name.toString();
            s += ", ";
        });
        return s;
    };
    Node.prototype.appendChild = function (c) {
        this._childrenList.push(c);
    };
    return Node;
}());
exports.Node = Node;
