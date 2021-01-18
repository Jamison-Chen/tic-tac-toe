# Game_TicTacToe
This project is a game implemented with Reinforcement Learning and Minimax Algorithm.

## File Descriptions
### machinePlayer.py
This file contains the core machine learning logic (Version1).
The key strategy used is the Minimax algorithm.

### main.py
You may see this file as the battle field of Tic Tac Toe for machinePlayer (Version1 ONLY), so the judge is implemented inside.
Before playing with machine, you may want to train the machine, which will make the machine look more intelligent.
The training times recommended is around 50,000 to 70,000. That will take 1 to 1.5 minutes approximately to train.

### machinePlayer_v2.py
This file contains the core machine learning logic (Version2).
The main differences between this file and "machinePlayer.py" is the different ways we implemented with on both the Minimax Algorithm part and the Back Propagation part.

### main_v2.py
Similar to main.py, this file is the battle field but for machinePlayer_v2 (Version2), so the judge is implemented inside as well.
The training times recommended is around 100,000 to 110,000. That will take 1.5 to 2 minutes approximately to train.
You'll see the machine's losing rate against a random player reaches 0% in the end. This is the most imortant difference comparing with the training result of main.py that you gotta be aware of.

### randomPlayer.py
This file, as the name goes, imitates like a player that always randomlly chooses which place to put the piece.
You'll see the randomPlayer being instanciated in both main.py and main_v2.py.

### node.py & player.py
These two files are the bases of machinePlayer.py and randomPlayer.py, providing lots of essential methods.

## Files Not Used
* test.ipynb
