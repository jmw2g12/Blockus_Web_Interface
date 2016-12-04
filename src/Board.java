import java.util.ArrayList;
import java.io.PrintWriter;
import java.io.File;
import java.util.Arrays;
import java.lang.Math;
import java.io.FileNotFoundException;
import java.io.IOException;
public class Board{
	String[][] board;
	Integer boardSize;
	ArrayList<String> allPieceCodes = new ArrayList<String>();
	ArrayList<Pair<Piece,String>> piecesDown = new ArrayList<Pair<Piece,String>>();
	public Board(int size){
		this.boardSize = size;
		this.board = new String[size][size];
	}
	public Board clone(){
		Board b = new Board(boardSize);
		for (int i = 0; i < boardSize; i++){
			for (int j = 0; j < boardSize; j++){
				b.board[i][j] = cloneString(board[i][j]);
			}
		}
		b.allPieceCodes = new ArrayList<String>(allPieceCodes);
		b.piecesDown = new ArrayList<Pair<Piece,String>>(piecesDown);
		return b;
	}
	public Integer getBoardSize(){
		return boardSize;
	}
	public String[][] getArray(){
		return board;
	}
	public String cloneString(String s){
		return (s == null ? null : new String(s));
	}
	public String getFromCoordinate(int x, int y){
		if (x < boardSize && y < boardSize){
			return board[y][x];
		}
		return null;
	}
	public boolean doesPieceFit(Piece p, boolean test_edges){
		for (Block b : p.blocks){
			int x = b.coordinate.x;
			int y = b.coordinate.y;
			if (x < 0) return false;
			if (y < 0) return false;
			if (x >= boardSize) return false;
			if (y >= boardSize) return false;
			if (board[y][x] != null && !board[y][x].equals("")) return false;
			if (test_edges){
					try{
						if (board[b.coordinate.y+1][b.coordinate.x] != null && !board[b.coordinate.y+1][b.coordinate.x].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y][b.coordinate.x+1] != null && !board[b.coordinate.y][b.coordinate.x+1].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y-1][b.coordinate.x] != null && !board[b.coordinate.y-1][b.coordinate.x].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y][b.coordinate.x-1] != null && !board[b.coordinate.y][b.coordinate.x-1].equals("") ) return false;
					}catch (Exception e){}
			}
		}
		return true;
	}
	public boolean doesPieceFit(Piece p, String pieceCode){
		for (Block b : p.blocks){
			int x = b.coordinate.x;
			int y = b.coordinate.y;
			if (x < 0) return false;
			if (y < 0) return false;
			if (x >= boardSize) return false;
			if (y >= boardSize) return false;
			if (board[y][x] != null && !board[y][x].equals("")) return false;
			try{
				if (board[b.coordinate.y+1][b.coordinate.x].equals(pieceCode)) return false;
			}catch (Exception e){}
			try{
				if (board[b.coordinate.y][b.coordinate.x+1].equals(pieceCode)) return false;
			}catch (Exception e){}
			try{
				if (board[b.coordinate.y-1][b.coordinate.x].equals(pieceCode)) return false;
			}catch (Exception e){}
			try{
				if (board[b.coordinate.y][b.coordinate.x-1].equals(pieceCode)) return false;
			}catch (Exception e){}
		}
		return true;
	}
	public boolean isConnectorFree(Block b, int direction, boolean test_edges){
		switch (direction){
			case 1 :
				if (b.coordinate.x+1 >= boardSize) return false;		
				if (b.coordinate.y+1 >= boardSize) return false;
				if (board[b.coordinate.y+1][b.coordinate.x+1] != null && !board[b.coordinate.y+1][b.coordinate.x+1].equals("")) return false; 
				if (test_edges){
					try{
						if (board[b.coordinate.y+2][b.coordinate.x+1] != null && !board[b.coordinate.y+2][b.coordinate.x+1].equals("") ) return false; 
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y+1][b.coordinate.x+2] != null && !board[b.coordinate.y+1][b.coordinate.x+2].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (!b.starter_block && board[b.coordinate.y][b.coordinate.x+1] != null && !board[b.coordinate.y][b.coordinate.x+1].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (!b.starter_block && board[b.coordinate.y+1][b.coordinate.x] != null && !board[b.coordinate.y+1][b.coordinate.x].equals("") ) return false;
					}catch (Exception e){}
				}
				return true;
			case 2 :
				if (b.coordinate.x+1 >= boardSize) return false;		
				if (b.coordinate.y-1 < 0) return false;
				if (board[b.coordinate.y-1][b.coordinate.x+1] != null && !board[b.coordinate.y-1][b.coordinate.x+1].equals("")) return false; 
				if (test_edges){
					try{
						if (!b.starter_block && board[b.coordinate.y][b.coordinate.x+1] != null && !board[b.coordinate.y][b.coordinate.x+1].equals("") ) return false; 
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y-1][b.coordinate.x+2] != null && !board[b.coordinate.y-1][b.coordinate.x+2].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y-2][b.coordinate.x+1] != null && !board[b.coordinate.y-2][b.coordinate.x+1].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (!b.starter_block && board[b.coordinate.y-1][b.coordinate.x] != null && !board[b.coordinate.y-1][b.coordinate.x].equals("") ) return false;
					}catch (Exception e){}
				}
				return true;
			case 3 :
				if (b.coordinate.x-1 < 0) return false;		
				if (b.coordinate.y-1 < 0) return false;
				if (board[b.coordinate.y-1][b.coordinate.x-1] != null && !board[b.coordinate.y-1][b.coordinate.x-1].equals("")) return false; 
				if (test_edges){
					try{
						if (!b.starter_block && board[b.coordinate.y][b.coordinate.x-1] != null && !board[b.coordinate.y][b.coordinate.x-1].equals("") ) return false; 
					}catch (Exception e){}
					try{
						if (!b.starter_block && board[b.coordinate.y-1][b.coordinate.x] != null && !board[b.coordinate.y-1][b.coordinate.x].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y-2][b.coordinate.x-1] != null && !board[b.coordinate.y-2][b.coordinate.x-1].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y-1][b.coordinate.x-2] != null && !board[b.coordinate.y-1][b.coordinate.x-2].equals("") ) return false;
					}catch (Exception e){}
				}
				return true;
			case 4 :
				if (b.coordinate.x-1 < 0) return false;		
				if (b.coordinate.y+1 >= boardSize) return false;
				if (board[b.coordinate.y+1][b.coordinate.x-1] != null && !board[b.coordinate.y+1][b.coordinate.x-1].equals("")) return false; 
				if (test_edges){
					try{
						if (board[b.coordinate.y+2][b.coordinate.x-1] != null && !board[b.coordinate.y+2][b.coordinate.x-1].equals("") ) return false; 
					}catch (Exception e){}
					try{
						if (!b.starter_block && board[b.coordinate.y+1][b.coordinate.x] != null && !board[b.coordinate.y+1][b.coordinate.x].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (!b.starter_block && board[b.coordinate.y][b.coordinate.x-1] != null && !board[b.coordinate.y][b.coordinate.x-1].equals("") ) return false;
					}catch (Exception e){}
					try{
						if (board[b.coordinate.y+1][b.coordinate.x-2] != null && !board[b.coordinate.y+1][b.coordinate.x-2].equals("") ) return false;
					}catch (Exception e){}
				}
				return true;
		}
		return false;
	}
	public boolean isConnectorFree(Block b, int direction, String pieceCode){
		switch (direction){
			case 1 :
				if (b.coordinate.x+1 >= boardSize) return false;		
				if (b.coordinate.y+1 >= boardSize) return false;
				if (board[b.coordinate.y+1][b.coordinate.x+1] != null && !board[b.coordinate.y+1][b.coordinate.x+1].equals("")) return false; 
				try{
					if (board[b.coordinate.y+2][b.coordinate.x+1].equals(pieceCode)) return false; 
				}catch (Exception e){}
				try{
					if (board[b.coordinate.y+1][b.coordinate.x+2].equals(pieceCode)) return false;
				}catch (Exception e){}
				try{
					if (!b.starter_block && board[b.coordinate.y][b.coordinate.x+1].equals(pieceCode)) return false;
				}catch (Exception e){}
				try{
					if (!b.starter_block && board[b.coordinate.y+1][b.coordinate.x].equals(pieceCode)) return false;
				}catch (Exception e){}
				return true;
			case 2 :
				if (b.coordinate.x+1 >= boardSize) return false;		
				if (b.coordinate.y-1 < 0) return false;
				if (board[b.coordinate.y-1][b.coordinate.x+1] != null && !board[b.coordinate.y-1][b.coordinate.x+1].equals("")) return false; 
				try{
					if (!b.starter_block && board[b.coordinate.y][b.coordinate.x+1].equals(pieceCode)) return false; 
				}catch (Exception e){}
				try{
					if (board[b.coordinate.y-1][b.coordinate.x+2].equals(pieceCode)) return false;
				}catch (Exception e){}
				try{
					if (board[b.coordinate.y-2][b.coordinate.x+1].equals(pieceCode)) return false;
				}catch (Exception e){}
				try{
					if (!b.starter_block && board[b.coordinate.y-1][b.coordinate.x].equals(pieceCode)) return false;
				}catch (Exception e){}
				return true;
			case 3 :
				if (b.coordinate.x-1 < 0) return false;		
				if (b.coordinate.y-1 < 0) return false;
				if (board[b.coordinate.y-1][b.coordinate.x-1] != null && !board[b.coordinate.y-1][b.coordinate.x-1].equals("")) return false; 
				try{
					if (!b.starter_block && board[b.coordinate.y][b.coordinate.x-1].equals(pieceCode)) return false; 
				}catch (Exception e){}
				try{
					if (!b.starter_block && board[b.coordinate.y-1][b.coordinate.x].equals(pieceCode)) return false;
				}catch (Exception e){}
				try{
					if (board[b.coordinate.y-2][b.coordinate.x-1].equals(pieceCode)) return false;
				}catch (Exception e){}
				try{
					if (board[b.coordinate.y-1][b.coordinate.x-2].equals(pieceCode)) return false;
				}catch (Exception e){}
				return true;
			case 4 :
				if (b.coordinate.x-1 < 0) return false;		
				if (b.coordinate.y+1 >= boardSize) return false;
				if (board[b.coordinate.y+1][b.coordinate.x-1] != null && !board[b.coordinate.y+1][b.coordinate.x-1].equals("")) return false; 
				try{
					if (board[b.coordinate.y+2][b.coordinate.x-1].equals(pieceCode)) return false; 
				}catch (Exception e){}
				try{
					if (!b.starter_block && board[b.coordinate.y+1][b.coordinate.x].equals(pieceCode)) return false;
				}catch (Exception e){}
				try{
					if (!b.starter_block && board[b.coordinate.y][b.coordinate.x-1].equals(pieceCode)) return false;
				}catch (Exception e){}
				try{
					if (board[b.coordinate.y+1][b.coordinate.x-2].equals(pieceCode)) return false;
				}catch (Exception e){}
				return true;
		}
		return false;
	}
	public void putPieceOnBoard(Piece p, String pieceCode){
		System.out.println("here");
		piecesDown.add(new Pair<Piece,String>(p,pieceCode));
		//pieces_left.remove(p);
		for (Block b : p.blocks){
			Coord c = b.coordinate;
			board[c.y][c.x] = pieceCode;
		}
	}
	public void putStartingPieceOnBoard(Piece p, String pieceCode){
		allPieceCodes.add(pieceCode);
		piecesDown.add(new Pair<Piece,String>(p,pieceCode));
	}
	public String pieceCodeFromStartingCorner(int startingCorner){
		//Coord c = new Coord((startingCorner == 1 || startingCorner == 2) ? -1 : boardSize, (startingCorner == 2 || startingCorner == 3) ? -1 : boardSize)
		for (Pair<Piece,String> p : piecesDown){
			
		}
		return "";
	}
	public static boolean isNumeric(String str){
    	return str.matches("[+-]?\\d*(\\.\\d+)?");
	}
	public void print(){
		System.out.print("+");
		for (int j = 0; j < boardSize; j++){
			System.out.print(" - ");
		}
		System.out.print("+");
		System.out.println("");
		for (int i = boardSize-1; i >= 0; i--){
			System.out.print("|");
			for (int j = 0; j < boardSize; j++){
				if (board[i][j] != null && board[i][j].length() > 1){
					System.out.print(" " + board[i][j] + "");
				}else if (board[i][j] != null && board[i][j].length() == 1){
					System.out.print(" " + board[i][j] + " ");
				}else{
					System.out.print(" " + ((char)183) + " ");
				}
			}
			System.out.println("|");
		}
		System.out.print("+");
		for (int j = 0; j < boardSize; j++){
			System.out.print(" - ");
		}
		System.out.print("+");
		System.out.println("");
	}
	public void printCleanDisplay(String pieceCode){
		System.out.print("+");
		for (int j = 0; j < boardSize; j++){
			System.out.print(" - ");
		}
		System.out.print("+");
		System.out.println("");
		for (int i = boardSize-1; i >= 0; i--){
			System.out.print("|");
			for (int j = 0; j < boardSize; j++){
				if (board[i][j] != null && board[i][j].length() > 1){
					System.out.print(" " + board[i][j] + "");
				}else if (board[i][j] != null && board[i][j].length() == 1){
					if (board[i][j].equals(pieceCode)){
						System.out.print(" " + ((char)248) + " ");
					}else{
						if (isNumeric(board[i][j])){
							System.out.print(" " + board[i][j] + " ");
						}else{
							System.out.print(" " + ((char)183) + " ");
						}
					}
				}else{
					System.out.print("   ");
				}
			}
			System.out.println("|");
		}
		System.out.print("+");
		for (int j = 0; j < boardSize; j++){
			System.out.print(" - ");
		}
		System.out.print("+");
		System.out.println("");
	}
	public void printOptionsBoard(ArrayList<Pair<Block,Integer>> connectableBlocks){
		ArrayList<Coord> optionCoords = new ArrayList<Coord>();
		int coord_id = 1;
		for (Pair<Block,Integer> p : connectableBlocks){	
			switch (p.getR()){
				case 1 : 
					board[p.getL().coordinate.y+1][p.getL().coordinate.x+1] = Integer.toString(coord_id);
					optionCoords.add(new Coord(p.getL().coordinate.x+1,p.getL().coordinate.y+1));
					break;
				case 2 : 
					board[p.getL().coordinate.y-1][p.getL().coordinate.x+1] = Integer.toString(coord_id);
					optionCoords.add(new Coord(p.getL().coordinate.x+1,p.getL().coordinate.y-1));
					break;
				case 3 : 
					board[p.getL().coordinate.y-1][p.getL().coordinate.x-1] = Integer.toString(coord_id);
					optionCoords.add(new Coord(p.getL().coordinate.x-1,p.getL().coordinate.y-1));
					break;
				case 4 : 
					board[p.getL().coordinate.y+1][p.getL().coordinate.x-1] = Integer.toString(coord_id);
					optionCoords.add(new Coord(p.getL().coordinate.x-1,p.getL().coordinate.y+1));
					break;
			}
			coord_id++;
		}
		print();
		for (Coord coord : optionCoords){ 
			board[coord.y][coord.x] = null;
		}
	}
	public void printOptionsBoard(ArrayList<Pair<Block,Integer>> connectableBlocks, String pieceCode){
		ArrayList<Coord> optionCoords = new ArrayList<Coord>();
		int coord_id = 1;
		for (Pair<Block,Integer> p : connectableBlocks){	
			switch (p.getR()){
				case 1 : 
					board[p.getL().coordinate.y+1][p.getL().coordinate.x+1] = Integer.toString(coord_id);
					optionCoords.add(new Coord(p.getL().coordinate.x+1,p.getL().coordinate.y+1));
					break;
				case 2 : 
					board[p.getL().coordinate.y-1][p.getL().coordinate.x+1] = Integer.toString(coord_id);
					optionCoords.add(new Coord(p.getL().coordinate.x+1,p.getL().coordinate.y-1));
					break;
				case 3 : 
					board[p.getL().coordinate.y-1][p.getL().coordinate.x-1] = Integer.toString(coord_id);
					optionCoords.add(new Coord(p.getL().coordinate.x-1,p.getL().coordinate.y-1));
					break;
				case 4 : 
					board[p.getL().coordinate.y+1][p.getL().coordinate.x-1] = Integer.toString(coord_id);
					optionCoords.add(new Coord(p.getL().coordinate.x-1,p.getL().coordinate.y+1));
					break;
			}
			coord_id++;
		}
		printCleanDisplay(pieceCode);
		for (Coord coord : optionCoords){ 
			board[coord.y][coord.x] = null;
		}
	}
	public ArrayList<Pair<Block,Integer>> getCornerBlocks(){
		ArrayList<Pair<Block,Integer>> result = new ArrayList<Pair<Block,Integer>>();
		for (Pair<Piece,String> p : piecesDown){				
			result.addAll(p.getL().connectable_blocks());
		}
		return result;
	}
	public ArrayList<Pair<Block,Integer>> getCornerBlocks(String pieceCode){
		ArrayList<Pair<Block,Integer>> result = new ArrayList<Pair<Block,Integer>>();
		for (Pair<Piece,String> p : piecesDown){
			if (p.getR().equals(pieceCode)){
				for (Pair<Block,Integer> b : p.getL().connectable_blocks()){
					result.add(b);
				}
				//result.addAll(p.connectable_blocks());
			}
		}
		return result;
	}
	public ArrayList<Pair<Block,Integer>> getConnectableBlocks(ArrayList<Pair<Block,Integer>> corners, String pieceCode){
		ArrayList<Pair<Block,Integer>> result = new ArrayList<Pair<Block,Integer>>();
		for (Pair<Block,Integer> p : corners){	
			if (isConnectorFree(p.getL(),p.getR(),pieceCode)) result.add(p);
		}
		return result;
	}
	public ArrayList<Pair<Block,Integer>> getConnectableBlocks(){
		ArrayList<Pair<Block,Integer>> result = new ArrayList<Pair<Block,Integer>>();
		ArrayList<Pair<Block,Integer>> corners = new ArrayList<Pair<Block,Integer>>();
		corners = getCornerBlocks();
		for (Pair<Block,Integer> p : corners){	
			if (isConnectorFree(p.getL(),p.getR(),true)) result.add(p);
		}
		return result;
	}
	public int getHeight(){ return boardSize; }
	public int getWidth(){ return boardSize; }
	public ArrayList<String> getAllPieceCodes(){ return new ArrayList<String>(allPieceCodes); }
	public void saveScoresToFile(Player... players){
		File workingDir = new File(System.getProperty("user.dir"));
		File scoresDir = new File(workingDir,"scores");
		if (!scoresDir.exists()) scoresDir.mkdir();
		for (int i = 0; i < 0xFFFF; i++){
			if (!(new File(scoresDir,"scores" + i + ".txt").exists())){
				File scoreFile = new File(scoresDir,"scores" + i + ".txt");
				try{
					scoreFile.createNewFile();
				}catch(IOException ioe){
					System.out.println("Caught ioe");
				}
				try(PrintWriter out = new PrintWriter(scoreFile)){
					for (int j = 0; j < Math.min(players.length, 4); j++){
    					out.println(players[j].getStrategy() + "," + blocksOnBoard(players[j].getPieceCode()));
    				}
    				out.close();
				}catch (FileNotFoundException fnfe){
					System.out.println("Caught fnfe");
				}
				break;
			}
		}
	}
	public int blocksOnBoard(String pieceCode){
		int blockCount = 0;
		for (int i = 0; i < boardSize; i++){
			for (int j = 0; j < boardSize; j++){
				if (board[i][j] != null && board[i][j].equals(pieceCode)) blockCount++;
			}
		}
		return blockCount;
	}
	public ArrayList<Piece> getPiecesFromCode(String pieceCode){
		ArrayList<Piece> result = new ArrayList<Piece>();
		for (Pair<Piece,String> p : piecesDown){
			if (p.getR().equals(pieceCode)) result.add(p.getL());
		}
		return result;
	}
}
