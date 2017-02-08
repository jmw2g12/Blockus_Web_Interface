"use strict";

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const java = require('java');
const util = require('util');
const SocketServer = require('ws').Server;
const url = require("url");
const gamecode_length = 4;

const port = process.env.PORT || 3000;

const http = require('http');
const fs = require('fs');
const dropbox = require('dropbox');

const app = express()
  .use(function(req, res){
  	var pathname = url.parse(req.url).pathname;
  	var doc = path.join(__dirname, pathname);
  	res.sendFile(doc);
  })
  .listen(port, () => console.log("Listening on " + port + ".."));

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
	update_user(game){
		//console.log('in message_user function, list size is ' + this.ws_clients.length);
		for (var i = 0; i < this.ws_clients.length; i++){
			if (this.ws_clients[i].readyState == 1){
				console.log('updating user');
				this.ws_clients[i].send(JSON.stringify({
					response: 'game_update',
					data: {
						game: game
					}
				}));
			}
		}
	}
}

class piece_position {
	constructor(piece_code, transform_code, coord){
		this.piece_code = piece_code;
		this.transform_code = transform_code;
		this.coord = coord;
	}
}
class game {
	constructor(gamecode, p1, single_player){
		this.gamecode = gamecode;
		this.p1_board = this.generate_empty_board();
		this.p1_board[board_size-1][0] = 3;
		this.p2_board = this.generate_empty_board();
		this.p2_board[board_size-1][0] = 3;
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
	generate_empty_board(){
		var res = [];
		for (var y = 0; y < board_size; y++){
			res.push([]);
			for (var x = 0; x < board_size; x++){
				res[y].push(0);
			}
		}
		return res;
	}
	rotate_CW(arr){
		var res = [];
		for (var x = 0; x < 5; x++){
			res.push([]);
			for (var y = 4; y >= 0; y--){
				res[x].push(arr[y][x]);
			}
		}
		return res;
	}
	flip_ver(arr){
		var res = [];
		for (var y = 4; y >= 0; y--){
			res.push([]);
			for (var x = 0; x < 5; x++){
				res[4-y].push(arr[y][x]);
			}
		}
		return res;
	}
	rotate_CCW(arr){
		var res = [];
		for (var x = 4; x >= 0; x--){
			res.push([]);
			for (var y = 0; y < 5; y++){
				res[4-x].push(arr[y][x]);
			}
		}
		return res;
	}
	flip_hor(arr){
		var res = [];
		for (var y = 0; y < 5; y++){
			res.push([]);
			for (var x = 4; x >= 0; x--){
				res[y].push(arr[y][x]);
			}
		}
		return res;
	}
	transform(id, code){
		console.log(id + ', ' + code);
		var res = piece_reference[id].slice();
		switch (code){
			case 1:
				return res;
				break;
			case 2:
				return this.rotate_CW(res);
				break;
			case 3:
				return this.rotate_CW(this.rotate_CW(res));
				break;
			case 4:
				return this.rotate_CCW(res);
				break;
			case 5:
				return this.flip_ver(res);
				break;
			case 6:
				return this.rotate_CW(this.flip_ver(res));
				break;
			case 7:
				return this.flip_hor(res);
				break;
			case 8:
				return this.rotate_CW(this.flip_hor(res));
				break;
		}
		return res;
	}
	player_move(username, piece_code, transform_code, coord){ //, ws_client){
		var player_no = this.which_player(username);
		if (this.turn == player_no && !this.has_player_resigned(player_no) && this.is_piece_unused(player_no, piece_code) && this.is_placement_valid(piece_code, transform_code, coord)){
		
			this.place_piece(player_no, piece_code, transform_code, coord);
			this.moves++;
			if (this.turn === 1){
				this.turn = 2;
			}else{
				this.turn = 1;
			}
			
			//update all linked socket clients
			this.update_socket_clients();
			return true;
		}else{
			//reply with error
			return false;
		}
	
	}
	update_socket_clients(){
		user_list[this.p1].update_user(game_list[this.gamecode]);
		if (!this.single_player && this.p2 != null){
			user_list[this.p2].update_user(game_list[this.gamecode]);
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
	is_placement_valid(piece_code, transform_code, coord){
		return true;
	}
	place_piece(player_no, piece_code, transform_code, coord){
		if (piece_code === -1) return false;
		if (player_no == 1){
			this.p1_pieces[piece_code] = new piece_position(piece_code, transform_code, coord);
			//add to board
			var piece = this.transform(piece_code,transform_code);
			var piece_coords = this.set_coords_relative(coord,this.piece_relative_coords(piece));
			//console.log(piece_coords);
			for (var y = 0; y < board_size; y++){
				for (var x = 0; x < board_size; x++){
					if (this.p1_board[y][x] === 3) this.p1_board[y][x] = 0;
				}
			}
			//add new piece
			for (var i = 0; i < piece_coords.length; i++){
				this.p1_board[(piece_coords[i][1]-1)][(piece_coords[i][0]-1)] = 1;
				this.p2_board[board_size-piece_coords[i][1]][board_size-piece_coords[i][0]] = 1;
			}			
			
			//process corners
			this.process_corners(this.p1_board,true);
			console.log('p1 board');
			this.print_array(this.p1_board);
			console.log('p2 board');
			this.print_array(this.p2_board);
		}else if (player_no == 2){
			this.p2_pieces[piece_code] = new piece_position(piece_code, transform_code, coord);
			//add to board
			var piece = this.transform(piece_code,transform_code);
			var piece_coords = this.set_coords_relative(coord,this.piece_relative_coords(piece));
			//console.log(piece_coords);
			for (var y = 0; y < board_size; y++){
				for (var x = 0; x < board_size; x++){
					if (this.p2_board[y][x] === 3) this.p2_board[y][x] = 0;
				}
			}
			//add new piece
			for (var i = 0; i < piece_coords.length; i++){
				this.p1_board[board_size-piece_coords[i][1]][board_size-piece_coords[i][0]] = 2;
				this.p2_board[(piece_coords[i][1]-1)][(piece_coords[i][0]-1)] = 2;
			}			
			
			//process corners
			this.process_corners(this.p2_board,false);
			console.log('p1 board');
			this.print_array(this.p1_board);
			console.log('p2 board');
			this.print_array(this.p2_board);
		}
	}
	print_array(arr){
		var line;
		for (var y = 0; y < arr.length; y++){
			line = '';
			for (var x = 0; x < arr[y].length; x++){
				line = line + ' ' + arr[y][x];
			}
			console.log(line);
		}
	}
	process_corners(board,is_p1){
		for (var y = 0; y < board_size; y++){
			for (var x = 0; x < board_size; x++){
				//console.log('testing at ' + x + ', ' + y);
				if (board[y][x] == 0){ //if idx isn't block of piece
					console.log('testing ' + x + ', ' + y);
					if (this.is_corner(board,x,y,is_p1)) board[y][x] = 3;
				}
			}
		}
		//console.log('res = ' + res);
		return board;
	}
	is_corner(board,x,y,is_p1){
		//has corner
		var block = (is_p1 ? 1 : 2);
		if ((x > 0 && y > 0 && board[y-1][x-1] === block) || (x < (board_size-1) && y > 0 && board[y-1][x+1] === block) || (x < (board_size-1) && y < (board_size-1) && board[y+1][x+1] === block) || (x > 0 && y < (board_size-1) && board[y+1][x-1] === block)){
			console.log('found a corner');
			//does not have face
			if (!(x > 0 && board[y][x-1] === block) && !(x < (board_size-1) && board[y][x+1] === block) && !(y > 0 && board[y-1][x] === block) && !(y < (board_size-1) && board[y+1][x] === block)) return true;
			console.log('but has connecting face');
		}
		return false;
	}
	set_coords_relative(origin,coords){
		var result = [];
		for (var i = 0; i < coords.length; i++){
			result.push([coords[i][0] + origin[0], coords[i][1] + origin[1]]);
		}
		return result;
	}
	piece_relative_coords(piece){
		var rel_x = -1;
		var rel_y = -1;
		for (var y = 0; y < 5; y++){
			for (var x = 0; x < 5; x++){
				if (piece[y][x] == 2){
					rel_x = x;
					rel_y = y;
					y = x = 5;
				}
			}
		}
		var coords = [];
		for (var y = 0; y < 5; y++){
			for (var x = 0; x < 5; x++){
				if (piece[y][x] != 0){
					coords.push([x-rel_x, y-rel_y]);
				}
			}
		}
		return coords;
	}
	resign_player(player_no){
		if (player_no == 1){
			this.p1_resigned = true;
		}else if (player_no == 2){
			this.p2_resigned = true;
		}
	}
	which_player(username){
		if (this.p1 === username){
			return 1;
		}else if (this.p2 === username){
			return 2;
		}else{
			return -1;
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
	get_players(){
		return [this.p1, this.p2];
	}
}


//---
function create_unique_code(length){
	var code = '';
	do{
		code = gen_random_string(length);
	}while (game_list[code] != null);
	return code;
}
function gen_random_string(length){
	var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	
    return text;
}


// -- request functions --
var request_functions = [];

request_functions['place_piece'] = function (message){
	if (game_list[message.gamecode] !== null){
		if (game_list[message.gamecode].player_move(message.username, message.piece_id, message.transform_code, message.coordinates)){
			return JSON.stringify({
				response: 'piece_placed',
				data: {
					game: game_list[message.gamecode]
				}
			});
		}else{
			return JSON.stringify({
				response: 'cant_place',
				data: {
					reason: 'invalid_placement'
				}
			});
		}
	}else{
		return JSON.stringify({
			response: 'cant_place',
			data: {
				reason: 'game_nonexistant'
			}
		});
	}
}
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
	var gamecode = create_unique_code(4);
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
	var gamecode = create_unique_code(gamecode_length);
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