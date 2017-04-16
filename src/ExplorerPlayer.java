import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Random;
import java.lang.Math;

public class ExplorerPlayer extends Player{
	ArrayList<Pair<Piece,Double>> scoredMoves = new ArrayList<Pair<Piece,Double>>();
	public ExplorerPlayer(Board board, Random rand, ArrayList<Piece> pieces, String pieceCode, ArrayList<Player> allPlayers, int startingCorner){
		super(board,rand,pieces,pieceCode,allPlayers,startingCorner);
		piecesRemaining = new ArrayList<Piece>(pieces);
		piecesOnBoard = new ArrayList<Piece>();
		strategy = "explorer";
	}
	public Player clone(){
		return new ExplorerPlayer(board,rand,new ArrayList<Piece>(pieces),pieceCode,allPlayers,startingCorner);
	}
	public Piece choosePiece(){ //should have no side effects, simply return player's chosen piece.
		scoredMoves = getHighestExplorationScores(possibleMoves);
		int n = rand.nextInt(scoredMoves.size());
		return scoredMoves.get(n).getL();
	}
	public double scoreSituation(Board b, int startingCorner){
		return scoreSituation_Opportunities(b, startingCorner);// - scoreSituation_Restrictive(b, startingCorner);
	}
	public double scoreSituation_Opportunities(Board b, int startingCorner){
		return (double)b.getConnectableBlocks(b.getCornerBlocks(pieceCode),pieceCode).size();
	}
	public double scoreSituation_Restrictive(Board b, int startingCorner){
		Double result = 0.0;
		for (Player p : allPlayers){
			if (p != this){
				result += (double)b.getConnectableBlocks(b.getCornerBlocks(p.getPieceCode()),p.getPieceCode()).size();
			}
		}
		result /= (allPlayers.size()-1);
		return result;
	}
	public ArrayList<Pair<Piece,Double>> getHighestExplorationScores(ArrayList<Piece> possibleMoves){
		ArrayList<Pair<Piece,Double>> allScores = new ArrayList<Pair<Piece,Double>>();
		ArrayList<Pair<Piece,Double>> result = new ArrayList<Pair<Piece,Double>>();
		Double maxScore = 0.0;
		for (Piece p : possibleMoves){
			Double thisScore = calcExplorationScore(p,startingCorner);
			allScores.add(new Pair<Piece,Double>(p,thisScore));
			if (maxScore < thisScore) maxScore = thisScore;
		}
		for (Pair<Piece,Double> m : allScores){
			if (m.getR().equals(maxScore)){
				result.add(m);
			}
		}
		return result;
	}
	public double getExplorationScore(Board b, int startingCorner){
		ArrayList<Piece> piecesOnBoard = b.getPiecesFromCode(allPlayers.get(startingCorner-1).pieceCode);
		int blocksOnBoard = b.blocksOnBoard(allPlayers.get(startingCorner-1).pieceCode);
		double score = 0.0;
		for (int i = 0; i < 4; i++){
			if (i == startingCorner-1){
				score += 3*b.blocksOnBoard(allPlayers.get(i).pieceCode);
			}else{
				score -= b.blocksOnBoard(allPlayers.get(i).pieceCode);
			}
		}
		return score;
	}
	public Double calcExplorationScore(Piece m, int startingCorner){
		double result = 0.0;
		double hyp = 0.0;
		double diag = 0.0;
		double x,y;
		for (Block b : m.blocks){
			switch (startingCorner){
				case 1 :
					x = b.coordinate.x;
					y = b.coordinate.y;
					hyp = Math.sqrt(x*x+y*y);
					diag = Math.sqrt(x*y);
					result += hyp + diag;
					break;
				case 2 :
					x = b.coordinate.x;
					y = (board.getHeight()-b.coordinate.y-1);
					hyp = Math.sqrt(x*x+y*y);
					diag = Math.sqrt(x*y);
					result += hyp + diag;
					break;
				case 3 :
					x = (board.getWidth()-b.coordinate.x-1);
					y = (board.getHeight()-b.coordinate.y-1);
					hyp = Math.sqrt(x*x+y*y);
					diag = Math.sqrt(x*y);
					result += hyp + diag;
					break;
				case 4 :
					x = (board.getWidth()-b.coordinate.x-1);
					y = b.coordinate.y;
					hyp = Math.sqrt(x*x+y*y);
					diag = Math.sqrt(x*y);
					result += hyp + diag;
					break;
			}
		}
		return new Double(result);
	}
}
