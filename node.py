class Node:
    def __init__(self, p, n, v):
        self.__parent = p
        self.__name = n
        self.__value = v  # (total value, time visited)
        self.__childrenList = []
        self.__endPoint = False

    def getParent(self):
        return self.__parent

    def getName(self):
        return self.__name

    def getValue(self):
        return self.__value

    def getChildrenList(self):
        return self.__childrenList

    def getEndPoint(self):
        return self.__endPoint

    def printChildrenList(self):
        s = ""
        for each in self.__childrenList:
            s += str(each.getName())
            s += ", "
        return s

    def setParent(self, p):
        self.__parent = p

    def setName(self, n):
        self.__name = n

    def setValue(self, v):
        self.__value = v

    def setChild(self, c):
        self.__childrenList.append(c)

    def setEndPoint(self, tf):
        self.__endPoint = tf
