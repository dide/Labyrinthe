"use strict";

var Sortie = function(bc) {
	Bloc.call(this, bc);
};

Sortie.prototype = Object.create(Bloc.prototype);

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