# Game_TicTacToe
This project is a game implemented with Reinforcement Learning.

## File Descriptions
### machinePlayer.py
This file contains the core Machine Learning logic. Strategies used include Monte-Carlo Tree Search, Minimax, etc.

### main.py
You may see this file as the battle field of Tic Tac Toe, so the judge is implemented inside.
Before playing with machine, you may want to train the machine, which will make the machine look more intelligent.
The training times recommented is around 50,000 to 80,000. It will take only 1 to 1.5 minutes to train.

### randomPlayer.py
This file, as the name goes, imitates like a player that always randomlly chooses which place to put the piece.

### node.py & player.py
These two files are the bases of machinePlayer.py and randomPlayer.py, providing lots of essential methods.

## Files Not Used
* mp2.py
* simulationField.py
* test.ipynb
