import { Playground } from "./playground.js";
import { GraphPlayer } from "./mlPlayer.js";
import HumanPlayer from "./humanPlayer.js";
const controlBar = document.getElementById("control-bar");
const reloadBtnInControlBar = document.getElementById("reload-btn-in-control-bar");
const multiplayerBtn = document.getElementById("multiplayer-btn");
const naiveMachineBtn = document.getElementById("naive-machine-btn");
const trainedMachineBtn = document.getElementById("trained-machine-btn");
const reloadBtnInEndingScreen = document.getElementById("reload-btn-in-ending-screen");
const mlPlayer = new GraphPlayer();
multiplayerBtn.addEventListener("click", () => startP2PGame());
naiveMachineBtn.addEventListener("click", () => startP2CGame(false));
trainedMachineBtn.addEventListener("click", () => startP2CGame(true));
reloadBtnInControlBar.addEventListener("click", () => location.reload());
reloadBtnInEndingScreen.addEventListener("click", () => location.reload());
function startP2PGame() {
    moveControlBar();
    const game = new Playground(new HumanPlayer(), new HumanPlayer());
    game.start(false);
}
function startP2CGame(shouldTrain) {
    moveControlBar();
    if (shouldTrain) {
        const game = new Playground(mlPlayer, new GraphPlayer());
        document.addEventListener("completeTraining", onCompleteTraining);
        game.trainMachine(32, 16);
    }
    else {
        const game = new Playground(mlPlayer, new HumanPlayer());
        game.start();
    }
}
function moveControlBar() {
    controlBar.classList.add("bottom");
}
const onCompleteTraining = (e) => {
    setTimeout(() => {
        e.detail.game.player2 = new HumanPlayer();
        e.detail.game.start(false, true);
    });
};
