import node
import numpy as np
import random
import player
# class machinePlayer(player.Player):
#     __root = node.Node(None, None, (0,0))
#     __temp = __root
#     __size = 1
#     __allChoices = [(0,0),(0,1),(0,2),(1,0),(1,1),(1,2),(2,0),(2,1),(2,2)]
#     __path = [] #[((x,y),player), ((x,y),player), ...]
#     #def __init__(self):
#     #    self.__root = node.Node(None, None, 0)
#     #    self.__temp = root
#     #    self.__size = 1
#     #    self.__allChoices = [(0,0),(0,1),(0,2),(1,0),(1,1),(1,2),(2,0),(2,1),(2,2)]
#     #    #self.board = np.zeros((3,3))
#     @classmethod
#     def root(cls):
#         return cls.__root
#     @classmethod
#     def isRoot(cls, n):
#         if n.getParent()==None:
#             return True
#         return False
#     @classmethod
#     def isExternal(cls, n):
#         if n.getChildrenList()==[]:
#             return True
#         return False
#     @classmethod
#     def isInternal(cls, n):
#         if n.getChildrenList()==[]:
#             return False
#         return True
#     @classmethod
#     def size(cls):
#         return cls.__size
#     @classmethod
#     def updateValue(cls, n, v):
#         n.setValue((n.getValue()[0]+v[0], n.getValue()[1]+v[1]))
#         return n
#     @classmethod
#     def moveWithOpponent(cls, opponentName, opponentMovePos):
#         if cls.isExternal(cls.__temp):
#             cls.expand()
#         l = cls.__temp.getChildrenList()
#         for each in l:
#             if each.getName() == opponentMovePos:
#                 cls.__temp = each
#                 break
#         cls.updatePath(opponentMovePos,opponentName)
#     @classmethod
#     def clearPath(cls):
#         cls.__path.clear()
#         cls.__allChoices = [(0,0),(0,1),(0,2),(1,0),(1,1),(1,2),(2,0),(2,1),(2,2)]
#     @classmethod
#     def doMinMax(cls):
#         l = cls.__temp.getChildrenList()
#         minMax = []
#         for i in range(len(l)):
#             if cls.isInternal(l[i]):
#                 ll = l[i].getChildrenList()
#                 max = -1
#                 for each in ll:
#                     this = 0
#                     if each.getValue()[1]!=0:   #The denominator is 0, which means this node
#                                                 #has never been visited.
#                         this = each.getValue()[0]/each.getValue()[1]
#                     if this>max:
#                         max = this
#                 minMax.append([max,i])  #minMax: [[max value, 0th node],[max value, 1st node],...]
#             else:   #last move(the 9th move) is in this branch
#                     #so now we have to choose the node having the highest score
#                 if l[i].getValue()[0]==0:   #The numerator is 0
#                     minMax.append([0,i])
#                 else:
#                     #denominator and numerator change place
#                     minMax.append([l[i].getValue()[1]/l[i].getValue()[0],i])
#         minMax.sort()
#         minMaxNp = []
#         for each in minMax:
#             minMaxNp.append(each[0])
#         minMaxNp = np.array(minMaxNp)
#         allTheSame = np.all(minMaxNp == minMaxNp[0])
#         return [minMax, allTheSame]
#     @classmethod
#     def updatePath(cls, pos, playerName):
#         cls.__allChoices.remove(pos)
#         cls.__path.append((pos, playerName))
#     @classmethod
#     def select(cls, playerName):
#         if cls.isExternal(cls.__temp):
#             cls.expand()
#         l = cls.__temp.getChildrenList()
#         minMaxInfo = cls.doMinMax()
#         minMax = minMaxInfo[0]
#         allTheSame = minMaxInfo[1]
#         if allTheSame==True:
#             #rollout policy
#             cls.__temp = l[random.randint(0, len(l)-1)]
#         else:
#             cls.__temp = l[minMax[0][1]]
#         position = cls.__temp.getName()
#         cls.updatePath(position, playerName)
#         return position
#     @classmethod
#     def expand(cls):
#         random.shuffle(cls.__allChoices)
#         for each in cls.__allChoices:
#             cls.__temp.setChild(node.Node(cls.__temp, each, (0, 0)))
#     @classmethod
#     def doBackpropagation(cls, winLossTie): #In this game, last mover is impossible to be a loser.
#         i = -1
#         lastMover = cls.__path[-1][1]
#         if winLossTie == 1:   #last mover won
#             while not cls.isRoot(cls.__temp):
#                 if cls.__path[i][1]==lastMover:
#                     cls.updateValue(cls.__temp, (1,1))
#                 else:
#                     cls.updateValue(cls.__temp, (-1,1))
#                 cls.__temp = cls.__temp.getParent()
#                 i-=1
#         else:   #last mover made it tie
#             while not cls.isRoot(cls.__temp):
#                 cls.updateValue(cls.__temp, (0,1))
#                 cls.__temp = cls.__temp.getParent()
#                 i-=1
#     @classmethod
#     def postOrder(cls, n):
#         print(str(n.getName())+"/"+str(n.getValue())+"/"+str(n.getParent())+"/"+str(n.printChildrenList()))
#         for each in n.getChildrenList():
#             cls.postOrder(each)


class machinePlayer(player.Player):
    __root = node.Node(None, None, (0, 0))
    __temp = __root
    __size = 1
    __allChoices = [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1),
                    (1, 2), (2, 0), (2, 1), (2, 2)]
    __path = []  # [((x,y),player), ((x,y),player), ...]

    def __init__(self):
        self.__root = node.Node(p=None, n=None, v=0)
        self.__temp = self.__root
        self.__size = 1
        self.__allChoices = [(0, 0), (0, 1), (0, 2), (1, 0),
                             (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
        #self.board = np.zeros((3,3))

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

    def moveWithOpponent(self, opponentName, opponentMovePos):
        if self.isExternal(self.__temp):
            self.expand()
        l = self.__temp.getChildrenList()
        for each in l:
            if each.getName() == opponentMovePos:
                self.__temp = each
                break
        self.updatePath(opponentMovePos, opponentName)

    def clearPath(self):
        self.__path.clear()
        self.__allChoices = [(0, 0), (0, 1), (0, 2), (1, 0),
                             (1, 1), (1, 2), (2, 0), (2, 1), (2, 2)]

    def doMinMax(self, childrenList):
        # l = self.__temp.getChildrenList()
        minMax = []
        for i in range(len(childrenList)):
            if self.isInternal(childrenList[i]):
                ll = childrenList[i].getChildrenList()
                max = -1
                for each in ll:
                    this = 0
                    # The denominator is 0, which means this node
                    # has never been visited.
                    if each.getValue()[1] != 0:
                        this = each.getValue()[0]/each.getValue()[1]
                    if this > max:
                        max = this
                # minMax: [[max value, 0th node],[max value, 1st node],...]
                minMax.append([max, i])
            else:  # last move(the 9th move) is in this branch,
                # so now we have to choose the node having the highest score
                if childrenList[i].getValue()[0] == 0:  # The numerator is 0
                    minMax.append([0, i])
                else:
                    # denominator and numerator change place
                    minMax.append([childrenList[i].getValue()[
                                  1]/childrenList[i].getValue()[0], i])
        minMax.sort()
        minMaxNp = np.array(minMax)[:, 0]
        allTheSame = np.all(minMaxNp == minMaxNp[0])
        return [minMax, allTheSame]

    def updatePath(self, pos, playerName):
        self.__allChoices.remove(pos)
        self.__path.append((pos, playerName))

    ################ CORE!!!!##################
    def select(self, playerName):
        if self.isExternal(self.__temp):
            self.expand()
        l = self.__temp.getChildrenList()
        [minMax, allTheSame] = self.doMinMax(l)
        if allTheSame:
            self.__temp = l[random.randint(0, len(l)-1)]    # Rollout Policy
        else:
            self.__temp = l[minMax[0][1]]
        # Because we use position as the name of a node at very first, so...
        position = self.__temp.getName()
        self.updatePath(position, playerName)
        return position

    def expand(self):
        random.shuffle(self.__allChoices)
        for each in self.__allChoices:
            # Use position as the name of the node expanded:
            self.__temp.setChild(node.Node(p=self.__temp, n=each, v=(0, 0)))

    # In this game, last mover is impossible to be a loser.
    def doBackpropagation(self, winLossTie):
        i = -1
        lastMover = self.__path[-1][1]
        if winLossTie == 1:  # last mover won
            while not self.isRoot(self.__temp):
                if self.__path[i][1] == lastMover:
                    self.updateValue(self.__temp, (1, 1))
                else:
                    self.updateValue(self.__temp, (-1, 1))
                self.__temp = self.__temp.getParent()
                i -= 1
        else:  # last mover made it tie
            while not self.isRoot(self.__temp):
                self.updateValue(self.__temp, (0, 1))
                self.__temp = self.__temp.getParent()
                i -= 1

    def postOrder(self, n):
        if n.getChildrenList() != []:
            print(str(n.getName())+"/"+str(n.getValue())+"/" +
                  str(n.getParent()).split(" ")[-1]+"/"+str(n.printChildrenList()))
        for each in n.getChildrenList():
            self.postOrder(each)
