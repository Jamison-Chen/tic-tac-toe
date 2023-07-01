import TicTacToe from "./ticTacToe.js";
import MachinePlayer from "./machinePlayer.js";
import HumanPlayer from "./humanPlayer.js";
const controlBar = document.getElementById("control-bar");
const reloadBtnInControlBar = document.getElementById("reload-btn-in-control-bar");
const multiplayerBtn = document.getElementById("multiplayer-btn");
const naiveMachineBtn = document.getElementById("naive-machine-btn");
const trainedMachineBtn = document.getElementById("trained-machine-btn");
const reloadBtnInEndingScreen = document.getElementById("reload-btn-in-ending-screen");
const machinePlayer = new MachinePlayer();
multiplayerBtn.addEventListener("click", () => startMultiPlayerGame());
naiveMachineBtn.addEventListener("click", () => startSinglePlayerGame(false));
trainedMachineBtn.addEventListener("click", () => startSinglePlayerGame(true));
reloadBtnInControlBar.addEventListener("click", () => location.reload());
reloadBtnInEndingScreen.addEventListener("click", () => location.reload());
function startMultiPlayerGame() {
    disableControlBar();
    const game = new TicTacToe(new HumanPlayer(), new HumanPlayer());
    game.start(false);
}
function startSinglePlayerGame(shouldTrain) {
    disableControlBar();
    setTimeout(() => {
        if (shouldTrain) {
            const game = new TicTacToe(machinePlayer);
            game.trainMachine(20000, 200);
            document.addEventListener("completeTraining", () => {
                setTimeout(() => {
                    game.player2 = new HumanPlayer();
                    game.start(false);
                });
            });
        }
        else {
            const game = new TicTacToe(machinePlayer, new HumanPlayer());
            game.start(false);
        }
    });
}
function disableControlBar() {
    multiplayerBtn.disabled = true;
    naiveMachineBtn.disabled = true;
    trainedMachineBtn.disabled = true;
    controlBar.classList.add("bottom");
}
