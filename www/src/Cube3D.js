"use strict";

var Cube3D = function(params, scene) {
	var largeur = params.width;
	var hauteur = params.height;
	var profondeur = params.depth;

	var blocs = [];

	for (var i = 0; i < largeur; i++) {
		blocs[i] = [];

		for (var j = 0; j < hauteur; j++) {
			blocs[i][j] = [];

			for (var k = 0; k < profondeur; k++) {
				var bloc = new Bloc();
				blocs[i][j].push(bloc);

				bloc.setId(i * largeur * largeur + j * largeur + k);
			}
		}
	}

	for (var i = 0; i < largeur; i++) {
		for (var j = 0; j < hauteur; j++) {
			for (var k = 0; k < profondeur; k++) {
				var bloc = blocs[i][j][k];
				if (i > 0) {
					bloc.addBlocConjoint(blocs[i - 1][j][k]);
				}

				if (i < blocs.length - 1) {
					bloc.addBlocConjoint(blocs[i + 1][j][k]);
				}

				if (j > 0) {
					bloc.addBlocConjoint(blocs[i][j - 1][k]);
				}

				if (j < blocs[i].length - 1) {
					bloc.addBlocConjoint(blocs[i][j + 1][k]);
				}

				if (k > 0) {
					bloc.addBlocConjoint(blocs[i][j][k - 1]);
				}

				if (k < blocs[i][j].length - 1) {
					bloc.addBlocConjoint(blocs[i][j][k + 1]);
				}
			}
		}
	}

	var entree = Cube3D.genereEntreeSortie(blocs);

	var getXYZ = function(bloc) {
		var x = -1, y = -1, z = -1;
		for (var i = 0; i < blocs.length; i++) {
			for (var j = 0; j < blocs[i].length; j++) {
				var blocLine = blocs[i][j];
				var index = blocLine.indexOf(bloc);
				if (index >= 0) {
					x = i;
					y = j;
					z = index;
					break;
				}
			}
		}

		if (x == -1)
			throw new Error('Block not found!');

		return {
			x : x,
			y : y,
			z : z
		};
	};

	var entreeMesh, sortieMesh;

	this.size = function() {
		return blocs.length * blocs[0].length * blocs[0][0].length;
	};

	this.trouveSortie = function(stepTracer) {
		return entree.trouveSortie(stepTracer);
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

				if (!blocs)
					return;

				for (var i = 0; i < blocs.length; i++) {
					for (var j = 0; j < blocs[0].length; j++) {
						for (var k = 0; k < blocs[0][0].length; k++) {
							blocs[i][j][k].removeSorties();

							if (!blocs[i][j][k].meshes)
								continue;

							for (var l = 0; l < blocs[i][j][k].meshes.length; l++) {
								var mesh = blocs[i][j][k].meshes[l];
								scene.remove(mesh);
							}
						}
					}
				}
			},
			eraseBloc : function(bloc) {
				if (bloc.meshes) {
					for (var i = 0; i < bloc.meshes.length; i++) {
						var mesh = bloc.meshes[i];
						scene.remove(mesh);
					}
				}
			},

			drawBloc : function(bloc) {
				var ouvertures = [];
				var pos = getXYZ(bloc, blocs);

				for (var i = 0; i < bloc.getSorties().length; i++) {
					var sortie = bloc.getSorties()[i];

					var sortiePos = getXYZ(sortie, blocs);
					if (sortiePos.x < pos.x) {
						ouvertures.push(Constants.LEFT);
					} else if (sortiePos.x > pos.x) {
						ouvertures.push(Constants.RIGHT);
					} else if (sortiePos.y < pos.y) {
						ouvertures.push(Constants.BOTTOM);
					} else if (sortiePos.y > pos.y) {
						ouvertures.push(Constants.TOP);
					} else if (sortiePos.z < pos.z) {
						ouvertures.push(Constants.BACK);
					} else if (sortiePos.z > pos.z) {
						ouvertures.push(Constants.FRONT);
					}
				}

				bloc.meshes = [];

				var createLine = function(lineGeometry) {
					var line = new THREE.Line(lineGeometry, Cube3D.LINE_MATERIAL);
					line.position.x = (pos.x - blocs.length / 2) * Cube3D.BLOCK_SIZE;
					line.position.y = (pos.y - blocs[0].length / 2) * Cube3D.BLOCK_SIZE;
					line.position.z = (pos.z - blocs[0][0].length / 2) * Cube3D.BLOCK_SIZE;
					return line;
				};

				if (ouvertures.indexOf(Constants.LEFT) >= 0) {
					var lineGeometry = new THREE.Geometry();
					lineGeometry.vertices.push(new THREE.Vector3(-Cube3D.BLOCK_HALF_SIZE, 0, 0), new THREE.Vector3(0, 0, 0));
					var line = createLine(lineGeometry);
					scene.add(line);
					bloc.meshes.push(line);
				}
				if (ouvertures.indexOf(Constants.RIGHT) >= 0) {
					var lineGeometry = new THREE.Geometry();
					lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Cube3D.BLOCK_HALF_SIZE, 0, 0));
					var line = createLine(lineGeometry);
					scene.add(line);
					bloc.meshes.push(line);
				}
				if (ouvertures.indexOf(Constants.TOP) >= 0) {
					var lineGeometry = new THREE.Geometry();
					lineGeometry.vertices.push(new THREE.Vector3(0, Cube3D.BLOCK_HALF_SIZE, 0), new THREE.Vector3(0, 0, 0));
					var line = createLine(lineGeometry);
					scene.add(line);
					bloc.meshes.push(line);
				}
				if (ouvertures.indexOf(Constants.BOTTOM) >= 0) {
					var lineGeometry = new THREE.Geometry();
					lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -Cube3D.BLOCK_HALF_SIZE, 0));
					var line = createLine(lineGeometry);
					scene.add(line);
					bloc.meshes.push(line);
				}

				if (ouvertures.indexOf(Constants.FRONT) >= 0) {
					var lineGeometry = new THREE.Geometry();
					lineGeometry.vertices.push(new THREE.Vector3(0, 0, Cube3D.BLOCK_HALF_SIZE), new THREE.Vector3(0, 0, 0));
					var line = createLine(lineGeometry);
					scene.add(line);
					bloc.meshes.push(line);
				}
				if (ouvertures.indexOf(Constants.BACK) >= 0) {
					var lineGeometry = new THREE.Geometry();
					lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -Cube3D.BLOCK_HALF_SIZE));
					var line = createLine(lineGeometry);
					scene.add(line);
					bloc.meshes.push(line);
				}
			},
			drawEntree : function() {
				var pos = getXYZ(entree);
				var geometry = new THREE.BoxGeometry(Cube3D.BLOCK_HALF_SIZE, Cube3D.BLOCK_HALF_SIZE, Cube3D.BLOCK_HALF_SIZE);
				var material = new THREE.MeshBasicMaterial({
					color : 0x00ff00
				});
				entreeMesh = new THREE.Mesh(geometry, material);
				entreeMesh.position.x = (pos.x - blocs.length / 2) * Cube3D.BLOCK_SIZE;
				entreeMesh.position.y = (pos.y - blocs[0].length / 2) * Cube3D.BLOCK_SIZE;
				entreeMesh.position.z = (pos.z - blocs[0][0].length / 2) * Cube3D.BLOCK_SIZE;
				scene.add(entreeMesh);
			},
			drawSortie : function() {
				var posSortie = getXYZ(entree.sortieLaby);

				var geometry = new THREE.BoxGeometry(Cube3D.BLOCK_HALF_SIZE, Cube3D.BLOCK_HALF_SIZE, Cube3D.BLOCK_HALF_SIZE);
				var material = new THREE.MeshBasicMaterial({
					color : 0xFF0000
				});
				sortieMesh = new THREE.Mesh(geometry, material);
				sortieMesh.position.x = (posSortie.x - blocs.length / 2) * Cube3D.BLOCK_SIZE;
				sortieMesh.position.y = (posSortie.y - blocs[0].length / 2) * Cube3D.BLOCK_SIZE;
				sortieMesh.position.z = (posSortie.z - blocs[0][0].length / 2) * Cube3D.BLOCK_SIZE;
				scene.add(sortieMesh);
			}
		};
	}
};

Cube3D.genereEntreeSortie = function(blocs) {
	var getRandomBorderCoordinate = function() {
		var side = parseInt(Math.random() * 6);

		return {
			x : side == Constants.LEFT ? 0 : side == Constants.RIGHT ? blocs.length - 1 : parseInt(Math.random() * blocs.length),
			y : side == Constants.BOTTOM ? 0 : side == Constants.TOP ? blocs[0].length - 1 : parseInt(Math.random() * blocs[0].length),
			z : side == Constants.BACK ? 0 : side == Constants.FRONT ? blocs[0][0].length - 1 : parseInt(Math.random() * blocs[0][0].length),
		};
	};

	var c = getRandomBorderCoordinate();
	var bloc = blocs[c.x][c.y][c.z];

	blocs[c.x][c.y][c.z] = new Entree(bloc);
	blocs[c.x][c.y][c.z].setId(bloc.getId());

	var c2;

	while (!c2 || c2.x == c.x && c2.y == c.y && c2.z == c.z) {
		c2 = getRandomBorderCoordinate();
	}

	bloc = blocs[c2.x][c2.y][c2.z];
	blocs[c2.x][c2.y][c2.z] = new Sortie(bloc);
	blocs[c2.x][c2.y][c2.z].setId(bloc.getId());

	blocs[c.x][c.y][c.z].sortieLaby = blocs[c2.x][c2.y][c2.z];

	return blocs[c.x][c.y][c.z];
};

Cube3D.NAME = 'Cube';

Cube3D.LINE_MATERIAL = new THREE.LineBasicMaterial({
	color : 0x0000ff,
	linewidth : 4
});
Cube3D.BLOCK_HALF_SIZE = 15;
Cube3D.BLOCK_SIZE = Cube3D.BLOCK_HALF_SIZE * 2;

Cube3D.PARAMETERS = [ {
	name : 'width',
	libelle : 'Width ? blocks',
	min : 2,
	max : 15,
	value : 7
}, {
	name : 'height',
	libelle : 'Height ? blocks',
	min : 2,
	max : 15,
	value : 7
}, {
	name : 'depth',
	libelle : 'Depth ? blocks',
	min : 1,
	max : 15,
	value : 7
} ];
