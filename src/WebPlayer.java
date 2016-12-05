import java.util.ArrayList;
import java.util.List;
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
		//System.out.println("pieceCode = " + pieceCode);
		board.putPieceOnBoard(p,pieceCode);
		removePiece(piecesRemaining.get(p.ID),true);
		piecesOnBoard.add(p);
		
		//board.print();
		return true;
	}
	public Piece getPieceFromNewBoard(Object[] newBoard){
		String[][] reformattedBoard, javaBoard;
		reformattedBoard = reformatBoard(newBoard);
		javaBoard = board.getArray();
		ArrayList<Coord> differences = getDifferences(javaBoard,reformattedBoard);
		ArrayList<Coord> normalCoord = normaliseCoords(differences);
		System.out.println("testing coord arrays equal:");
		ArrayList<Coord> ar1 = new ArrayList<Coord>();
		ArrayList<Coord> ar2 = new ArrayList<Coord>();
		ArrayList<Coord> ar3 = new ArrayList<Coord>();
		ar1.add(new Coord(5, 5));
		ar2.add(new Coord(5, 5));
		ar3.add(new Coord(5, 5));
		ar1.add(new Coord(3, 5));
		ar2.add(new Coord(5, 3));
		ar3.add(new Coord(3, 5));
		ar1.add(new Coord(10, 10));
		ar2.add(new Coord(10, 10));
		ar3.add(new Coord(10, 10));
		System.out.println("coordArraysEqual(ar1,ar2) : ");
		System.out.println(coordArraysEqual(ar1, ar2));
		System.out.println("coordArraysEqual(ar1,ar3) : ");
		System.out.println(coordArraysEqual(ar1, ar3));
		System.out.println("coordArraysEqual(ar2,ar3) : ");
		System.out.println(coordArraysEqual(ar2, ar3));
		System.out.println("");
		for (Coord c : piecesRemaining.get(20).getCoordinates()){
			System.out.println("piece 20, coordinate = " + c.x + ", " + c.y);
		}
		System.out.println("leaving getPieceFromNewBoard");
		return piecesRemaining.get(20);
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

		ArrayList<Coord> sourceList = new ArrayList<Coord>(p1);
		ArrayList<Coord> destinationList = new ArrayList<Coord>(p2);

		System.out.println(sourceList);
		System.out.println(destinationList);
		
		sourceList.removeAll(p1);
		destinationList.removeAll(p2);

		System.out.println(sourceList);
		System.out.println(destinationList);
		
		if (sourceList.size() == 0 && destinationList.size() == 0){
			return true;
		}else{
			return false;
		}
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
			}else{
				return false;
			}
		}else if (s2 == null){
			if (s1 == null){
				return true;
			}else if(s1.equals("0")){
				return true;
			}else{
				return false;
			}
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
	public void print2DStringArray(String[][] ar, boolean invertY){
		int maxY = ar.length;
		String line = "";
		if (invertY){
			for (int y = maxY-1; y >= 0; y--){
				for (int x = 0; x < ar[y].length; x++){
					line = line + ar[y][x];
				}
				System.out.println(line);
				line = "";
			}
		}else{
			for (int y = 0; y < maxY; y++){
				for (int x = 0; x < ar[y].length; x++){
					line = line + ar[y][x];
				}
				System.out.println(line);
				line = "";
			}
		}
	}
	public String nodeBoardVal(Object[] nodeBoard, int x, int y){
		Object[] rowobj = (Object[])nodeBoard[y];
		return String.valueOf(rowobj[x]);
	}
	/*
	public Piece getPieceFromNewBoard(Object[] newBoard){
		ArrayList<Coord> differences = new ArrayList<Coord>();
		ArrayList<Coord> pieceMatchingCoords = new ArrayList<Coord>();
		int boardSize = board.getBoardSize();
		System.out.println("java board");
		board.print();
		System.out.println("");
		System.out.println("differences board");
		int containingBoxTopLeftX = 0xFF;
		int containingBoxTopLeftY = 0xFF;
		for (int i = 0; i < board.boardSize; i++){
			for (int j = 0; j < board.boardSize; j++){
				System.out.print(nodeBoardVal(newBoard,j,i));
				System.out.print(board.getFromCoordinate(j,boardSize-i-1));
				if (compBoardVals(newBoard,board,j,i)){
					System.out.print("t   ");
				}else{
					System.out.print("f   ");
					differences.add(new Coord(j,i));
					if (j < containingBoxTopLeftX) containingBoxTopLeftX = j;
					if (i < containingBoxTopLeftY) containingBoxTopLeftY = i;
				}
			}
			System.out.println("");
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
		for (Coord c : normalCoords){
			pieceMatchingCoords.add(new Coord(c.x,height-c.y-1));
		}
		String[] newPieceArray = new String[height];
		String line = "";
		for (int i = 0; i < height; i++){
			for (int j = 0; j < width; j++){
				line = line + ((normalCoords.contains(new Coord(j,i))) ? "X" : "-");
			}
			newPieceArray[i] = new String(line);
			line = "";
		}
		for (Piece p : piecesRemaining){
		System.out.println("--------------starting for piece---------------");
		System.out.println("");
			//System.out.println("# " + pieces.indexOf(p) + " :");
			//p.print_piece();
			String[] pieceArray = p.getPieceArray();
			System.out.println("piece coords:");
			p.print_coordinates();
			System.out.println("new piece coords:");
			printCoordArrayList(normalCoords);
			System.out.println("");
			System.out.println("piece array");
			printStringArray(pieceArray);
			System.out.println("new piece array");
			printStringArray(newPieceArray);
			if (pieceArraysEqual(pieceArray,newPieceArray)){
			//if (coordArraysEqual
				System.out.println("*** found match ***");
				p.printPieceDiagram();
				
				p.place_piece(bl,c);
				return p;
			}
			System.out.println("");
			System.out.println("-------------------------------------------");
		}
		System.out.println("NO PIECE MATCHES!");
		return null;
	}*/
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
	/*
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
	*/
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
