"use strict";

var Labyrinthe = function() {

};

Labyrinthe.randomizeList = function(l) {
	var rl = [];
	var allreadyChecked = [];

	for (var i = 0; i < l.length; i++) {
		var i2 = parseInt(Math.random() * l.length);

		while (allreadyChecked.indexOf(i2) >= 0 && i2 < l.length - 1) {
			i2++;
		}

		while (allreadyChecked.indexOf(i2) >= 0 && i2 > 0) {
			i2--;
		}

		allreadyChecked.push(i2);

		rl[i2] = l[i];
	}

	return new Path(rl);
};

Labyrinthe.fill = function(path, nbBlocsAuTotal, stepTracer) {
	var buffer = new Path(path.slice(0));
	var loop2 = function() {

		var randomizePath = Labyrinthe.randomizeList(buffer);
		var i = 0;
		var loop = function() {

			return randomizePath[i++].fillPath(buffer, stepTracer).then(function() {
				// console.log(test);
			}).then(function() {
				if (i < randomizePath.length) {
					return loop();
				} else {
					return new Promise(function(resolve, reject) {
						resolve();
					});
				}
			});
		};

		return loop().then(function() {
			if (buffer.length < nbBlocsAuTotal) {
				return loop2();
			} else {
				return new Promise(function(resolve, reject) {
					resolve();
				});
			}
		});
	};

	return loop2();
};