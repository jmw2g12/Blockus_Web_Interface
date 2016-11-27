import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Random;
import java.lang.Math;

public class WebPlayer extends Player{
	BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
	final boolean orderedInput = true;
	
	public WebPlayer(Board board, Random rand, ArrayList<Piece> pieces, String pieceCode, ArrayList<Player> allPlayers, int startingCorner){
		super(board,rand,pieces,pieceCode,allPlayers,startingCorner);
		piecesRemaining = new ArrayList<Piece>(pieces);
		piecesOnBoard = new ArrayList<Piece>();
		strategy = "web";
	}
	public boolean takeMove(String[] pieceArray){	
		System.out.println("in take move : ");
		for (String s : pieceArray){
			System.out.println("java -> " + s);
		}
		System.out.println("leaving take move : ");
		
		/*
		
		if (firstMove) placeStarterBlock();
		updatePieceIDs();
		Piece p;
		possibleMoves = possibleMovesForPlayer();
		if (possibleMoves.size() == 0){
			finished = true;
			System.out.println("There are no more moves available! Player in " + startingCorner + " is finished.");
			return false;
		}
		p = getPieceFromArray(pieceArray);
		if (p == null) return false;
		board.putPieceOnBoard(p,pieceCode);
		removePiece(piecesRemaining.get(p.ID),true);
		piecesOnBoard.add(p);
				
		*/
				
		return true;
	}
	public Piece choosePiece(){
		return null;
	}
	public Piece getPieceFromArray(String[] piece){
		for (Piece p : piecesRemaining){
			if (p.comparePieceArray(piece)) return p;
		}
		System.out.println("*** did not find this piece ***");
		return null;
	}
}
