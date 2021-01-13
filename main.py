import machinePlayer as mp
import randomPlayer as rp
# import mp2
import numpy as np
import random
import time
import os


class ticTacToe():
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
        self.player = mp.machinePlayer()
        self.rdPlayer = rp.randomPlayer(
            [(0, 0), (0, 1), (0, 2),
             (1, 0), (1, 1), (1, 2),
             (2, 0), (2, 1), (2, 2)])
        self.rdPlayer2 = rp.randomPlayer(
            [(0, 0), (0, 1), (0, 2),
             (1, 0), (1, 1), (1, 2),
             (2, 0), (2, 1), (2, 2)])

    def validHumanInput(self):
        valid = False
        while not valid:
            print("Please make choice.")
            inP = input().split(",")
            inpNp = np.array(inP)
            for each in inpNp:
                valid = True
                if not each.isdigit():
                    print("Invalid Input!")
                    valid = False
                    break
            try:
                if valid and self.board[int(inpNp[1])][int(inpNp[0])] != " ":
                    print("This position is occupied.")
                    valid = False
            except:
                print("Input Out of Bound!")
                valid = False
        return (int(inpNp[0]), int(inpNp[1]))

    def playerMakeMove(self, playerNumber, role="", opponent=""):
        if playerNumber == "player1":
            playMark = "O"
            playerName = 1
        else:
            playMark = "X"
            playerName = 2

        if role == "":
            pos = self.player.select(playerName=playerName)
        elif role == "random":
            if playerNumber == "player1":
                pos = self.rdPlayer.select()
            else:
                pos = self.rdPlayer2.select()
        elif role == "human":
            pos = self.validHumanInput()

        self.board[pos[1]][pos[0]] = playMark
        if role == "human":
            os.system('cls')
            print(self.board)

        if opponent == "random":
            if playerNumber == "player1":
                self.rdPlayer2.updateChoices(pos)
            else:
                self.rdPlayer.updateChoices(pos)
        elif opponent == "human":
            time.sleep(0.5)
            os.system('cls')
            print(self.board)
        elif opponent == "":
            if role == "":
                pass
            else:
                if playerNumber == "player1":
                    pass
                else:
                    self.player.moveWithOpponent(playerName, pos)

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
                    self.player.backPropagate(1)
                    # self.player2.backPropagate(-1)
                    self.player.clearPath()
                    # self.player2.clearPath()
                elif p1 == "" and p2 != "":
                    self.player.backPropagate(1)
                    self.player.clearPath()
                elif p1 != "" and p2 != "":
                    pass
            else:
                # print("Player2 wins!!!!!!\n\n")
                self.p2Win += 1
                if p1 == "" and p2 == "":
                    self.player.backPropagate(1)
                    # player2.backPropagate(1)
                    self.player.clearPath()
                    # player2.clearPath()
                elif p1 == "" and p2 != "":
                    self.player.backPropagate(1)
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
            if p1 == "" and p2 == "":
                self.player.backPropagate(0)
                # self.player2.backPropagate(0)
                self.player.clearPath()
                # self.player2.clearPath()
            elif p1 == "" and p2 != "":
                self.player.backPropagate(0)
                self.player.clearPath()
            elif p1 != "" and p2 != "":
                pass
            if p1 == "random":
                self.rdPlayer.resetChoices()
            if p2 == "random":
                self.rdPlayer2.resetChoices()
            # print("Tie!\n\n")
            self.tie += 1
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
        if self.mover == 1:
            self.p1Start += 1
        elif self.mover == 2:
            self.p2Start += 1

    def play(self, trainTimes, p1="", p2=""):
        self.newGame(p1=p1, p2=p2)
        while self.gameRunning:
            if self.mover == 1:
                self.playerMakeMove(playerNumber="player1",
                                    role=p1, opponent=p2)
                self.judge(self.mover, p1=p1, p2=p2)
                if self.totalGames == trainTimes:
                    break
                if not self.gameRunning:  # Player 1 wins
                    self.newGame(p1, p2)
                    if self.mover == 1:
                        continue
            self.playerMakeMove(playerNumber="player2", role=p2, opponent=p1)
            self.judge(self.mover, p1=p1, p2=p2)
            if self.totalGames == trainTimes:
                break
            if not self.gameRunning:  # Player 2 wins
                self.newGame(p1, p2)

    def printTrainResult(self):
        print("Game start with P1: %s / P2: %s" %
              (str(self.p1Start), str(self.p2Start)))
        print("P1 winning rate: %.2f%%" % (self.p1Win/self.totalGames*100))
        print("P2 winning rate: %.2f%%" % (self.p2Win/self.totalGames*100))
        print("Tie rate: %.2f%%" % (self.tie/self.totalGames*100))

    def trainStatisticsRefresh(self):
        self.p1Start = 0
        self.p2Start = 0
        self.totalGames = 0
        self.p1Win = 0
        self.p2Win = 0
        self.tie = 0

    def trainMachine(self, trainTimes, batch, train_type=""):
        epoch = trainTimes//batch
        mod = trainTimes % batch
        self.trainStatisticsRefresh()
        for i in range(epoch):
            self.play(trainTimes=batch, p1="", p2=train_type)
            self.printTrainResult()
            self.trainStatisticsRefresh()
        if mod != 0:
            self.play(trainTimes=mod, p1="", p2=train_type)
            self.printTrainResult()
            self.trainStatisticsRefresh()


# 想法：
# 機器的自我訓練，在後期就好像是跟一個聰明的人下棋，所以是讓機器「學會如何不要輸」，然而這樣還不夠，
# 因為總是有思慮不周的地方，所以另外讓機器與「隨機下棋機」訓練，目的是讓機器「學會如何不讓對手贏」。
if __name__ == "__main__":
    game = ticTacToe()
    game.trainMachine(600, batch=200)
    game.trainMachine(60000, batch=10000, train_type="random")
    game.play(1, p1="", p2="human")
    # game.player.postOrderPrintTree(player.root())
