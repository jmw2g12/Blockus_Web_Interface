/*
	Deals with interfacing between the UI and the controller
*/

function printPieceToViewer(viewerID, piece){ //piece -> screen
	table = document.getElementById(viewerID);
	tableData = "";
	var data = nBorder(piece,1);
	for (y = 0; y < data.length; y++) {
		rowData = "";
		for (x = 0; x < data[y].length; x++){
			if (viewerID === "pieceChoice" && isBlock(data,x,y)){
				var onload = "onclick=\"selectBlock("+x+","+y+")\"";
			}else{
				onload = "";
			}
			rowData += "<td " + ((isBlock(data,x,y)) ? "class=\"viewerblock\" " : "class=\"viewerbackg\" ") + onload + ">#<\/td>";
		}
		tableData += "<tr class=\"pieceViewer\">" + rowData + "<\/tr>";
	}
	table.innerHTML = tableData;
}
function removePieceFromTable(viewerID){
	table = document.getElementById(viewerID);
	tableData = "<tr><td></td></tr>";
	table.innerHTML = tableData;
}
function selectPiece(viewerID){ //screen -> piece
	document.getElementById("flipHorizButton").disabled = false;
	document.getElementById("flipVerticButton").disabled = false;
	document.getElementById("rotateCWButton").disabled = false;
	document.getElementById("rotateCCWButton").disabled = false;
	chosenPiece = getPieceFromTable(viewerID);
	selectedPieceId = viewerID.split("pieceViewer")[1];
	selectedPiece = chosenPiece;
	printPieceToViewer("pieceChoice",chosenPiece);
}
function removePieceFromSet(){
	document.getElementById("pieceViewer" + selectedPieceId).onclick = "";
	removePieceFromTable("pieceViewer" + selectedPieceId);
	document.getElementById("flipHorizButton").disabled = true;
	document.getElementById("flipVerticButton").disabled = true;
	document.getElementById("rotateCWButton").disabled = true;
	document.getElementById("rotateCCWButton").disabled = true;
	piecesRemaining[selectedPieceId-1] = 0;
	selectedPieceId = 0;
	selectedPiece = [[]];
	removePieceFromTable("pieceChoice");
}
function removePieceIDsFromSet(pieces){
	//console.log("removing pieces:  pieces=" + pieces);
	for (i = 0; i < pieces.length; i++){
		if (pieces[i] === 0){
			//console.log("i = " + i + ", piece[i] = " + pieces[i]);
			//console.log("pieces remaining = " + piecesRemaining);
			//if (piecesRemaining[i] !== 0){
			try{
				//console.log("removing piece as piecesRemaining[" + i + "] = " + piecesRemaining[i]);
				document.getElementById("pieceViewer" + pieces[i]).onclick = "";
			}catch(err){}
			try{
				document.getElementById("pieceViewer" + String(i+1)).innerHTML = "<tr><td></td></tr>";
				//console.log("pieceViewer" + String(i+1) + " = " + document.getElementById("pieceViewer" + String(i+1)));
				//removePieceFromTable("pieceViewer" + pieces[i]);
			}catch(err){}
				piecesRemaining[i] = 0;
			//}else{
				//console.log("piece id " + String(i+1) + " has already been changed");
			//}
		}
	}
}
function selectBlock(x,y){ //coords of block in selected-piece viewer
	if (selectedCell != null) selectedCell.className = "viewerblock";
	var selectedPieceTable = document.getElementById("pieceChoice");
	var selectedPieceCell = selectedPieceTable.rows[y].cells[x];
	selectedPieceCell.className = "selectedBlock";
	selectedCell = selectedPieceCell;
	selectedCellId = [x,y];
}
function createDraggable(elem){
	//console.log("createDraggable:");
	clearBoard();
	hoveringBlocks = [];
	if (selectedPieceId === 0) return 0;
	coords = elem.id.split("cell");
	cellX = coords[1].split("-")[0]; //1 to 14 inc.
	cellY = coords[1].split("-")[1];
	
	width = selectedPiece[0].length;
	height = selectedPiece.length;
	
	blockCoords = selectedBlockCoords();
	if (blockCoords === 0) return 0;
	blockX = blockCoords[0];
	blockY = blockCoords[1];
	
	spacesAbove = blockY;
	spacesBelow = height - blockY - 1;
	spacesLeft = blockX;
	spacesRight = width - blockX - 1;
	
	//console.log("piece ready");
	if (parseInt(cellX) + parseInt(spacesRight) > boardSize) return 0;
	if (parseInt(cellX) - parseInt(spacesLeft) <= 0) return 0;
	if (parseInt(cellY) - parseInt(spacesAbove) <= 0) return 0;
	if (parseInt(cellY) + parseInt(spacesBelow) > boardSize) return 0;
	
	var relativeCoords = relativeBlockCoords(blockX,blockY);
	
	var colourCell = true;
	for (i = 0; i < relativeCoords.length; i++){
		hoveringBlocks.push([parseInt(relativeCoords[i][0])+parseInt(cellX),parseInt(relativeCoords[i][1])+parseInt(cellY)]);
		for (var z = 0; z < usedCellCoords.length; z++){
			if (usedCellCoords[z][0] === parseInt(relativeCoords[i][0])+parseInt(cellX) && usedCellCoords[z][1] === parseInt(relativeCoords[i][1])+parseInt(cellY)){
				colourCell = false;
				//console.log("not colourCell " + x + "," + y);
				break;
			}
		}
		if (colourCell) boardCellAtCoords(parseInt(relativeCoords[i][0])+parseInt(cellX),parseInt(relativeCoords[i][1])+parseInt(cellY)).className = "hoverBlock";
		colourCell = true;
		
	}
}
function clearBoard(){
	table = document.getElementById("playingboard");
	var clearCell = true;
	for (var y = 1; y <= boardSize; y++) {
		for (var x = 1; x <= boardSize; x++) {
			for (var z = 0; z < usedCellCoords.length; z++){
				if (usedCellCoords[z][0] === x && usedCellCoords[z][1] === y){
					clearCell = false;
					//console.log("not clearing " + x + "," + y);
					break;
				}
			}
			if (clearCell) boardCellAtCoords(x,y).className = "blankcell";
			clearCell = true;
		}
	}
}
function boardCellAtCoords(x,y){
	return document.getElementById("cell"+x+"-"+y);
}
function updateBoard(){
	for (y = 0; y < boardSize; y++){
		for (x = 0; x < boardSize; x++){
			if (board[y][x] == 1){
				if (boardCellAtCoords(x+1,y+1).className != "usedCellP1"){
					p1CellCoords.push([x+1,y+1]);
					usedCellCoords.push([x+1,y+1]);
				}
				boardCellAtCoords(x+1,y+1).className = "usedCellP1";
			}else if(board[y][x] == 2){
				if (boardCellAtCoords(x+1,y+1).className != "usedCellP2"){
					p2CellCoords.push([x+1,y+1]);
					usedCellCoords.push([x+1,y+1]);
				}
				boardCellAtCoords(x+1,y+1).className = "usedCellP2";
			}
		}
	}
}
function relativeBlockCoords(blockX, blockY){
	var result = [];
	var table = document.getElementById("pieceChoice");
	for (var y = 0, row; row = table.rows[y]; y++) {
		for (var x = 0, col; col = row.cells[x]; x++) {
			if (table.rows[y].cells[x].className === "selectedBlock" || table.rows[y].cells[x].className === "viewerblock"){
				result.push([x-1-blockX,y-1-blockY]);
			}
		}
	}
	return result;
	//console.log(result);
}
function selectedBlockCoords(){
	var table = document.getElementById("pieceChoice");
	//console.log(table);
	for (var y = 0, row; row = table.rows[y]; y++) {
		for (var x = 0, col; col = row.cells[x]; x++) {
			if (table.rows[y].cells[x].className === "selectedBlock"){
				return [x-1,y-1];		
			}
		}
	}
	return 0;
	console.log("No selected block - selectedBlockCoords()");
}
function addPieceToBoard(element){
	console.log("addPieceToBoard: go = " + go);
	var cellClassName = "";

	for (i = 0; i < hoveringBlocks.length; i++){
		usedCellCoords.push(hoveringBlocks[i]);
		boardCellAtCoords(hoveringBlocks[i][0],hoveringBlocks[i][1]).className = (go == 1) ? "usedCellP1" : "usedCellP2";
		console.log("assigning class name as " + boardCellAtCoords(hoveringBlocks[i][0],hoveringBlocks[i][1]).className);
		if (go === 1){
			p1CellCoords.push([hoveringBlocks[i][0],hoveringBlocks[i][1]]);
		}else if (go === 2){
			p2CellCoords.push([hoveringBlocks[i][0],hoveringBlocks[i][1]]);
		}
	}
}