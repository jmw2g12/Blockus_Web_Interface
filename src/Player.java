import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Random;
import java.lang.Math;
public abstract class Player{
	String strategy;
	Board board;
	int startingCorner;
	boolean finished = false;
	ArrayList<Piece> pieces;
	ArrayList<Piece> piecesOnBoard;
	ArrayList<Piece> piecesRemaining;
	ArrayList<Player> allPlayers;
	String pieceCode;
	ArrayList<Pair<Block,Integer>> cornerBlocks = new ArrayList<Pair<Block,Integer>>();
	ArrayList<Pair<Block,Integer>> connectableBlocks = new ArrayList<Pair<Block,Integer>>();
	ArrayList<Piece> possibleMoves = new ArrayList<Piece>();
	Random rand = new Random();
	boolean firstMove = true;
	
	public Player(){}
	public Player(Board board, Random rand, ArrayList<Piece> pieces, String pieceCode, ArrayList<Player> allPlayers, int startingCorner){
		this.board = board;
		this.pieces = pieces;
		this.piecesRemaining = new ArrayList<Piece>(pieces);
		this.piecesOnBoard = new ArrayList<Piece>();
		this.pieceCode = pieceCode;
		this.allPlayers = allPlayers;
		this.rand = rand;
		this.startingCorner = startingCorner;
	}
	public void setConstructorValues(Board board, Random rand, ArrayList<Piece> pieces, String pieceCode, ArrayList<Player> allPlayers, int startingCorner){
		this.board = board;
		this.pieces = pieces;
		this.piecesRemaining = new ArrayList<Piece>(pieces);
		this.piecesOnBoard = new ArrayList<Piece>();
		this.pieceCode = pieceCode;
		this.allPlayers = allPlayers;
		this.rand = rand;
		this.startingCorner = startingCorner;
	}
	public void placeStarterBlock(){
		switch (startingCorner){
			case 1 :
				Piece bottomLeftStarter = pieces.get(0).clone();
				bottomLeftStarter.blocks.get(0).starter_block = true;
				bottomLeftStarter.place_piece(bottomLeftStarter.blocks.get(0),new Coord(-1,-1));
				board.putStartingPieceOnBoard(bottomLeftStarter,pieceCode);
				break;
			case 2 :
				Piece topLeftStarter = pieces.get(0).clone();
				topLeftStarter.blocks.get(0).starter_block = true;
				topLeftStarter.place_piece(topLeftStarter.blocks.get(0),new Coord(-1,board.getHeight()));
				board.putStartingPieceOnBoard(topLeftStarter,pieceCode);
				break;
			case 3 :
				Piece topRightStarter = pieces.get(0).clone();
				topRightStarter.blocks.get(0).starter_block = true;
				topRightStarter.place_piece(topRightStarter.blocks.get(0),new Coord(board.getWidth(),board.getHeight()));
				board.putStartingPieceOnBoard(topRightStarter,pieceCode);
				break;
			case 4 :
				Piece bottomRightStarter = pieces.get(0).clone();
				bottomRightStarter.blocks.get(0).starter_block = true;
				bottomRightStarter.place_piece(bottomRightStarter.blocks.get(0),new Coord(board.getWidth(),-1));
				board.putStartingPieceOnBoard(bottomRightStarter,pieceCode);
				break;
		}
		firstMove = false;
	}
	public String getStrategy(){ return strategy; }
	public String getPieceCode(){ return pieceCode; }
	public boolean isNumeric(String str){ return str.matches("[+-]?\\d*(\\.\\d+)?"); }
	public boolean isFinished(){ return finished; }
	public ArrayList<Piece> getPiecesRemaining(){ return piecesRemaining; }
	public boolean takeMove(){	
		if (firstMove) placeStarterBlock();
		updatePieceIDs();
		Piece p;
		System.out.println("here before");
		possibleMoves = possibleMovesForPlayer();
		System.out.println("here after");
		if (possibleMoves.size() == 0){
			finished = true;
			System.out.println("There are no more moves available! Player in " + startingCorner + " is finished.");
			return false;
		}
		p = choosePiece();
		board.putPieceOnBoard(p,pieceCode);
		removePiece(piecesRemaining.get(p.ID),true);
		piecesOnBoard.add(p);
				
		return true;
	}
	public ArrayList<Piece> possibleMovesForPlayer(){
		System.out.println("here in possibleMoves, before");
		cornerBlocks = board.getCornerBlocks(pieceCode);
		connectableBlocks = board.getConnectableBlocks(cornerBlocks,pieceCode);
		System.out.println("here in possibleMoves, almost done");
		return getPossibleMoves(startingCorner,connectableBlocks,false);
	}
	public abstract Piece choosePiece();
	public void removePiece(Piece piece, boolean removePermutations){
		if (removePermutations){
			for (Piece p : (ArrayList<Piece>)piecesRemaining.clone()){
				if (p.isSamePiece(piece)) piecesRemaining.remove(p);
			}
		}else{
			piecesRemaining.remove(piece);
		}
	}
	public void updatePieceIDs(){
		int counter = 0;
		for (Piece p : piecesRemaining){
			p.ID = counter;
			counter++;
		}
	}
	public ArrayList<Piece> getPossibleMoves(int startingCorner, ArrayList<Pair<Block,Integer>> connectables, Boolean printPieces){
		System.out.println("here in getPossibleMoves, before");
		System.out.println("piecesRemaining.size() = " +  piecesRemaining.size());
		System.out.println("pieces.size() = " +  pieces.size());
		System.out.println("board.blocksOnBoard('1') = " +  board.blocksOnBoard("1"));
		System.out.println("connectables.size() = " + connectables.size());
		ArrayList<Piece> result = new ArrayList<Piece>();
		Piece pieceToTest;
		Block block_of_piece;
		System.out.println("here before loop");
		for (Pair<Block,Integer> c : connectables){	
			System.out.println("starting loop iteration #" + connectables.indexOf(c));
			for (Pair<Piece,Block> pcs : findPiecesToConnect(c.getR(),allPlayers.get(indexFromStartCorner(startingCorner)).getPiecesRemaining())){
				System.out.println("starting inner loop");
				pieceToTest = pcs.getL().clone();
				block_of_piece = pieceToTest.blocks.get(pcs.getL().blocks.indexOf(pcs.getR())); //gets equivalent cloned block in new piece
				pieceToTest.place_piece(block_of_piece, c.getL(), c.getR());
				if (board.doesPieceFit(pieceToTest,true)){
					result.add(pieceToTest);
					if (printPieces){
						pieceToTest.print_piece();
						System.out.println("");
					}
				}
				System.out.println("finishing inner loop");
			}
			System.out.println("finishing loop iteration #" + connectables.indexOf(c));
		}
		System.out.println("here in getPossibleMoves, after");
		return result;
	}
	public Integer indexFromStartCorner(start){
		if (start == 1) return 0;
		if (start == 3) return 1;
		return null;
	}
	public ArrayList<Pair<Piece,Block>> findPiecesToConnect(int connectorDirection, ArrayList<Piece> piecesRemaining){
		int direction = (connectorDirection + 2) % 4;
		if (direction == 0) direction = 4;
		ArrayList<Pair<Piece,Block>> connectable_pieces = new ArrayList<Pair<Piece,Block>>();
		for (Piece p : piecesRemaining){
			for (Block bl : p.blocks){
				switch (direction){
					case 1 : 
						if (bl.topright){
							connectable_pieces.add(new Pair<Piece,Block>(p,bl));
						}
						break;
					case 2 : 	
						if (bl.bottomright){
							connectable_pieces.add(new Pair<Piece,Block>(p,bl));
						}
						break;
					case 3 : 
						if (bl.bottomleft){
							connectable_pieces.add(new Pair<Piece,Block>(p,bl));
						}
						break;
					case 4 : 
						if (bl.topleft){
							connectable_pieces.add(new Pair<Piece,Block>(p,bl));
						}
						break;
				}
			}
		}
		return connectable_pieces;
	}
	public void printRemainingPieces(){
		int counter = 0;
		for (Piece p : piecesRemaining){
			System.out.println("Piece " + counter + ": ");
			//p.print_piece();
			for (String s : p.getPieceDiagram(" ")){
				System.out.println(s);
			}
			System.out.println("");
			counter++;
		}
	}
	public String nBlanks(int n){
		String s = "";
		for (int i = 0; i < n; i++){
			s += " ";
		}
		return s;
	}
	public void padPieceDiagram(ArrayList<String> pieceArray, int rows){ //has 3 things in, size = 3, index up to 2, rows=5, pad with 2 rows, up until index = 4
		pieceArray.ensureCapacity(rows);
		int cols = pieceArray.get(0).length();
		for (int i = 0; i < rows; i++){
			if (i >= pieceArray.size()){
				pieceArray.add(nBlanks(cols));
			}
		}
	}
	public ArrayList<Piece> printPiecesInLine(ArrayList<Piece> piecesRemaining, int maxColumns, int xSpacing, int ySpacing, boolean uniqueOnly, boolean representationOnly){
		ArrayList<Piece> pieceList = new ArrayList<Piece>();
		ArrayList<String> printArray = new ArrayList<String>();
		ArrayList<String> pieceDiagram = new ArrayList<String>();
		ArrayList<Piece> printList;
		if (uniqueOnly){
			printList = getUniquePiecesFromOrderedList(piecesRemaining);
		}else{
			printList = piecesRemaining;
		}
		int columnCounter = 0;
		int maxRows = 0;
		int pieceCounter = 0;
 		for (Piece p : printList){
 			pieceDiagram = p.getPieceRepresentation(" ",Character.toString((char)248),false);
 			if (pieceDiagram.get(0).length() + columnCounter > maxColumns){
 				//print out pieces up until now
 				printArray = new ArrayList<String>(maxRows);
 				for (int i = 0; i < maxRows; i++){
 					printArray.add("");
 				}
 				for (Piece toPrint : pieceList){
 					pieceDiagram = toPrint.getPieceRepresentation(" ",Character.toString((char)248),true,pieceList.indexOf(toPrint)+pieceCounter);
 					padPieceDiagram(pieceDiagram,maxRows);
 					for (int i = 0; i < maxRows; i++){
 						printArray.set(i,printArray.get(i)+pieceDiagram.get(i)+nBlanks(xSpacing));
 					}
 				}
 				for (String s : printArray){
 					System.out.println(s);
 				}
 				for (int i = 0; i < ySpacing; i++){
 					System.out.println(nBlanks(columnCounter));
 				}
 				
 				//reset 2 arraylists and col/row counters
 				pieceCounter += pieceList.size();
 				pieceList = new ArrayList<Piece>();
 				maxRows = 0;
 				columnCounter = 0;
 			}
 			pieceDiagram = p.getPieceRepresentation(" ",Character.toString((char)248),false);
 			pieceList.add(p);
 			columnCounter += pieceDiagram.get(0).length();
 			if (pieceDiagram.size() > maxRows) maxRows = pieceDiagram.size();
 		}
 		//print out pieces up until now
 		printArray = new ArrayList<String>(maxRows);
 		for (int i = 0; i < maxRows; i++){
 			printArray.add("");
 		}
 		for (Piece toPrint : pieceList){
 			pieceDiagram = toPrint.getPieceRepresentation(" ",Character.toString((char)248),!representationOnly,pieceList.indexOf(toPrint)+pieceCounter); //changed here! was true
 			padPieceDiagram(pieceDiagram,maxRows);
 			for (int i = 0; i < maxRows; i++){
 				printArray.set(i,printArray.get(i)+pieceDiagram.get(i)+nBlanks(xSpacing));
 			}
 		}
 		for (String s : printArray){
 			System.out.println(s);
 		}
 		return printList;
	}
	public ArrayList<Piece> getUniquePiecesFromOrderedList(ArrayList<Piece> list){
		ArrayList<Piece> result = new ArrayList<Piece>();
		boolean first = true;
		Piece prev = list.get(0);
		for (Piece p : list){
			if (first == false){
				if (!p.isSamePiece(prev)){
					result.add(p);
				}
			}else{
				result.add(p);
			}
			first = false;
			prev = p;
		}
		return result;
	}
}
