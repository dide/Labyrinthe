"use strict";

var Disc3D = function(params, scene) {
	var nbDiscs = parseInt(params.nbDiscs);
	var areaUnit = parseInt(params.areaUnit);
	var radiusUnit = parseInt(params.radiusUnit);

	var discs = [];

	var getNbBlocs = function(n) {
		if (n == 0)
			return 1;

		var rn = function(n) {
			return n * radiusUnit;
		};

		var carrer = rn(n) * rn(n) - rn(n - 1) * rn(n - 1);

		return parseInt(Math.PI * carrer / areaUnit);
	};

	var nbBlocsTotal = 1;

	var getEntree = function() {
		return discs[0].getN(0, 0);
	};

	for (var i = 0; i < nbDiscs + 1; i++) {
		discs.push(new Disc3D.Disc());

		if (i == 0) {
			discs[i].push(0, new Entree());
			continue;
		}

		var nbBlocs = getNbBlocs(i);

		for (var j = 0; j < nbBlocs; j++) {
			var angle = 2 * Math.PI * j / nbBlocs;

			if (i > 1) {
				if (!discs[i - 1].push(angle, new Bloc())) {
					nbBlocsTotal++;
				}
			}

			var bloc;
			if (i == nbDiscs && j == 0) {
				bloc = new Sortie();
				getEntree().sortieLaby = bloc;
			} else {
				bloc = new Bloc();
			}
			if (!discs[i].push(angle, bloc)) {
				nbBlocsTotal++;
			}
		}
	}

	for (var i = 1; i < discs.length; i++) {
		var disc = discs[i];
		var n = getNbBlocs(i);

		disc.itereOnN(n, function(bloc, j) {
			var blocPrec = i == 1 ? getEntree() : discs[i - 1].getN(n, j);
			blocPrec.addBlocConjoint(bloc);
			bloc.addBlocConjoint(blocPrec);
		});

		for (var j = 0; j < disc.getBlocs().length; j++) {
			var bloc = disc.getBlocs()[j].bloc;
			var neighBoor = j == disc.getBlocs().length - 1 ? disc.getBlocs()[0].bloc : disc.getBlocs()[j + 1].bloc;

			bloc.addBlocConjoint(neighBoor);
			neighBoor.addBlocConjoint(bloc);
		}
	}

	var getCoord = function(bloc) {
		var l = -1, theta = -1;
		for (var i = 0; i < discs.length; i++) {

			var index = discs[i].indexOf(bloc);
			if (index >= 0) {
				l = i;
				theta = discs[i].getAngle(index);
				break;
			}
		}

		if (l == -1)
			throw new Error('Block not found!');

		return {
			l : l,
			angle : theta
		};
	};

	var getRadiusAndAngle = function(bloc) {
		var c = getCoord(bloc);

		return {
			radius : radiusUnit * c.l,
			angle : c.angle
		}
	};

	var getVector3 = function(bloc) {
		var c = getCoord(bloc);

		return new THREE.Vector3(radiusUnit * c.l * Math.cos(c.angle), radiusUnit * c.l * Math.sin(c.angle), 0);
	};

	var entreeMesh, sortieMesh;

	this.size = function() {
		return nbBlocsTotal;
	};

	this.trouveSortie = function(stepTracer) {
		return getEntree().trouveSortie(stepTracer);
	};

	this.getDrawer = function() {
		return {
			clearScene : function() {
				if (entreeMesh) {
					scene.remove(entreeMesh);
				}

				if (sortieMesh) {
					scene.remove(sortieMesh);
				}

				if (!discs)
					return;

				for (var i = 0; i < discs.length; i++) {
					var disc = discs[i];

					for (var j = 0; j < disc.getBlocs().length; j++) {
						var bloc = disc.getBlocs()[j].bloc;
						bloc.removeSorties();
						bloc.isDrawn = false;

						if (!bloc.meshes)
							continue;

						for (var k = 0; k < bloc.meshes.length; k++) {
							var mesh = bloc.meshes[k];
							scene.remove(mesh);
						}
					}
				}
			},
			drawEntree : function() {
				var pos = getVector3(getEntree());
				var geometry = new THREE.BoxGeometry(Disc3D.BLOCK_HALF_SIZE, Disc3D.BLOCK_HALF_SIZE, Disc3D.BLOCK_HALF_SIZE);
				var material = new THREE.MeshBasicMaterial({
					color : 0x00ff00
				});
				entreeMesh = new THREE.Mesh(geometry, material);
				entreeMesh.position.copy(pos);
				scene.add(entreeMesh);
			},
			drawSortie : function() {
				var posSortie = getVector3(getEntree().sortieLaby);

				var geometry = new THREE.BoxGeometry(Disc3D.BLOCK_HALF_SIZE, Disc3D.BLOCK_HALF_SIZE, Disc3D.BLOCK_HALF_SIZE);
				var material = new THREE.MeshBasicMaterial({
					color : 0xFF0000
				});
				sortieMesh = new THREE.Mesh(geometry, material);
				sortieMesh.position.copy(posSortie);
				scene.add(sortieMesh);
			},
			eraseBloc : function(bloc) {
				bloc.isDrawn = false;

				if (bloc.meshes) {
					for (var i = 0; i < bloc.meshes.length; i++) {
						var mesh = bloc.meshes[i];
						scene.remove(mesh);
					}
				}
			},
			drawBloc : function(bloc) {
				// if (bloc.isDrawn)
					//return;

				bloc.isDrawn = true;

				var pos = getVector3(bloc);
				var rEntree = getRadiusAndAngle(bloc);

				bloc.meshes = [];

				for (var i = 0; i < bloc.getSorties().length; i++) {
					var sortie = bloc.getSorties()[i];
					// if (sortie.isDrawn)
						// continue;

					var sortiePos = getVector3(sortie);
					var rSortie = getRadiusAndAngle(sortie);

					var lineGeometry = new THREE.Geometry();

					if (rEntree.radius != rSortie.radius) {
						lineGeometry.vertices.push(pos, sortiePos);
					} else {
						var clockWise;

						if (rSortie.angle - rEntree.angle > Math.PI) {
							clockWise = true;
						} else if (rEntree.angle - rSortie.angle > Math.PI) {
							clockWise = false;
						} else if (rEntree.angle - rSortie.angle > 0) {
							clockWise = true;
						} else {
							clockWise = false;
						}

						var curve = new THREE.EllipseCurve(0, 0, // ax, aY
						rEntree.radius, rEntree.radius, // xRadius, yRadius
						rEntree.angle, rSortie.angle, // aStartAngle,
						// aEndAngle
						clockWise // aClockwise
						);
						var points = curve.getSpacedPoints(6);
						var path = new THREE.Path();
						lineGeometry = path.createGeometry(points);
					}

					var line = new THREE.Line(lineGeometry, Disc3D.LINE_MATERIAL);
					scene.add(line);
					bloc.meshes.push(line);
				}
			}
		};
	};
};

Disc3D.Disc = function() {
	var blocs = [];

	this.id = Disc3D.Disc.currentSerial++;

	this.push = function(angle, bloc) {
		for (var i = 0; i < blocs.length; i++) {
			if (blocs[i].angle == angle) {
				return blocs[i].bloc;
			}
		}

		bloc.setId(this.id * Disc3D.Disc.currentSerial * Disc3D.Disc.currentSerial + blocs.length);
		var result = {
			angle : angle,
			bloc : bloc
		};
		blocs.push(result);
		sort();
		return;
	};

	this.getBlocs = function() {
		return blocs;
	};

	var getBlocsFromLevel = function(n) {
		var result = [];

		for (var i = 0; i < blocs.length; i++) {
			var o = blocs[i];
			var d = o.angle * n / (2 * Math.PI);

			if (parseInt(d) == d) {
				result.push(o.bloc);
			}
		}

		return result;
	};

	this.itereOnN = function(n, handler) {
		var result = getBlocsFromLevel(n);
		for (var i = 0; i < result.length; i++) {
			handler(result[i], i);
		}
	};

	this.getN = function(n, i) {
		var result = getBlocsFromLevel(n);
		return result[i];
	};

	var sort = function() {
		blocs.sort(function(o1, o2) {
			if (o1.angle < o2.angle)
				return -1;
			if (o1.angle > o2.angle)
				return 1;
			return 0;
		});
	};

	this.indexOf = function(bloc) {
		for (var i = 0; i < blocs.length; i++) {
			if (blocs[i].bloc == bloc)
				return i;
		}

		return -1;
	};

	this.getAngle = function(i) {
		return blocs[i].angle;
	};
};

Disc3D.Disc.currentSerial = 0;

Disc3D.NAME = 'Disc';

Disc3D.LINE_MATERIAL = new THREE.LineBasicMaterial({
	color : 0x0000ff,
	linewidth : 4
});
Disc3D.BLOCK_HALF_SIZE = 15;
Disc3D.BLOCK_SIZE = Disc3D.BLOCK_HALF_SIZE * 2;

Disc3D.PARAMETERS = [ {
	name : 'nbDiscs',
	libelle : '? discs around',
	min : 1,
	max : 10,
	value : 6
}, {
	name : 'areaUnit',
	libelle : 'Area of small unit ?',
	min : 40,
	max : 2000,
	value : 500
}, {
	name : 'radiusUnit',
	libelle : 'Radius between discs, ?',
	min : 10,
	max : 100,
	value : 20
} ];
