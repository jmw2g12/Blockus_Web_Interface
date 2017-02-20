var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var username = '';
var gamecode = '';

// -- response functions --
var response_functions = [];

response_functions['game_code'] = function (reply){
	alert(reply);
}
response_functions['login_success'] = function (reply){
	username = reply.username;
	$('#splash-text').fadeOut('slow');
	$('#splash-login').fadeOut('slow',function(){
		$('#splash-input-container').fadeIn();
		$('#splash-input-container').css('display','table');
	});
	$("#page-title").html('Welcome to Blokus, ' + reply.username[0].toUpperCase() + reply.username.substring(1).toLowerCase());

	reply.games.forEach(function(game){
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
}
response_functions['started_1p'] = function (reply){
	//alert('started a 1 player game with game code ' + reply.gamecode);
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + '. Gamecode: ' + reply.gamecode);
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['started_2p'] = function (reply){
	//alert('started a 2 player game with game code ' + reply.gamecode);
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + '. Gamecode: ' + reply.gamecode);
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['joined_game'] = function (reply){
	//alert('joined an already running game with game code ' + reply.gamecode);
	$("#page-title").html('Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + '. Gamecode: ' + reply.gamecode);
	gamecode = reply.gamecode;
	loadGame(reply.game);
}
response_functions['failed_join_game'] = function (reply){
	alert('could not join the game : ' + reply.reason);
}
response_functions['receive_message'] = function (reply){
	$('#message-from').html(reply.from_user);
	$('#message-text').html(reply.text);
	$('#message-view').slideToggle()
}
response_functions['piece_placed'] = function (reply){
	setPieces(reply.game,(reply.game.p1 == username));
	setMoves(reply.game,(reply.game.p1 == username));
	resetPiece();
	console.log(reply.game);
}
response_functions['cant_place'] = function (reply){
	alert(reply.reason);
}
response_functions['game_update'] = function (reply){
	console.log('game_update');
	setMoves(reply.game,(reply.game.p1 == username));
	setPieces(reply.game,(reply.game.p1 == username));
	console.log(reply.game);
}


// -- response caller --
ws.onmessage = function (reply) {
	parsed_reply = JSON.parse(reply.data);
	if (response_functions[parsed_reply.response] != null){
		response_functions[parsed_reply.response](parsed_reply.data);
	}else{
		console.log('invalid response function : ' + parsed_reply.response);
	}
};


// -- request functions --
function requestLogin(username, password){
	if (username.match(/^[a-zA-Z0-9]+$/) && password.match(/^[a-zA-Z0-9]+$/)){
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