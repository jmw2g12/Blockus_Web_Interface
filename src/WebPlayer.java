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
	public boolean takeMove(Object[] newBoard){	
		if (firstMove) placeStarterBlock();
		updatePieceIDs();
		Piece p;
		possibleMoves = possibleMovesForPlayer();
		if (possibleMoves.size() == 0){
			finished = true;
			System.out.println("There are no more moves available! Player in " + startingCorner + " is finished.");
			return false;
		}
		p = getPieceFromNewBoard(newBoard);
		board.putPieceOnBoard(p,pieceCode);
		removePiece(piecesRemaining.get(p.ID),true);
		piecesOnBoard.add(p);
		
		board.print();
		return true;
	}
	public Piece getPieceFromNewBoard(Object[] newBoard){
		ArrayList<Coord> differences = new ArrayList<Coord>();
		
		for (int i = 0; i < board.boardSize; i++){
			for (int j = 0; j < board.boardSize; j++){
				//System.out.print(nodeBoardVal(newBoard,j,i));
				//System.out.print(board.getFromCoordinate(j,i));
				if (compBoardVals(newBoard,board,j,i)){
					//System.out.print("t   ");
				}else{
					//System.out.print("f   ");
					differences.add(new Coord(j,i));
				}
			}
			//System.out.println("");
		}
		//System.out.println("differences.size() = " + differences.size());
		ArrayList<Coord> normalCoords = normaliseCoords(differences);
		int maxX = -0xFF;
		int minX = 0xFF;
		int maxY = -0xFF;
		int minY = 0xFF;
		for (int i = 0; i < normalCoords.size(); i++){
			if (normalCoords.get(i).x > maxX) maxX = normalCoords.get(i).x;
			if (normalCoords.get(i).y > maxY) maxY = normalCoords.get(i).y;
			if (normalCoords.get(i).x < minX) minX = normalCoords.get(i).x;
			if (normalCoords.get(i).y < minY) minY = normalCoords.get(i).y;
		}
		int width = maxX - minX + 1;
		int height = maxY - minY + 1;
		String[] newPieceArray = new String[height];
		String line = "";
		for (int i = 0; i < height; i++){
			for (int j = 0; j < height; j++){
				line = line + ((normalCoords.contains(new Coord(j,i))) ? "X" : "O");
			}
			newPieceArray[i] = new String(line);
			line = "";
		}
		for (Piece p : piecesRemaining){
			System.out.println("# " + pieces.indexOf(p) + " :");
			p.print_piece();
			String[] pieceArray = p.getPieceArray();
			if (pieceArraysEqual(pieceArray,newPieceArray)){
				p.printPieceDiagram();
				return p;
			}
		}
		return null;
	}
	public boolean pieceArraysEqual(String[] a, String[] b){
		if (a.length != b.length) return false;
		for (int i = 0; i < a.length; i++){
			if (!(a[i].length() == b[i].length())) return false;
			if (!(a[i].equals(b[i]))) return false;
		}
		return true;
	}
	public ArrayList<Coord> normaliseCoords(ArrayList<Coord> initial){
		ArrayList<Coord> result = new ArrayList<Coord>();
		int maxX = -0xFF;
		int minX = 0xFF;
		int maxY = -0xFF;
		int minY = 0xFF;
		for (int i = 0; i < initial.size(); i++){
			if (initial.get(i).x > maxX) maxX = initial.get(i).x;
			if (initial.get(i).y > maxY) maxY = initial.get(i).y;
			if (initial.get(i).x < minX) minX = initial.get(i).x;
			if (initial.get(i).y < minY) minY = initial.get(i).y;
		}
		//System.out.println("minX = " + minX + ", minY = " + minY + ", maxX = " + maxX + ", maxY = " + maxY);
		for (int i = 0; i < initial.size(); i++){
			Coord prev = initial.get(i);
			result.add(new Coord(prev.x-minX, prev.y-minY));
			//System.out.println("i:" + i + "    x = " + result.get(i).x + ", y = " + result.get(i).y);
		}
		return result;
	}
	public String nodeBoardVal(Object[] nodeBoard, int x, int y){
		Object[] rowobj = (Object[])nodeBoard[y];
		return String.valueOf(rowobj[x]);
	}
	public Integer[][] nodeBoardArray(Object[] nodeBoard){
		int boardSize = board.getBoardSize();
		Integer[][] result = new Integer[boardSize][boardSize];
		for (int y = 0; y < boardSize; y++){
			Object[] rowojb = (Object[])nodeBoard[y];
			for (int x = 0; x < boardSize; x++){
				result[y][x] = Integer.parseInt(rowobj[x]);
			}
		}
		return result;
	}
	public void printObjValues(Object[] board){
		for (int i = 0; i < 14; i++){
			Object[] row = (Object[])board[i];
			for (int j = 0; j < 14; j++){
				System.out.print(row[j] + ":" + row[j].getClass() + "      ");
			}
			System.out.println("");
		}
	}
	public boolean compBoardVals(Object[] jsBoard, Board board, int x, int y){
		String jsVal = nodeBoardVal(jsBoard,x,y);
		String val = board.getFromCoordinate(x,y);
		if (jsVal.equals("0") && val == null){
			return true;
		}else if(jsVal.equals(val)){
			return true;
		}else{
			return false;
		}
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
