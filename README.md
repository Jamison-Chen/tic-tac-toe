# Game_TicTacToe
This project is a game implemented with Reinforcement Learning and Minimax Algorithm.

## File Descriptions
### machinePlayer_v1_0.py
This file contains the core machine learning logic *(Version1.0)*.
The key strategy used is the Monte-Carlo Tree Search Algorithm (MCTS).
Also, when choosing the best move, we use the strategy that try to minimize the maximum score that our opponent can get in the next step.
*(MIND: We only look forward at "the next step", so this is not the Minimax Algoritm.)*

### machinePlayer_v1_1.py
The only 2 differences between this version and the 1.0 one is that:
1. This version do not look forward at the next (opponent's) step anymore.
2. We add a term **C**, a hyperparameter, in the method called ***maximize*** when counting score of each child. This term is the weight of **exploring less-visited nodes** given the weight of **the original winning rate** to be 1. However, you can simply see the **C** term as the learning rate as in many other maching-learning algorithms.

### main_v1.py
You may see this file as the battle field of Tic Tac Toe for machinePlayer *(Version1.0 & Version 1.1 ONLY)*, so the judge is implemented inside.
Before playing with machine, you may want to train the machine, which will make the machine look more intelligent.
The training times recommended is around 50,000 to 70,000. That will take 1 to 1.5 minutes approximately to train.

### machinePlayer_v2.py
This file contains the core machine learning logic *(Version2)*.
The main differences between this file and "machinePlayer.py" is that we use the Minimax Algorithm instead of MCTS.

### main_v2.py
Similar to main.py, this file is the battle field but for machinePlayer_v2 *(Version2)* only, so the judge is implemented inside as well.
The training times recommended is around 100,000 to 110,000. That will take 1.5 to 2 minutes approximately to train.
You'll see the machine's losing rate against a random player reaches 0% in the end. This is the most imortant difference comparing with the training result of main.py that you gotta be aware of.
However, you'll also notice that this approach takes more time to converge to a steady state. That is, the winning rate of the machine player in the first few epochs will be constantly low (around 50%), and then start getting higher in the following epochs.

### randomPlayer.py
This file, as the name goes, imitates like a player that always randomlly chooses which place to put the piece.
You'll see the randomPlayer being instanciated in both main_v1.py and main_v2.py.

### node.py & player.py
These two files are the bases of machinePlayer.py and randomPlayer.py, providing lots of essential methods.

## Files Not Used
* test.ipynb
