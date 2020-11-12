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
# player = mp2.machinePlayer()
# player.selfTraining(30000)
rdPlayer = rp.randomPlayer(
    [(0, 0), (0, 1), (0, 2),
     (1, 0), (1, 1), (1, 2),
     (2, 0), (2, 1), (2, 2)])


def player1MakeMove(human=""):
    global player, rdPlayer, totalGames, gameRunning, board
    if human == "":
        player1_pos = player.select(1)
        # player.postOrder(player.root())
        board[player1_pos[1]][player1_pos[0]] = "O"
    elif human == "human":
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
        board[int(inpNp[1])][int(inpNp[0])] = "O"
        player.moveWithOpponent(1, (int(inpNp[0]), int(inpNp[1])))
        print(board)
        print()
    elif human == "random":
        player1_pos = rdPlayer.select()
        player.moveWithOpponent(1, player1_pos)
        board[player1_pos[1]][player1_pos[0]] = "O"
    # print(board)
    # print()


def player2MakeMove(human=""):
    global player, rdPlayer, totalGames, gameRunning, board
    if human == "human":
        time.sleep(1)
    player2_pos = player.select(2)
    if human == "random":
        rdPlayer.updateChoices(player2_pos)
    board[player2_pos[1]][player2_pos[0]] = "X"
    if human == "human":
        print(board)
        print()
    # print(board)
    # print()


def judge(lastMover, human=""):
    global player, rdPlayer, p1Win, p2Win, tie, totalGames, gameRunning, board, mover
    winner = None
    hasWinner = False
    for each in board:
        if np.all(each == each[0]) and each[0] != " ":
            winner = each[0]
            hasWinner = True
            break
    if not hasWinner:
        for each in board.T:
            if np.all(each == each[0]) and each[0] != " ":
                winner = each[0]
                hasWinner = True
                break
    if not hasWinner:
        diagnal1 = np.array([board[0][0], board[1][1], board[2][2]])
        diagnal2 = np.array([board[0][2], board[1][1], board[2][0]])
        if np.all(diagnal1 == diagnal1[0]) and diagnal1[0] != " ":
            winner = diagnal1[0]
            hasWinner = True
        elif np.all(diagnal2 == diagnal2[0]) and diagnal2[0] != " ":
            winner = diagnal2[0]
            hasWinner = True
    if hasWinner:
        player.doBackpropagation(1)
        if winner == "O":
            #print("Player1 wins!!!!!!\n\n")
            p1Win += 1
            if human == "human":
                player.doBackpropagation(-1)
            elif human == "":
                player.doBackpropagation(1)
            if human == "random":
                rdPlayer.resetChoices()
        else:
            #print("Player2 wins!!!!!!\n\n")
            p2Win += 1
            if human == "random":
                rdPlayer.resetChoices()
        #print("Path: " + str(player._machinePlayer__path))
        player.clearPath()
        gameRunning = False
        totalGames += 1
    elif not np.any(board == " "):
        player.doBackpropagation(0)
        #print("Path: " + str(player._machinePlayer__path))
        player.clearPath()
        if human == "random":
            rdPlayer.resetChoices()
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


def play(trainTimes, p1=""):
    global gameRunning, mover, totalGames
    newGame()
    while gameRunning:
        if mover == 1:
            player1MakeMove(p1)
            judge(mover, p1)
            if totalGames == trainTimes:
                break
            if not gameRunning:
                newGame()
                if mover == 1:
                    continue
        player2MakeMove(p1)
        judge(mover, p1)
        if totalGames == trainTimes:
            break
        if not gameRunning:
            newGame()


def train(trainTimes):
    play(trainTimes)


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


# train(10000)
# printTrainResult()
# trainStatisticsRefresh()
# train(10000)
# printTrainResult()
# trainStatisticsRefresh()
# train(10000)
# printTrainResult()
# trainStatisticsRefresh()
play(100, "random")
printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
#play(10000, "random")
# printTrainResult()
# trainStatisticsRefresh()
# train(10000)
# printTrainResult()
play(5, "human")
# printTrainResult()
# player.postOrder(player.root())
