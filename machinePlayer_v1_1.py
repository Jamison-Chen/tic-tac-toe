import node
import numpy as np
import random
import player
import math


class machinePlayer(player.Player):

    def __init__(self):
        self.__root = node.Node(p=None, n=None, v=(0, 0))
        self.__temp = self.__root
        self.__size = 1
        self.__allChoices = [(0, 0), (0, 1), (0, 2), (1, 0),
                             (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
        ####### board ########
        #(0, 0) (1, 0) (2, 0)#
        #(0, 1) (1, 1) (2, 1)#
        #(0, 2) (1, 2) (2, 2)#
        ######################
        self.__path = []  # [((x,y),player), ((x,y),player), ...]

    def root(self):
        return self.__root

    def isRoot(self, n):
        if n.getParent() == None:
            return True
        return False

    def isExternal(self, n):
        if n.getChildrenList() == []:
            return True
        return False

    def isInternal(self, n):
        if n.getChildrenList() == []:
            return False
        return True

    def size(self):
        return self.__size

    def updateValue(self, n, v):
        n.setValue((n.getValue()[0]+v[0], n.getValue()[1]+v[1]))
        return n

    def updatePath(self, pos, playerName):
        self.__allChoices.remove(pos)
        self.__path.append((pos, playerName))

    def moveWithOpponent(self, opponentName, opponentMovePos):
        if self.isExternal(self.__temp):
            self.expand()
        children_list = self.__temp.getChildrenList()
        updated = False
        for each in children_list:
            if each.getName() == opponentMovePos:
                self.__temp = each
                self.updatePath(pos=opponentMovePos, playerName=opponentName)
                updated = True
                break
        if not updated:
            print("Faild to update!!!")
            quit()

    def clearPath(self):
        self.__path.clear()
        self.__allChoices = [(0, 0), (0, 1), (0, 2), (1, 0),
                             (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]

    def maximize(self, childrenList, N):
        C = 0.9
        maxScore = float('-inf')
        maxChild = None
        for each in childrenList:
            try:
                score = (each.getValue()[0]/each.getValue()[1]) + \
                    C*(math.log(N)/each.getValue()[1])**(0.5)
            except:
                score = float('inf')
            if score >= maxScore:
                maxScore = score
                maxChild = each
        return maxChild

    def select(self, playerName):
        if self.isExternal(self.__temp):
            self.expand()
            child_list = self.__temp.getChildrenList()
            self.__temp = child_list[random.randint(
                0, len(child_list)-1)]    # Rollout Policy
            # self.expand()
            # child_list = self.__temp.getChildrenList()
            # for each in child_list:
            #     self.simulate(each)
            # maxWinRate = 0
            # bestChoice = None
            # for each in child_list:
            #     thisWinRate = each.getValue()[0]/each.getValue()[1]
            #     if thisWinRate >= maxWinRate:
            #         maxWinRate = thisWinRate
            #         bestChoice = each
            # self.__temp = bestChoice
        else:
            child_list = self.__temp.getChildrenList()
            self.__temp = self.maximize(child_list, self.__temp.getValue()[1])
        # Because we use position as the name of a node at very first, so...
        position = self.__temp.getName()
        self.updatePath(position, playerName)
        return position

    def expand(self):
        random.shuffle(self.__allChoices)
        for each in self.__allChoices:
            # Use position as the name of the node expanded:
            self.__temp.appendChild(node.Node(p=self.__temp, n=each, v=(0, 0)))

    # Hint: In this game, the last mover is impossible to be a loser.
    def backPropagate(self, winLossTie):
        i = -1
        lastMover = self.__path[i][1]
        if winLossTie == 1:  # last mover won
            while not self.isRoot(self.__temp):
                if self.__path[i][1] == lastMover:
                    self.updateValue(n=self.__temp, v=(1, 1))
                else:
                    self.updateValue(n=self.__temp, v=(-1, 1))
                self.__temp = self.__temp.getParent()
                i -= 1
        else:  # last mover made it tie
            while not self.isRoot(self.__temp):
                self.updateValue(n=self.__temp, v=(0, 1))
                self.__temp = self.__temp.getParent()
                i -= 1

    def postOrderPrintTree2(self, n=""):
        if n == "":
            n = self.__root
        if n.getChildrenList() != []:
            if self.isRoot(n):
                print("Name\tValue\tParent\t#\tChildren\n" +
                      "_________________________________________________")
                print(str(n.getName())+"\t" +
                      str(n.getValue())+"\t" +
                      "None\t" +
                      str(len(n.getChildrenList()))+"\t" +
                      n.printChildrenList().strip(", "))
            else:
                print(str(n.getName())+"\t" +
                      str(n.getValue())+"\t" +
                      str(n.getParent().getName())+"\t" +
                      str(len(n.getChildrenList()))+"\t" +
                      n.printChildrenList().strip(", "))
        else:
            if self.isRoot(n):
                print("Name\tValue\tParent\tChild Number\tChildren\n" +
                      "_________________________________________________")
                print(str(n.getName())+"\t" +
                      str(n.getValue())+"\t" +
                      "None\t" +
                      "No")
            else:
                print(str(n.getName())+"\t" +
                      str(n.getValue())+"\t" +
                      str(n.getParent().getName())+"\t" +
                      "No")
        for each in n.getChildrenList():
            self.postOrderPrintTree2(each)
