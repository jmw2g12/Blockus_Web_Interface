var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var username = '';
var password = '';
var gamecode = '';
var game_over = false;

// -- response functions --
var response_functions = [];

response_functions['login_success'] = function (reply){
	username = reply.username;
	$('#splash-text').fadeOut('slow');
	$('#splash-login').fadeOut('slow',function(){
		$('#splash-input-container').fadeIn();
		$('#splash-input-container').css('display','table');
	});
	$("#page-title").html('Welcome to Blokus, ' + reply.username[0].toUpperCase() + reply.username.substring(1).toLowerCase());
	
	//console.log('login success : ' + JSON.stringify(reply));
	reply.games.forEach(function(game){
		if (game == null) return;
		$('#joinable-games-list').show();
		var other_player = '';
		if (game.p1 == username){
			other_player = game.p2;
		}else{
			other_player = game.p1;
		}
		if (other_player == null || other_player == undefined){
			$('#joinable-games-list').append('<a class="joinable-game" onclick="joinGame(\'' + game.gamecode + '\')"> -> ' + game.gamecode + ' (no opponent yet)</a><br>');
		}else if (other_player == '* computer *'){
			$('#joinable-games-list').append('<a class="joinable-game" onclick="joinGame(\'' + game.gamecode + '\')"> -> ' + game.gamecode + ' vs ' + other_player.replace(/\s+/g,'') + '</a><br>');
		}else{
			other_player = other_player.charAt(0).toUpperCase() + other_player.slice(1);
			$('#joinable-games-list').append('<a class="joinable-game" onclick="joinGame(\'' + game.gamecode + '\')"> -> ' + game.gamecode + ' vs \"' + other_player + '\"</a><br>');
		}
	});
}
response_functions['login_reject'] = function (reply){
	alert(reply.username + ' is already in use!');
	password = '';
}
response_functions['started_1p'] = function (reply){
	//alert('started a 1 player game with game code ' + reply.gamecode);
	var is_p1 = (reply.game.p1 === username);
	var is_turn = (is_p1 ? (reply.game.turn === 1) : (reply.game.turn === 2));
	var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | ' + appendage);
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['started_2p'] = function (reply){
	//alert('started a 2 player game with game code ' + reply.gamecode);
	var is_p1 = (reply.game.p1 === username);
	var is_turn = (is_p1 ? (reply.game.turn === 1) : (reply.game.turn === 2));
	var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | ' + appendage);
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['joined_game'] = function (reply){
	//alert('joined an already running game with game code ' + reply.gamecode);
	var is_p1 = (reply.game.p1 === username);
	var is_turn = (is_p1 ? (reply.game.turn === 1) : (reply.game.turn === 2));
	var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | ' + appendage);
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['failed_join_game'] = function (reply){
	alert('could not join the game : ' + reply.reason);
}
response_functions['receive_message'] = function (reply){
	//$('#message-from').html(reply.from_user);
	//$('#message-text').html(reply.text);
	//$('#message-view').slideToggle()
	alert('Message from ' + reply.from_user + ':\n\n' + reply.text);
}
response_functions['piece_placed'] = function (reply){
	//console.log('piece placed');
	setPieces(reply.game,(reply.game.p1 == username));
	setMoves(reply.game,(reply.game.p1 == username));
	resetPiece();
	//console.log(reply.game);
}
response_functions['cant_place'] = function (reply){
	//alert(reply.reason);
	//console.log(reply.game);
	//console.log('here - invalid move from server');
	$("#page-title").clearQueue();
	$("#page-title").fadeOut('fast',function(){
		var is_p1 = (reply.game.p1 === username);
		var is_turn = (is_p1 ? (reply.game.turn === 1) : (reply.game.turn === 2));
		var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
		var prev = 'Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | ' + appendage;
		//console.log('prev = ' + prev);
		$("#page-title").html('Invalid move');
		$("#page-title").fadeIn('fast',function(){
			$("#page-title").delay(1500).fadeOut('fast',function(){
				$("#page-title").html(prev);
				$("#page-title").fadeIn('fast');
			});
		});
	});
	
}
response_functions['game_update'] = function (reply){
	//console.log('game_update : ' + JSON.stringify(reply));
	if (gamecode === '') return;
	var is_p1 = (reply.game.p1 === username);
	var is_turn = (is_p1 ? (reply.game.turn === 1) : (reply.game.turn === 2));
	var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | ' + appendage);
	
	setMoves(reply.game,(reply.game.p1 == username));
	setPieces(reply.game,(reply.game.p1 == username));
	//console.log(reply.game);
}
response_functions['resigned'] = function (reply){
	//console.log('this player has resigned');
	//console.log(reply.game);
	var is_p1 = (reply.game.p1 === username);
	var is_turn = (is_p1 ? (reply.game.turn === 1) : (reply.game.turn === 2));
	var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | ' + appendage);
	setPieces(reply.game,(reply.game.p1 == username));
}
response_functions['game_over'] = function (reply){
	//console.log('game is over');
	game_over = true;
	setGameOver();
	//console.log(reply.game);
	setPieces(reply.game,(reply.game.p1 == username));
	var p1_score = 0;
	var p2_score = 0;
	for (var y = 0; y < board.length; y++){
		for (var x = 0; x < board[0].length; x++){
			if (board[y][x] === 1) p1_score++;
			if (board[y][x] === 2) p2_score++;
		}
	}
	//console.log('scores are ' + p1_score + ' : ' + p2_score);
	if ((reply.game.p1 == username && (p1_score > p2_score)) || (reply.game.p2 == username && (p1_score < p2_score))){
		//console.log('Congratulations, you won!');
		$("#page-title").fadeOut('fast',function(){
			$("#page-title").html('Congratulations, you won!');
			$("#page-title").fadeIn('fast');
		});
	}else if (p1_score === p2_score){
		//console.log('The game was a draw!');
		$("#page-title").fadeOut('fast',function(){
			$("#page-title").html('The game was a draw!');
			$("#page-title").fadeIn('fast');
		});
	}else{
		//console.log('Better luck next time, the other player won');
		$("#page-title").fadeOut('fast',function(){
			$("#page-title").html('Better luck next time, the other player won');
			$("#page-title").fadeIn('fast');
		});
	}
}
response_functions['ping'] = function (reply){};


// -- response caller --
ws.onmessage = function (reply) {
	parsed_reply = JSON.parse(reply.data);
	if (response_functions[parsed_reply.response] != null){
		response_functions[parsed_reply.response](parsed_reply.data);
	}else{
		console.log('unassigned response function : ' + parsed_reply.response);
	}
};


// -- request functions --
function requestLogin(username, password){
	if (username.match(/^[a-zA-Z0-9]+$/) && password.match(/^[a-zA-Z0-9]+$/)){
		this.password = password;
		var message = {
			request: "login",
			data: {
				username: username,
				password: password
			}
		};
		ws.send(JSON.stringify(message));
	}else{
		alert('Please enter a valid username and password');
	}
}
function start1pGame(){
	var message = {
		request: "start_1p",
		data: {
			username: username
		}
	};
	ws.send(JSON.stringify(message));
}
function start2pGame(){
	var message = {
		request: "start_2p",
		data: {
			username: username
		}
	};
	ws.send(JSON.stringify(message));
}
function joinGame(gamecode){
	var message = {
		request: "join_game",
		data: {
			username: username,
			gamecode: gamecode
		}
	};
	ws.send(JSON.stringify(message));
}
function placePiece(piece_id, transform_code, coordinates){
	resetAll();
	var message = {
		request: "place_piece",
		data: {
			username: username,
			gamecode: gamecode,
			piece_id: piece_id,
			transform_code: transform_code,
			coordinates: coordinates
		}
	};
	ws.send(JSON.stringify(message));
}
function messageUser(to_user, text){
	if (username !== null){
		var message = {
			request: "msg_user",
			data: {
				from_user: username,
				to_user: to_user,
				text: text
			}
		};
		ws.send(JSON.stringify(message));
	}
}
function requestBackup(){
	var message = {
		request: "backup_data"
	}
	ws.send(JSON.stringify(message));
}
function printUsers(){
	var message = {
		request: "print_users"
	}
	ws.send(JSON.stringify(message));
}
function printUser(username){
	var message = {
		request: "print_user",
		data: {
			username: username
		}
	}
	ws.send(JSON.stringify(message));
}
function printGames(){
	var message = {
		request: "print_games"
	}
	ws.send(JSON.stringify(message));
}
function printGame(gamecode){
	var message = {
		request: "print_game",
		data: {
			gamecode: gamecode
		}
	}
	ws.send(JSON.stringify(message));
}
function resign(){
	var message = {
		request: "resign",
		data: {
			username: username,
			gamecode: gamecode
		}
	};
	ws.send(JSON.stringify(message));
}