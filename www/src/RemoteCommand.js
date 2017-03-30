"use strict";

var RemoteCommand = function() {

	var resolveCommand = undefined;
	var rejectCommand = undefined;
	var paused = false;
	var stopped = true;
	var that = this;

	var reset = function(){
		resolveCommand = undefined;
		rejectCommand = undefined;
		stopped = true;
		paused = false;
	};
	
	this.promise = function() {
		return new Promise(function(resolve, reject) {

			if (stopped) {
				reject('Generation stopped');
				reset();
				if (typeof stopped == 'function') {
					stopped();
				}
			} else if (!paused) {
				resolveCommand = undefined;
				rejectCommand = undefined;
				resolve();
			} else {
				resolveCommand = resolve;
			}
		});
	};

	this.pause = function() {
		paused = true;
	};

	this.stop = function(stoppedHandler) {
		if ((paused || that.isStopped()) && typeof stoppedHandler == 'function') {
			if (rejectCommand)
				rejectCommand();
			reset();
			stoppedHandler();
			return;
		}

		stopped = stoppedHandler || true;
	};

	this.play = function() {
		paused = false;
		stopped = false;

		if (resolveCommand) {
			resolveCommand();
		}
	};

	this.isStopped = function() {
		return stopped;
	};

	this.isPlaying = function() {
		return !paused && !stopped;
	};
};