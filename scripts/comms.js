var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var username = '';
var password = '';
var gamecode = '';
var game_over = false;

// Response functions
var response_functions = [];

response_functions['login_success'] = function (reply){
	username = reply.username;
	$('#splash-text').fadeOut('slow');
	if (gamecode !== ''){
		$('#blokus-game').fadeOut('slow',function(){
			$('#splash').fadeIn('slow');
		});
		gamecode = '';
	}
	$('#splash-login').fadeOut('slow',function(){
		$('#splash-input-container').fadeIn();
		$('#splash-input-container').css('display','table');
	});
	$("#page-title").html('Welcome to Blokus, ' + reply.username[0].toUpperCase() + reply.username.substring(1).toLowerCase());
	
	$('#joinable-games-list').html('');
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
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['started_2p'] = function (reply){
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['joined_game'] = function (reply){
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['failed_join_game'] = function (reply){
	alert('could not join the game : ' + reply.reason);
}
response_functions['receive_message'] = function (reply){
	alert('Message from ' + reply.from_user + ':\n\n' + reply.text);
}
response_functions['cant_place'] = function (reply){
	$("#page-title").clearQueue();
	$("#page-title").fadeOut('fast',function(){
		var is_p1 = (reply.game.p1 === username);
		var is_turn = (is_p1 ? (reply.game.turn === 1) : (reply.game.turn === 2));
		var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
		var prev = 'Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | ' + appendage;
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
	if (gamecode === '' || gamecode !== reply.game.gamecode) return;
	console.log('game_update : ' + JSON.stringify(reply));
	setTurn(reply.game.turn);
	var is_p1 = (reply.game.p1 === username);
	var is_turn = (is_p1 ? (reply.game.turn === 1) : (reply.game.turn === 2));
	var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
	
	if (!game_over) $("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | ' + appendage);
	
	setMoves(reply.game,(reply.game.p1 == username));
	setPieces(reply.game,(reply.game.p1 == username));
}
response_functions['resigned'] = function (reply){
	$("#resign-button").prop('disabled', true);
	$('.board-cell').off('click');
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + reply.game.gamecode + ' | You have resigned, waiting for other player');
	setPieces(reply.game,(reply.game.p1 == username));
}
response_functions['game_over'] = function (reply){
	game_over = true;
	setGameOver();
	setPieces(reply.game,(reply.game.p1 == username));
	var p1_score = 0;
	var p2_score = 0;
	for (var y = 0; y < board.length; y++){
		for (var x = 0; x < board[0].length; x++){
			if (board[y][x] === 1) p1_score++;
			if (board[y][x] === 2) p2_score++;
		}
	}
	$("#resign-button").prop('disabled', true);
	$('.board-cell').off('click');
	if ((reply.game.p1 == username && (p1_score > p2_score)) || (reply.game.p2 == username && (p1_score < p2_score))){
		$("#page-title").fadeOut('fast',function(){
			$("#page-title").html('Congratulations, you won!');
			$("#page-title").fadeIn('fast');
		});
	}else if (p1_score === p2_score){
		$("#page-title").fadeOut('fast',function(){
			$("#page-title").html('The game was a draw!');
			$("#page-title").fadeIn('fast');
		});
	}else{
		$("#page-title").fadeOut('fast',function(){
			$("#page-title").html('Better luck next time, the other player won');
			$("#page-title").fadeIn('fast');
		});
	}
}
response_functions['ping'] = function (reply){};


// Response caller
ws.onmessage = function (reply) {
	parsed_reply = JSON.parse(reply.data);
	if (response_functions[parsed_reply.response] != null){
		response_functions[parsed_reply.response](parsed_reply.data);
	}else{
		console.log('unassigned response function : ' + parsed_reply.response);
	}
};


// Request functions
function requestLogin(username, password){
	if (username.match(/^[a-zA-Z0-9]+$/) && password.match(/^[a-zA-Z0-9]+$/)){
		this.password = password;
		var message = {
			request: "login",
			data: {
				username: username.toLowerCase(),
				password: password
			}
		};
		send(JSON.stringify(message));
	}else{
		alert('Please enter a valid username and password');
	}
}
function backToAccount(){
	requestLogin(username, password);
}
function start1pGame(){
	var message = {
		request: "start_1p",
		data: {
			username: username
		}
	};
	send(JSON.stringify(message));
}
function start2pGame(){
	var message = {
		request: "start_2p",
		data: {
			username: username
		}
	};
	send(JSON.stringify(message));
}
function joinGame(gamecode){
	var message = {
		request: "join_game",
		data: {
			username: username,
			gamecode: gamecode
		}
	};
	send(JSON.stringify(message));
}
function placePiece(piece_id, transform_code, coordinates){
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
	send(JSON.stringify(message));
	resetAll();
	resetPiece();
}
function messageUser(to_user, text){
	if (username !== null){
		var message = {
			request: "msg_user",
			data: {
				from_user: username,
				to_user: to_user.toLowerCase(),
				text: text
			}
		};
		send(JSON.stringify(message));
	}
}
function requestBackup(){
	var message = {
		request: "backup_data"
	}
	send(JSON.stringify(message));
}
function printUsers(){
	var message = {
		request: "print_users"
	}
	send(JSON.stringify(message));
}
function printUser(username){
	var message = {
		request: "print_user",
		data: {
			username: username.toLowerCase()
		}
	}
	send(JSON.stringify(message));
}
function printGames(){
	var message = {
		request: "print_games"
	}
	send(JSON.stringify(message));
}
function printGame(gamecode){
	var message = {
		request: "print_game",
		data: {
			gamecode: gamecode
		}
	}
	send(JSON.stringify(message));
}
function resign(){
	var message = {
		request: "resign",
		data: {
			username: username,
			gamecode: gamecode
		}
	};
	send(JSON.stringify(message));
}
function send(message){
	if (ws.readyState === 1) {
		ws.send(message);
	}else{
		if (gamecode == ''){
			alert('Connection to the server was lost. Please refresh this page.');
		}else{
			alert('Connection to the server was lost. Please refresh this page, log back in and click on gamecode ' + gamecode + ' to continue playing.');
		}
	}
}