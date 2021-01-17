import machinePlayer_v2 as mp2
import randomPlayer as rp
import main
import numpy as np
import random
import time
import os


class ticTacToe2(main.ticTacToe):
    def __init__(self):
        self.board = np.full((3, 3), " ")
        self.gameRunning = True
        self.mover = 0
        self.p1Start = 0
        self.p2Start = 0
        self.totalGames = 0
        self.p1Win = 0
        self.p2Win = 0
        self.tie = 0
        self.player = mp2.machinePlayer()
        self.rdPlayer = rp.randomPlayer(
            [(0, 0), (0, 1), (0, 2),
             (1, 0), (1, 1), (1, 2),
             (2, 0), (2, 1), (2, 2)])
        self.rdPlayer2 = rp.randomPlayer(
            [(0, 0), (0, 1), (0, 2),
             (1, 0), (1, 1), (1, 2),
             (2, 0), (2, 1), (2, 2)])

    def judge(self, lastMover, p1="", p2=""):
        winner = None
        hasWinner = False
        for each in self.board:  # Check each row
            if np.all(each == each[0]) and each[0] != " ":
                winner = each[0]
                hasWinner = True
                break
        if not hasWinner:  # Check each column
            for each in self.board.T:
                if np.all(each == each[0]) and each[0] != " ":
                    winner = each[0]
                    hasWinner = True
                    break
        if not hasWinner:   # Check diagnals
            diagnal1 = np.array(
                [self.board[0][0], self.board[1][1], self.board[2][2]])
            diagnal2 = np.array(
                [self.board[0][2], self.board[1][1], self.board[2][0]])
            if np.all(diagnal1 == diagnal1[0]) and diagnal1[0] != " ":
                winner = diagnal1[0]
                hasWinner = True
            elif np.all(diagnal2 == diagnal2[0]) and diagnal2[0] != " ":
                winner = diagnal2[0]
                hasWinner = True
        if hasWinner:
            if winner == "O":
                # print("Player1 wins!!!!!!\n\n")
                self.p1Win += 1
                if p1 == "" and p2 == "":
                    self.player.backPropagate(state=1)
                    self.player.clearPath()
                elif p1 == "" and p2 != "":
                    self.player.backPropagate(state=1)
                    self.player.clearPath()
                elif p1 != "" and p2 != "":
                    pass
            else:
                # print("Player2 wins!!!!!!\n\n")
                self.p2Win += 1
                if p1 == "" and p2 == "":
                    self.player.backPropagate(state=-1)
                    self.player.clearPath()
                elif p1 == "" and p2 != "":
                    self.player.backPropagate(state=-1)
                    self.player.clearPath()
                elif p1 != "" and p2 != "":
                    pass
            if p1 == "random":
                self.rdPlayer.resetChoices()
            if p2 == "random":
                self.rdPlayer2.resetChoices()
            self.gameRunning = False
            self.totalGames += 1
        elif not np.any(self.board == " "):  # Tie
            self.tie += 1
            if p1 == "" and p2 == "":
                self.player.backPropagate(state=0)
                self.player.clearPath()
            elif p1 == "" and p2 != "":
                self.player.backPropagate(state=0)
                self.player.clearPath()
            elif p1 != "" and p2 != "":
                pass
            if p1 == "random":
                self.rdPlayer.resetChoices()
            if p2 == "random":
                self.rdPlayer2.resetChoices()
            # print("Tie!\n\n")
            self.gameRunning = False
            self.totalGames += 1
        self.mover = -1 * lastMover + 3  # input 2, output1; input 1, output 2

    def newGame(self, p1, p2):
        self.gameRunning = True
        self.board = np.full((3, 3), " ")
        if p1 == "human" or p2 == "human":
            os.system('cls')
            print(self.board)
            self.mover = random.randint(1, 2)
        else:
            self.mover = 1
        if self.mover == 1:
            self.p1Start += 1
        elif self.mover == 2:
            self.p2Start += 1


if __name__ == "__main__":
    os.system('cls')
    game = ticTacToe2()
    game.trainMachine(100000, batch=10000, train_type="random")
    while (game.p2Win/game.totalGames*100) > 0:
        game.trainMachine(5000, batch=5000, train_type="random")
    game.play(10, p1="", p2="human")
    # game.player.postOrderPrintTree(game.player.root())
