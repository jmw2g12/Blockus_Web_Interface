function loadGame(game){
	$('#splash').fadeOut('fast', function(){
		$('#blokus-game').fadeIn('slow');
		injectGameElements();
		var p1 = (game.p1 == username);
		console.log('this player is player 1 : ' + p1);
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
		}
	}
}
function setMoves(game, p1){
	
}
function setGo(game, p1){
	
}
function injectGameElements(){
	//create piece table holders
	$('#piece-set').html(createDivGrid(4,6,'piece-table','board-row'));
	$('.piece-table').click(function(){
		console.log($(this).attr('id'));
	});
	
	//create piece tables
	$('.piece-table').html('<div class="piece-table-container">' + createDivGrid(5,5,'piece-table-cell','board-row') + '</div>');
		
	//create piece viewer table
	$('#main-viewer').html('<div class="piece-table-container">' + createDivGrid(5,5,'piece-table-cell','board-row') + '</div>');
	
	//create board
	$('#board').html(createDivGrid(14,14,'board-cell','board-row'));
	$('.board-cell').click(function(){
		console.log($(this).attr('id'));
	});
}
function createDivGrid(width, height, cell_class, row_class){
	var grid = '';
	for (var y = 0; y < height; y++){
		grid = grid + '<div class=\"' + row_class + '\">';
		for (var x = 0; x < width; x++){
			grid = grid + '<div id=\"' + cell_class + '_' + (x+1) + '_' + (y+1) + '\" class=\"' + cell_class + '\"></div>';
		}
		grid = grid + '</div>';
	}
	return grid;
}