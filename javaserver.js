var express = require('express')
var java = require('java')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

java.classpath.push("commons-lang3-3.1.jar");
java.classpath.push("commons-io.jar");
java.classpath.push("src");
var querier = java.newInstanceSync("ServerInterface");

console.log('querier.getHiWorldSync() = ' + querier.getHiWorldSync());
console.log('querier.printHiWorldSync():');
querier.printHiWorldSync();
