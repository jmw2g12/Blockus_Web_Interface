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
var transform_codes = ['cw','ccw','ver','hor'];
var selected_piece_id = -1;
var piece_transform_code = 1;
var painted = [[],[]];

function loadGame(game){
	$('#splash').fadeOut('fast', function(){
		$('#blokus-game').fadeIn('slow');
		injectGameElements();
		var p1 = (game.p1 == username);
		//console.log('this player is player 1 : ' + p1);
		setMoves(game,p1);
		
		//if not resigned:
		setPieces(game,p1);
		setGo(game,p1);
		console.log(game);
	});
}
function setPieces(game, p1){
	var piece_list;
	if (p1){
		piece_list = game.p1_pieces;
	}else{
		piece_list = game.p2_pieces;
	}
	for (var i = 0; i < piece_list.length; i++){
		if (piece_list[i] == null){
			console.log('piece ' + i + ' has not been placed');
			populatePieceTable(i+1,piece_reference[i],false);
		}
	}
}
function populatePieceTable(i,piece,main){
	var prefix = '#piece-table_' + i;
	if (main) prefix = '#main-piece-table';
	for (var y = 1; y <= 5; y++){
		for (var x = 1; x <= 7; x++){
			if (piece[y-1][x-2] == 0){
				$(prefix + '-cell_' + x + '_' + y).css("display", "table-cell");
				$(prefix + '-cell_' + x + '_' + y).css("background", "#EEEEEE");
			}else if(piece[y-1][x-2] == 1){			
				$(prefix + '-cell_' + x + '_' + y).css("display", "table-cell");
				$(prefix + '-cell_' + x + '_' + y).css("background", "#CCCCCC");
			}else if(piece[y-1][x-2] == 2){			
				$(prefix + '-cell_' + x + '_' + y).css("display", "table-cell");
				$(prefix + '-cell_' + x + '_' + y).css("background", "#990000");
			}else{
				$(prefix + '-cell_' + x + '_' + y).css("display", "table-cell");
				$(prefix + '-cell_' + x + '_' + y).css("background", "#EEEEEE");
			}
		}
	}
}
function setMoves(game, p1){
	
}
function setGo(game, p1){
	
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
		console.log($(this).attr('id'));
	});
	
	$('.board-cell').mouseenter(function(){
		setHoverCells($(this));
	});
}
function setHoverCells(cell){
	if (selected_piece_id >= 0){
		for (var i = 0; i < painted[1].length; i++){
			$('#board-cell_' + painted[1][i][0] + '_' + painted[1][i][1]).removeClass("hover-cell");
		}
		$('#board-cell_' + painted[0][0] + '_' + painted[0][1]).removeClass("rel-hover-cell");
		hover_piece = transform(selected_piece_id,piece_transform_code);
		var rel_coords = pieceRelativeCoords(hover_piece);
		var cell_coords = cell.attr('id').split('board-cell')[1].split('_');
		cell_coords = cell_coords.map(Number);
		cell_coords = [cell_coords[1], cell_coords[2]];
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
		}
	}	
}
function resetAll(){
	$('.board-cell').removeClass("hover-cell");
	$('.board-cell').removeClass("rel-hover-cell");
}
function setCoordsRelative(cell_coords,coords){
	var result = [];
	for (i = 0; i < coords.length; i++){
		result.push([coords[i][0] + cell_coords[0],coords[i][1] + cell_coords[1]]);
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