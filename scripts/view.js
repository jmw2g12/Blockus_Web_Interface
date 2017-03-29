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

var transforms = [
[2,4,5,7],
[3,1,8,6],
[4,2,7,5],
[1,3,6,8],
[6,8,1,3],
[7,5,4,2],
[8,6,3,1],
[5,7,2,4],
];
var board = [];
var turn = 1; // 1 or 2 denoting player
var is_p1;
var transform_codes = ['cw','ccw','ver','hor'];
var selected_piece_id = -1;
var piece_transform_code = 1;
var painted = [[],[]];
var corners = [];
var gamecode = '';
var game_over = false;

function loadGame(game){
	$('#splash').fadeOut('fast', function(){
		$('#blokus-game').fadeIn('slow');
		injectGameElements();
		var p1 = (game.p1 == username);
		gamecode = game.gamecode;
		turn = game.turn;
		//console.log('this player is player 1 : ' + p1);
		setMoves(game,p1);
		
		if (p1){
			board = game.p1_board;
			is_p1 = true;
		}else{
			board = game.p2_board;
			is_p1 = false;
		}
		
		//if not resigned:
		setPieces(game,p1);
		setGo(game,p1);
		console.log(game);
	});
}
function setCoordsRelative(origin,coords){
	var result = [];
	for (i = 0; i < coords.length; i++){
		result.push([coords[i][0] + origin[0], coords[i][1] + origin[1]]);
	}
	return result;
}
function pieceRelativeCoords(piece){
	rel_x = -1;
	rel_y = -1;
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
function printPiece(p){
	var line;
	for (var y = 0; y < 5; y++){
		line = '';
		for (var x = 0; x < 5; x++){
			line = line + ' ' + p[y][x];
		}
		console.log(line);
	}
}
function transformSelected(dir){
	var changed = transform(selected_piece_id,transforms[piece_transform_code-1][transform_codes.indexOf(dir)]);
	populatePieceTable(0,changed,true);
	piece_transform_code = transforms[piece_transform_code-1][transform_codes.indexOf(dir)];
}
function rotateCW(arr){
	var res = [];
	for (x = 0; x < 5; x++){
		res.push([]);
		for (y = 4; y >= 0; y--){
			res[x].push(arr[y][x]);
		}
	}
	return res;
}
function flipVer(arr){
	var res = [];
	for (y = 4; y >= 0; y--){
		res.push([]);
		for (x = 0; x < 5; x++){
			res[4-y].push(arr[y][x]);
		}
	}
	return res;
}
function rotateCCW(arr){
	var res = [];
	for (x = 4; x >= 0; x--){
		res.push([]);
		for (y = 0; y < 5; y++){
			res[4-x].push(arr[y][x]);
		}
	}
	return res;
}
function flipHor(arr){
	var res = [];
	for (y = 0; y < 5; y++){
		res.push([]);
		for (x = 4; x >= 0; x--){
			res[y].push(arr[y][x]);
		}
	}
	return res;
}
function transform(id, code){
	var res = piece_reference[id].slice();
	switch (code){
		case 1:
			return res;
			break;
		case 2:
			return rotateCW(res);
			break;
		case 3:
			return rotateCW(rotateCW(res));
			break;
		case 4:
			return rotateCCW(res);
			break;
		case 5:
			return flipVer(res);
			break;
		case 6:
			return rotateCW(flipVer(res));
			break;
		case 7:
			return flipHor(res);
			break;
		case 8:
			return rotateCW(flipHor(res));
			break;
	}
}

//following is done to load the UI, other functions load specific game
function injectGameElements(){
	//create piece table holders
	$('#piece-set').html(createDivGrid(4,6,'piece-table','board-row',true));
	$('.piece-table').click(function(){
		var id = $(this).attr('id').split('_')[1]-1;
		if (id < piece_reference.length){
			populatePieceTable(0,piece_reference[$(this).attr('id').split('_')[1]-1],true);
			selected_piece_id = id;
			rotation_code = 1;
			$('.piece-controls-row > input').attr('disabled',false);
		}
	});
	
	//create piece tables
	//$('.piece-table').html('<div class="piece-table-container">' + createDivGrid(5,5,'piece-table-cell','board-row') + '</div>');
	$('.piece-table').each(function(){
		$(this).html('<div class="piece-table-container">' + createDivGrid(7,5,($(this).attr('id') + '-cell'),'board-row') + '</div>');
	});
		
	//create piece viewer table
	$('#main-viewer').html('<div class="piece-table-container">' + createDivGrid(7,5,'main-piece-table-cell','board-row') + '</div>');
	
	//create board
	$('#board').html(createDivGrid(14,14,'board-cell','board-row'));
	$('#board').mouseleave(function(){
		resetAll();
		
	});
	$('.board-cell').click(function(){
		if (game_over) return;
		var cell_coords = $(this).attr('id').split('board-cell')[1].split('_');
		cell_coords = cell_coords.map(Number);
		cell_coords = [cell_coords[1], cell_coords[2]];
		if (moveValid()){
			placePiece(selected_piece_id, piece_transform_code, cell_coords);
		}else{
			//alert('invalid move');
			//console.log('here - invalid move');
			$("#page-title").clearQueue();
			$("#page-title").fadeOut('fast',function(){
				//var prev = $("#page-title").html();
				var is_turn = (is_p1 ? (turn === 1) : (turn === 2));
				console.log('invalid move : is_p1=' + is_p1 + ', turn=' + turn + ', is_turn=' + is_turn);
				var appendage = (is_turn ? 'Its your go!' : 'Waiting for other player..');
				var prev = 'Welcome to Blokus, ' + username[0].toUpperCase() + username.substring(1).toLowerCase() + ' | Gamecode: ' + gamecode + ' | ' + appendage;
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
	});
	
	$('.board-cell').mouseenter(function(){
		var cell_coords = $(this).attr('id').split('board-cell')[1].split('_');
		cell_coords = cell_coords.map(Number);
		cell_coords = [cell_coords[1], cell_coords[2]];
		setHoverCells(cell_coords);
	});
}
function setHoverCells(cell_coords){
	if (selected_piece_id >= 0){
		for (var i = 0; i < painted[1].length; i++){
			$('#board-cell_' + painted[1][i][0] + '_' + painted[1][i][1]).removeClass("hover-cell");
		}
		$('#board-cell_' + painted[0][0] + '_' + painted[0][1]).removeClass("rel-hover-cell");
		
		for (var i = 0; i < corners.length; i++){
			$('#board-cell_' + (corners[i][0]+1) + '_' + (corners[i][1]+1)).addClass("corner-block");
		}
		
		hover_piece = transform(selected_piece_id,piece_transform_code);
		var rel_coords = pieceRelativeCoords(hover_piece);
		to_paint = setCoordsRelative(cell_coords,rel_coords);
		painted = [[],[]];
		for (var i = 0; i < to_paint.length; i++){
			if (to_paint[i][0] < 1 || to_paint[i][0] > 14 || to_paint[i][1] < 1 || to_paint[i][1] > 14) return;
		}
		for (var i = 0; i < to_paint.length; i++){
			if (rel_coords[i][0] == 0 && rel_coords[i][1] == 0){
				$('#board-cell_' + to_paint[i][0] + '_' + to_paint[i][1]).addClass("rel-hover-cell");
				painted[0].push(to_paint[i][0]);
				painted[0].push(to_paint[i][1]);
			}else{
				$('#board-cell_' + to_paint[i][0] + '_' + to_paint[i][1]).addClass("hover-cell");
				painted[1].push(to_paint[i]);
			}
			for (var j = 0; j < corners.length; j++){
				if ((corners[j][0]+1) === to_paint[i][0] && (corners[j][1]+1) === to_paint[i][1]){
					$('#board-cell_' + (corners[j][0]+1) + '_' + (corners[j][1]+1)).removeClass("corner-block");
				}
			}
		}
		if (moveValid(board)){
			$('body').addClass("good-move");
			$('.piece-table-container').addClass("good-move");
		}else{
			$('body').removeClass("good-move");
			$('.piece-table-container').removeClass("good-move");
		}
	}	
}
function moveValid(){
	var coordinates = painted[1].slice();
	for (var i = 0; i < coordinates.length; i++){
		coordinates[i] = [coordinates[i][0]-1, coordinates[i][1]-1];
	}
	coordinates.push([painted[0][0]-1, painted[0][1]-1]);
	
	if (selected_piece_id == -1) return false;
	
	var c;
	//check if doesn't overlap
	// for each coord in coordinates check if coord is a 0
	for (var i = 0; i < coordinates.length; i++){
		c = coordinates[i];
		if (!(board[c[1]][c[0]] === 0 || board[c[1]][c[0]] === 3)) return false;
	}
	
	//check if connected at a corner
	// if one of the coordinates exists in corners array
	var connected = false;
	for (var i = 0; i < coordinates.length; i++){
		c = coordinates[i];
		for (var j = 0; j < corners.length; j++){
			if (c[0] === corners[j][0] && c[1] === corners[j][1]){
				connected = true;
				j = i = Infinity; //get out of both loops
			}
		}
	}
	if (!connected) return false;
	
	//check if NOT connected at face
	// for each coord in coordinates check if each face is not players' block
	var block = is_p1 ? 1 : 2;
	var x,y;
	//console.log('testing face connections');
	for (var i = 0; i < coordinates.length; i++){
		//console.log('testing coordinates[' + i + '] = ' + coordinates[i]);
		x = coordinates[i][0];
		y = coordinates[i][1];
		if (x > 0 && board[y][x-1] === block) return false;
		if (y > 0 && board[y-1][x] === block) return false;
		if (x < (board.length-1) && board[y][x+1] === block) return false;
		if (y < (board.length-1) && board[y+1][x] === block) return false;
	}
	//console.log('face connections good');
	return true;
}
function resetAll(){
	$('.board-cell').removeClass("hover-cell");
	$('.board-cell').removeClass("rel-hover-cell");
	$('body').removeClass("good-move");
	$('.piece-table-container').removeClass("good-move");
}
function createDivGrid(width, height, cell_class, row_class, incr){
	var grid = '';
	for (var y = 0; y < height; y++){
		grid = grid + '<div class=\"' + row_class + '\">';
		for (var x = 0; x < width; x++){
			if (incr){
				grid = grid + '<div id=\"' + cell_class + '_' + (x+y*width+1) + '\" class=\"' + cell_class + '\"></div>';
			}else{
				grid = grid + '<div id=\"' + cell_class + '_' + (x+1) + '_' + (y+1) + '\" class=\"' + cell_class + '\"></div>';
			}
		}
		grid = grid + '</div>';
	}
	return grid;
}
function setPieces(game, p1){
	var piece_list;
	if (p1){
		piece_list = game.p1_pieces;
		if (game.p1_resigned){
			$('.piece-table').prop('onclick',null).off('click');
			resetPiece();
			for (var i = 0; i < piece_list.length; i++){
				populatePieceTable(i+1,piece_reference[i],false,true);
			}
			return;
		}
	}else{
		piece_list = game.p2_pieces;
		if (game.p2_resigned){
			$('.piece-table').prop('onclick',null).off('click');
			resetPiece();
			for (var i = 0; i < piece_list.length; i++){
				populatePieceTable(i+1,piece_reference[i],false,true);
			}
			return;
		}
	}
	console.log('piece list = ');
	console.log(piece_list);
	for (var i = 0; i < piece_list.length; i++){
		if (piece_list[i] == null){
			populatePieceTable(i+1,piece_reference[i],false);
		}else{
			//remove piece from table
			populatePieceTable(i+1,piece_reference[i],false,true);
			$('#piece-table_' + (i+1)).prop('onclick',null).off('click');
		}
	}
}
function resetPiece(){
	$('#rotatecw').prop('disabled', true);
	$('#rotateccw').prop('disabled', true);
	$('#fliphor').prop('disabled', true);
	$('#flipver').prop('disabled', true);
	populatePieceTable(-1,-1,true,true);
	selected_piece_id = -1;
	piece_transform_code = 1;
	//painted = [[],[]];
}
function populatePieceTable(i,piece,main,empty){
	var prefix = '#piece-table_' + i;
	if (main) prefix = '#main-piece-table';
	for (var y = 1; y <= 5; y++){
		for (var x = 1; x <= 7; x++){
			$(prefix + '-cell_' + x + '_' + y).css("display", "table-cell");
			if (empty){
				$(prefix + '-cell_' + x + '_' + y).css("background", "#EEEEEE");
			}else{
				if (piece[y-1][x-2] == 0){
					$(prefix + '-cell_' + x + '_' + y).css("background", "#EEEEEE");
				}else if(piece[y-1][x-2] == 1){
					$(prefix + '-cell_' + x + '_' + y).css("background", "#999999");
				}else if(piece[y-1][x-2] == 2){
					$(prefix + '-cell_' + x + '_' + y).css("background", "rgb(170, 110, 120)");
				}else{
					$(prefix + '-cell_' + x + '_' + y).css("background", "#EEEEEE");
				}
			}
		}
	}
}
function setGameOver(){
	game_over = true;
}
function setMoves(game, p1){
	var my_pieces = [];
	var opp_pieces = [];
	var my_board;
	turn = game.turn;
	game_over = game.game_over;
	if (p1){
		my_pieces = game.p1_pieces;
		opp_pieces = game.p2_pieces;
		board = game.p1_board;
	}else{
		my_pieces = game.p2_pieces;
		opp_pieces = game.p1_pieces;
		board = game.p2_board;
	}
	var p;
	for (var i = 0; i < my_pieces.length; i++){
		if (my_pieces[i] != null){
			p = transform(my_pieces[i].piece_code,my_pieces[i].transform_code);
			rel_p = pieceRelativeCoords(p);
			to_paint = setCoordsRelative(my_pieces[i].coord,rel_p);
			for (var j = 0; j < to_paint.length; j++){
				$('#board-cell_' + to_paint[j][0] + '_' + to_paint[j][1]).addClass("my-block");
			}
		}
	}
	for (var i = 0; i < opp_pieces.length; i++){
		if (opp_pieces[i] != null){
			p = transform(opp_pieces[i].piece_code,opp_pieces[i].transform_code);
			rel_p = pieceRelativeCoords(p);
			to_paint = setCoordsRelative(opp_pieces[i].coord,rel_p);
			console.log(to_paint);
			var twisted;
			for (var j = 0; j < to_paint.length; j++){
				console.log(to_paint[j]);
				twisted = twistCoord(to_paint[j]);
				$('#board-cell_' + twisted[0] + '_' + twisted[1]).addClass("opp-block");
			}
		}
	}
	corners = [];
	for (var y = 0; y < board.length; y++){
		for (var x = 0; x < board.length; x++){
			if (board[y][x] === 3){
				console.log('setting corner ' + x + ', ' + y + ' :   #board-cell_' + (x+1) + '_' + (y+1));
				$('#board-cell_' + (x+1) + '_' + (y+1)).addClass("corner-block");
				corners.push([x,y]);
			}else{
				$('#board-cell_' + (x+1) + '_' + (y+1)).removeClass("corner-block");
			}
		}
	}
	console.log('corners.length = ' + corners.length);
}
function twistCoord(coord){
	return [15 - coord[0], 15 - coord[1]];
}
function setGo(game, p1){
	
}