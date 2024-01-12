"use strict";

import { Bloc } from "./Bloc";

class Sortie extends Bloc { constructor(bc) {
	super(bc);
}};


Sortie.prototype.trouveSortie = function(entreeDuBloc, path, stepTracer) {
	var that = this;
	this.addSortie(entreeDuBloc);

	return new Promise(function(resolve, reject) {
		stepTracer.next(that).then(function() {
			path.push(that);
			resolve(path);
		});
	});
};

Sortie.prototype.pathExistsToExit = function() {
	return true;
};

export { Sortie };