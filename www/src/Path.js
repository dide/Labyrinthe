"use strict";

class Path extends Array { constructor(l) {
	super();

	if (l) {
		for (var i = 0; i < l.length; i++) {
			this.push(l[i]);
		}
	}

	var that = this;

	this.contains = function(bloc) {
		for (var i = 0; i < that.length; i++) {
			if (bloc == that[i])
				return true;
		}

		return false;
	};

}};

export { Path };