http = require('http');
fs = require('fs');
var board = [];
var go = 1;
initBoard();
var reply = "post-received";
server = http.createServer( function(req, res) {

    console.dir(req.param);

    if (req.method == 'POST') {
        console.log("POST");
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            console.log("Body: " + body);
            handleMsg(body);
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        reply = boardToMsg();
        console.log("reply = " + reply);
        res.end(reply);
    }else{
        console.log("GET");
        
        var html = fs.readFileSync('index.html');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    }

});
function initBoard(){
	for (i = 0; i < 14; i++){
		board.push(new Array(14));
		for (j = 0; j < 14; j++){
			board[i][j] = 0;
		}
	}
	//console.log("init-ed board = " + board[0]);
}
function handleMsg(msg){
	//console.log("handleMsg:  JSON.parse(msg)[0] = " + JSON.parse(msg)[0]);
	if (JSON.parse(msg)[0] === "board"){
		console.log("returning board");
	}else{
		handlePieceMsg(msg);
	}
}
function boardToMsg(){
	return JSON.stringify(board.concat(go));
}
function handlePieceMsg(msgJSON){
	var msg = JSON.parse(msgJSON);
	var msgGo = parseInt(msg[0]);
	console.log("msg.length = " + msg.length);
	console.log("go = " + msgGo);

	var blocks = [];
	for (i = 1; i < msg.length; i++){
		var x = msg[i][0];
		var y = msg[i][1];
		blocks.push([x,y]);
	}
	console.log("blocks = " + blocks);
	addPieceToBoard(blocks);
	go = (msgGo === 1) ? 2 : 1;
}
function addPieceToBoard(piece){
	for (i = 0; i < piece.length; i++){
		board[(piece[i][1]-1)][(piece[i][0]-1)] = go;
	}
	printBoard();
}
function printBoard(){
	for (i = 0; i < board.length; i++){
		console.log("  " + board[i]);
	}
}

port = 8080;
host = 'localhost';
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
