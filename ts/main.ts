// Notice the .js in path below
import {
    Playground,
    CompleteTrainingEvent,
    TrainingGround,
} from "./playground.js";
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
        document.addEventListener(
            "completeTraining",
            onCompleteTraining as EventListener
        );
        //// Visualize training process (event-driven, very slow)
        // const game = new Playground(mlPlayer, new GraphPlayer());
        // game.trainMachine(24, 12);

        //// Hide training process (iteration, very fast)
        const game = new TrainingGround(mlPlayer, new GraphPlayer());
        game.trainMachine(2400, 400);
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
        if (e.detail.game) {
            e.detail.game.player1 = mlPlayer;
            e.detail.game.player2 = new HumanPlayer();
            e.detail.game.start(false, true);
        } else {
            const game = new Playground(mlPlayer, new HumanPlayer());
            game.start(false, true);
        }
    });
};
