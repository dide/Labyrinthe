"use strict";

var Walls3D = function(params, scene) {
	var largeur = params.width;
	var hauteur = 1;
	var profondeur = params.length;

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

	var entree = Walls3D.genereEntreeSortie(blocs);

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

	var entreeMesh, sortieMesh, meshes;

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

				for (var i = 0; i < meshes.length; i++) {
					scene.remove(meshes[i]);
				}

				meshes = undefined;
			},
			eraseBloc : function(bloc) {
				bloc.isDrawn = false;
				bloc.drawnAngles = [];

				if (bloc.meshes) {
					for (var i = 0; i < bloc.meshes.length; i++) {
						var mesh = bloc.meshes[i];
						scene.remove(mesh);
					}
				}
			},

			drawBloc : function(bloc) {
				var ouvertures = [];
				var angles = [];
				bloc.isDrawn = true;

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

				for (var i = 0; i < bloc.getBlocsConjoints().length; i++) {
					var conjoint = bloc.getBlocsConjoints()[i];

					if (!conjoint.isDrawn)
						continue;

					var conjointPos = getXYZ(conjoint, blocs);

					if (conjointPos.x < pos.x) {
						ouvertures.push(Constants.LEFT);
					} else if (conjointPos.x > pos.x) {
						ouvertures.push(Constants.RIGHT);
					} else if (conjointPos.y < pos.y) {
						ouvertures.push(Constants.BOTTOM);
					} else if (conjointPos.y > pos.y) {
						ouvertures.push(Constants.TOP);
					} else if (conjointPos.z < pos.z) {
						ouvertures.push(Constants.BACK);
					} else if (conjointPos.z > pos.z) {
						ouvertures.push(Constants.FRONT);
					}
				}

				bloc.meshes = [];

				var createLongBoxGeometry = function(side) {
					switch (side) {
					case Constants.LEFT:
					case Constants.RIGHT:
						return new THREE.BoxGeometry(Walls3D.WALL_THICKNESS, Walls3D.WALL_HEIGHT, Walls3D.BLOCK_SIZE - Walls3D.WALL_THICKNESS);

					case Constants.FRONT:
					case Constants.BACK:
						return new THREE.BoxGeometry(Walls3D.BLOCK_SIZE - Walls3D.WALL_THICKNESS, Walls3D.WALL_HEIGHT, Walls3D.WALL_THICKNESS);
					default:
						break;
					}
				};

				var angleBoxGeometry = new THREE.BoxGeometry(Walls3D.WALL_THICKNESS, Walls3D.WALL_HEIGHT, Walls3D.WALL_THICKNESS);

				var translateBox = function(side, position) {
					switch (side) {
					case Constants.LEFT:
						position.x -= Walls3D.BLOCK_HALF_SIZE;
						// position.z += Walls3D.WALL_THICKNESS / 2;
						return;
					case Constants.RIGHT:
						position.x += Walls3D.BLOCK_HALF_SIZE;
						// position.z -= Walls3D.WALL_THICKNESS / 2;
						return;
					case Constants.FRONT:
						position.z += Walls3D.BLOCK_HALF_SIZE;
						// position.x += Walls3D.WALL_THICKNESS / 2;
						return;
					case Constants.BACK:
						position.z -= Walls3D.BLOCK_HALF_SIZE;
						// position.x -= Walls3D.WALL_THICKNESS / 2;
						return;
					default:
						break;
					}
				};

				var createBox = function(boxGeometry) {
					var box = new THREE.Mesh(boxGeometry, Walls3D.WALL_MATERIAL);

					// box.receiveShadow = true;
					// box.castShadow = true;

					box.position.x = (pos.x - (blocs.length - 1) / 2) * Walls3D.BLOCK_SIZE;
					box.position.y = Walls3D.WALL_HEIGHT / 2;
					box.position.z = (pos.z - (blocs[0][0].length - 1) / 2) * Walls3D.BLOCK_SIZE;
					return box;
				};

				for (var i = 0; i < Constants.HORIZONTAL_DIRECTIONS.length; i++) {
					var direction = Constants.HORIZONTAL_DIRECTIONS[i];

					if (ouvertures.indexOf(direction) >= 0)
						continue;
					var boxGeometry = createLongBoxGeometry(direction);
					var box = createBox(boxGeometry);
					translateBox(direction, box.position);
					scene.add(box);
					bloc.meshes.push(box);
				}

				if ((pos.x == 0 || !blocs[pos.x - 1][0][pos.z].isDrawn) && (pos.z == 0 || pos.x == 0 || !blocs[pos.x - 1][0][pos.z - 1].isDrawn)
						&& (pos.z == 0 || !blocs[pos.x][0][pos.z - 1].isDrawn)) {
					var box = createBox(angleBoxGeometry);
					translateBox(Constants.BACK, box.position);
					translateBox(Constants.LEFT, box.position);
					scene.add(box);
					bloc.meshes.push(box);
				}

				if (pos.x < blocs.length - 1 && blocs[pos.x + 1][0][pos.z].isDrawn || pos.x < blocs.length - 1 && pos.z < blocs[0][0].length - 1
						&& blocs[pos.x + 1][0][pos.z + 1].isDrawn || pos.z < blocs[0][0].length - 1 && blocs[pos.x][0][pos.z + 1].isDrawn) {
					// continue;
				} else {
					var box = createBox(angleBoxGeometry);
					translateBox(Constants.FRONT, box.position);
					translateBox(Constants.RIGHT, box.position);
					scene.add(box);
					bloc.meshes.push(box);
				}

				if (pos.x > 0 && blocs[pos.x - 1][0][pos.z].isDrawn || pos.x > 0 && pos.z < blocs[0][0].length - 1 && blocs[pos.x - 1][0][pos.z + 1].isDrawn
						|| pos.z < blocs[0][0].length - 1 && blocs[pos.x][0][pos.z + 1].isDrawn) {
					// continue;
				} else {
					var box = createBox(angleBoxGeometry);
					translateBox(Constants.FRONT, box.position);
					translateBox(Constants.LEFT, box.position);
					scene.add(box);
					bloc.meshes.push(box);
				}

				if (pos.x < blocs.length - 1 && blocs[pos.x + 1][0][pos.z].isDrawn || pos.x < blocs.length - 1 && pos.z > 0
						&& blocs[pos.x + 1][0][pos.z - 1].isDrawn || pos.z > 0 && blocs[pos.x][0][pos.z - 1].isDrawn) {
					// continue;
				} else {
					var box = createBox(angleBoxGeometry);
					translateBox(Constants.BACK, box.position);
					translateBox(Constants.RIGHT, box.position);
					scene.add(box);
					bloc.meshes.push(box);
				}

			},
			drawEntree : function() {
				var pos = getXYZ(entree);
				var geometry = new THREE.BoxGeometry(Walls3D.BLOCK_HALF_SIZE, Walls3D.BLOCK_HALF_SIZE, Walls3D.BLOCK_HALF_SIZE);
				var material = new THREE.MeshBasicMaterial({
					color : 0x00ff00
				});
				entreeMesh = new THREE.Mesh(geometry, material);
				entreeMesh.position.x = (pos.x - (blocs.length - 1) / 2) * Walls3D.BLOCK_SIZE;
				entreeMesh.position.y = Walls3D.WALL_HEIGHT / 2;
				entreeMesh.position.z = (pos.z - (blocs[0][0].length - 1) / 2) * Walls3D.BLOCK_SIZE;
				scene.add(entreeMesh);

				var geometry = new THREE.PlaneGeometry(blocs.length * Walls3D.BLOCK_SIZE, blocs[0][0].length * Walls3D.BLOCK_SIZE);
				// var material = new THREE.MeshBasicMaterial( {color: 0xffff00}
				// );
				var material = new THREE.MeshPhongMaterial({
					color : 0x63d477,
					specular : 0x0,
					emissive : 0x0
				});

				var plane = new THREE.Mesh(geometry, material);
				// plane.receiveShadow = true;
				plane.rotation.x = -Math.PI / 2;
				// plane.rotation.set(-Math.PI/2, Math.PI/2000, Math.PI);
				// plane.position.y = -Walls3D.BLOCK_HALF_SIZE;

				scene.add(plane);
				meshes = [];
				meshes.push(plane);
			},
			drawSortie : function() {
				var posSortie = getXYZ(entree.sortieLaby);

				var geometry = new THREE.BoxGeometry(Walls3D.BLOCK_HALF_SIZE, Walls3D.BLOCK_HALF_SIZE, Walls3D.BLOCK_HALF_SIZE);
				var material = new THREE.MeshBasicMaterial({
					color : 0xFF0000
				});
				sortieMesh = new THREE.Mesh(geometry, material);
				sortieMesh.position.x = (posSortie.x - (blocs.length - 1) / 2) * Walls3D.BLOCK_SIZE;
				sortieMesh.position.y = Walls3D.WALL_HEIGHT / 2;
				sortieMesh.position.z = (posSortie.z - (blocs[0][0].length - 1) / 2) * Walls3D.BLOCK_SIZE;
				scene.add(sortieMesh);
			}
		};
	}
};

Walls3D.genereEntreeSortie = function(blocs) {
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

Walls3D.NAME = 'Classique avec des murs';

Walls3D.WALL_MATERIAL = new THREE.MeshPhongMaterial({
	color : 0xffffff,
	specular : 0x0,
	emissive : 0x0
});
Walls3D.BLOCK_HALF_SIZE = 3;
Walls3D.BLOCK_SIZE = Walls3D.BLOCK_HALF_SIZE * 2;
Walls3D.WALL_THICKNESS = 1;
Walls3D.WALL_HEIGHT = Walls3D.BLOCK_HALF_SIZE;

Walls3D.PARAMETERS = [ {
	name : 'width',
	libelle : 'Width ? blocks',
	min : 4,
	max : 40,
	value : 15
}, {
	name : 'length',
	libelle : 'Length ? blocks',
	min : 4,
	max : 40,
	value : 25
} ];
