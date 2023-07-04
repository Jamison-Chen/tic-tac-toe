export function isAutoPlayer(player) {
    return ("moveWithOpponent" in player &&
        typeof player.moveWithOpponent === "function");
}
