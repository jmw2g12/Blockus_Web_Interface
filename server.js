var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))


//Blokus logic
console.log("hello world, you're in the server.js file");
http = require('http');
fs = require('fs');

var board = [];
var go = 1;
initBoard();
var reply = "post-received";

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


//Back to server logic

app.get('/', function(req, res) {
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
