from random import choice
class randomPlayer():
    def __init__(self, initialChoices):
        self.__allChoices = initialChoices
        self.__currentChoices = self.__allChoices.copy()
    def resetChoices(self):
        self.__currentChoices = self.__allChoices.copy()
    def updateChoices(self, pos):
        self.__currentChoices.remove(pos)
    def select(self):
        position = choice(self.__currentChoices)
        self.updateChoices(position)
        return position
