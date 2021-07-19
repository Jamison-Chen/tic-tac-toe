import node
import numpy as np
import random
import player

# 可優化點：目前透過「極小化對手之最高分數」的方法，只設想到兩步以內的未來，
# 所以很難學會某些「後手必須在第一手就下對才不會輸」的棋局


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

    def minimizeOpponentMax(self, childrenList):
        minMax = []  # minMax: [[max score, 0th node],[max score, 1st node],...]
        for i in range(len(childrenList)):
            # child i has been explored before.
            if self.isInternal(childrenList[i]):
                ll = childrenList[i].getChildrenList()
                maxScore = -float('inf')
                this = 0
                for each in ll:
                    # The denominator is not 0, which means child i's child(each) has been visited.
                    if each.getValue()[1] != 0:
                        this = each.getValue()[0]/each.getValue()[1]
                        # 可以想得更遠：若下下步（對方的步數）的所有小孩（到時候自己的選擇）的分數皆 < 0
                        # 當然有可能是一開始猜得不好所以都輸了，但隨著訓練場次的增加，則更有可能會是因為
                        # 下下步是個對方的「必勝步」，此時他的 value 應該無限大，不過不能真的讓他無限大，
                        # 因為就是真的有可能只是一開始猜得不好。
                    # The denominator is 0, which means child i's child(each) has never been visited.
                    else:
                        # This can be changed if you want to explore nodes that hasn't been visited.
                        # this = 0
                        # Strategy 2: tend to explore new paths
                        this = -float('inf')
                    if this > maxScore:
                        maxScore = this
                minMax.append([maxScore, i])
            else:
                # "getValue()[1]!=0" and "isExternal" mean child i is the last step,
                # and if child i is a "winning" step, getValue()[0] must > 0, so...
                if childrenList[i].getValue()[0] > 0:
                    return [[-float('inf'), i], False]
                # or if child i is a "losing" step...
                elif childrenList[i].getValue()[0] < 0:
                    minMax.append([float('inf'), i])
                # or if child i is a "drawing" step (must be the 9th step)...
                elif childrenList[i].getValue()[0] == 0 and childrenList[i].getValue()[1] != 0:
                    minMax.append([0, i])
                # "getValue()[1]==0" and "isExternal" mean child i has never been visited...
                elif childrenList[i].getValue()[1] == 0:
                    # Strategy 1: tend to explore new paths
                    minMax.append([-float('inf'), i])
                    # Strategy 2: tend to follow the previous-winning path
                    # minMax.append([0, i])
        minMax.sort()   # small to large
        minMaxNp = np.array(minMax)[:, 0]
        allTheSame = np.all(minMaxNp == minMaxNp[0])
        return [minMax[0], allTheSame]

    def select(self, playerName):
        if self.isExternal(self.__temp):
            self.expand()
            child_list = self.__temp.getChildrenList()
            self.__temp = child_list[random.randint(
                0, len(child_list)-1)]    # Rollout Policy
        else:
            child_list = self.__temp.getChildrenList()
            [minMax, allTheSame] = self.minimizeOpponentMax(child_list)
            if allTheSame:
                self.__temp = child_list[random.randint(
                    0, len(child_list)-1)]    # Rollout Policy
            else:
                self.__temp = child_list[minMax[1]]
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
