"use strict";

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const java = require('java');
const util = require('util');
const SocketServer = require('ws').Server;
const url = require("url");
const gamecode_length = 4;

const port = process.env.PORT || 4000;

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
	console.log('*** Error occurred *** : ' + util.inspect(err));
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


/*
 *	A user class is made for every user that logs in
 *	Holds web sockets so they can be contacted without request when the game is updated
*/

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
		for (var i = 0; i < this.ws_clients.length; i++){
			if (this.ws_clients[i].readyState === 1){
				this.ws_clients[i].send(JSON.stringify({
					response: 'receive_message',
					data: {
						from_user: from,
						text: text
					}
				},replacer));
				
			}
		}
	}
	update_user(game, msg){
		for (var i = 0; i < this.ws_clients.length; i++){
			if (this.ws_clients[i].readyState == 1){
				this.ws_clients[i].send(JSON.stringify({
					response: msg,
					data: {
						game: game
					}
				},replacer));
			}
		}
	}
}

/*
 *	Used as an encapsulation of piece position variables
*/
class piece_position {
	constructor(piece_code, transform_code, coord){
		this.piece_code = piece_code;
		this.transform_code = transform_code;
		this.coord = coord;
	}
}

/*
 *	A game class is made for every game created, can be against computer or other user
 *	2 player updates the board and sends back to both players
 *  1 player has to update the java game object, solicit a move and replies to the user
 *	To avoid a heavy blocking function, computer move done asynchronously. This requires
 *	polling to check if complete
*/
class game {

	constructor(gamecode, p1, single_player){
		this.gamecode = gamecode;
		this.p1_board = this.generate_empty_board();
		this.p1_board[board_size-1][0] = 3;
		this.p2_board = this.generate_empty_board();
		this.p2_board[board_size-1][0] = 3;
		this.turn = 1;
		this.moves = 0;
		this.p1_resigned = false;
		this.p2_resigned = false;
		this.p1_pieces = new Array(piece_count).fill(null);
		this.p2_pieces = new Array(piece_count).fill(null);
		this.single_player = single_player;
		this.game_over = false;
		this.move_record = "";
		if (single_player){
			var blokusConstructor = java.import("Blokus");
			this.java_game = new blokusConstructor();
			this.comp_strategy = this.get_random_strategy();
			this.java_game.setCompStrategySync(this.comp_strategy);
			if (Math.random() < 0.5){
				this.humanP1 = true;
				this.p1 = p1;
				this.p2 = '* computer *';
				this.java_game.setHumanP1Sync();
				this.java_human = this.java_game.getP1Sync();
				this.java_computer = this.java_game.getP2Sync();
				this.intervalFunc = null;
			}else{
				this.humanP1 = false;
				this.p1 = '* computer *';
				this.p2 = p1;
				this.java_game.setCompP1Sync();
				this.java_computer = this.java_game.getP1Sync();
				this.java_human = this.java_game.getP2Sync();
				this.java_game.compMove(function(err, result){
					if (err) console.log(err);
				});
				this.intervalFunc = setInterval(this.computer_move_check.bind(this),3000);
			}
		}else{
			this.p1 = p1;
			this.p2 = null;
		}
	}
	
	//	Used to choose a weighted random computer opponent for 1 player games
	get_random_strategy(){
		var weights = [];
		var strategies = [];
		
		weights[0] = 1;
		strategies[0] = 'exploration';
		
		weights[1] = 3;
		strategies[1] = 'mcts_playout_10000_1.0_heat_difference_max';
		
		weights[2] = 3;
		strategies[2] = 'mcts_playout_10000_1.0_policy_difference_max';
		
		weights[3] = 3;
		strategies[3] = 'mcts_playout_60000_1.0_heat_difference_max';
		
		weights[4] = 3;
		strategies[4] = 'mcts_playout_60000_1.0_policy_difference_max';
		
		var totalWeights = 0;
		for (var i = 0; i < weights.length; i++){
			totalWeights += weights[i];
		}
		
		var rnd = Math.random() * totalWeights;
		var idx = -1;
		for (var i = 0; i < weights.length; i++){
			if (rnd < weights[i]){
				idx = i;
				break;
			}else{
				rnd = rnd - weights[i];
			}
		}
		return strategies[idx];
	}
	
	// This function is used to load in games from backups
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
	
	//	Transform changes the orientation of a piece
	transform(id, code){
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
	
	//	Called when a move has been made by a user
	player_move(username, piece_code, transform_code, coord){
		
		var player_no = this.which_player(username);
		var player_resigned;
		if (player_no === 1){
			player_resigned = this.p1_resigned;
		}
		if (player_no === 2){
			player_resigned = this.p2_resigned;
		
		}
		if (this.turn == player_no && !player_resigned && this.is_piece_unused(player_no, piece_code)){
		
			this.place_piece(player_no, piece_code, transform_code, coord);
			this.moves++;
			if (this.turn === 1){
				if (!this.p2_resigned) this.turn = 2;
			}else{
				if (!this.p1_resigned) this.turn = 1;
			}
			
			this.update_socket_clients('game_update');	
				
			if (this.single_player){
				this.make_web_player_move();
				this.intervalFunc = setInterval(this.computer_move_check.bind(this),3000);
			}
			return true;
		}else{
			return false;
		}
	
	}
	
	//	Obtains the new board after
	set_board_after_computer_move(newBoard){
		var board = this.generate_empty_board();
		for (var y = 0; y < newBoard.length; y++){
			for (var x = 0; x < newBoard.length; x++){
				if (this.humanP1){
					if (newBoard[13-y][x] == 1 || newBoard[13-y][x] == 2) board[y][x] = parseInt(newBoard[13-y][x]);
				}else{
					if (newBoard[y][13-x] == 1 || newBoard[y][13-x] == 2) board[y][x] = parseInt(newBoard[y][13-x]);
				}
			}
		}
		if (this.humanP1){
			this.update_computer_move_record(board,this.p2_board);
			this.p1_board = this.process_corners(JSON.parse(JSON.stringify(board)),true);
			this.p2_board = this.process_corners(JSON.parse(JSON.stringify(board)),false);
		}else{
			this.update_computer_move_record(board,this.p1_board);
			this.p1_board = this.transpose(this.process_corners(JSON.parse(JSON.stringify(board)),true));
			this.p2_board = this.process_corners(JSON.parse(JSON.stringify(board)),false);
		}
	}
	
	transpose(board){
		var transposed = this.generate_empty_board();
		for (var y = 0; y < board.length; y++){
			for (var x = 0; x < board.length; x++){
				transposed[13-y][13-x] = board[y][x];
			}
		}
		return transposed;
	}
	
	update_computer_move_record(new_board,old_board){
		if (this.humanP1){
			this.move_record = this.move_record.concat('2: ');
		}else{
			this.move_record = this.move_record.concat('1: ');
		}
		for (var y = 0; y < new_board.length; y++){
			for (var x = 0; x < new_board.length; x++){
				if (this.humanP1){
					if (new_board[y][x] == 2 && old_board[y][x] != 2){
						this.move_record = this.move_record.concat(String(x), ',', String(y), ';');
					}
				}else{
					if (new_board[y][x] == 1 && old_board[y][x] != 1){
						this.move_record = this.move_record.concat(String(x), ',', String(y), ';');
					}
				}
			}
		}			
		this.move_record = this.move_record.concat('\n');
	}
	
	//	Tests whether the computer has finished computing its move
	computer_move_check(){
		if (this.java_game.hasCompFinishedSync()){
			this.moves++;
			this.java_game.resetCompMoveFlagSync();
			this.set_board_after_computer_move(this.java_game.getBoardArraySync());
			if (this.humanP1){
				this.p2_resigned = this.java_game.hasCompResignedSync();
				if (!this.p1_resigned) this.turn = 1;
				this.update_socket_clients('game_update');
				if (this.p1_resigned && !this.p2_resigned){
					this.java_game.compMove(function(err,result){
						if (err) console.log(err);
					});
				}else{
					clearInterval(this.intervalFunc);
				}
			}else{
				this.p1_resigned = this.java_game.hasCompResignedSync();
				if (!this.p2_resigned) this.turn = 2;
				this.update_socket_clients('game_update');
				if (this.p2_resigned && !this.p1_resigned){
					this.java_game.compMove(function(err,result){
						if (err) console.log(err);
					});
				}else{
					clearInterval(this.intervalFunc);
				}
			}
			if (this.p1_resigned && this.p2_resigned){
				clearInterval(this.intervalFunc);
				this.finish_game();
			}
		}
	}
	
	make_web_player_move(){
		this.java_game.webMove(this.neutral_board(),function(err, result) {
			if (err) console.log(err);
			result.compMove(function(err, result){
				if (err) console.log(err);
			});
		});
	}
	
	//	Player one and player two boards have the available corners on,
	//	neutral board only has each players' blocks
	neutral_board(){
		var board = JSON.parse(JSON.stringify(this.p1_board));
		for (var y = 0; y < board_size; y++){
			for (var x = 0; x < board_size; x++){
				if (board[y][x] == 3){
					board[y][x] = 0;
				}
			}
		}
		return board;
	}
	
	update_socket_clients(msg){
		if (this.p1 != '* computer *'){
			user_list[this.p1].update_user(game_list[this.gamecode],msg);
		}
		if (this.p2 != '* computer *' && this.p2 != null){
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
	
	place_piece(player_no, piece_code, transform_code, coord){
		if (piece_code === -1) return false;
		if (player_no == 1){
			this.p1_pieces[piece_code] = new piece_position(piece_code, transform_code, coord);
			
			var piece = this.transform(piece_code,transform_code);
			var piece_coords = this.set_coords_relative(coord,this.piece_relative_coords(piece));
			for (var y = 0; y < board_size; y++){
				for (var x = 0; x < board_size; x++){
					if (this.p1_board[y][x] === 3) this.p1_board[y][x] = 0;
				}
			}
			
			this.move_record = this.move_record.concat('1: ');
			for (var i = 0; i < piece_coords.length; i++){
				this.p1_board[(piece_coords[i][1]-1)][(piece_coords[i][0]-1)] = 1;
				this.p2_board[board_size-piece_coords[i][1]][board_size-piece_coords[i][0]] = 1;
				this.move_record = this.move_record.concat(String(board_size-piece_coords[i][0]), ',', String(board_size-piece_coords[i][1]), ';');
			}			
			this.move_record = this.move_record.concat('\n');
			
			
			this.process_corners(this.p1_board,true);
			
		}else if (player_no == 2){
			this.p2_pieces[piece_code] = new piece_position(piece_code, transform_code, coord);
			
			var piece = this.transform(piece_code,transform_code);
			var piece_coords = this.set_coords_relative(coord,this.piece_relative_coords(piece));
			
			for (var y = 0; y < board_size; y++){
				for (var x = 0; x < board_size; x++){
					if (this.p2_board[y][x] === 3) this.p2_board[y][x] = 0;
				}
			}
			
			this.move_record = this.move_record.concat('2: ');
			for (var i = 0; i < piece_coords.length; i++){
				this.p1_board[board_size-piece_coords[i][1]][board_size-piece_coords[i][0]] = 2;
				this.p2_board[(piece_coords[i][1]-1)][(piece_coords[i][0]-1)] = 2;
				this.move_record = this.move_record.concat(String(board_size-piece_coords[i][0]), ',', String(board_size-piece_coords[i][1]), ';');
			}
			this.move_record = this.move_record.concat('\n');
			
			this.process_corners(this.p2_board,false);
		}
	}
	
	process_corners(board,is_p1){
		var started = false;
		for (var y = 0; y < board_size; y++){
			for (var x = 0; x < board_size; x++){
				if (board[y][x] == 0 || board[y][x] == null){
					if (this.is_corner(board,x,y,is_p1)) board[y][x] = 3;
				}else{
					if ((board[y][x] == 1 && is_p1) || (board[y][x] == 2 && !is_p1)){
						started = true;
					}
				}
			}
		}
		if (!started){
			if ((this.humanP1 && is_p1) || (!this.humanP1 && !is_p1)){
				board[board_size-1][0] = 3;
			}
		}
		return board;
	}
	
	is_corner(board,x,y,is_p1){
		var block = (is_p1 ? 1 : 2);
		if ((x > 0 && y > 0 && board[y-1][x-1] == block) || (x < (board_size-1) && y > 0 && board[y-1][x+1] == block) || (x < (board_size-1) && y < (board_size-1) && board[y+1][x+1] == block) || (x > 0 && y < (board_size-1) && board[y+1][x-1] == block)){
			if (!(x > 0 && board[y][x-1] == block) && !(x < (board_size-1) && board[y][x+1] == block) && !(y > 0 && board[y-1][x] == block) && !(y < (board_size-1) && board[y+1][x] == block)) return true;
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
			if (this.p2_resigned){
				this.finish_game();
			}else if (this.single_player){
				//console.log("computer moving again");
				this.intervalFunc = setInterval(this.computer_move_check.bind(this),3000);
				this.java_game.compMove();
			}
		}else if (player_no == 2){
			this.p2_resigned = true;
			this.turn = 1;
			if (this.p1_resigned) this.finish_game();
		}
		this.update_socket_clients('game_update');
	}
	
	finish_game(){
		this.update_socket_clients('game_over');
		this.game_over = true;
		game_to_dropbox(this);
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


/*
 *	Misc. utility functions
*/
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
	var dbx = new dropbox({ accessToken: 'wOqCJGXuP6AAAAAAAAAAEyvlOLYxd9Tu4CJWwOcZzisddCY1MVyZtOAa2eJzE4zo' });
	
	var contents = '';
	if (game.p1 == '* computer *'){
		contents = contents.concat('1: ', game.comp_strategy, ';', '\n');
	}else{
		contents = contents.concat('1: ', game.p1, ';', '\n');
	}
	if (game.p2 == '* computer *'){
		contents = contents.concat('2: ', game.comp_strategy, ';', '\n');
	}else{
		contents = contents.concat('2: ', game.p2, ';', '\n');
	}
	contents = contents.concat(game.move_record);
	
	var d = new Date();
    var n = d.getTime();
	var path = '/BlokusData/' + game.gamecode + '/' + n + '.txt';
	
	dbx.filesUpload({ path: path, contents: contents })
      .then(function (response) {
        //console.log(response);
      })
      .catch(function (err) {
        //console.log(err);
      });
}
function data_to_dropbox(name){
	var dbx = new dropbox({ accessToken: 'wOqCJGXuP6AAAAAAAAAAEyvlOLYxd9Tu4CJWwOcZzisddCY1MVyZtOAa2eJzE4zo' });
	var d = new Date();
	var n = '';
    if (name){
    	n = name + d.getTime();
    }else{
    	n = d.getTime();
    }
	var user_path = '/BlokusBackups/' + n + '_users.txt';
	var game_path = '/BlokusBackups/' + n + '_games.txt';
	var user_contents = arrayToJSON(user_list);
	var game_contents = arrayToJSON(game_list);
	
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
    	case 'java_human':
    		return [];
    	case 'java_game':
    		return [];
    	case 'java_computer':
    		return [];
    	case 'intervalFunc':
    		return [];
    	default:
    		return value;
	}
}



/*
 *	Request functions deal with client messages
*/

var request_functions = [];

request_functions['place_piece'] = function (message){
	if (game_list[message.gamecode] !== null){
		if (game_list[message.gamecode].player_move(message.username, message.piece_id, message.transform_code, message.coordinates)){
			
			return JSON.stringify({
				response: 'piece_placed',
				data: {}
			});
		}else{
			return JSON.stringify({
				response: 'cant_place',
				data: {
					reason: 'invalid_placement',
					game: game_list[message.gamecode]
				}
			},replacer);
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
	if (game_list[message.gamecode] !== null && game_list[message.gamecode].is_player_joined(message.username)){
		var game = game_list[message.gamecode];
		game_list[message.gamecode].resign_player(game_list[message.gamecode].which_player(message.username));
		if (game.game_over){
			user_list[message.username].remove_game(message.gamecode);
			if (!game.single_player) user_list[game_list[message.gamecode].other_player(message.username)].remove_game(message.gamecode);
			delete game_list[message.gamecode];
		}
		return JSON.stringify({
			response: 'resigned',
			data: {
				game: game
			}
		},replacer);
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
	},replacer);
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
	},replacer);
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
		},replacer);
	}
	if (game_list[code].is_player_joined(message.username)){
		return JSON.stringify({
			response: 'joined_game',
			data: {
				gamecode: code,
				game: game_list[code]
			}
		},replacer);
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
		},replacer);
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




/*
 *	Socket logic to handle incoming connections
*/

const wss = new SocketServer({ server:app });

wss.on('connection', (ws) => {
  ws['_closeTimer'] = -1;
  
  ws.on('message', function incoming(message) {
  	var parsed_message = JSON.parse(message);
  	ws.send(request_functions[parsed_message.request](parsed_message.data, ws));
  });
});
setInterval(function(){
	wss.clients.forEach(function each(client) {
		if (client.readyState === 1) {
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



/*
 *	Handles reinstating backups that have been saved on dropbox
*/

var backup_user_list = [{"username":"user","password":"pass","game_codes":["SGOP"],"games_played":0,"ws_clients":[]},{"username":"guest","password":"pass","game_codes":["SGOP"],"games_played":0,"ws_clients":[]}];
var backup_game_list = [{"gamecode":"SGOP","p1_board":[[0,0,0,0,0,0,0,0,0,0,0,0,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,2,0],[0,0,0,0,0,0,0,0,0,0,0,2,2,0],[0,0,0,0,0,0,0,0,0,0,2,0,0,0],[0,0,0,0,0,0,0,2,2,2,2,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,3,0,0,0,0,3,0,0,0,0,0],[0,0,0,0,1,1,1,1,0,0,0,0,0,0],[0,3,0,0,0,1,0,0,3,0,0,0,0,0],[0,0,1,1,1,0,3,0,0,0,0,0,0,0],[0,3,0,1,0,3,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0],[1,1,1,0,3,0,0,0,0,0,0,0,0,0],[1,0,1,0,0,0,0,0,0,0,0,0,0,0]],"p2_board":[[0,0,0,0,0,0,0,0,0,0,0,1,0,1],[0,0,0,0,0,0,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,3,0,0,0,0,3,0,0,0,0,0,0],[0,0,0,2,2,2,2,0,0,0,0,0,0,0],[3,0,0,2,0,0,0,3,0,0,0,0,0,0],[0,2,2,0,3,0,0,0,0,0,0,0,0,0],[0,2,0,3,0,0,0,0,0,0,0,0,0,0],[2,2,0,0,0,0,0,0,0,0,0,0,0,0]],"turn":2,"moves":5,"p1":"user","p2":"guest","p1_resigned":false,"p2_resigned":false,"p1_pieces":[null,null,null,null,null,null,null,null,null,null,null,{"piece_code":11,"transform_code":1,"coord":[5,8]},null,null,{"piece_code":14,"transform_code":1,"coord":[1,13]},{"piece_code":15,"transform_code":1,"coord":[3,10]},null,null,null,null,null],"p2_pieces":[null,null,null,null,null,null,null,null,null,null,{"piece_code":10,"transform_code":1,"coord":[4,10]},null,null,null,null,null,null,null,{"piece_code":18,"transform_code":1,"coord":[2,12]},null,null],"single_player":false,"game_over":false,"move_record":"1: 13,1;12,1;11,1;13,0;11,0;\n2: 12,2;11,2;12,1;13,0;12,0;\n1: 11,4;10,4;9,4;10,3;10,2;\n2: 10,4;9,4;8,4;7,4;10,3;\n1: 9,6;8,6;7,6;6,6;8,5;\n"}];

backup_user_list.forEach(function(backup_user){
	user_list[backup_user.username] = new user(backup_user.username, backup_user.password);
	user_list[backup_user.username].set_game_codes(backup_user.game_codes);
	if (backup_user.games_played) user_list[backup_user.username].set_games_played(backup_user.games_played);
});
backup_game_list.forEach(function(backup_game){
	game_list[backup_game.gamecode] = new game(backup_game.gamecode, backup_game.p1, backup_game.single_player);
	game_list[backup_game.gamecode].set_game_configuration(backup_game.p2, backup_game.p1_board, backup_game.p2_board, backup_game.turn, backup_game.moves, backup_game.p1_resigned, backup_game.p2_resigned, backup_game.p1_pieces, backup_game.p2_pieces, backup_game.game_over, backup_game.move_record);
});




/*
 *	Java interfacing
*/

java.classpath.push("commons-lang3-3.1.jar");
java.classpath.push("commons-io.jar");
java.classpath.push("src");

