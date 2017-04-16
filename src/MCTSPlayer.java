import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Random;
import java.lang.Math;

public class MCTSPlayer extends Player{
	MCTS mcts;
	int iterations = 100;
	boolean binaryScoring;
	public MCTSPlayer(Board board, Random rand, ArrayList<Piece> pieces, String pieceCode, ArrayList<Player> allPlayers, int startingCorner, int iterations, boolean binaryScoring){
		super(board,rand,pieces,pieceCode,allPlayers,startingCorner);
		piecesRemaining = new ArrayList<Piece>(pieces);
		piecesOnBoard = new ArrayList<Piece>();
		strategy = "mcts" + Integer.toString(iterations) + (binaryScoring ? "binary" : "");
		mcts = new MCTS(this,"");
		this.iterations = iterations;
		this.binaryScoring = binaryScoring;
	}
	public Player clone(){
		return new MCTSPlayer(board,rand,new ArrayList<Piece>(pieces),pieceCode,allPlayers,startingCorner,iterations,binaryScoring);
	}
	public Piece choosePiece(){
		//System.out.println("mcts choosing piece with " + iterations + " iterations");
		Move m = mcts.runMCTS(board, iterations, false, binaryScoring);
		if (m == null) return null;
		return m.getPiece();
	}
	public int explorationScore(Piece p){
		Coord startingCoord = (startingCorner == 1 ? new Coord(0,0) : new Coord(board.getWidth()-1,board.getHeight()-1));
		int score = 0;
		for (Block b : p.blocks){
			score += startingCoord.manhattanDistance(b.coordinate);
		}
		return score;
		
	}
	public int sizeScore(Piece p){
		return p.blocks.size();
	}
}
