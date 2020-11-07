import node
import numpy as np
import random
import simulationField as sf
import randomPlayer
import math
class machinePlayer():
    def __init__(self):
        self.__root = node.Node(None, None, (0,0))
        self.__temp = self.__root
        self.__size = 1
        self.__allChoices = [(0,0),(0,1),(0,2),(1,0),(1,1),(1,2),(2,0),(2,1),(2,2)]
        self.__path = [] #[((x,y),player), ((x,y),player), ...]
    def root(self):
        return self.__root
    def isRoot(self, n):
        if n.getParent()==None:
            return True
        return False
    def isExternal(self, n):
        if n.getChildrenList()==[]:
            return True
        return False
    def isInternal(self, n):
        if n.getChildrenList()==[]:
            return False
        return True
    def size(self):
        return self.__size
    def updateValue(self, n, v):
        n.setValue((n.getValue()[0]+v[0], n.getValue()[1]+v[1]))
        return n
    def clearPath(self):
        self.__path.clear()
        self.__allChoices = [(0,0),(0,1),(0,2),(1,0),(1,1),(1,2),(2,0),(2,1),(2,2)]
    def updatePath(self, pos, playerName):
        self.__allChoices.remove(pos)
        self.__path.append((pos, playerName))
    def UCTCalculate(self, node, c):
        if node.getValue()[1]==0:
            return math.inf
        else:
            result = (node.getValue()[0]/node.getValue()[1])+\
                c*np.sqrt(np.log(node.getParent().getValue()[1])/node.getValue()[1])
            return result
    def mcts(self):
        while self.isInternal(self.__temp):
            playerName = 1
            if len(self.__path)!=0:
                playerName = -1*self.__path[-1][-1]+3
            l = self.__temp.getChildrenList()
            max = -1
            maxIndex = -1
            for i in range(len(l)):
                if l[i].getEndPoint():
                    continue
                if self.UCTCalculate(l[i], c = 1.5)>max:
                    max = self.UCTCalculate(l[i], c = 1.5)
                    maxIndex = i
            self.__temp = l[maxIndex]
            position = self.__temp.getName()
            self.updatePath(position, playerName)
            print("one select\t"+str((position, playerName)))
        if self.isExternal(self.__temp):
            if self.__temp.getValue()[1]==0:#This node has never been visited.
                if len(self.__allChoices)!=0:
                    print("one simulation")
                    self.simulation()
                else:
                    print("reach end")
                    self.simulation()
            else:
                if len(self.__allChoices)!=0:
                    print("one expand")
                    self.expand()
                    self.mcts()
                elif not self.__temp.getEndPoint():
                    print("connoat expand")
                    self.simulation()
                else:
                    while not self.isRoot(self.__temp):
                        self.updateValue(self.__temp, (0, 1))
                        self.__temp = self.__temp.getParent()
                    self.updateValue(self.__temp, (0, 1))  #for root node
                    self.clearPath()
    def expand(self):
        #random.shuffle(self.__allChoices)
        for each in self.__allChoices:
            self.__temp.setChild(node.Node(self.__temp, each, (0, 0)))
    def simulation(self):
        r1 = randomPlayer.randomPlayer(self.__allChoices)
        r2 = randomPlayer.randomPlayer(self.__allChoices)
        test = sf.TrainField(r1, r2, self.__path)
        test.train(100, self.__temp) #Do simulation for 100 times
        #Inner Backpropagation
        if test.p1Win!=0:
            winTime = test.p1Win
        elif test.p2Win!=0:
            winTime = test.p2Win
        else:
            winTime = 0
        print(winTime)
        while not self.isRoot(self.__temp):
            self.updateValue(self.__temp, (winTime, 1))
            self.__temp = self.__temp.getParent()
        self.updateValue(self.__temp, (winTime, 1))  #for root node
        self.clearPath()
    def selfTraining(self, trainingDepth):
        for i in range(trainingDepth):
            print(i+1)
            self.mcts()
    def postOrder(self, n):
        print(str(n.getName())+"/"+str(n.getValue())+"/"+\
            str(n.getParent())[-19:-1]+"/"+str(n.printChildrenList())+\
            str(n.getEndPoint()))
        for each in n.getChildrenList():
            self.postOrder(each)
    def select(self, playerName):
        if self.isExternal(self.__temp):
            self.expand()
        l = self.__temp.getChildrenList()
        max = -1
        maxIndex = -1
        for i in range(len(l)):
            if self.UCTCalculate(l[i], c = 0)>max:
                max = self.UCTCalculate(l[i], c = 0)
                maxIndex = i
        self.__temp = l[maxIndex]
        position = self.__temp.getName()
        self.updatePath(position, playerName)
        return position
    def moveWithOpponent(self, opponentName, opponentMovePos):
        if self.isExternal(self.__temp):
            self.expand()
        l = self.__temp.getChildrenList()
        for each in l:
            if each.getName() == opponentMovePos:
                self.__temp = each
                break
        self.updatePath(opponentMovePos,opponentName)
    def doMinMax(self):
        l = self.__temp.getChildrenList()
        minMax = []
        for i in range(len(l)):
            if self.isInternal(l[i]):
                ll = l[i].getChildrenList()
                max = -1
                for each in ll:
                    if self.UCTCalculate(each, c = 1.5)>max:
                        max = self.UCTCalculate(each, c = 1.5)
                minMax.append([max,i])  #minMax: [[max value, 0th node],[max value, 1st node],...]
            else:   #last move(the 9th move) is in this branch
                    #so now we have to choose the node having the highest score
                minMax.append([1/self.UCTCalculate(l[i], c = 1.5),i])
        minMax.sort()
        minMaxNp = []
        for each in minMax:
            minMaxNp.append(each[0])
        minMaxNp = np.array(minMaxNp)
        allTheSame = np.all(minMaxNp == minMaxNp[0])
        return [minMax, allTheSame]
#a = machinePlayer()
#a.selfTraining(25000)
#a.postOrder(a._machinePlayer__root)
#for i in range(9):
#    print(a.select(1))