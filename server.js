"use strict";

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const java = require('java')
const util = require('util')
const SocketServer = require('ws').Server;
const url = require("url");

const port = process.env.PORT || 3000;
const index = path.join(__dirname, 'index.html');
const comms = path.join(__dirname, 'scripts/comms.js');
const view = path.join(__dirname, 'scripts/view.js');
const splash = path.join(__dirname, 'css/splash.css');
const blokus = path.join(__dirname, 'css/blokus.css');

const http = require('http');
const fs = require('fs');
const dropbox = require('dropbox');

const app = express()
  .use(function(req, res){
  	var pathname = url.parse(req.url).pathname;
  	//console.log(pathname);
  	if (pathname === '/'){
  		res.sendFile(index);
	}else if(pathname == '/scripts/comms.js'){
		res.sendFile(comms);
	}else if(pathname == '/scripts/view.js'){
		res.sendFile(view);
	}else if(pathname == '/css/splash.css'){
		res.sendFile(splash);
	}else if(pathname == '/css/blokus.css'){
		res.sendFile(blokus);
	}else{
		res.sendFile(index);
	}
  })
  .listen(port, () => console.log('Listening on ' + port + '..'));

var board_size = 14;
var piece_count = 21;
var game_list = [];
var user_list = [];
var piece_reference = [
[[0,0,0,0,0],[0,0,0,0,0],[0,0,2,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,0,0,0],[0,2,1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,0,0,0],[0,2,1,1,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,0,0,0],[0,2,1,0,0],[0,1,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,0,0,0],[2,1,1,1,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,2,1,1,0],[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,2,1,0],[0,1,1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,2,1,1,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,2,1,0,0],[0,1,1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,0,0,0],[2,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[2,1,1,1,0],[1,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[2,1,1,1,0],[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,2,1,1,0],[1,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,2,1,1,0],[0,1,1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,2,1,1,0],[0,1,0,1,0],[0,0,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,2,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,2,1,1,0],[0,1,0,0,0],[0,1,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,2,1,0],[0,1,1,0,0],[0,1,0,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,2,1,0],[0,0,1,0,0],[0,1,1,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,2,1,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,0,0,0]],
[[0,0,0,0,0],[0,0,2,0,0],[0,1,1,1,0],[0,0,1,0,0],[0,0,0,0,0]]];

class user {
	constructor(username, password, ws){
		this.username = username;
		this.password = password;
		this.games = [];
		this.ws_clients = [ws];
	}
	add_game(game){
		this.games.push(game);
	}
	add_ws_client(ws){
		this.ws_clients.push(ws);
	}
	message_user(from,text){
		//console.log('in message_user function, list size is ' + this.ws_clients.length);
		for (var i = 0; i < this.ws_clients.length; i++){
			if (this.ws_clients[i].readyState == 1){
				console.log('messaging user');
				this.ws_clients[i].send(JSON.stringify({
					response: 'receive_message',
					data: {
						from_user: from,
						text: text
					}
				}));
				
			}
		}
	}
}

class piece_position {
	constructor(player_no, piece_code, rotation_code, coord){
		this.player_no = player_no;
		this.piece_code = piece_code;
		this.rotation_code = rotation_code;
		this.coord = coord;
	}
}
class game {
	constructor(gamecode, p1, single_player){
		this.gamecode = gamecode;
		this.board = new Array(board_size).fill(new Array(board_size).fill(0));
		this.turn = 1;
		this.moves = 0;
		this.p1 = p1;
		if (single_player){
			this.p2 = '* computer *';
		}else{
			this.p2 = null;
		}
		this.p1_resigned = false;
		this.p2_resigned = false;
		this.p1_pieces = new Array(piece_count).fill(null);
		this.p2_pieces = new Array(piece_count).fill(null);
		this.single_player = single_player;
		//this.java_player
	}
	
	player_moved(player_no, piece_code, rotation_code, coord){ //, ws_client){
	
		if (this.turn == player_no && !this.has_player_resigned(player_no) && this.is_piece_unused(player_no, piece_code) && this.is_placement_valid(piece_code, rotation_code, coord)){
		
			this.place_piece(player_no, piece_code, rotation_code, coord);
			this.moves++;
			
			//update all linked socket clients
			
		}else{
			
			//reply with error
		}
	
	}
	has_player_resigned(player_no){
		if (player_no == 1){
			return this.p1_resigned;
		}else if (player_no == 2){
			return this.p1_resigned;
		}
	}
	is_piece_unused(player_no, piece_code){
		if (player_no == 1){
			return this.p1_pieces[piece_code] == null;
		}else if (player_no == 2){
			return this.p2_pieces[piece_code] == null;
		}
	}
	is_placement_valid(piece_code, rotation_code, coord){
		return true;
	}
	place_piece(player_no, piece_code, rotation_code, coord){
		if (player_no == 1){
			this.p1_pieces[piece_code] = new piece_position(player_no, piece_code, rotation_code, coord);
		}else if (player_no == 2){
			this.p2_pieces[piece_code] = new piece_position(player_no, piece_code, rotation_code, coord);
		}
	}
	update_ws_clients(piece_code, rotation_code, coord){
		for (var i = 0; i < this.ws_clients.length; i++) {
			console.log('updating client ' + i + '..');
			
		}
	}
	resign_player(player_no){
		if (player_no == 1){
			this.p1_resigned = true;
		}else if (player_no == 2){
			this.p2_resigned = true;
		}
	}
	add_p2(username){
		if (this.is_joinable()){
			this.p2 = username;
			return true;
		}else{
			return false;
		}
	}
	is_joinable(){
		return (!this.single_player && this.p2 == null);
	}
	is_player_joined(username){
		return (this.p1 == username || this.p2 == username);
	}
	other_player(username){
		if (this.p1 === username){
			return this.p2;
		}else{
			return this.p1;
		}
	}
}

function create_unique_code(length){
	var code = '';
	do{
		code = gen_random_string(length);
	}while (game_list[code] != null);
	return code;
}
function gen_random_string(length){
	var text = '';
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	
    return text;
}


// -- request functions --
var request_functions = [];

request_functions['msg_user'] = function (message){
	if (user_list[message.to_user] !== null){
		user_list[message.to_user].message_user(message.from_user,message.text);
		return JSON.stringify({
			response: 'msg_sent',
			data: {}
		});
	}else{
		return JSON.stringify({
			response: 'msg_failed',
			data: {}
		});
	}
}
request_functions['start_1p'] = function (message){
	var gamecode = create_unique_code(8);
	var one_player_game = new game(gamecode, message.username, true);
	game_list[gamecode] = one_player_game;
	user_list[message.username].add_game(one_player_game);
	return JSON.stringify({
		response: 'started_1p',
		data: {
			gamecode: gamecode,
			game: game_list[gamecode]
		}
	});
}
request_functions['start_2p'] = function (message){
	var gamecode = create_unique_code(8);
	var two_player_game = new game(gamecode, message.username, false);
	game_list[gamecode] = two_player_game;
	user_list[message.username].add_game(two_player_game);
	return JSON.stringify({
		response: 'started_2p',
		data: {
			gamecode: gamecode,
			game: game_list[gamecode]
		}
	});
}
request_functions['join_game'] = function (message){
	if (game_list[message.gamecode] == null){
		return JSON.stringify({
			response: 'failed_join_game',
			data: {
				reason: 'nonexistant',
				gamecode: message.gamecode
			}
		});
	}
	if (game_list[message.gamecode].is_player_joined(message.username)){
		return JSON.stringify({
			response: 'joined_game',
			data: {
				gamecode: message.gamecode,
				game: game_list[message.gamecode]
			}
		});
	}
	if (game_list[message.gamecode].is_joinable()){
		game_list[message.gamecode].add_p2(message.username);
		user_list[message.username].add_game(game_list[message.gamecode]);
		return JSON.stringify({
			response: 'joined_game',
			data: {
				gamecode: message.gamecode,
				game: game_list[message.gamecode]
			}
		});
	}
	return JSON.stringify({
		response: 'failed_join_game',
		data: {
			reason: 'game_full',
			gamecode: message.gamecode
		}
	});
}
request_functions['login'] = function (message, ws){	
	if (user_list[message.username] == null){
		user_list[message.username] = new user(message.username, message.password, ws);
		
		return JSON.stringify({
			response: 'login_success',
			data: {
				type: 'new_user',
				username: message.username,
				password: message.password,
				games: []
			}
		});
	}else{
		if (user_list[message.username].password === message.password){
			var game_list = user_list[message.username].games;
			user_list[message.username].add_ws_client(ws);
			return JSON.stringify({
				response: 'login_success',
				data: {
					type: 'current_user',
					username: message.username,
					password: message.password,
					games: game_list
				}
			});
		}else{
			return JSON.stringify({
				response: 'login_reject',
				data: {
					type: 'wrong_password',
					username: message.username,
					password: message.password
				}
			});
		}
	}
}


// -- socket logic --
const wss = new SocketServer({ server:app });

wss.on('connection', (ws) => {
  //console.log('Client connected');
  
  ws.on('message', function incoming(message) {
  	var parsed_message = JSON.parse(message);
  	ws.send(request_functions[parsed_message.request](parsed_message.data, ws));
  });
  
  //ws.on('close', () => console.log('Client disconnected'));
});