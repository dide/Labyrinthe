var express = require('express');
var http = require('http');
var app = express();
var myArgs = require('optimist').argv;
var Q = require('q');

var PORT = myArgs.p || myArgs.port || process.env.PORT || 8080;

app.use('/', express.static('www'));

var httpServer = http.createServer(app);
var deferredWebServerLoaded = Q.defer();

var server = httpServer.listen(PORT, function() {
	var host = server.address().address;
	var port = server.address().port;

	var msg = 'Master server listening at http://' + (host.length == 2 ? '127.0.0.1' : host) + ':' + port;
	deferredWebServerLoaded.resolve(msg);
	console.log(msg);
});

exports.loaded = deferredWebServerLoaded.promise;