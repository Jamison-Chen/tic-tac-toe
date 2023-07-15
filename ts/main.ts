import Playground from "./playground.js";
import { GraphPlayer } from "./mlPlayer.js";
import HumanPlayer from "./humanPlayer.js";

const controlBar: HTMLElement = document.getElementById("control-bar")!;
const reloadBtnInControlBar: HTMLButtonElement = document.getElementById(
    "reload-btn-in-control-bar"
) as HTMLButtonElement;
const multiplayerBtn: HTMLButtonElement = document.getElementById(
    "multiplayer-btn"
) as HTMLButtonElement;
const naiveMachineBtn: HTMLButtonElement = document.getElementById(
    "naive-machine-btn"
) as HTMLButtonElement;
const trainedMachineBtn: HTMLButtonElement = document.getElementById(
    "trained-machine-btn"
) as HTMLButtonElement;

const reloadBtnInEndingScreen: HTMLButtonElement = document.getElementById(
    "reload-btn-in-ending-screen"
) as HTMLButtonElement;

const mlPlayer = new GraphPlayer();

multiplayerBtn.addEventListener("click", () => startMultiPlayerGame());
naiveMachineBtn.addEventListener("click", () => startSinglePlayerGame(false));
trainedMachineBtn.addEventListener("click", () => startSinglePlayerGame(true));
reloadBtnInControlBar.addEventListener("click", () => location.reload());
reloadBtnInEndingScreen.addEventListener("click", () => location.reload());

function startMultiPlayerGame(): void {
    moveControlBar();
    const game = new Playground(new HumanPlayer(), new HumanPlayer());
    game.start(false);
}

function startSinglePlayerGame(shouldTrain: boolean): void {
    moveControlBar();
    if (shouldTrain) {
        const game = new Playground(mlPlayer, new GraphPlayer());
        game.trainMachine(2500, 250);
        document.addEventListener("completeTraining", () => {
            setTimeout(() => {
                game.player2 = new HumanPlayer();
                game.start(false, true);
            });
        });
    } else {
        const game = new Playground(mlPlayer, new HumanPlayer());
        game.start(false);
    }
}

function moveControlBar(): void {
    controlBar.classList.add("bottom");
}
