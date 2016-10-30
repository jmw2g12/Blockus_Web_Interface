var piecesLoaded = 0;
var selectedPieceId = 0;
var selectedPiece = [[]];	//correctly oriented data
var selectedCell;			//DOM element
var selectedCellId = [];
var boardSize = 14;
var hoveringBlocks = [];
var usedCellCoords = [];
var p1CellCoords = [];
var p2CellCoords = [];
var boardData = [[]];			//not used currently
var go = 1;
var turn = 1;
var players = 2;
var thisPlayersGo = true;
var playersStartingCorners = [[1,14],[14,1]];
var firstMove = true;