import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Random;
import java.lang.Math;

public class HumanPlayer extends Player{
	BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
	final boolean orderedInput = true;
	
	public HumanPlayer(Board board, Random rand, ArrayList<Piece> pieces, String pieceCode, ArrayList<Player> allPlayers, int startingCorner){
		super(board,rand,pieces,pieceCode,allPlayers,startingCorner);
		piecesRemaining = new ArrayList<Piece>(pieces);
		piecesOnBoard = new ArrayList<Piece>();
		strategy = "human";
	}
	public Piece choosePiece(){ //should have no side effects, simply return player's chosen piece.
		scoreBoard(board,startingCorner);
		scoreBoard(board,startingCorner+1);
		scoreBoard(board,startingCorner+2);
		scoreBoard(board,startingCorner+3);
		return acceptUserInput();
	}
	public String[] acceptValues(int numOfConnectors){
		String[] input = {""};
		while(true){
			System.out.println("");
			System.out.println("Please enter: piece - block - connector");
	
			String line = "";
			try{
				line = reader.readLine();
				input = line.split(" ");
			}catch (IOException ioe){
				System.out.println("Invalid input!");
				System.out.println("");
				continue;
			}
			if (input.length >= 3 && isNumeric(input[0]) && isNumeric(input[1]) && isNumeric(input[2])){
				if (Integer.parseInt(input[0]) < piecesRemaining.size() && Integer.parseInt(input[0]) >= 0){
					if (Integer.parseInt(input[1]) < piecesRemaining.get(Integer.parseInt(input[0])).blocks.size() && Integer.parseInt(input[1]) >= 0){
						if (Integer.parseInt(input[2]) <= numOfConnectors && Integer.parseInt(input[2]) >= 1){
							break;
						}else{
							System.out.println("Invalid input! Choose one of the connectors on the board, " + ((numOfConnectors == 1) ? ("of which there is only 1.") : (" from 1 to " + numOfConnectors + ".")));
						}
					}else{
						System.out.println("Invalid input! Piece " + input[0] + " only has " + piecesRemaining.get(Integer.parseInt(input[0])).blocks.size() + ((piecesRemaining.get(Integer.parseInt(input[0])).blocks.size()==1) ? " block." : " blocks."));
					}
				}else{
					System.out.println("Invalid input! Please enter a valid piece ID (<=" + (piecesRemaining.size()-1) + ").");
				}
			}else{
				if (input.length >= 1 && input[0].equals("q")){
					System.out.println('\n' + "Goodbye!" + '\n' + '\n');
					System.exit(0);
				}
				System.out.println("Invalid input! Please enter 3 digits.");
			}
		}
		return input;
	}
	public String[] acceptValuesInOrder(int numOfConnectors, ArrayList<Piece> uniquePieces){
		String[] input = {""};
		String[] result = new String[3];
		Piece chosenPiece;
		ArrayList<Piece> pieceVariations;
		int pieceIndex = 0;
		while(true){
			System.out.println("");
			System.out.println("Please enter piece number");
	
			String line = "";
			try{
				line = reader.readLine();
				input = line.split(" ");
			}catch (IOException ioe){
				System.out.println("Invalid input!");
				System.out.println("");
				continue;
			}
			if (!input[0].equals("") && input.length == 1 && isNumeric(input[0])){
				if (Integer.parseInt(input[0]) < uniquePieces.size() && Integer.parseInt(input[0]) >= 0){
					//Accepted piece is valid, print rotations
					pieceIndex = Integer.parseInt(input[0]);
					System.out.println("Number of variations  = " + uniquePieces.get(Integer.parseInt(input[0])).getAllPieceVariations().size());
					pieceVariations = printPiecesInLine(uniquePieces.get(Integer.parseInt(input[0])).getAllPieceVariations(), 120, 3, 0, false, true);
					System.out.println("Please enter rotation number");
					try{
						line = reader.readLine();
						input = line.split(" ");
					}catch (IOException ioe){
						System.out.println("Invalid input!");
						System.out.println("");
						continue;
					}
					if (!input[0].equals("") && input.length == 1 && isNumeric(input[0])){
						if (Integer.parseInt(input[0]) < pieceVariations.size() && Integer.parseInt(input[0]) >= 0){
							//Accepted rotation is valid, obtain piecesRemaining index of piece
							chosenPiece = pieceVariations.get(Integer.parseInt(input[0]));
							result[0] = Integer.toString(pieceVariations.get(Integer.parseInt(input[0])).findPieceInArrayList(piecesRemaining));
							System.out.println("You chose this piece:");
							piecesRemaining.get(Integer.parseInt(result[0])).printPieceDiagram();
							System.out.println("Please enter block number");
							try{
								line = reader.readLine();
								input = line.split(" ");
							}catch (IOException ioe){
								System.out.println("Invalid input!");
								System.out.println("");
								continue;
							}
							if (!input[0].equals("") && input.length == 1 && isNumeric(input[0]) && Integer.parseInt(input[0]) < chosenPiece.blocks.size() && Integer.parseInt(input[0]) >= 0){
								//Accepted block number is valid
								result[1] = input[0];
								System.out.println('\n' + "Please enter connector number");
								try{
									line = reader.readLine();
									input = line.split(" ");
								}catch (IOException ioe){
									System.out.println("Invalid input!");
									System.out.println("");
									continue;
								}
								if (!input[0].equals("") && input.length == 1 && isNumeric(input[0]) && Integer.parseInt(input[0]) <= numOfConnectors && Integer.parseInt(input[0]) >= 1){
									result[2] = input[0];
									break;
								}else if (!input[0].equals("") && input.length == 1 && (input[0].equals("undo") || input[0].equals("print"))){
									printBoardAndOptions();
									continue;
								}else{
									System.out.println("Invalid input! Choose one of the connectors on the board, " + ((numOfConnectors == 1) ? ("of which there is only 1.") : (" from 1 to " + numOfConnectors + ".")));
								}
							}else if (!input[0].equals("") && input.length == 1 && (input[0].equals("undo") || input[0].equals("print"))){
									printBoardAndOptions();
									continue;
							}else{
								System.out.println("Invalid input! The piece only has " + (((chosenPiece.blocks.size() + chosenPiece.blocks.size()) == 1) ? " block." : " blocks."));
							}
						}else if (!input[0].equals("") && input.length == 1 && (input[0].equals("undo") || input[0].equals("print"))){
									printBoardAndOptions();
									continue;
						}else{
							System.out.println("Invalid input! Please enter a valid rotation ID (<=" + (pieceVariations.size()-1) + ").");
						}
					}else if (!input[0].equals("") && input.length == 1 && (input[0].equals("undo") || input[0].equals("print"))){
						printBoardAndOptions();
						continue;
					}else{
						System.out.println("Invalid input! Too many values or not numeric.");
					}
				}else if (!input[0].equals("") && input.length == 1 && (input[0].equals("undo") || input[0].equals("print"))){
					printBoardAndOptions();
					continue;
				}else{
					System.out.println("Invalid input! Please enter a valid piece ID (<=" + (uniquePieces.size()-1) + ").");
				}
			}else if (!input[0].equals("") && input.length == 1 && (input[0].equals("undo") || input[0].equals("print"))){
				printBoardAndOptions();
				continue;
			}else{
				if (input.length >= 1 && (input[0].equals("q") || input[0].equals("quit"))){
					System.out.println('\n' + "Goodbye!" + '\n' + '\n');
					System.exit(0);
				}
				System.out.println("Invalid input! Too many values or not numeric.");
			}
		}
		return result;
	}
	public Piece acceptUserInput(){
		
		printBoardAndOptions();
		ArrayList<Piece> uniquePieces = getUniquePiecesFromOrderedList(piecesRemaining);
		
		Piece p;
		String[] input = {""};
		while(true){
			input = orderedInput ? acceptValuesInOrder(connectableBlocks.size(),uniquePieces) : acceptValues(connectableBlocks.size());
			p = piecesRemaining.get(Integer.parseInt(input[0])).clone();
			Block bl = p.blocks.get(Integer.parseInt(input[1]));
			Block con = connectableBlocks.get(Integer.parseInt(input[2])-1).getL();
			Integer dir = connectableBlocks.get(Integer.parseInt(input[2])-1).getR();
			
			Coord c = new Coord();
			if (dir == 1){
				c = new Coord(con.coordinate.x+1,con.coordinate.y+1);
			}else if (dir == 2){
				c = new Coord(con.coordinate.x+1,con.coordinate.y-1);
			}else if (dir == 3){
				c = new Coord(con.coordinate.x-1,con.coordinate.y-1);
			}else if (dir == 4){
				c = new Coord(con.coordinate.x-1,con.coordinate.y+1);
			}
			p.place_piece(bl,c);
		
			if (!board.doesPieceFit(p,pieceCode)){
				System.out.println("Please enter the id of a piece that fits!");
			}else{
				System.out.println("");
				break;
			}
		}
		return p;
	}
	public void printBoardAndOptions(){
		System.out.println();
		System.out.println();
		board.printOptionsBoard(connectableBlocks, pieceCode);
		System.out.println();
		printPiecesInLine(piecesRemaining, 120, 3, 0, orderedInput,false);
	}
	
	
	//to check heuristic scores: 		****************************
	
	public int scoreBoard(Board b, int startingCorner){
		int result = 0;
		
		int opportunities = scoreSituation_Opportunities(b,startingCorner);
		
		ArrayList<Piece> playerPieces = b.getPiecesFromCode(allPlayers.get(startingCorner-1).getPieceCode());
		double explorationScore = 0;
		int explorationInt = 0;
		for (Piece p : playerPieces){
			explorationScore += calcExplorationScore(p,startingCorner);
		}
		explorationScore /= playerPieces.size();
		explorationInt = (int)Math.round(explorationScore);
		
		int blocksLeft = numberOfBlocksLeftForPlayer(b,startingCorner);
		
		result = 4*opportunities + explorationInt + 2*(75-blocksLeft);
		
		System.out.println("*****  Scoring Board for Corner " + startingCorner + ":  *****");
		System.out.println("Opportunities = " + opportunities);
		System.out.println("Exploration score = " + explorationInt);
		System.out.println("Blocks left = " + blocksLeft + " (/75)");
		System.out.println("Result = " + result);
		System.out.println("****************************");
		
		return result;
	}
	public int numberOfBlocksLeftForPlayer(Board b, int startingCorner){
		int runningTotal = 76;
		ArrayList<Piece> playerPieces = b.getPiecesFromCode(allPlayers.get(startingCorner-1).getPieceCode());
		for (Piece p : playerPieces){
			runningTotal -= p.blocks.size();
		}
		return runningTotal;
	}
	public int scoreSituation_Opportunities(Board b, int startingCorner){
		return b.getConnectableBlocks(b.getCornerBlocks(pieceCode),pieceCode).size();
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