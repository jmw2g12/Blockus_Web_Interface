var pieces = [];

var p1 = "{\"width\":1,\"height\":1,\"data\":[[1]]}"
var p10 = "{\"width\":5,\"height\":1,\"data\":[[1,1,1,1,1]]}"
var p11 = "{\"width\":4,\"height\":2,\"data\":[[1,1,1,1],[1,0,0,0]]}"
var p12 = "{\"width\":4,\"height\":2,\"data\":[[1,1,1,1],[0,1,0,0]]}"
var p13 = "{\"width\":4,\"height\":2,\"data\":[[0,1,1,1],[1,1,0,0]]}"
var p14 = "{\"width\":3,\"height\":2,\"data\":[[1,1,1],[1,1,0]]}"
var p15 = "{\"width\":3,\"height\":2,\"data\":[[1,1,1],[1,0,1]]}"
var p16 = "{\"width\":3,\"height\":3,\"data\":[[1,1,1],[0,1,0],[0,1,0]]}"
var p17 = "{\"width\":3,\"height\":3,\"data\":[[0,0,1],[0,0,1],[1,1,1]]}"
var p18 = "{\"width\":3,\"height\":3,\"data\":[[0,1,1],[1,1,0],[1,0,0]]}"
var p19 = "{\"width\":3,\"height\":3,\"data\":[[0,1,1],[0,1,0],[1,1,0]]}"
var p2 = "{\"width\":2,\"height\":1,\"data\":[[1,1]]}"
var p20 = "{\"width\":3,\"height\":3,\"data\":[[0,1,1],[1,1,0],[0,1,0]]}"
var p21 = "{\"width\":3,\"height\":3,\"data\":[[0,1,0],[1,1,1],[0,1,0]]}"
var p3 = "{\"width\":3,\"height\":1,\"data\":[[1,1,1]]}"
var p4 = "{\"width\":2,\"height\":2,\"data\":[[1,1],[1,0]]}"
var p5 = "{\"width\":4,\"height\":1,\"data\":[[1,1,1,1]]}"
var p6 = "{\"width\":3,\"height\":2,\"data\":[[1,1,1],[1,0,0]]}"
var p7 = "{\"width\":3,\"height\":2,\"data\":[[0,1,1],[1,1,0]]}"
var p8 = "{\"width\":3,\"height\":2,\"data\":[[1,1,1],[0,1,0]]}"
var p9 = "{\"width\":2,\"height\":2,\"data\":[[1,1],[1,1]]}"

function getNthPiece(n){
	//console.log("nth piece at n="+n);
	return this["p"+n];
}
