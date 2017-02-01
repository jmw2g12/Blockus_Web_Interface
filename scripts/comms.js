var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var username = '';

// -- response functions --
var response_functions = [];

response_functions['game_code'] = function (reply){
	alert(reply);
}
response_functions['login_success'] = function (reply){
	username = reply.username;
	$('#splash-login').fadeOut('slow',function(){
		$('#splash-input-container').fadeIn();
		$('#splash-input-container').css('display','table');
	});
	$("#page-title").append(reply.username);

	reply.games.forEach(function(game){
		$('#joinable-games-list').show();
		$('#joinable-games-list').append('<a class="joinable-game" onclick="joinGame(\'' + game.gamecode + '\')"> -> ' + game.gamecode + '</a><br>');
	});
}
response_functions['login_reject'] = function (reply){
	alert(reply.username + ' is already in use!');
}
response_functions['started_1p'] = function (reply){
	//alert('started a 1 player game with game code ' + reply.gamecode);
	loadGame(reply.game);
}
response_functions['started_2p'] = function (reply){
	//alert('started a 2 player game with game code ' + reply.gamecode);
	loadGame(reply.game);
}
response_functions['joined_game'] = function (reply){
	//alert('joined an already running game with game code ' + reply.gamecode);
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


// -- response caller --
ws.onmessage = function (reply) {
	parsed_reply = JSON.parse(reply.data);
	if (response_functions[parsed_reply.response] != null){
		response_functions[parsed_reply.response](parsed_reply.data);
	}else{
		console.log('invalid response function');
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