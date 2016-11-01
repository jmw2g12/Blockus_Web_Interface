var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var util = require('util')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Blokus logic
console.log("hello world, you're in the server.js file");
http = require('http');
fs = require('fs');

var board = [];
var turn = 1;
initBoard();
var reply = "post-received";
var dataCount = 0;

function initBoard(){
        for (i = 0; i < 14; i++){
                board.push(new Array(14));
                for (j = 0; j < 14; j++){
                        board[i][j] = 0;
                }
        }
        //console.log("init-ed board = " + board[0]);
}
function boardToMsg(){
        return JSON.stringify(board.concat(turn));
}
function handlePieceMsg(msgJSON){
		console.log("msgJSON = " + msgJSON);
        var msg = JSON.parse(msgJSON);
        var msgGo = parseInt(msg[0]);
        console.log("msg.length = " + msg.length);
        console.log("turn = " + msgGo);

        var blocks = [];
        for (i = 1; i < msg.length; i++){
                var x = msg[i][0];
                var y = msg[i][1];
                blocks.push([x,y]);
        }
        console.log("blocks = " + blocks);
        addPieceToBoard(blocks);
        //go = (msgGo === 1) ? 2 : 1;
}
function addPieceToBoard(piece){
		console.log("addPieceToBoard, turn = " + turn);
        for (i = 0; i < piece.length; i++){
                board[(piece[i][1]-1)][(piece[i][0]-1)] = turn;
        }
        printBoard();
}
function printBoard(){
        for (i = 0; i < board.length; i++){
                console.log("  " + board[i]);
        }
}
function switchTurn(){
		if (turn == 1){
   		 	turn = 2;
    		console.log("turn was 1, changing to " + turn);
    	}else if (turn == 2){
    		turn = 1;
    		console.log("turn was 2, changing to " + turn);
    	}else{
    		console.log("TURN IS NOT 1 OR 2!!! ****");
    	}
}


//Back to server logic

app.get('/', function(req, res) {
	console.dir(req.param);
    console.log("GET");

    var html = fs.readFileSync('index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
})
// app.post('/', function(req, res) {
// 	console.log("in post /");
// 	console.log("current turn = " + turn);
// 	var body = '';
// 	req.on('data', function (data) {
// 		console.log("body data count = " + dataCount);
// 		dataCount++;
//         body += data;
//     });
//     req.on('end', function () {
//     	console.log("Body: " + body);
//     	dataCount = 0;
//         handlePieceMsg(body);
//         switchTurn();
//     });
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     reply = '';
//     res.end(reply);
// })

app.post('/', function(req, res) {
	console.log("*** Placing piece: ***");
	var body = req.body;
	console.log("body = " + util.inspect(body, false, null));
	console.log("starting checks");
	console.log("body.length = " + body.length);
	console.log("Object.keys(data) = " + Object.keys(body));
	console.log("Object.keys(body)[0] = " + Object.keys(body)[0]);
	console.log("Object.keys(body)[0][piece] = " Object.keys(body)[0]["piece"]);
	console.log("finished checks");
	handlePieceMsg(body);
	switchTurn();
	res.writeHead(200, {'Content-Type': 'text/html'});
	reply = boardToMsg();
    res.end(reply);
})

// app.post('/board', function(req, res) {
// 	console.log("in post /board");
// 	console.log("turn = " + turn);
// 	var body = '';
// 	req.on('data', function (data) {
//         body += data;
//     });
//     req.on('end', function () {
//     	console.log("not handling piece. Body: " + body);
//     });
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     reply = boardToMsg();
//     console.log("reply = " + reply);
//     res.end(reply);
// })

app.post('/board', function(req, res) {
	//console.log("request = " + util.inspect(req, false, null));
	//console.log("request = " + util.inspect(res, false, null));
	res.writeHead(200, {'Content-Type': 'text/html'});
	reply = boardToMsg();
    res.end(reply);
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})


/*
//DB logic
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

//var url = 'mongodb://localhost:27017/gamedata';
var url = 'mongodb://jack:password@ds139187.mlab.com:39187/heroku_5l1pksgk';


MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db.close();
});
*/
