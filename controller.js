var piecesLoaded = 0;
var selectedPieceId = 0;
var selectedPiece = [[]];	//correctly oriented data
var selectedCell;			//DOM element
var selectedCellId = [];

function addAllPieces(){
	for (i = 1; i <=21; i++){
		piecesLoaded++;
		parsePiece(getNthPiece(i));
	}
}
function printGameInfo(){
	console.log("----------------------------------Game Data----------------------------------");
	console.log("boardData : ");
	printBoard();
	console.log("");
	console.log("go = " + go);
	console.log("turn = " + turn);
	console.log("thisPlayersGo = " + thisPlayersGo);
	console.log("firstMove = " + firstMove);
	console.log("piecesRemaining = " + piecesRemaining);
	console.log("getBoardData : ");
	var bd = getBoardData();
	for (y = 0; y < boardSize; y++){
		console.log(bd[y]);
	}
	console.log("-----------------------------------------------------------------------------");
}
function variableName(variable){
  for (var name in window){
    if (window[name]==variable)
    return(name);
  }
  return("");
}
function out(variable){
	console.log(variable + " = " + window[variable]);
}
function selectGo(){
	var playerNumber = prompt("Please enter player go: (1 or 2)");
	while(true){
		if (playerNumber == 1 || playerNumber == 2){
			return playerNumber;	
		}else{
			playerNumber = prompt("Value must be either 1 or 2, please enter again:");	
		}
	}
}
function selectGameCode(){
	return prompt("Please enter game code:");
}
function updateFirstMove(){
	//console.log("within updateFirstMove()");
	if (typeof board === 'undefined'){
		//console.log("board is undefined");
		return;
	}
	for (var y = 0; y < boardSize; y++) {
		for (var x = 0; x < boardSize; x++) {
			if (typeof board[y][x] !== 'undefined' && board[y][x] == go){
				//console.log("not first move, " + x + ", " + y + " is already used: " + board[y][x]);
				firstMove = false;
				return;
			}
		}
	}
	//console.log("no blocks with code " + go + " found. firstGo = true");
}
function updatePieceList(pieceLists){
	console.log("in function updatePieceList() - " + pieceLists);	
}
function parsePiece(pieceJSON){
	pieceObj = JSON.parse(pieceJSON);
	var pieceData = pieceObj.data;
	printPieceToViewer("pieceViewer"+piecesLoaded,pieceData);
}
function getPieceFromTable(elemID){
	var pieceID = elemID.split("pieceViewer");
	var nthPiece = getNthPiece(elemID.split("pieceViewer")[1]);
	var pieceObj = JSON.parse(nthPiece);
	var pieceData = pieceObj.data;
	return pieceData;
}


function rotateCW(elemID){
	var piece = selectedPiece;     
	var rotPiece = create2DArray(piece[0].length);
	for (y = 0; y < piece.length; y++){
		for (x = 0; x < piece[0].length; x++){
			rotPiece[x][piece.length-1-y] = piece[y][x];
		}
	}
	selectedPiece = rotPiece;
	printPieceToViewer(elemID,rotPiece);    
}
function flipHoriz(elemID){
	var piece = selectedPiece;    
	var flipPiece = create2DArray(piece.length);
	for (y = 0; y < piece.length; y++){
		for (x = 0; x < piece[0].length; x++){
			flipPiece[piece.length-y-1][x] = piece[y][x];
		}
	}
	selectedPiece = flipPiece;
	printPieceToViewer(elemID,flipPiece);    
}
function rotateCCW(elemID){
	var piece = selectedPiece;    
	var rotPiece = create2DArray(piece[0].length);
	for (y = 0; y < piece.length; y++){
		for (x = 0; x < piece[0].length; x++){
			rotPiece[piece[0].length-1-x][y] = piece[y][x];
		}
	}
	selectedPiece = rotPiece;
	printPieceToViewer(elemID,rotPiece);    
}
function flipVertic(elemID){
	var piece = selectedPiece;    
	var flipPiece = create2DArray(piece.length);
	for (y = 0; y < piece.length; y++){
		for (x = 0; x < piece[0].length; x++){
			flipPiece[y][piece[0].length-1-x] = piece[y][x];
		}
	}
	selectedPiece = flipPiece;
	printPieceToViewer(elemID,flipPiece);    
}


function create2DArray(y) {
	var arr = [];
	for (var i=0;i<y;i++) {
		arr[i] = [];
	}
	return arr;
}
function nBorder(data, n){
	var padded = create2DArray(2*n+data.length);
	for (y = 0; y < data.length+2*n; y++){
		for (x = 0; x < data[0].length+2*n; x++){
			if (isBlock(data,x-n,y-n)){
				padded[y][x]=1;
			}else{
				padded[y][x]=0;
			}
		}
	}
	return padded;
}
function isBlock(piece,x,y){
	if (x < 0 || y < 0 || x >= piece[0].length || y >= piece.length || piece[y][x]!=1){
		return false;
	}else{
		return true;
	}
}
function getCellValue(element){
	if (element.className == "usedCellP1") return 1;
	if (element.className == "usedCellP2") return 2;
	if (element.className == "blankcell") return 0;
	console.log("CLASS NAME ERRROR: " + element.className);
}
function getBoardData(){
	clearBoard();
	var data = [];
	for (y = 1; y <= boardSize; y++){
		data.push([]);
		for (x = 1; x <= boardSize; x++){
			var cellValue = getCellValue(boardCellAtCoords(x,y));
			data[y-1].push(cellValue);
		}
	}
	//console.log(data);
	return data;
}
function getBoardValue(x,y){
	if (x >= 1 && x <= boardSize && y >= 1 && y <= boardSize) return boardData[y-1][x-1];
	return -1;
	//console.log("out of bounds!");
}



//blokus logic
function placePiece(element){
	//printBoard();
	//console.log("turn = " + turn + ",  go = " + go);
	board = getBoardData();
	//console.log("in placePiece");
	//console.log("turn = " + turn + ",  go = " + go);
	if (turn != go) return;
	var newPiece = hoveringBlocks;
	clearBoard();
	//console.log("testing whether piece is overlapping");
	if (isOverlapping(newPiece)) return;
	//console.log("testing whether piece is touching another's edge");
	if (isTouchingEdge(newPiece)) return;
	//console.log("testing whether piece is connected at corner");
	if (!isConnectedAtCorner(newPiece)) return;
	//console.log("checks okay");
	firstMove = false;
	//console.log("go = " + go);
	addPieceToBoard(element);
	sendPieceToServer(newPiece);
	turn++;
	boardData = getBoardData();
	removePieceFromSet();
	thisPlayersGo = false;
}
function printBoard(){
	var boardLine = "";
	for (i = 0; i < boardSize; i++){
		for (j = 0; j < boardSize; j++){
			boardLine += boardData[i][j];
		}
		//console.log(boardLine);
		boardLine = "";
	}
}
function isOverlapping(piece){
	for (i = 0; i < piece.length; i++){
		for (j = 0; j < usedCellCoords.length; j++){
			//console.log(piece[i] + " compared to " + usedCellCoords[j]);
			if (piece[i][0] === usedCellCoords[j][0] && piece[i][1] === usedCellCoords[j][1]){
				return true;
			}
		}
	}
	return false;
}
function isTouchingEdge(piece){
	for (i = 0; i < piece.length; i++){
		//console.log("Testing piece #" + i + " at (" + piece[i][0] + "," + piece[i][1] + ") which is previously " + getBoardValue(piece[i][0],piece[i][1]));
		pX = piece[i][0];
		pY = piece[i][1];
		//console.log("testing board value 
		if (getBoardValue(pX,pY+1) == go) return true; 
		if (getBoardValue(pX+1,pY) == go) return true; 
		if (getBoardValue(pX,pY-1) == go) return true; 
		if (getBoardValue(pX-1,pY) == go) return true; 
	}
	return false;
}
function isConnectedAtCorner(piece){
	//console.log("firstMove = " + firstMove);
	if (firstMove){
		for (i = 0; i < piece.length; i++){
			pX = piece[i][0];
			pY = piece[i][1];
			//console.log("does " + pX + ", " + pY + " match " + playersStartingCorners[go-1][0] + ", " + playersStartingCorners[go-1][1]);
			if (pX === playersStartingCorners[go-1][0] && pY === playersStartingCorners[go-1][1]) return true;
		}
	}else{
		for (i = 0; i < piece.length; i++){
			//console.log("Testing piece #" + i + " at (" + piece[i][0] + "," + piece[i][1] + ") which is previously " + getBoardValue(piece[i][0],piece[i][1]));
			pX = piece[i][0];
			pY = piece[i][1];
			//console.log("pX = " + pX + ", pY = " + pY);
			//console.log("x+1, y+1 = " + getBoardValue(pX+1,pY+1)); 
			//console.log("x+1, y-1 = " + getBoardValue(pX+1,pY-1)); 
			//console.log("x-1, y+1 = " + getBoardValue(pX-1,pY+1)); 
			//console.log("x-1, y-1 = " + getBoardValue(pX-1,pY-1)); 
			//printBoard();
			//console.log("pX = " + pX + ", pY = " + pY + " in coords from 1 to 14");
			//console.log("pX+1,pY+1 = (" + String(pX+1) + ", " + String(pY+1) + ") = " + getBoardValue(pX+1,pY+1));
			if (getBoardValue(pX+1,pY+1) == go) return true;
			
			//console.log("pX+1,pY-1 = (" + String(pX+1) + ", " + String(pY-1) + ") = " + getBoardValue(pX+1,pY-1));
			if (getBoardValue(pX+1,pY-1) == go) return true; 
			
			//console.log("pX-1,pY+1 = (" + String(pX-1) + ", " + String(pY+1) + ") = " + getBoardValue(pX-1,pY+1));
			if (getBoardValue(pX-1,pY+1) == go) return true; 
			
			//console.log("pX-1,pY-1 = (" + String(pX-1) + ", " + String(pY-1) + ") = " + getBoardValue(pX-1,pY-1));
			if (getBoardValue(pX-1,pY-1) == go) return true; 
		}
	}
	return false;
}