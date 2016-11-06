function sendPieceToServer(piece){
	var http = new XMLHttpRequest();
	var params = createPieceMsg(piece);
	http.open("POST", document.URL, true);

	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if (http.readyState == 4 && http.status == 200) {
			//console.log(http.responseText);
		}
	}
	http.send(params);
}
function newGame(){
	var http = new XMLHttpRequest();
	var req = createBoardMsg();
	var params = JSON.stringify(req);
	http.open("POST", (document.URL + "newGame"), true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {
		if (http.readyState == 4 && http.status == 200) {
			//console.log(http.responseText);
		}
	}
	http.send(params);
}
function fetchBoard(){
	
	board = getBoardData();
	
	var http = new XMLHttpRequest();
	var req = createBoardMsg();
	console.log("fetchboard");
	//console.log("fetchBoard:  params[fetch] = " + params["fetch"]);
	var params = JSON.stringify(req);
	http.open("POST", (document.URL + "board"), true);

	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		console.log("fetchBoard cb");
		if (http.readyState == 4 && http.status == 200) {
			//console.log(http.responseText);
			var endOfBoard = boardSize - 1;
			board = JSON.parse(http.responseText).slice(0,endOfBoard+1);
			//console.log("board = " + board);
			//console.log("board.length = " + board.length);
			//console.log("returned turn = " + JSON.parse(http.responseText)[endOfBoard+1]);
			turn = JSON.parse(http.responseText)[endOfBoard+1];
			var pieceList = JSON.parse(http.responseText)[endOfBoard+1+parseInt(go)];
			//console.log("player 1's list = " + JSON.parse(http.responseText)[endOfBoard+2]);
			//console.log("player 2's list = " + JSON.parse(http.responseText)[endOfBoard+3]);
			//console.log("this players's list = " + pieceList);
			var scores = JSON.parse(http.responseText)[endOfBoard+3+parseInt(go)];
			updateScores(scores);
			updateBoard();
			updateFirstMove();
			removePieceIDsFromSet(pieceList);
			console.log(" /fetchBoard cb");
		}
	}

	http.send(params);
}
function createPieceMsg(pieceData){
	return JSON.stringify({piece : pieceData, playerCode : go, password : gameCode, pieceID : selectedPieceId});
}
function createBoardMsg(){
	return JSON.stringify({password : gameCode});
}