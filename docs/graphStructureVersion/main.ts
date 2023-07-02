import TicTacToe from "./ticTacToe.js";
import MachinePlayer from "./machinePlayer.js";
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

const machinePlayer = new MachinePlayer();

multiplayerBtn.addEventListener("click", () => startMultiPlayerGame());
naiveMachineBtn.addEventListener("click", () => startSinglePlayerGame(false));
trainedMachineBtn.addEventListener("click", () => startSinglePlayerGame(true));
reloadBtnInControlBar.addEventListener("click", () => location.reload());
reloadBtnInEndingScreen.addEventListener("click", () => location.reload());

function startMultiPlayerGame(): void {
    disableControlBar();
    const game = new TicTacToe(new HumanPlayer(), new HumanPlayer());
    game.start(false);
}

function startSinglePlayerGame(shouldTrain: boolean): void {
    disableControlBar();
    if (shouldTrain) {
        const game: TicTacToe = new TicTacToe(
            machinePlayer
            // new MachinePlayer()
        );
        game.trainMachine(5000, 250);
        document.addEventListener("completeTraining", () => {
            setTimeout(() => {
                game.player2 = new HumanPlayer();
                game.start(false, true);
            });
        });
    } else {
        const game: TicTacToe = new TicTacToe(machinePlayer, new HumanPlayer());
        game.start(false);
    }
}

function disableControlBar(): void {
    multiplayerBtn.disabled = true;
    naiveMachineBtn.disabled = true;
    trainedMachineBtn.disabled = true;
    controlBar.classList.add("bottom");
}
