export default class Utils {
    public static getSizeOfObject(object: any): number {
        const objectList = [];
        const stack = [object];
        let bytes = 0;
        while (stack.length) {
            const item = stack.pop();
            if (
                typeof item === "object" &&
                item !== null &&
                objectList.indexOf(item) === -1
            ) {
                objectList.push(item);
                for (let key in item) stack.push(item[key]);
            }
            bytes += Utils.sizeOf(item);
        }
        return bytes;
    }
    private static sizeOf(item: any): number {
        if (item === null) return 0;
        if (typeof item === "boolean") return 4;
        if (typeof item === "number") return 8;
        if (typeof item === "string") return item.length * 2;
        if (typeof item === "object") {
            if (Array.isArray(item)) {
                return item.reduce((acc, val) => acc + Utils.sizeOf(val), 0);
            }
            return Object.keys(item).reduce(
                (acc, key) => acc + Utils.sizeOf(key) + Utils.sizeOf(item[key]),
                0
            );
        }
        return 0;
    }
    public static inPlaceShuffle(array: any[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
