import machinePlayer as mp
import randomPlayer as rp
# import mp2
import numpy as np
import random
import time
board = np.array([[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]])
gameRunning = True
mover = 0
p1Start = 0
p2Start = 0
totalGames = 0
p1Win = 0
p2Win = 0
tie = 0
player = mp.machinePlayer()
rdPlayer = rp.randomPlayer(
    [(0, 0), (0, 1), (0, 2),
     (1, 0), (1, 1), (1, 2),
     (2, 0), (2, 1), (2, 2)])
rdPlayer2 = rp.randomPlayer(
    [(0, 0), (0, 1), (0, 2),
     (1, 0), (1, 1), (1, 2),
     (2, 0), (2, 1), (2, 2)])


def player1MakeMove(role="", opponent=""):
    global player, rdPlayer, rdPlayer2, totalGames, gameRunning, board
    if role == "":
        pos = player.select(playerName=1)
        board[pos[1]][pos[0]] = "O"
        if opponent == "random":
            rdPlayer2.updateChoices(pos)
        # elif opponent == "":
        #     player2.moveWithOpponent(1, pos)
        elif opponent == "human":
            print(board)
            print()
    elif role == "human":
        valid = False
        while not valid:
            print("Please make choice.")
            inP = input().split(",")
            inpNp = np.array(inP)
            for each in inpNp:
                valid = True
                if not each.isdigit():
                    print("Invalid Operation!")
                    valid = False
                    break
            if valid and board[int(inpNp[1])][int(inpNp[0])] != " ":
                print("This position is occupied.")
                valid = False
        pos = (int(inpNp[0]), int(inpNp[1]))
        board[pos[1]][pos[0]] = "O"
        print(board)
        print()
        # if opponent == "":
        #     player2.moveWithOpponent(1, pos)
        if opponent == "random":
            rdPlayer2.updateChoices(pos)
        # elif opponent == "human":
            # Nothing to do.
    elif role == "random":
        pos = rdPlayer.select()
        board[pos[1]][pos[0]] = "O"
        # if opponent == "":
        #     player2.moveWithOpponent(1, pos)
        if opponent == "human":
            print(board)
            print()
        elif opponent == "random":
            rdPlayer2.updateChoices(pos)


def player2MakeMove(role="", opponent=""):
    global player, rdPlayer, rdPlayer2, totalGames, gameRunning, board
    if role == "random":
        pos = rdPlayer2.select()
        board[pos[1]][pos[0]] = "X"
        if opponent == "":
            player.moveWithOpponent(2, pos)
        elif opponent == "human":
            print(board)
            print()
        elif opponent == "random":
            rdPlayer.updateChoices(pos)
    elif role == "human":
        valid = False
        while not valid:
            print("Please make choice.")
            inP = input().split(",")
            inpNp = np.array(inP)
            for each in inpNp:
                valid = True
                if not each.isdigit():
                    print("Invalid Operation!")
                    valid = False
                    break
            if valid and board[int(inpNp[1])][int(inpNp[0])] != " ":
                print("This position is occupied.")
                valid = False
        pos = (int(inpNp[0]), int(inpNp[1]))
        board[pos[1]][pos[0]] = "X"
        print(board)
        print()
        if opponent == "":
            player.moveWithOpponent(2, pos)
        elif opponent == "random":
            rdPlayer.updateChoices(pos)
        # elif opponent == "human":
            # Nothing to do.
    elif role == "":
        pos = player.select(playerName=2)
        board[pos[1]][pos[0]] = "X"
        # if opponent == "":
        #     player.moveWithOpponent(2, pos)
        if opponent == "human":
            print(board)
            print()
        elif opponent == "random":
            rdPlayer.updateChoices(pos)


def judge(lastMover, p1="", p2=""):
    global player, rdPlayer, rdPlayer2, p1Win, p2Win, tie, totalGames, gameRunning, board, mover
    winner = None
    hasWinner = False
    for each in board:  # Check each row
        if np.all(each == each[0]) and each[0] != " ":
            winner = each[0]
            hasWinner = True
            break
    if not hasWinner:  # Check each column
        for each in board.T:
            if np.all(each == each[0]) and each[0] != " ":
                winner = each[0]
                hasWinner = True
                break
    if not hasWinner:   # Check diagnals
        diagnal1 = np.array([board[0][0], board[1][1], board[2][2]])
        diagnal2 = np.array([board[0][2], board[1][1], board[2][0]])
        if np.all(diagnal1 == diagnal1[0]) and diagnal1[0] != " ":
            winner = diagnal1[0]
            hasWinner = True
        elif np.all(diagnal2 == diagnal2[0]) and diagnal2[0] != " ":
            winner = diagnal2[0]
            hasWinner = True
    if hasWinner:
        if winner == "O":
            # print("Player1 wins!!!!!!\n\n")
            p1Win += 1
            # if p1 != "" and p2 == "":
            #     player2.doBackpropagation(-1)
            #     player2.clearPath()
            if p1 == "" and p2 == "":
                player.doBackpropagation(1)
                # player2.doBackpropagation(-1)
                player.clearPath()
                # player2.clearPath()
            elif p1 == "" and p2 != "":
                player.doBackpropagation(1)
                player.clearPath()
            # elif p1!="" and p2!="":
                # Nothing to do.
        else:
            # print("Player2 wins!!!!!!\n\n")
            p2Win += 1
            # if p1 != "" and p2 == "":
            #     player2.doBackpropagation(1)
            #     player2.clearPath()
            if p1 == "" and p2 == "":
                player.doBackpropagation(1)
                # player2.doBackpropagation(1)
                player.clearPath()
                # player2.clearPath()
            elif p1 == "" and p2 != "":
                player.doBackpropagation(1)
                player.clearPath()
            # elif p1!="" and p2!="":
                # Nothing to do.
        if p1 == "random":
            rdPlayer.resetChoices()
        if p2 == "random":
            rdPlayer2.resetChoices()
        gameRunning = False
        totalGames += 1
    elif not np.any(board == " "):  # Tie
        # if p1 != "" and p2 == "":
        #     player2.doBackpropagation(0)
        #     player2.clearPath()
        if p1 == "" and p2 == "":
            player.doBackpropagation(0)
            # player2.doBackpropagation(0)
            player.clearPath()
            # player2.clearPath()
        elif p1 == "" and p2 != "":
            player.doBackpropagation(0)
            player.clearPath()
        # elif p1!="" and p2!="":
            # Nothing to do.
        if p1 == "random":
            rdPlayer.resetChoices()
        if p2 == "random":
            rdPlayer2.resetChoices()
        # print("Tie!\n\n")
        tie += 1
        gameRunning = False
        totalGames += 1
    mover = -1*lastMover+3  # input 2, output1; input 1, output 2


def newGame():
    global gameRunning, mover, p1Start, p2Start, board
    gameRunning = True
    board = np.array([[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]])
    # print(board)
    # print()
    mover = random.randint(1, 2)
    if mover == 1:
        p1Start += 1
    elif mover == 2:
        p2Start += 1


def play(trainTimes, p1="", p2=""):
    global gameRunning, mover, totalGames
    newGame()
    while gameRunning:
        if mover == 1:
            player1MakeMove(role=p1, opponent=p2)
            judge(mover, p1=p1, p2=p2)
            if totalGames == trainTimes:
                break
            if not gameRunning:  # Player 1 wins
                newGame()
                if mover == 1:
                    continue
        player2MakeMove(role=p2, opponent=p1)
        judge(mover, p1=p1, p2=p2)
        if totalGames == trainTimes:
            break
        if not gameRunning:  # Player 2 wins
            newGame()


def random_train(trainTimes):
    play(trainTimes=trainTimes, p1="", p2="random")


def machine_train(trainTimes):
    play(trainTimes=trainTimes, p1="", p2="")


def printTrainResult():
    global p1Win, p2Win, tie, totalGames, p1Start, p2Start
    print("Game start with P1: "+str(p1Start)+" / P2: "+str(p2Start))
    print("P1 winning rate: " + str(p1Win/totalGames*100) + "%")
    print("P2 winning rate: " + str(p2Win/totalGames*100) + "%")
    print("Tie rate: " + str(tie/totalGames*100) + "%")


def trainStatisticsRefresh():
    global p1Win, p2Win, tie, totalGames, p1Start, p2Start
    p1Start = 0
    p2Start = 0
    totalGames = 0
    p1Win = 0
    p2Win = 0
    tie = 0


# 想法：機器的自我訓練，在後期就好像是跟一個聰明的人下棋，所以是讓機器「學會如何不要輸」，
# 然而這樣還不夠，因為總是有思慮不周的地方，所以另外讓機器與隨機下棋機訓練，目的是讓機器「學會如何不讓對手贏」。
machine_train(10000)
printTrainResult()

trainStatisticsRefresh()
machine_train(5000)
printTrainResult()

trainStatisticsRefresh()
machine_train(5000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()

trainStatisticsRefresh()
random_train(10000)
printTrainResult()
play(3, p1="", p2="human")
# player.postOrder(player.root())
