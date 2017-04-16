import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Random;
public class Blokus{
	final int boardSize = 14;
	final int maxPieceSize = 5;

	ArrayList<Piece> pieces = new ArrayList<Piece>();
	ArrayList<Player> players = new ArrayList<Player>();
	Random rand = new Random();
	Board board = new Board(boardSize);
	Boolean moveMade = false;
	
	public Blokus(){
	
		initPieces();
		
		rand = new Random(System.currentTimeMillis());
		Player p1,p2;
		
		p1 = generatePlayer("web","1",1);
		p2 = generatePlayer("smcts_50_heat","2",3);
		
		players.add(p1);
		players.add(p2);
		
		board.setPlayers(players);
		board.setPieces(pieces);
		
		//System.out.println("players.size() = " + players.size());
		
	}
	public boolean hasCompResigned(){
		return players.get(1).isFinished() || !board.doesPlayerHaveRemainingMoves(players.get(1));
	}
	public boolean hasCompFinished(){
		return moveMade;
	}
	public void resetCompMoveFlag(){
		moveMade = false;
	}
	public Blokus webMove(Object[] newBoard){
		this.moveMade = false;
		((WebPlayer)players.get(0)).takeMove(newBoard);
		return this;
	}
	public void compMove(){
		//System.out.println("comp taking move from java");
		board.setCurrentPlayer(players.get(1));
		players.get(1).takeMove();
		//System.out.println("finished move");
		moveMade = true;
	}
	public Player getP1(){
		return players.get(0);
	}
	public Player getP2(){
		return players.get(1);
	}
	public void printBoard(){
		board.print();
	}
	public String[][] getBoardArray(){
		return board.getArray();
	}
	public class InvalidPlayerException extends Exception{
		public InvalidPlayerException (String msg){
			super(msg);
		}
	}
	public Player generatePlayer(String strategy, String pieceCode, int corner){
		Player p;
		if (strategy.equals("human")){
			return new HumanPlayer(board,rand,pieces,pieceCode,players,corner);
		}else if (strategy.equals("random")){
			return new RandomPlayer(board,rand,pieces,pieceCode,players,corner);
		}else if (strategy.equals("explorer")){
			return new ExplorerPlayer(board,rand,pieces,pieceCode,players,corner);
		}else if (strategy.equals("web")){
			return new WebPlayer(board,rand,pieces,pieceCode,players,corner);
		}else if (strategy.startsWith("mcts")){
			//e.g. mcts100binary for 100 iterations and binary scoring. mcts1000 for 100 iterations and difference scoring
			return new MCTSPlayer(board,rand,pieces,pieceCode,players,corner,Integer.parseInt(strategy.split("mcts")[1].replaceAll("\\D+","")),strategy.split("mcts")[1].replaceAll("\\d+","").equals("binary"));
		}else if (strategy.equals("heuristic")){
			return new HeuristicPlayer(board,rand,pieces,pieceCode,players,corner);
		}else if (strategy.startsWith("smcts")){
			return new SmartMCTSPlayer(board,rand,pieces,pieceCode,players,corner,Integer.parseInt(strategy.split("_")[1]),strategy.split("_")[2].equals("binary"),strategy.split("_")[strategy.split("_").length-1]);
		}
		System.out.println("*** Invalid player strategy given! ***");
		return null;
	}
	public void printAllPieces(){
		int counter = 0;
		for (Piece p : pieces){
			System.out.println("Piece " + counter + ": ");
			p.print_piece();
			System.out.println("");
			counter++;
		}
	}
	public void initPieces(){
		Block b1 = new Block();
		Block b2 = new Block();
		Block b3 = new Block();
		Block b4 = new Block();
		Block b5 = new Block();
		pieces.add(new Piece(b1));
		pieces.get(pieces.size()-1).pieceNumber = 0;
		
		if (maxPieceSize == 1) return;
		
		
		b1 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		pieces.add(new Piece(b1,b2));
		pieces.get(pieces.size()-1).pieceNumber = 1;
		
		b1 = new Block();
		b2 = new Block();
		b1.add_left(b2);
		b2.add_right(b1);
		pieces.add(new Piece(b1,b2));
		pieces.get(pieces.size()-1).pieceNumber = 1;
		
		if (maxPieceSize == 2) return;
		
		
		b1 = new Block();
		b2 = new Block();
		b1.add_right(b2);
		b2.add_left(b1);
		b2.add_bottom(b3);
		b3.add_top(b2);
		pieces.add(new Piece(b1,b2,b3));
		pieces.get(pieces.size()-1).pieceNumber = 2;	
			
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_left(b3);
		b3.add_right(b2);
		pieces.add(new Piece(b1,b2,b3));
		pieces.get(pieces.size()-1).pieceNumber = 2;
				
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_right(b3);
		b3.add_left(b2);
		pieces.add(new Piece(b1,b2,b3));
		pieces.get(pieces.size()-1).pieceNumber = 2;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b1.add_left(b2);
		b2.add_right(b1);
		b2.add_bottom(b3);
		b3.add_top(b2);
		pieces.add(new Piece(b1,b2,b3));
		pieces.get(pieces.size()-1).pieceNumber = 2;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_bottom(b3);
		b3.add_top(b2);
		pieces.add(new Piece(b1,b2,b3));
		pieces.get(pieces.size()-1).pieceNumber = 3;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b1.add_left(b2);
		b2.add_right(b1);
		b2.add_left(b3);
		b3.add_right(b2);
		pieces.add(new Piece(b1,b2,b3));
		pieces.get(pieces.size()-1).pieceNumber = 3;
		
		if (maxPieceSize == 3) return;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.connectLeft(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 4;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 4;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectBottom(b4);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 4;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectTop(b4);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 4;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_bottom(b3);
		b3.add_top(b2);
		b3.add_right(b4);
		b4.add_left(b3);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 4;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_bottom(b3);
		b3.add_top(b2);
		b3.add_left(b4);
		b4.add_right(b3);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 4;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_left(b2);
		b2.add_right(b1);
		b2.add_left(b3);
		b3.add_right(b2);
		b3.add_top(b4);
		b4.add_bottom(b3);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 4;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_left(b2);
		b2.add_right(b1);
		b2.add_left(b3);
		b3.add_right(b2);
		b3.add_bottom(b4);
		b4.add_top(b3);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 4;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_right(b2);
		b1.add_bottom(b4);
		b2.add_left(b1);
		b2.add_bottom(b3);
		b3.add_top(b2);
		b3.add_left(b4);
		b4.add_right(b3);
		b4.add_top(b1);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 5;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_right(b2);
		b2.add_left(b1);
		b2.add_top(b3);
		b3.add_bottom(b2);
		b2.add_right(b4);
		b4.add_left(b2);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 6;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_right(b2);
		b2.add_left(b1);
		b2.add_bottom(b3);
		b3.add_top(b2);
		b2.add_right(b4);
		b4.add_left(b2);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 6;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_left(b3);
		b3.add_right(b2);
		b2.add_bottom(b4);
		b4.add_top(b2);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 6;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_right(b3);
		b3.add_left(b2);
		b2.add_bottom(b4);
		b4.add_top(b2);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 6;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_right(b2);
		b2.add_left(b1);
		b2.add_bottom(b3);
		b3.add_top(b2);
		b3.add_right(b4);
		b4.add_left(b3);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 7;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_right(b2);
		b2.add_left(b1);
		b2.add_top(b3);
		b3.add_bottom(b2);
		b3.add_right(b4);
		b4.add_left(b3);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 7;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_left(b3);
		b3.add_right(b2);
		b3.add_bottom(b4);
		b4.add_top(b3);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 7;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.add_bottom(b2);
		b2.add_top(b1);
		b2.add_right(b3);
		b3.add_left(b2);
		b3.add_bottom(b4);
		b4.add_top(b3);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 7;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectRight(b4);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 8;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		pieces.add(new Piece(b1,b2,b3,b4));
		pieces.get(pieces.size()-1).pieceNumber = 8;
		
		if (maxPieceSize == 4) return;
		
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 2a
		b1.connectBottom(b2);
		b2.connectLeft(b3);
		b2.connectBottom(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 9;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 2a
		b1.connectBottom(b2);
		b2.connectLeft(b3);
		b3.connectBottom(b4);
		b2.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 9;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 2a
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectRight(b4);
		b3.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 9;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 2a
		b1.connectBottom(b2);
		b2.connectLeft(b3);
		b3.connectBottom(b4);
		b3.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 9;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 2b
		b1.connectBottom(b2);
		b2.connectRight(b3);
		b2.connectBottom(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 9;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 2b
		b1.connectTop(b2);
		b2.connectLeft(b3);
		b3.connectTop(b4);
		b2.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 9;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 2b
		b1.connectLeft(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b3.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 9;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 2b
		b1.connectTop(b2);
		b2.connectLeft(b3);
		b3.connectTop(b4);
		b3.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 9;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 3
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectRight(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 10;
		
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 3
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 10;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 4a
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectBottom(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 11;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 4a
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 11;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 4a
		b1.connectLeft(b2);
		b2.connectLeft(b3);
		b3.connectTop(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 11;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 4a
		b1.connectTop(b2);
		b2.connectTop(b3);
		b3.connectRight(b4);
		b4.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 11;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 4
		b1.connectLeft(b2);
		b2.connectLeft(b3);
		b3.connectBottom(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 11;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 4
		b1.connectTop(b2);
		b2.connectTop(b3);
		b3.connectLeft(b4);
		b4.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 11;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 4
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectTop(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 11;
	
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 4
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectRight(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 11;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 5
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectRight(b4);
		b3.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 12;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 5
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b3.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 12;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 5
		b1.connectLeft(b2);
		b2.connectLeft(b3);
		b3.connectLeft(b4);
		b3.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 12;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 5
		b1.connectTop(b2);
		b2.connectTop(b3);
		b3.connectTop(b4);
		b3.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 12;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 5
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectRight(b4);
		b3.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 12;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 5
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b3.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 12;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 5
		b1.connectLeft(b2);
		b2.connectLeft(b3);
		b3.connectLeft(b4);
		b3.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 12;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 5
		b1.connectTop(b2);
		b2.connectTop(b3);
		b3.connectTop(b4);
		b3.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 12;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 6
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectTop(b1);
		b1.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 13;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 6
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectTop(b1);
		b2.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 13;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 6
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectTop(b1);
		b2.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 13;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 6
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectTop(b1);
		b3.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 13;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 6
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectTop(b1);
		b3.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 13;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 6
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectTop(b1);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 13;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 6
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectTop(b1);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 13;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 6
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectTop(b1);
		b1.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 13;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 7
		b1.connectRight(b2);
		b2.connectRight(b3);
		b2.connectBottom(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 14;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 7
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b2.connectLeft(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 14;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 7
		b1.connectLeft(b2);
		b2.connectLeft(b3);
		b2.connectTop(b4);
		b4.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 14;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 7
		b1.connectTop(b2);
		b2.connectTop(b3);
		b2.connectRight(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 14;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 8
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectRight(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 15;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 8
		b1.connectBottom(b2);
		b2.connectLeft(b3);
		b3.connectBottom(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 15;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 8
		b1.connectLeft(b2);
		b2.connectTop(b3);
		b3.connectLeft(b4);
		b4.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 15;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 8
		b1.connectTop(b2);
		b2.connectRight(b3);
		b3.connectTop(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 15;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 9
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectBottom(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 16;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 9
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectLeft(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 16;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 9
		b1.connectLeft(b2);
		b2.connectLeft(b3);
		b3.connectTop(b4);
		b4.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 16;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 9
		b1.connectTop(b2);
		b2.connectTop(b3);
		b3.connectRight(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 16;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 10
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 17;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 10
		b1.connectBottom(b2);
		b2.connectLeft(b3);
		b3.connectLeft(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 17;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 10
		b1.connectLeft(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 17;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 10
		b1.connectBottom(b2);
		b2.connectRight(b3);
		b3.connectRight(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 17;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 11
		b1.connectLeft(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 18;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 11
		b1.connectBottom(b2);
		b2.connectLeft(b3);
		b3.connectLeft(b4);
		b4.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 18;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 11
		b1.connectRight(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 18;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 11
		b1.connectTop(b2);
		b2.connectRight(b3);
		b3.connectRight(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 18;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 12a
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectRight(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 19;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 12a
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 19;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 12a
		b1.connectLeft(b2);
		b2.connectLeft(b3);
		b3.connectLeft(b4);
		b4.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 19;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 12a
		b1.connectTop(b2);
		b2.connectTop(b3);
		b3.connectTop(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 19;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 12b
		b1.connectRight(b2);
		b2.connectRight(b3);
		b3.connectRight(b4);
		b4.connectTop(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 19;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 12b
		b1.connectBottom(b2);
		b2.connectBottom(b3);
		b3.connectBottom(b4);
		b4.connectRight(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 19;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 12b
		b1.connectLeft(b2);
		b2.connectLeft(b3);
		b3.connectLeft(b4);
		b4.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 19;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 12b
		b1.connectTop(b2);
		b2.connectTop(b3);
		b3.connectTop(b4);
		b4.connectLeft(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 19;
		
		b1 = new Block();
		b2 = new Block();
		b3 = new Block();
		b4 = new Block();
		b5 = new Block();
		//*** 13
		b1.connectBottom(b2);
		b2.connectLeft(b3);
		b2.connectRight(b4);
		b2.connectBottom(b5);
		pieces.add(new Piece(b1,b2,b3,b4,b5));
		pieces.get(pieces.size()-1).pieceNumber = 20;
	}
	public void printCharacters(int to){
		System.out.println("----Start----");
		for (int i = 0; i <= to; i++){
			System.out.println(i + ":    " + ((char)i));
		}
		System.out.println("----End----");
	}

}
