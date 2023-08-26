import HumanPlayer from "./humanPlayer.js";
import { GraphPlayer } from "./mlPlayer.js";
import { Playground, TrainingGround } from "./playground.js";
import RandomPlayer from "./randomPlayer.js";
class Main {
    static main() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cellDiv = document.createElement("div");
                Main.board.appendChild(cellDiv);
                cellDiv.id = `${i},${j}`;
                cellDiv.className = "cell";
            }
        }
        Main.multiplayerBtn.addEventListener("click", Main.startP2PGame);
        Main.naiveMachineBtn.addEventListener("click", () => {
            Main.startP2CGame(false);
        });
        Main.trainedMachineBtn.addEventListener("click", () => {
            Main.startP2CGame(true);
        });
        Main.reloadBtnInControlBar.addEventListener("click", () => {
            location.reload();
        });
        Main.reloadBtnInEndingScreen.addEventListener("click", () => {
            Main.game.start();
        });
        Main.mlPlayer = new GraphPlayer();
        new TrainingGround(Main.mlPlayer, new GraphPlayer()).trainMachine(2400, 400);
    }
    static moveControlBar() {
        Main.controlBar.classList.add("bottom");
    }
}
Main.board = document.getElementById("board");
Main.controlBar = document.getElementById("control-bar");
Main.reloadBtnInControlBar = document.getElementById("reload-btn-in-control-bar");
Main.multiplayerBtn = document.getElementById("multiplayer-btn");
Main.naiveMachineBtn = document.getElementById("naive-machine-btn");
Main.trainedMachineBtn = document.getElementById("trained-machine-btn");
Main.reloadBtnInEndingScreen = document.getElementById("reload-btn-in-ending-screen");
Main.startP2PGame = () => {
    Main.moveControlBar();
    Main.game = new Playground(new HumanPlayer(), new HumanPlayer());
    Main.game.start(false);
};
Main.startP2CGame = (shouldTrain) => {
    Main.moveControlBar();
    Main.game = new Playground(shouldTrain ? Main.mlPlayer : new RandomPlayer(), new HumanPlayer());
    Main.game.start();
};
Main.main();
