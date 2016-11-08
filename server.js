var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var util = require('util')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

console.log("Hello world, you're in the server.js file");

http = require('http');
fs = require('fs');

var board = [];
var turn = [];
var reply = '';
var passwordList = [];
var pieceSet = [];
var resigned = [];

function initBoard(password){
		board[password] = [];
        for (i = 0; i < 14; i++){
                board[password].push(new Array(14));
                for (j = 0; j < 14; j++){
                        board[password][i][j] = 0;
                }
        }
}
function replyMsg(password){
        return JSON.stringify(board[password].concat(turn[password]).concat(pieceSet[password]).concat(getScores(password)).concat(resigned[password]));
}
function getScores(password){
	var scores = [0,0];
	for (y = 0; y < 14; y++){
		for (x = 0; x < 14; x++){
			var cell = board[password][y][x]
			if (cell == 1){
				scores[0]++;
			}else if(cell == 2){
				scores[1]++;
			}
		}
	}
	return scores;
}
function addPieceToBoard(piece,pieceID,code,password){
        for (i = 0; i < piece.length; i++){
                board[password][(piece[i][1]-1)][(piece[i][0]-1)] = code;
        }
        pieceSet[password][parseInt(code)-1][parseInt(pieceID)-1]=0;
}
function printBoard(password){
        for (i = 0; i < board[password].length; i++){
                console.log("  " + board[password][i]);
        }
}
function switchTurn(password){
		if (turn[password] == 1){
   		 	turn[password] = 2;
    	}else if (turn[password] == 2){
    		turn[password] = 1;
    	}
}
function existsAsPassword(password){
	for (i = 0; i < passwordList.length; i++){
		if (password === passwordList[i]) return true;
	}
	return false;
}
function checkAndHandleNewPassword(password){
	if (!existsAsPassword(password)){
		passwordList.push(password);
		turn[password] = 1;
		resigned[password] = [false, false];
		initBoard(password);
		pieceSet[password] = [[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]];
		return true;
	}else{
		return false;
	}
}


//Server code

app.get('/', function(req, res) {
	console.dir(req.param);
    console.log("GET");

    var html = fs.readFileSync('index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
})

app.post('/', function(req, res) {
	var bodyObject = JSON.parse(Object.keys(req.body)[0]);
	var piece = bodyObject.piece;
	var pieceID = bodyObject.pieceID;
	var playerCode = bodyObject.playerCode;
	var password = bodyObject.password;
	if (!existsAsPassword(password)) console.log("placing this piece has created the game");
	checkAndHandleNewPassword(password);
	addPieceToBoard(piece,pieceID,playerCode,password);
	if (resigned[password][2-parseInt(playerCode)] == false) switchTurn(password);
	res.writeHead(200, {'Content-Type': 'text/html'});
	reply = replyMsg(password);
    res.end(reply);
})

app.post('/newGame', function(req, res) { // *** NOT USED YET ***
	var bodyObject = JSON.parse(Object.keys(req.body)[0]);
	var password = bodyObject.password;
	var index = passwordList.indexOf(password);
	if (index > -1){
		passwordList.splice(index, 1);
		console.log("in /newGame: password = " + password + ", index = " + index + ". Removed this value from passwordList.");
	}else{
		console.log("in /newGame: password = " + password + ", index = " + index + ". Could not remove this value from passwordList.");
	}
	if (checkAndHandleNewPassword(password)){
		console.log("renewed game");
	}else{
		console.log("did not renew game");
	}
	reply = replyMsg(password);
	res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(reply);
})

app.post('/board', function(req, res) {
	var bodyObject = JSON.parse(Object.keys(req.body)[0]);
	var password = JSON.parse(bodyObject)["password"];
	checkAndHandleNewPassword(password);
	reply = replyMsg(password);
	res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(reply);
})

app.post('/resign', function(req, res) {
	var bodyObject = JSON.parse(Object.keys(req.body)[0]);
	var password = bodyObject.password;
	var playerCode = bodyObject.playerCode;
	if (playerCode == turn[password]) switchTurn(password);
	var playerCode = bodyObject.playerCode;
	resigned[password][parseInt(playerCode)-1] = true;
	reply = replyMsg(password);
	res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(reply);
})

app.post('/isGameOver', function(req, res) {
	var bodyObject = JSON.parse(Object.keys(req.body)[0]);
	var password = bodyObject.password;
	if (resigned[password][0] == true && resigned[password][1] == true){
		var reply = JSON.stringify([true].concat(getScores(password)));
	}else{
		var reply = JSON.stringify([false].concat(getScores(password)));
	}
	res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(reply);
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
