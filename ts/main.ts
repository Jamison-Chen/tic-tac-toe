import { Playground, CompleteTrainingEvent } from "./playground.js";
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

multiplayerBtn.addEventListener("click", () => startP2PGame());
naiveMachineBtn.addEventListener("click", () => startP2CGame(false));
trainedMachineBtn.addEventListener("click", () => startP2CGame(true));
reloadBtnInControlBar.addEventListener("click", () => location.reload());
reloadBtnInEndingScreen.addEventListener("click", () => location.reload());

function startP2PGame(): void {
    moveControlBar();
    const game = new Playground(new HumanPlayer(), new HumanPlayer());
    game.start(false);
}

function startP2CGame(shouldTrain: boolean): void {
    moveControlBar();
    if (shouldTrain) {
        const game = new Playground(mlPlayer, new GraphPlayer());
        document.addEventListener(
            "completeTraining",
            onCompleteTraining as EventListener
        );
        game.trainMachine(32, 16);
    } else {
        const game = new Playground(mlPlayer, new HumanPlayer());
        game.start();
    }
}

function moveControlBar(): void {
    controlBar.classList.add("bottom");
}

const onCompleteTraining = (e: CustomEvent<CompleteTrainingEvent>) => {
    setTimeout(() => {
        e.detail.game.player2 = new HumanPlayer();
        e.detail.game.start(false, true);
    });
};
