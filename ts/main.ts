// Notice the .js in path below
import HumanPlayer from "./humanPlayer.js";
import { GraphPlayer } from "./mlPlayer.js";
import { Playground, TrainingGround } from "./playground.js";
import RandomPlayer from "./randomPlayer.js";

class Main {
    private static controlBar: HTMLElement =
        document.getElementById("control-bar")!;
    private static reloadBtnInControlBar = document.getElementById(
        "reload-btn-in-control-bar"
    ) as HTMLButtonElement;
    private static multiplayerBtn = document.getElementById(
        "multiplayer-btn"
    ) as HTMLButtonElement;
    private static naiveMachineBtn = document.getElementById(
        "naive-machine-btn"
    ) as HTMLButtonElement;
    private static trainedMachineBtn = document.getElementById(
        "trained-machine-btn"
    ) as HTMLButtonElement;
    private static reloadBtnInEndingScreen = document.getElementById(
        "reload-btn-in-ending-screen"
    ) as HTMLButtonElement;

    private static mlPlayer: GraphPlayer;
    private static game: Playground;

    public static main(): void {
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
        new TrainingGround(Main.mlPlayer, new GraphPlayer()).trainMachine(
            2400,
            400
        );
    }
    private static startP2PGame = (): void => {
        Main.moveControlBar();
        Main.game = new Playground(new HumanPlayer(), new HumanPlayer());
        Main.game.start(false);
    };
    private static startP2CGame = (shouldTrain: boolean): void => {
        Main.moveControlBar();

        //// Visualize training process (event-driven, very slow)
        // game = new Playground(mlPlayer, new GraphPlayer());
        // game.trainMachine(24, 12);

        Main.game = new Playground(
            shouldTrain ? Main.mlPlayer : new RandomPlayer(),
            new HumanPlayer()
        );
        Main.game.start();
    };
    private static moveControlBar(): void {
        Main.controlBar.classList.add("bottom");
    }
}

Main.main();
