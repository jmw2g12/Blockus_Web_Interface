import java.util.ArrayList;
import java.util.List;
import java.util.Comparator;
import java.util.*;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Random;
import java.lang.Math;

public class WebPlayer extends Player{
	
	BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
		
	public WebPlayer(Board board, ArrayList<Piece> pieces, String pieceCode,  int startingCorner){
		super(board,pieces,pieceCode,startingCorner);
		strategy = "web";
	}
	
	public boolean takeMove(Object[] newBoard){	
		if (firstMove) placeStarterBlock();
		updatePieceIDs();
		ArrayList<Piece> possibleMoves = board.getMoves(this);
		if (possibleMoves.size() == 0){
			finished = true;
			return false;
		}
		Piece p = getPieceFromNewBoard(newBoard);
		board.putPieceOnBoard(p,pieceCode);
		removePiece(piecesRemaining.get(p.ID));
		piecesOnBoard.add(p);
		
		return true;
	}
	public Piece getPieceFromNewBoard(Object[] newBoard){
		String[][] reformattedBoard, javaBoard;
		reformattedBoard = reformatBoard(newBoard);
		javaBoard = board.getArray();
		ArrayList<Coord> differences = getDifferences(javaBoard,reformattedBoard);
		ArrayList<Coord> normalCoords = normaliseCoords(differences);
		
		Piece p = findPieceFromCoords(normalCoords, piecesRemaining);
		if (p == null) return null;
		return repositionPiece(differences,p);
	}
	public Piece repositionPiece(ArrayList<Coord> differences, Piece p){
		Coord bottomLeftCoord = getBottomLeft(differences);
		Block block = p.blocks.get(0);
		p.placePiece(block,new Coord(block.coordinate.x + bottomLeftCoord.x, block.coordinate.y + bottomLeftCoord.y));
		return p;
	}
	public Coord getBottomLeft(ArrayList<Coord> coords){
		int minX = 0xFF;
		int minY = 0xFF;
		for (Coord c : coords){
			if (c.x < minX) minX = c.x;
			if (c.y < minY) minY = c.y;
		}
		
		return new Coord(minX,minY);
	}
	public Piece findPieceFromCoords(ArrayList<Coord> coords, ArrayList<Piece> pieces){
		for (Piece p : pieces){
			if (coordArraysEqual(coords,p.getCoordinates())){
				return p;
			}
		}
		return null;
	}
	public boolean coordArraysEqual(ArrayList<Coord> p1, ArrayList<Coord> p2){
		Comparator<Coord> coordComp = new Comparator<Coord>(){
			public int compare(Coord c1, Coord c2){
				int c1Val = c1.x*100+c1.y;
				int c2Val = c2.x*100+c2.y;
				return c1Val-c2Val;
			}        
		};
		Collections.sort(p1,coordComp);
		Collections.sort(p2,coordComp);
		if (p1.size() != p2.size()) return false;
		for (int i = 0; i < p1.size(); i++){
			if (!p1.get(i).equals(p2.get(i))) return false;
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
		for (int i = 0; i < initial.size(); i++){
			Coord prev = initial.get(i);
			result.add(new Coord(prev.x-minX, prev.y-minY));
		}
		return result;
	}
	public ArrayList<Coord> getDifferences(String[][] b1, String[][] b2){
		int boardSize = board.getBoardSize();
		ArrayList<Coord> result = new ArrayList<Coord>();
		for (int i = 0; i < boardSize; i++){
			for (int j = 0; j < boardSize; j++){
				if (!testCellEquality(b1[i][j],b2[i][j])){
					result.add(new Coord(j,i));
				}
			}
		}
		return result;
	}
	public boolean testCellEquality(String s1, String s2){
		if (s1 == null){
			if (s2 == null){
				return true;
			}else if(s2.equals("0")){
				return true;
			}else if(s2.equals("3")){
				return true;
			}else{
				return false;
			}
		}else if (s2 == null){
			if (s1 == null){
				return true;
			}else if(s1.equals("0")){
				return true;
			}else if(s1.equals("3")){
				return true;
			}else{
				return false;
			}
		}else if (s1.equals("3")){
			return (s2.equals("3") || s2.equals("0"));
		}else if (s2.equals("3")){
			return (s1.equals("3") || s1.equals("0"));
		}else{
			return s1.equals(s2);
		}
	}
	public String[][] reformatBoard(Object[] board){
		int boardSize = this.board.getBoardSize();
		String[][] result = new String[boardSize][boardSize];
		for (int y = 0; y < boardSize; y++){
			for (int x = 0; x < boardSize; x++){
				result[y][x] = nodeBoardVal(board,x,boardSize-y-1);
			}
		}
		return result;
	}
	public String nodeBoardVal(Object[] nodeBoard, int x, int y){
		Object[] rowobj = (Object[])nodeBoard[y];
		return String.valueOf(rowobj[x]);
	}
	public void printStringArray(String[] ar){
		for (int i = 0; i < ar.length; i++){
			System.out.println(ar[i]);
		}
	}
	public void printCoordArrayList(ArrayList<Coord> al){
		for (Coord c : al){
			System.out.println("x=" + c.x + ", y=" + c.y);
		}
	}
	public boolean pieceArraysEqual(String[] a, String[] b){
		if (a.length != b.length) return false;
		for (int i = 0; i < a.length; i++){
			if (!(a[i].length() == b[i].length())) return false;
			if (!(a[i].equals(b[i]))) return false;
		}
		return true;
	}
	
	public boolean compBoardVals(Object[] jsBoard, Board board, int x, int y){
		int boardSize = board.getBoardSize();
		String jsVal = nodeBoardVal(jsBoard,x,y);
		String val = board.getFromCoordinate(x,boardSize-y-1);
		if (jsVal.equals("0") && val == null){
			return true;
		}else if(jsVal.equals(val)){
			return true;
		}else{
			return false;
		}
	}
	
	// Function not used but requires overriding. TakeMove is overriden instead
	public Piece choosePiece(ArrayList<Piece> possibleMoves){
		return null;
	}
	
	public Piece getPieceFromArray(String[] piece){
		for (Piece p : piecesRemaining){
			if (p.comparePieceArray(piece)) return p;
		}
		return null;
	}
}
