
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Map;
import java.util.Random;

public class MCTS {
	private Random random;
	private Node rootNode;
	private double explorationConstant = Math.sqrt(2.0);
	private double pessimisticBias;
	private double optimisticBias;

	private boolean scoreBounds;
	private boolean binaryScoring;
	private boolean trackTime; // display thinking time used
	
	private String weighting_method = "";
	
	private Player p;

	public MCTS(Player p, String weighting_method) {
		random = new Random();
		this.weighting_method = weighting_method;
		this.p = p;
	}

	/**
	 * Run a UCT-MCTS simulation for a number of iterations.
	 * 
	 * @param startingBoard starting board
	 * @param runs how many iterations to think
	 * @param bounds enable or disable score bounds.
	 * @return
	 */
	public Move runMCTS(Board startingBoard, int runs, boolean bounds, boolean binScr) {
		scoreBounds = bounds;
		binaryScoring = binScr;
		rootNode = new Node(startingBoard);
		
		//System.out.println("Making choice for player: " + rootNode.player);
		
		long startTime = System.nanoTime();

		for (int i = 0; i < runs; i++) {
			select(startingBoard.duplicate(), rootNode);
			
			/*if (runs < 10){
				System.out.println(i + "/" + runs);
			}else{
				if (i % (runs/10) == 0){
					System.out.println((i/(runs/10)+1) + "/10");
				}
			}*/
		}

		long endTime = System.nanoTime();

		if (this.trackTime)
			System.out.println("Thinking time per move in milliseconds: "
					+ (endTime - startTime) / 1000000);

		return finalSelect(rootNode);
	}

	/**
	 * This represents the select stage, or default policy, of the algorithm.
	 * Traverse down to the bottom of the tree using the selection strategy
	 * until you find an unexpanded child node. Expand it. Run a random playout.
	 * Backpropagate results of the playout.
	 * 
	 * @param node
	 *            Node from which to start selection
	 * @param brd
	 * 			  Board state to work from.
	 */
	private void _select(Board currentBoard, Node currentNode) {
		while (true) {
			// Break procedure if end of tree
			if (currentBoard.gameOver()) {
				currentNode.backPropagateScore(binaryScoring ? currentBoard.getBinaryScore() : currentBoard.getScore());
				if (scoreBounds) {
					// This runs only if bounds propagation is enabled.
					// It propagates bounds from solved nodes and prunes
					// branches from the when needed.
					currentNode.backPropagateBounds(binaryScoring ? currentBoard.getBinaryScore() : currentBoard.getScore());
				}
				return;
			}

			// We have not visited this node hence the list is null
			if (currentNode.unvisitedChildren == null) {
				currentNode.expandNode(currentBoard);
			}

			// If player ID is 0 or positive it means this is a normal node
			// A negative ID means the node is a random node
			if (currentNode.player >= 0){
				// This node has unexplored children
				if (!currentNode.unvisitedChildren.isEmpty()) {
					// it picks a move at random from list of unvisited children
					Node temp = currentNode.unvisitedChildren.remove(random.nextInt(currentNode.unvisitedChildren.size()));
					currentNode.children.add(temp);
					currentBoard.makeMove(temp.move,currentNode.player);
					playout(temp, currentBoard);
					return;
				} else {
					// This node had no unexplored children
					// hence we can proceed down to the next node
					ArrayList<Node> bestNodes = currentNode.select(optimisticBias, pessimisticBias, explorationConstant);
					
					// This only occurs if all branches have been 
					// pruned from the tree 
					if (currentNode == rootNode && bestNodes.isEmpty())
						return;
					
					Node finalNode = bestNodes.get(random.nextInt(bestNodes.size()));
					currentNode = finalNode;
					currentBoard.makeMove(finalNode.move,currentNode.player);
				}
			} else {
				if (currentNode.rVisited == null)
					currentNode.rVisited = new HashSet<Integer>();
				
				// We're in a random node, so pick a child at random
				int indexOfMove = currentNode.randomSelect(currentBoard);
				
				if (currentNode.rVisited.contains(indexOfMove)){
					// The node has been visited previously
					// So we can just proceed down
					currentNode = currentNode.unvisitedChildren.get(indexOfMove);
					currentBoard.makeMove(currentNode.move,currentNode.player);
				} else {
					// The node has never been visited, so
					// we run a playout from it, and quit
					currentNode = currentNode.unvisitedChildren.get(indexOfMove);
					currentBoard.makeMove(currentNode.move,currentNode.player);
					playout(currentNode, currentBoard);
					return;					
				}
			}
		}
	}
	
	/**
	 * This represents the select stage, or default policy, of the algorithm.
	 * Traverse down to the bottom of the tree using the selection strategy
	 * until you find an unexpanded child node. Expand it. Run a random playout.
	 * Backpropagate results of the playout.
	 * 
	 * @param node
	 *            Node from which to start selection
	 * @param brd
	 * 			  Board state to work from.
	 */
	private void select(Board currentBoard, Node currentNode){
		Map.Entry<Board, Node> tuple = treePolicy(currentBoard, currentNode);
		double[] score = playout(tuple.getValue(), tuple.getKey());
		tuple.getValue().backPropagateScore(score);
	}
	
	private Map.Entry<Board, Node> treePolicy(Board b, Node node) { //need to look at final move conditions
		while(true) {
			if (b.gameOver()) {
				return new AbstractMap.SimpleEntry<>(b, node);
			} else {
				if (node.unvisitedChildren == null) {
					node.expandNode(b); 
					Board temp = b.clone();
					ArrayList<Move> moves = b.getMoves();
				}
				
				if (!node.unvisitedChildren.isEmpty()) {
					Node temp = node.unvisitedChildren.remove(random.nextInt(node.unvisitedChildren.size()));
					node.children.add(temp);
					b.makeMove(temp.move);
					return new AbstractMap.SimpleEntry<>(b, temp);
				} else {
					ArrayList<Node> bestNodes = node.select(optimisticBias, pessimisticBias, explorationConstant);
					Node finalNode = bestNodes.get(random.nextInt(bestNodes.size()));
					node = finalNode;
					b.makeMove(finalNode.move,finalNode.player);
				}
			}
		}
	}
	
	
	/**
	 * This is the final step of the algorithm, to pick the best move to
	 * actually make.
	 * 
	 * @param n
	 *            this is the node whose children are considered
	 * @return the best Move the algorithm can find
	 */
	private Move finalSelect(Node n) {
		//System.out.println("final select " + n.player);
		double bestValue = Double.NEGATIVE_INFINITY;
		double tempBest;
		ArrayList<Node> bestNodes = new ArrayList<Node>();

		for (Node s : n.children) {
			tempBest = s.games;
			tempBest += s.opti[n.player] * optimisticBias;
			tempBest += s.pess[n.player] * pessimisticBias;
			// tempBest += 1.0 / Math.sqrt(s.games);
			//tempBest = Math.min(tempBest, s.opti[n.player]);
			//tempBest = Math.max(tempBest, s.pess[n.player]);
			if (tempBest > bestValue) {
				bestNodes.clear();
				bestNodes.add(s);
				bestValue = tempBest;
			} else if (tempBest == bestValue) {
				bestNodes.add(s);
			}
		}
		
		if (bestNodes.size() == 0) return null;
		
		Node finalNode = bestNodes.get(random.nextInt(bestNodes.size()));
		
		//System.out.println("Highest value: " + bestValue + ", O/P Bounds: "
		//		+ finalNode.opti[n.player] + ", " + finalNode.pess[n.player]);
		return finalNode.move;
	}

	/**
	 * Playout function for MCTS
	 * 
	 * @param state
	 * @return
	 */
	private double[] playout(Node state, Board board) {
		ArrayList<Move> moves;
		Move mv;
		Board brd = board.duplicate();
		// Start playing random moves until the game is over
		while (!brd.gameOver()) {
			moves = brd.getMoves();
			mv = moves.get(random.nextInt(moves.size()));
			brd.makeMove(mv,brd.getCurrentPlayer());
			//brd.print();
		}
		return binaryScoring ? brd.getBinaryScore() : brd.getScore();
	}

	private Move getRandomMove(Board board, ArrayList<Move> moves) {
		double[] weights = board.getMoveWeights(moves, weighting_method);
		
		double totalWeight = 0.0d;
		for (int i = 0; i < weights.length; i++)
		{
		    totalWeight += weights[i];
		}
		
		int randomIndex = -1;
		double random = Math.random() * totalWeight;
		for (int i = 0; i < weights.length; ++i)
		{
		    random -= weights[i];
		    if (random <= 0.0d)
		    {
		        randomIndex = i;
		        break;
		    }
		}
		
		return moves.get(randomIndex);
	}
	
	/**
	 * Sets the exploration constant for the algorithm. You will need to find
	 * the optimal value through testing. This can have a big impact on
	 * performance. Default value is sqrt(2)
	 * 
	 * @param exp
	 */
	public void setExplorationConstant(double exp) {
		explorationConstant = exp;
	}

	/**
	 * This is multiplied by the pessimistic bounds of any
	 * considered move during selection.	 
	 * @param b
	 */
	public void setPessimisticBias(double b) {
		pessimisticBias = b;
	}

	/**
	 * This is multiplied by the optimistic bounds of any
	 * considered move during selection.
	 * @param b
	 */
	public void setOptimisticBias(double b) {
		optimisticBias = b;
	}

	public void setTimeDisplay(boolean displayTime) {
		this.trackTime = displayTime;
	}
}
