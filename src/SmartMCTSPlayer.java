import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Random;
import java.lang.Math;

public class SmartMCTSPlayer extends Player{
	MCTS mcts;
	int iterations = 100;
	double iteration_multiplication_factor = 1.3;
	boolean binaryScoring;
	String weightingMethod = "size";
	public SmartMCTSPlayer(Board board, Random rand, ArrayList<Piece> pieces, String pieceCode, ArrayList<Player> allPlayers, int startingCorner, int iterations, boolean binaryScoring, String weightingMethod){
		super(board,rand,pieces,pieceCode,allPlayers,startingCorner);
		piecesRemaining = new ArrayList<Piece>(pieces);
		piecesOnBoard = new ArrayList<Piece>();
		this.binaryScoring = binaryScoring;
		this.weightingMethod = weightingMethod;
		strategy = "smcts_" + Integer.toString(iterations) + "_" + (binaryScoring ? "binary_" : "") + weightingMethod;
		mcts = new MCTS(this, weightingMethod);
		this.iterations = iterations;
		this.binaryScoring = binaryScoring;
	}
	//public Player clone(){
	//	return new SmartMCTSPlayer(board,rand,new ArrayList<Piece>(pieces),pieceCode,allPlayers,startingCorner,iterations);
	//}
	//public Piece choosePiece(ArrayList<Piece> possibleMoves){
	public Piece choosePiece(){
		//System.out.println("mcts choosing piece with " + iterations + " iterations");
		//System.out.println("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		//System.out.println("possibleMoves.size() = " + possibleMoves.size());
		board.setCurrentPlayer(this);
		//System.out.println("moving player " + board.getCurrentPlayer() + " : pieceCode = " + pieceCode);
		if (piecesOnBoard.size() >= 3){
			//System.out.println("choosing a piece via mcts with " + iterations + " iterations");
			//Board temp = board.clone();
			//temp.clonePlayers();
			Move m = mcts.runMCTS(board, iterations, false, binaryScoring);
			iterations = (int)Math.round((double)iterations * iteration_multiplication_factor);
			if (m == null) return null;
			return m.getPiece();
		}else{
			//System.out.println("choosing a piece via set starting playout");
			return chooseSetPlayPiece();
		}
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
	public Piece chooseSetPlayPiece(){
		int bestScore = 0;
		int pieceScore = 0;
		Board cloned;
		ArrayList<Piece> best = new ArrayList<Piece>();
		for (Piece p : possibleMoves){
			pieceScore = explorationProductScore(p);
			if (pieceScore > bestScore){
				best.clear();
				best.add(p);
				bestScore = pieceScore;
			}else if (pieceScore == bestScore){
				best.add(p);
			}
		}
		//System.out.println("finished testing board");
		int n = rand.nextInt(best.size());
		return best.get(n);
	}
	public int explorationProductScore(Piece p){
		Coord startingCoord = (startingCorner == 1 ? new Coord(0,0) : new Coord(board.getWidth()-1,board.getHeight()-1));
		int score = 0;
		for (Block b : p.blocks){
			score += startingCoord.productScore(b.coordinate);
		}
		return score;
		
	}
}
