import node
import numpy as np
import random
import player


class machinePlayer(player.Player):

    def __init__(self):
        self.__root = node.Node(p=None, n="ROOT", v=[None, float('inf')])
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
            print("Faild to update.")
            quit()

    def clearPath(self):
        self.__path.clear()
        self.__allChoices = [(0, 0), (0, 1), (0, 2), (1, 0),
                             (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]

    def select(self, playerName):
        if self.isExternal(self.__temp):
            self.expand()
        child_list = self.__temp.getChildrenList()
        for each in child_list:
            if each.getName() == self.__temp.getValue()[0]:
                self.__temp = each
                # Because we use position as the name of a node at very first, so...
                position = self.__temp.getName()
                self.updatePath(position, playerName)
                return position
        print("Failed to select.")
        quit()

    def expand(self):
        random.shuffle(self.__allChoices)
        for each in self.__allChoices:
            # Use position as the name of the node expanded:
            self.__temp.appendChild(
                node.Node(p=self.__temp, n=each, v=[None, float('inf')]))
        self.backPropagate(state=2)

    def backPropagate(self, state):
        # state: 2 means that this' for expanding,
        #        1 means that the first mover won,
        #        -1 means that the first mover lost,
        #        0 means that this game went tie.
        if state == 2:
            probe = self.__temp.getChildrenList()[0]
        else:
            probe = self.__temp

        depth = 0
        while not self.isRoot(probe):
            probe = probe.getParent()
            probe.setValue(None)
            depth += 1
        if state == 1:
            self.__temp.setValue([None, 100/depth])
        elif state == -1:
            self.__temp.setValue([None, -100/depth])
        elif state == 0:
            self.__temp.setValue([None, 0])

        self.minimax(probe, True)
        if state != 2:
            self.__temp = probe

    def hasNoneValue(self, aListOfNodes):
        hasNone = False
        items = []
        for i in range(len(aListOfNodes)):
            if aListOfNodes[i].getValue() == None:
                hasNone = True
                items.append(i)
        return [hasNone, items]

    def minimax(self, aTree, isMaximizer):
        needRecursive = self.hasNoneValue(aTree.getChildrenList())
        if needRecursive[0]:
            for i in needRecursive[1]:
                self.minimax(aTree.getChildrenList()[i], not isMaximizer)
        children = aTree.getChildrenList()
        cInfo = [[each.getName(), each.getValue()[1]] for each in children]
        v = sorted(cInfo, key=lambda x: x[1], reverse=isMaximizer)[0]
        aTree.setValue(v)

    def postOrderPrintTree(self, n=""):
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
            self.postOrderPrintTree(each)
