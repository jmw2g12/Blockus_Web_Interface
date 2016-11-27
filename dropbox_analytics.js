var Dropbox = require('dropbox');

var ACCESS_TOKEN = 'wOqCJGXuP6AAAAAAAAAAEyvlOLYxd9Tu4CJWwOcZzisddCY1MVyZtOAa2eJzE4zo';

listFiles('/BlokusData');

function listFiles(path) {
	//wconsole.log(path);
	var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
	dbx.filesListFolder({path: path})
        .then(function(response) {
        	if (includesDirectories(response.entries)){
    	    	displayFolders(response.entries);
    		}else{
    			displayFiles(response.entries);
    			if (wasGameFinished(response.entries)){
    				console.log("this game was finished.");
    			}else{
    				console.log("this game was NOT finished.");
    			}
    		}
        })
        .catch(function(error) {
			console.log("error!");
	});
}
function includesDirectories(files){
	for (var i = 0; i < files.length; i++) {
		if (files[i]['.tag'] === 'folder'){
			return true;
		}
	}
	return false;
}
function displayFolders(files){
	if (files.length == 0) return;
	for (var i = 0; i < files.length; i++) {
		listFiles(files[i].path_display,false);
	}
}
function displayFiles(files){
	for (var i = 0; i < files.length; i++){
		console.log(files[i].path_display);
	}
}
function getFileContents(path){
	var data = [0,1,2,3];
	
	return data;
}
function wasGameFinished(files){ //give contents of time file
	for (var i = 0; i < files.length; i++) {
		if(files[i].name == 'game_finished.txt') return true;
	}
	return false;
}
function lastMoveTime(files){
	console.log("lastMoveTime, files.length = " + files.length);
	if (files.length === 0){
		console.log("no files");
		return;
	}
	var mostRecentTime = files[0].client_modified;
	var mostRecentFile = files[0];
	if (files.length === 1){
		console.log("only 1 file");
		return mostRecentFile;
	}
	for (var i = 1; i < files.length; i++) {
		//console.log(files[i].name + " was last modified at " + files[i].client_modified);
		if (isFirstDateMostRecent(files[i].client_modified,mostRecentTime)){
			mostRecentTime = files[i].client_modified;
			mostRecentFile = files[i];
		}
	}
	return mostRecentFile;
}
function isFirstDateMostRecent(firstDate, secondDate){
	var output = false;
	// format is '2016-11-09T01:37:50Z'
	console.log(firstDate + ", " + secondDate);
	
	var firstYear = firstDate.split("-")[0];
	var secondYear = secondDate.split("-")[0];
	if (output) console.log("firstYear = " + firstYear + ", secondYear = " + secondYear);
	if (parseInt(firstYear) < parseInt(secondYear)) return true;

	var firstMonth = firstDate.split("-")[1];
	var secondMonth = secondDate.split("-")[1];
	if (output) console.log("firstMonth = " + firstMonth + ", secondMonth = " + secondMonth);
	if (parseInt(firstMonth) < parseInt(secondMonth)) return true;

	var firstDay = firstDate.split("-")[2];
	firstDay = firstDay.split("T")[0];
	var secondDay = secondDate.split("-")[2];
	secondDay = secondDay.split("T")[0];
	if (output) console.log("firstDay = " + firstDay + ", secondDay = " + secondDay);
	if (parseInt(firstDay) < parseInt(secondDay)) return true;

	var firstHour = firstDate.split("T")[1];
	firstHour = firstHour.split(":")[0];
	var secondHour = secondDate.split("T")[1];
	secondHour = secondHour.split(":")[0];	
	if (output) console.log("firstHour = " + firstHour + ", secondMonth = " + secondHour);
	if (parseInt(firstHour) < parseInt(secondHour)) return true;

	var firstMin = firstDate.split(":")[1];
	var secondMin = secondDate.split(":")[1];
	if (output) console.log("firstMin = " + firstMin + ", secondMin = " + secondMin);
	if (parseInt(firstMin) < parseInt(secondMin)) return true;
	
	var firstSec = firstDate.split(":")[2];
	firstSec = firstSec.split(",")[0];
	var secondSec = secondDate.split(":")[2];
	secondSec = secondSec.split(",")[0];
	if (output) console.log("firstSec = " + firstSec + ", secondSec = " + secondSec);
	if (parseInt(firstSec) < parseInt(secondSec)) return true;
	
	return false;
}