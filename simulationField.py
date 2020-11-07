import numpy as np
import random
class TrainField():
    def __init__(self, player1Using, player2Using, path):
        self.board = np.array([[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]])
        self.path = path
        self.gameRunning = True
        self.mover = 0
        self.p1Start = 0
        self.p2Start = 0
        self.totalGames = 0
        self.p1Win = 0
        self.p2Win = 0
        self.tie = 0
        self.rdPlayer1 = player1Using
        self.rdPlayer2 = player2Using
    def player1MakeMove(self):
        player1_pos = self.rdPlayer1.select()
        self.rdPlayer2.updateChoices(player1_pos)
        self.board[player1_pos[1]][player1_pos[0]] = "O"
    def player2MakeMove(self):
        player2_pos = self.rdPlayer2.select()
        self.rdPlayer1.updateChoices(player2_pos)
        self.board[player2_pos[1]][player2_pos[0]] = "X"
    def judge(self, lastMover):
        winner = None
        hasWinner = False
        for each in self.board:
            if np.all(each == each[0]) and each[0]!=" ":
                winner = each[0]
                hasWinner = True
                break
        if not hasWinner:
            for each in self.board.T:
                if np.all(each == each[0]) and each[0]!=" ":
                    winner = each[0]
                    hasWinner = True
                    break
        if not hasWinner:
            diagnal1 = np.array([self.board[0][0], self.board[1][1], self.board[2][2]])
            diagnal2 = np.array([self.board[0][2], self.board[1][1], self.board[2][0]])
            if np.all(diagnal1 == diagnal1[0]) and diagnal1[0]!=" ":
                winner = diagnal1[0]
                hasWinner = True
            elif np.all(diagnal2 == diagnal2[0]) and diagnal2[0]!=" ":
                winner = diagnal2[0]
                hasWinner = True
        if hasWinner:
            if winner == "O":
                self.p1Win+=1
            else:
                self.p2Win+=1
            self.rdPlayer1.resetChoices()
            self.rdPlayer2.resetChoices()
            self.gameRunning = False
            self.totalGames+=1
        elif not np.any(self.board == " "):
            self.rdPlayer1.resetChoices()
            self.rdPlayer2.resetChoices()
            self.tie+=1
            self.gameRunning = False
            self.totalGames+=1
        self.mover = -1*lastMover+3  #input 2, output1; input 1, output 2
        return winner
    def newGame(self):
        self.gameRunning = True
        self.board = np.array([[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]])
        if len(self.path)==0:
            self.mover = random.randint(1,2)
        else:
            self.mover = -1*self.path[-1][-1]+3  #input 2, output1; input 1, output 2
    def setBoard(self):
        for each in self.path:
            if each[1]==1:
                self.board[each[0][1]][each[0][0]] = "O"
            else:
                self.board[each[0][1]][each[0][0]] = "X"
        #print(self.board)
    def train(self, trainTimes, currentNode):
        self.newGame()
        self.setBoard()
        #test if having result at begining
        winner = self.judge(-1*self.mover+3)
        if not self.gameRunning:
            if winner=="O":
                self.p1Win = trainTimes
            elif winner=="X":
                self.p2Win = trainTimes
            else:
                self.p1Win = 0
                self.p2Win = 0
            currentNode.setEndPoint(True)
        while self.gameRunning:
            if self.mover==1:
                self.player1MakeMove()
                self.judge(self.mover)
                if self.totalGames==trainTimes:
                    break
                if not self.gameRunning:
                    self.newGame()
                    self.setBoard()
                    if self.mover==1:
                        continue
            self.player2MakeMove()
            self.judge(self.mover)
            if self.totalGames==trainTimes:
                break
            if not self.gameRunning:
                self.newGame()
                self.setBoard()
    def printTrainResult(self):
        print("Game start with P1: "+str(self.p1Start)+" / P2: "+str(self.p2Start))
        print("P1 winning rate: " + str(self.p1Win/self.totalGames*100) + "%")
        print("P2 winning rate: " + str(self.p2Win/self.totalGames*100) + "%")
        print("Tie rate: " + str(self.tie/self.totalGames*100) + "%")
    def trainStatisticsRefresh(self):
        self.p1Start = 0
        self.p2Start = 0
        self.totalGames = 0
        self.p1Win = 0
        self.p2Win = 0
        self.tie = 0


