import abc
class Player(metaclass = abc.ABCMeta):
    @abc.abstractmethod
    def root(cls):
        return NotImplemented
    @abc.abstractmethod
    def isRoot(cls):
        return NotImplemented
    @abc.abstractmethod
    def isExternal(cls):
        return NotImplemented
    @abc.abstractmethod
    def isInternal(cls):
        return NotImplemented
    @abc.abstractmethod
    def size(cls):
        return NotImplemented
    @abc.abstractmethod
    def clearPath(cls):
        return NotImplemented
    @abc.abstractmethod
    def updatePath(cls):
        return NotImplemented
    @abc.abstractmethod
    def select(cls):
        return NotImplemented
    @abc.abstractmethod
    def expand(cls):
        return NotImplemented