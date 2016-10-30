function sendPieceToServer(piece){
	var http = new XMLHttpRequest();
	var params = createMsg(piece);
	http.open("POST", document.URL, true);

	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if (http.readyState == 4 && http.status == 200) {
			//console.log(http.responseText);
		}
	}
	http.send(params);
}
function fetchBoard(){
	var http = new XMLHttpRequest();
	var req = ["board"];
	//console.log("params = " + params);
	//console.log("fetchBoard:  params[fetch] = " + params["fetch"]);
	var params = JSON.stringify(req);
	http.open("POST", document.URL, true);

	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if (http.readyState == 4 && http.status == 200) {
			console.log(http.responseText);
			board = JSON.parse(http.responseText).slice(0,JSON.parse(http.responseText).length);
			console.log("returned go = " + JSON.parse(http.responseText)[JSON.parse(http.responseText).length-1]);
			turn = JSON.parse(http.responseText)[JSON.parse(http.responseText).length-1];
			updateBoard();
		}
	}

	http.send(params);
}
function pieceToMsg(piece){
	var str = "";
	str += go;
	for (i = 0; i < piece.length; i++){
		str += ":";
		str += (piece[i][0] + "," + piece[i][1]);
	}
	//console.log("str = " + str);
	return str;
}
function createMsg(piece){
	var msgInfo = [go];
	msgInfo = msgInfo.concat(piece);
	//console.log(JSON.stringify(msgInfo));
	return JSON.stringify(msgInfo);
}