"use strict";

var Bloc = function(bloc) {
	var blocsConjoints = bloc ? bloc.getBlocsConjoints() || [] : [];

	if (bloc) {
		for (var i = 0; i < bloc.getBlocsConjoints().length; i++) {
			var b = bloc.getBlocsConjoints()[i];
			b.replaceBlocConjoint(bloc, this);
		}
	}

	var id = undefined;
	var sorties = [];

	this.setId = function(newId) {
		id = newId;
	};

	this.getId = function() {
		return id;
	};

	this.addSortie = function(inSortie) {
		if (inSortie)
			sorties.push(inSortie);
	};

	this.getSorties = function() {
		return sorties;
	};

	this.removeSortie = function(sortie) {
		var i = sorties.indexOf(sortie);
		sorties.splice(i, 1);
	};

	this.removeSorties = function() {
		sorties = [];
	};

	this.addBlocConjoint = function(bloc) {
		if (blocsConjoints.indexOf(bloc) == -1)
			blocsConjoints.push(bloc);
	};

	this.getBlocsConjoints = function(entreeDuBloc, path) {
		if (!entreeDuBloc)
			return blocsConjoints;

		var blocs = [];

		for (var i = 0; i < blocsConjoints.length; i++) {
			var bloc = blocsConjoints[i];

			if (bloc == entreeDuBloc) {
				continue;
			}

			if (path.contains(bloc)) {
				continue;
			}

			blocs.push(bloc);
		}

		return blocs;
	};

	this.replaceBlocConjoint = function(bloc1, bloc2) {
		for (var i = 0; i < blocsConjoints.length; i++) {
			var bloc = blocsConjoints[i];
			if (bloc == bloc1) {
				blocsConjoints[i] = bloc2;
				return;
			}
		}
	};
};

Bloc.prototype.trouveSortie = function(entreeDuBloc, path, stepTracer) {
	var that = this;
	this.addSortie(entreeDuBloc);

	path.push(that);

	var randomizedConjoints = Labyrinthe.randomizeList(this.getBlocsConjoints(entreeDuBloc, path));

	for (var i = randomizedConjoints.length - 1; i >= 0; i--) {
		if (!randomizedConjoints[i].pathExistsToExit(path)) {
			randomizedConjoints.splice(i, 1);
		}
	}

	if (randomizedConjoints.length == 0) {
		throw new Error('No path to exit (bloc ' + that.getId() + ')');
	}

	var i = 0;
	var loop = function() {
		var neighboor = randomizedConjoints[i++];

		that.addSortie(neighboor);

		return stepTracer.next(that).then(function() {
			return neighboor.trouveSortie(that, path, stepTracer);
		}).then(function(pathTrouve) {
			if (!pathTrouve) {
				that.removeSortie(neighboor);

				return stepTracer.backtrack(that).then(function() {
					return loop();
				});
			} else {
				return pathTrouve;
			}
		});
	};

	return loop();
};

Bloc.prototype.pathExistsToExit = function(path, buffer) {
	buffer = buffer || new Path();

	buffer.push(this);

	var blocsConjoints = this.getBlocsConjoints();

	for (var i = 0; i < blocsConjoints.length; i++) {
		var bloc = blocsConjoints[i];

		if (path.contains(bloc))
			continue;

		if (buffer.contains(bloc))
			continue;

		var e = bloc.pathExistsToExit(path, buffer);
		if (e)
			return true;
	}

	return false;
};

Bloc.prototype.fillPath = function(buffer, stepTracer) {
	var that = this;

	buffer = buffer || new Path();
	if (!buffer.contains(that))
		buffer.push(that);

	var blocsConjoints = Labyrinthe.randomizeList(this.getBlocsConjoints());

	for (var i = 0; i < blocsConjoints.length; i++) {
		var bloc = blocsConjoints[i];

		if (buffer.contains(bloc))
			continue;

		this.addSortie(bloc);
		bloc.addSortie(this);

		return stepTracer.backtrack(this).then(function() {
			return stepTracer.next(that).then(function() {
				return bloc.fillPath(buffer, stepTracer);
			});
		});
	}

	return new Promise(function(resolve, reject){
		resolve();
	});
};