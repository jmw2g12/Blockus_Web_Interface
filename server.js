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

const app = express().use(function(req, res){
  	var pathname = url.parse(req.url).pathname;
  	var doc = path.join(__dirname, pathname);
  	res.sendFile(doc);
  })
  .use('/favicon.ico', express.static('images/favicon.ico'))
  .listen(port, () => console.log("Listening on " + port + ".."));
  
process.on('uncaughtException', function (err) {
	data_to_dropbox('error_at_');
	console.log('*** Error occurred *** : ' + err);
})

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
		this.game_codes = [];
		this.games_played = 0;
		if (ws){
			this.ws_clients = [ws];
		}else{
			this.ws_clients = [];
		}
	}
	set_game_codes(game_codes){
		this.game_codes = game_codes;
	}
	set_games_played(played){
		this.games_played = played;
	}
	add_game(game){
		this.game_codes.push(game.gamecode);
	}
	remove_game(gamecode){
		var index = this.game_codes.indexOf(gamecode);
		if (index > -1) {
			this.games_played++;
			this.game_codes.splice(index, 1);
			//console.log('removing game : ' + gamecode + ' from user : ' + this.username);
		}
	}
	get_games(){
		var games = [];
		for (var i = 0; i < this.game_codes.length; i++){
			games.push(game_list[this.game_codes[i]]);
		}
		return games;
	}
	add_ws_client(ws){
		this.ws_clients.push(ws);
	}
	message_user(from,text){
		//console.log('in message_user function, list size is ' + this.ws_clients.length);
		for (var i = 0; i < this.ws_clients.length; i++){
			if (this.ws_clients[i].readyState === 1){
				//console.log('messaging user');
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
	update_user(game, msg){
		//console.log('in message_user function, list size is ' + this.ws_clients.length);
		for (var i = 0; i < this.ws_clients.length; i++){
			if (this.ws_clients[i].readyState == 1){
				//console.log('updating user');
				this.ws_clients[i].send(JSON.stringify({
					response: msg,
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
		this.game_over = false;
		this.move_record = "";
		//this.java_player
	}
	set_game_configuration(p2, p1_board, p2_board, turn, moves, p1_resigned, p2_resigned, p1_pieces, p2_pieces, game_over, move_record){
		this.p2 = p2;
		this.p1_board = p1_board;
		this.p2_board = p2_board;
		this.turn = turn;
		this.moves = moves;
		this.p1_resigned = p1_resigned;
		this.p2_resigned = p2_resigned;
		this.p1_pieces = p1_pieces;
		this.p2_pieces = p2_pieces;
		this.game_over = game_over;
		this.move_record = move_record;
	}
	player_scores(board){
		var p1_score = 0;
		var p2_score = 0;
		for (var y = 0; y < board.length; y++){
			for (var x = 0; x < board[0].length; x++){
				if (board[y][x] === 1) p1_score++;
				if (board[y][x] === 2) p2_score++;
			}
		}
		return [p1_score, p2_score];
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
		//console.log(id + ', ' + code);
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
		var player_resigned;
		if (player_no === 1){
			player_resigned = this.p1_resigned;
			//console.log('player_no = 1, player_resigned = ' + player_resigned);
		}
		if (player_no === 2){
			player_resigned = this.p2_resigned;
			//console.log('player_no = 2, player_resigned = ' + player_resigned);
		
		}
		if (this.turn == player_no && !player_resigned && this.is_piece_unused(player_no, piece_code) && this.is_placement_valid(piece_code, transform_code, coord)){
		
			this.place_piece(player_no, piece_code, transform_code, coord);
			this.moves++;
			if (this.turn === 1){
				if (!this.p2_resigned) this.turn = 2;
			}else{
				if (!this.p1_resigned) this.turn = 1;
			}
			
			//update all linked socket clients
			this.update_socket_clients('game_update');
			return true;
		}else{
			//reply with error
			//console.log('');
			//console.log('invalid placement checks:');
			//console.log('player ' + player_no + ' attempted to go. it is player ' + this.turn + ' go.');
			//console.log('have players resigned ?  p1_resigned = ' + this.p1_resigned + ',  p2_resigned = ' + this.p2_resigned);
			//console.log('attempted to place piece ' + piece_code + '. is it unused ? ' + this.is_piece_unused(player_no, piece_code));
			//console.log('is the placement valid ? ' + this.is_placement_valid(piece_code, transform_code, coord));
			//console.log('');
			return false;
		}
	
	}
	update_socket_clients(msg){
		//console.log('sending update message : ' + JSON.stringify(game_list[this.gamecode]));
		user_list[this.p1].update_user(game_list[this.gamecode],msg);
		if (!this.single_player && this.p2 != null){
			user_list[this.p2].update_user(game_list[this.gamecode],msg);
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
		//so far client makes appropriate checks. write this function if required later
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
			this.move_record = this.move_record.concat('1: ');
			for (var i = 0; i < piece_coords.length; i++){
				this.p1_board[(piece_coords[i][1]-1)][(piece_coords[i][0]-1)] = 1;
				this.p2_board[board_size-piece_coords[i][1]][board_size-piece_coords[i][0]] = 1;
				this.move_record = this.move_record.concat(String(board_size-piece_coords[i][0]), ',', String(board_size-piece_coords[i][1]), ';');
			}			
			this.move_record = this.move_record.concat('\n');
			
			//process corners
			this.process_corners(this.p1_board,true);
			//console.log('p1 board');
			//this.print_array(this.p1_board);
			//console.log('p2 board');
			//this.print_array(this.p2_board);
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
			this.move_record = this.move_record.concat('2: ');
			for (var i = 0; i < piece_coords.length; i++){
				this.p1_board[board_size-piece_coords[i][1]][board_size-piece_coords[i][0]] = 2;
				this.p2_board[(piece_coords[i][1]-1)][(piece_coords[i][0]-1)] = 2;
				this.move_record = this.move_record.concat(String(board_size-piece_coords[i][0]), ',', String(board_size-piece_coords[i][1]), ';');
			}
			this.move_record = this.move_record.concat('\n');
			
			//process corners
			this.process_corners(this.p2_board,false);
			//console.log('p1 board');
			//this.print_array(this.p1_board);
			//console.log('p2 board');
			//this.print_array(this.p2_board);
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
					//console.log('testing ' + x + ', ' + y);
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
			//console.log('found a corner');
			//does not have face
			if (!(x > 0 && board[y][x-1] === block) && !(x < (board_size-1) && board[y][x+1] === block) && !(y > 0 && board[y-1][x] === block) && !(y < (board_size-1) && board[y+1][x] === block)) return true;
			//console.log('but has connecting face');
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
			this.turn = 2;
			if (this.p2_resigned) this.finish_game();
		}else if (player_no == 2){
			this.p2_resigned = true;
			this.turn = 1;
			if (this.p1_resigned) this.finish_game();
		}
	}
	finish_game(){
		this.update_socket_clients('game_over');
		this.game_over = true;
		//console.log(this.move_record);
		game_to_dropbox(this);
		//remove game from array to improve server performance
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
function game_to_dropbox(game){
	//console.log(game);
	//console.log('sending file to dropbox');
	var dbx = new dropbox({ accessToken: 'wOqCJGXuP6AAAAAAAAAAEyvlOLYxd9Tu4CJWwOcZzisddCY1MVyZtOAa2eJzE4zo' });
	
	// need to find an appropriate data storage system
	//var contents = JSON.stringify(game_list[gamecode]);
	var contents = '';
	contents = contents.concat('1: ', game.p1, ';', '\n');
	contents = contents.concat('2: ', game.p2, ';', '\n');
	contents = contents.concat(game.move_record);
	//
	
	var d = new Date();
    var n = d.getTime();
	var path = '/BlokusData/' + game.gamecode + '/' + n + '.txt';
	//console.log("path = " + path);
	dbx.filesUpload({ path: path, contents: contents })
      .then(function (response) {
        //console.log(response);
      })
      .catch(function (err) {
        //console.log(err);
      });
    //console.log("leaving send file to dropbox function");
}
function data_to_dropbox(name){
	//console.log('sending all game and user data to dropbox');
	var dbx = new dropbox({ accessToken: 'wOqCJGXuP6AAAAAAAAAAEyvlOLYxd9Tu4CJWwOcZzisddCY1MVyZtOAa2eJzE4zo' });
	var d = new Date();
	var n = '';
    if (name){
    	n = name + d.getTime();
    }else{
    	n = d.getTime();
    }
	var user_path = '/BlokusData/backup/' + n + '_users.txt';
	var game_path = '/BlokusData/backup/' + n + '_games.txt';
	var user_contents = arrayToJSON(user_list);
	var game_contents = arrayToJSON(game_list);
	//console.log('user_contents : ' + user_contents);
	//console.log('game_contents : ' + game_contents);
	dbx.filesUpload({ path: user_path, contents: user_contents })
      .then(function (response) {
        //console.log(response);
      })
      .catch(function (err) {
        //console.log(err);
      });
    dbx.filesUpload({ path: game_path, contents: game_contents })
      .then(function (response) {
        //console.log(response);
      })
      .catch(function (err) {
        //console.log(err);
      });
}
function arrayToJSON(arr){
	var result = '[';
	for(var code in arr) {
		if(arr.hasOwnProperty(code) && arr[code] !== null){
			result += JSON.stringify(arr[code],replacer);
			result += ',';
		}
	}
	if (result.slice(-1) === ',') result = result.slice(0, -1);
	result += ']';
	return result;
}
function replacer(key,value){
    switch (key){
    	case 'ws_clients':
    		return [];
    	default:
    		return value;
	}
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
					reason: 'invalid_placement',
					game: game_list[message.gamecode]
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
request_functions['resign'] = function (message){
	//console.log('resign message from player in gamecode ' + message.gamecode);
	if (game_list[message.gamecode] !== null && game_list[message.gamecode].is_player_joined(message.username)){
		var game = game_list[message.gamecode];
		//var game = JSON.parse(JSON.stringify(game_list[message.gamecode]));
		game_list[message.gamecode].resign_player(game_list[message.gamecode].which_player(message.username));
		if (game.game_over){
			user_list[message.username].remove_game(message.gamecode);
			user_list[game_list[message.gamecode].other_player(message.username)].remove_game(message.gamecode);
			delete game_list[message.gamecode];
		}
		return JSON.stringify({
			response: 'resigned',
			data: {
				game: game
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
	var code = message.gamecode.toUpperCase();
	if (game_list[code] == null){
		return JSON.stringify({
			response: 'failed_join_game',
			data: {
				reason: 'nonexistant',
				gamecode: code
			}
		});
	}
	if (game_list[code].is_player_joined(message.username)){
		return JSON.stringify({
			response: 'joined_game',
			data: {
				gamecode: code,
				game: game_list[code]
			}
		});
	}
	if (game_list[code].is_joinable()){
		game_list[code].add_p2(message.username);
		user_list[message.username].add_game(game_list[code]);
		return JSON.stringify({
			response: 'joined_game',
			data: {
				gamecode: code,
				game: game_list[code]
			}
		});
	}
	return JSON.stringify({
		response: 'failed_join_game',
		data: {
			reason: 'game_full',
			gamecode: code
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
			var game_list = user_list[message.username].get_games();
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
request_functions['backup_data'] = function (message, ws){
	data_to_dropbox();
	return JSON.stringify({
		response: 'backup_requested'
	});
}
request_functions['print_users'] = function (message, ws){
	console.log('request to print all users : ');
	for (var username in user_list){
		if (user_list.hasOwnProperty(username)){
			console.log(username + ' : ' + util.inspect(user_list[username],{depth: 1}));
		}
	}
	return JSON.stringify({
		response: 'users_printed'
	});
}
request_functions['print_user'] = function (message, ws){
	console.log('request to print single user (' + message.username + ') : ');
	if (user_list.hasOwnProperty(message.username)){
		console.log(util.inspect(user_list[message.username],{depth: 1}));
		return JSON.stringify({
			response: 'user_printed'
		});
	}else{
		return JSON.stringify({
			response: 'user_nonexistant'
		});
	}
}
request_functions['print_game'] = function (message, ws){
	console.log('request to print single game (' + message.gamecode + ') : ');
	if (game_list.hasOwnProperty(message.gamecode)){
		console.log(JSON.stringify(game_list[message.gamecode]));
		return JSON.stringify({
			response: 'game_printed'
		});
	}else{
		return JSON.stringify({
			response: 'game_nonexistant'
		});
	}
}
request_functions['print_games'] = function (message, ws){
	console.log('request to print all games');
	for (var gamecode in game_list){
		if (game_list.hasOwnProperty(gamecode)){
			console.log(gamecode + ' : ' + JSON.stringify(game_list[gamecode]));
			console.log('');
		}
	}
	return JSON.stringify({
		response: 'games_printed'
	});
}


// -- socket logic --
const wss = new SocketServer({ server:app });

wss.on('connection', (ws) => {
  //console.log('Client connected : ' + Object.keys(ws));
  //console.log(ws.hasOwnProperty('_closeTimer') + ', _closeTimer = ' + ws['_closeTimer']);
  ws['_closeTimer'] = -1;
  
  ws.on('message', function incoming(message) {
  	var parsed_message = JSON.parse(message);
  	ws.send(request_functions[parsed_message.request](parsed_message.data, ws));
  });
  
  //ws.on('close', () => console.log('Client disconnected'));
});
setInterval(function(){
	wss.clients.forEach(function each(client) {
		if (client.readyState === 1) {
			//console.log('pinging client');
			client.send(JSON.stringify({
			response: 'ping',
			data: {}
		}));
		}
	});
}, 40*1000);
setInterval(function(){
	data_to_dropbox();
}, 12*60*60*1000);


// -- load previous data --
var backup_user_list = [{"username":"a","password":"a","game_codes":["SGOP"],"games_played":0,"ws_clients":[]},{"username":"b","password":"b","game_codes":["SGOP"],"games_played":0,"ws_clients":[]},{"username":"c","password":"a","game_codes":["OIRG"],"games_played":0,"ws_clients":[]},{"username":"jack","password":"Pass","game_codes":[],"games_played":0,"ws_clients":[]},{"username":"chickenmum","password":"Chicken1","game_codes":["FCEC"],"games_played":0,"ws_clients":[]},{"username":"asdjnas","password":"dksfndks","game_codes":[],"games_played":0,"ws_clients":[]},{"username":"jackw","password":"asdas","game_codes":["FCEC"],"games_played":0,"ws_clients":[]}];
var backup_game_list = [{"gamecode":"SGOP","p1_board":[[0,0,0,0,0,0,0,0,0,0,0,0,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,2,0],[0,0,0,0,0,0,0,0,0,0,0,2,2,0],[0,0,0,0,0,0,0,0,0,0,2,0,0,0],[0,0,0,0,0,0,0,2,2,2,2,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,3,0,0,0,0,3,0,0,0,0,0],[0,0,0,0,1,1,1,1,0,0,0,0,0,0],[0,3,0,0,0,1,0,0,3,0,0,0,0,0],[0,0,1,1,1,0,3,0,0,0,0,0,0,0],[0,3,0,1,0,3,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0],[1,1,1,0,3,0,0,0,0,0,0,0,0,0],[1,0,1,0,0,0,0,0,0,0,0,0,0,0]],"p2_board":[[0,0,0,0,0,0,0,0,0,0,0,1,0,1],[0,0,0,0,0,0,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,3,0,0,0,0,3,0,0,0,0,0,0],[0,0,0,2,2,2,2,0,0,0,0,0,0,0],[3,0,0,2,0,0,0,3,0,0,0,0,0,0],[0,2,2,0,3,0,0,0,0,0,0,0,0,0],[0,2,0,3,0,0,0,0,0,0,0,0,0,0],[2,2,0,0,0,0,0,0,0,0,0,0,0,0]],"turn":2,"moves":5,"p1":"a","p2":"b","p1_resigned":true,"p2_resigned":false,"p1_pieces":[null,null,null,null,null,null,null,null,null,null,null,{"piece_code":11,"transform_code":1,"coord":[5,8]},null,null,{"piece_code":14,"transform_code":1,"coord":[1,13]},{"piece_code":15,"transform_code":1,"coord":[3,10]},null,null,null,null,null],"p2_pieces":[null,null,null,null,null,null,null,null,null,null,{"piece_code":10,"transform_code":1,"coord":[4,10]},null,null,null,null,null,null,null,{"piece_code":18,"transform_code":1,"coord":[2,12]},null,null],"single_player":false,"game_over":false,"move_record":"1: 13,1;12,1;11,1;13,0;11,0;\n2: 12,2;11,2;12,1;13,0;12,0;\n1: 11,4;10,4;9,4;10,3;10,2;\n2: 10,4;9,4;8,4;7,4;10,3;\n1: 9,6;8,6;7,6;6,6;8,5;\n"},{"gamecode":"OIRG","p1_board":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0,0,0,0,0,0]],"p2_board":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0,0,0,0,0,0]],"turn":1,"moves":0,"p1":"c","p2":null,"p1_resigned":false,"p2_resigned":false,"p1_pieces":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"p2_pieces":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"single_player":false,"game_over":false,"move_record":""},{"gamecode":"FCEC","p1_board":[[0,0,0,0,0,0,0,0,0,0,0,0,2,2],[0,3,0,0,0,3,0,0,0,0,0,0,2,0],[0,0,1,1,1,0,0,2,0,0,0,2,2,0],[0,0,1,1,2,2,2,2,0,0,2,0,0,0],[0,3,0,0,1,1,0,0,2,2,2,0,0,0],[0,0,3,0,1,0,0,0,3,0,2,0,0,0],[0,0,0,1,1,0,1,1,0,2,0,0,0,0],[0,0,3,0,0,1,1,0,3,2,2,0,0,0],[0,0,0,3,0,0,1,0,2,2,0,0,0,0],[0,0,3,0,1,1,0,3,0,0,0,0,0,0],[0,0,0,1,1,0,3,0,0,0,0,0,0,0],[0,3,0,1,0,3,0,0,0,0,0,0,0,0],[1,0,1,0,3,0,0,0,0,0,0,0,0,0],[1,1,1,0,0,0,0,0,0,0,0,0,0,0]],"p2_board":[[0,0,0,0,0,0,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,0,0,0,0,0,1,0,1],[0,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,1,0,0,0],[0,0,0,3,0,0,3,0,1,1,0,0,0,0],[0,0,3,0,2,2,0,1,0,0,0,0,0,0],[0,0,0,2,2,0,3,1,1,0,0,0,0,0],[0,0,3,0,2,0,1,1,0,1,1,0,0,0],[0,0,0,2,0,0,3,0,0,1,0,0,0,0],[0,0,0,2,2,2,0,0,1,1,3,0,0,0],[3,0,0,2,0,0,2,2,2,2,1,1,0,0],[0,2,2,0,3,0,2,0,0,1,1,1,0,0],[0,2,0,3,0,3,0,3,0,0,0,0,0,0],[2,2,0,0,0,0,0,0,0,0,0,0,0,0]],"turn":2,"moves":9,"p1":"chickenmum","p2":"jackw","p1_resigned":false,"p2_resigned":false,"p1_pieces":[null,null,null,null,null,null,null,null,null,null,null,null,null,{"piece_code":13,"transform_code":1,"coord":[3,3]},{"piece_code":14,"transform_code":3,"coord":[3,14]},null,null,{"piece_code":17,"transform_code":1,"coord":[5,10]},{"piece_code":18,"transform_code":1,"coord":[5,5]},{"piece_code":19,"transform_code":1,"coord":[7,7]},null],"p2_pieces":[null,null,null,null,null,null,null,null,null,null,{"piece_code":10,"transform_code":1,"coord":[7,11]},null,null,null,null,{"piece_code":15,"transform_code":4,"coord":[4,11]},null,null,{"piece_code":18,"transform_code":1,"coord":[2,12]},{"piece_code":19,"transform_code":1,"coord":[5,6]},null],"single_player":false,"game_over":false,"move_record":"1: 13,1;11,1;13,0;12,0;11,0;\n2: 12,2;11,2;12,1;13,0;12,0;\n1: 9,4;8,4;10,3;9,3;10,2;\n2: 10,5;10,4;9,4;8,4;10,3;\n1: 7,7;6,7;8,6;7,6;7,5;\n2: 7,3;6,3;5,3;4,3;7,2;\n1: 9,9;8,9;9,8;10,7;9,7;\n2: 9,8;8,8;10,7;9,7;9,6;\n1: 11,11;10,11;9,11;11,10;10,10;\n"}];

backup_user_list.forEach(function(backup_user){
	user_list[backup_user.username] = new user(backup_user.username, backup_user.password);
	user_list[backup_user.username].set_game_codes(backup_user.game_codes);
	if (backup_user.games_played) user_list[backup_user.username].set_games_played(backup_user.games_played);
});
backup_game_list.forEach(function(backup_game){
	game_list[backup_game.gamecode] = new game(backup_game.gamecode, backup_game.p1, backup_game.single_player);
	game_list[backup_game.gamecode].set_game_configuration(backup_game.p2, backup_game.p1_board, backup_game.p2_board, backup_game.turn, backup_game.moves, backup_game.p1_resigned, backup_game.p2_resigned, backup_game.p1_pieces, backup_game.p2_pieces, backup_game.game_over, backup_game.move_record);
});