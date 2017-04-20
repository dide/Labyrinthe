var path = require('path');
var myArgs = require('optimist').argv;

var randomPort = parseInt(Math.random() * 10000 + 1000);
process.env.PORT = randomPort;
console.log('Launching web server on port ' + randomPort);
var webServerLoaded = require('../server.js').loaded;

var PHANTOMJS_HOME = process.env.PHANTOMJS_HOME;

if (!PHANTOMJS_HOME) {
	throw new Error('PHANTOMJS_HOME environment variable not found');
}

var phantomJsBin = PHANTOMJS_HOME + path.sep + 'bin' + path.sep + 'phantomjs';

if (!myArgs.i) {
	console.log('option -i pour le fichier a executer');
	process.exit(0);
}

var fileToExec = path.resolve(myArgs.i);
var execFile = require('child_process').execFile;

webServerLoaded.then(function() {
	
	var args = [ fileToExec, randomPort ];
	console.log('Launching : '+phantomJsBin+' '+args.join(' '));
	
	execFile(phantomJsBin, [ fileToExec, randomPort ], function(error, stdout, stderr) {
		if (error) {
			console.error(error);
			return;
		}
		console.log(stdout);
		console.log(stderr);
	});
});
