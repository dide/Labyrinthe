"use strict";

class StepTracer { constructor() {

	var backtrackHandlers = [];
	this.addBacktrackHandler = function(handler) {
		backtrackHandlers.push(handler);
	};

	this.backtrack = function(bloc) {
		var promises = [];
		for (var i = 0; i < backtrackHandlers.length; i++) {
			promises.push(new Promise(function(resolve, reject) {
				backtrackHandlers[i](bloc, resolve, reject);
			}));
		}

		return Promise.all(promises);
	};

	var nextHandlers = [];
	this.addNextHandler = function(handler) {
		nextHandlers.push(handler);
	};

	this.next = function(bloc) {
		var promises = [];
		for (var i = 0; i < nextHandlers.length; i++) {
			promises.push(new Promise(function(resolve, reject) {
				nextHandlers[i](bloc, resolve, reject);
			}));
		}

		return Promise.all(promises);
	};

	var dualChoiceHandlers = [];
	this.addDualChoiceHandler = function(handler) {
		dualChoiceHandlers.push(handler);
	};

	this.dualChoice = function(bloc) {
		var promises = [];
		for (var i = 0; i < dualChoiceHandlers.length; i++) {
			promises.push(new Promise(function(resolve, reject) {
				dualChoiceHandlers[i](bloc, resolve, reject);
			}));
		}

		return Promise.all(promises);
	};
}};

export { StepTracer };