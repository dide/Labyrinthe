"use strict";

var Labyrinthe2D = function(bc) {
	
};

Labyrinthe2D.genere = function(largeur, hauteur) {
	var blocs = [];

	for (var i = 0; i < largeur; i++) {
		blocs[i] = [];

		for (var j = 0; j < hauteur; j++) {
			var bloc = new Bloc();
			blocs[i].push(bloc);

			bloc.setId(i * largeur + j);
		}
	}

	for (var i = 0; i < largeur; i++) {
		for (var j = 0; j < hauteur; j++) {
			var bloc = blocs[i][j];
			if (i > 0) {
				bloc.addBlocConjoint(blocs[i - 1][j]);
			}

			if (i < blocs.length - 1) {
				bloc.addBlocConjoint(blocs[i + 1][j]);
			}

			if (j > 0) {
				bloc.addBlocConjoint(blocs[i][j - 1]);
			}

			if (j < blocs[i].length - 1) {
				bloc.addBlocConjoint(blocs[i][j + 1]);
			}
		}
	}

	return blocs;
};

Labyrinthe2D.genereEntreeSortie = function(blocs) {
	var getRandomBorderCoordinate = function() {
		var side = parseInt(Math.random() * 4);

		return {
			x : side == Constants.LEFT ? 0 : side == Constants.RIGHT ? blocs.length - 1 : parseInt(Math.random() * blocs.length),
			y : side == Constants.TOP ? 0 : side == Constants.BOTTOM ? blocs[0].length - 1 : parseInt(Math.random() * blocs[0].length)
		};
	};

	var c = getRandomBorderCoordinate();
	var bloc = blocs[c.x][c.y];

	blocs[c.x][c.y] = new Entree(bloc);
	blocs[c.x][c.y].setId(bloc.getId());

	var c2;

	while (!c2 || c2.x == c.x && c2.y == c.y) {
		c2 = getRandomBorderCoordinate();
	}

	bloc = blocs[c2.x][c2.y];
	blocs[c2.x][c2.y] = new Sortie(bloc);
	blocs[c2.x][c2.y].setId(bloc.getId());
	
	blocs[c.x][c.y].sortieLaby = blocs[c2.x][c2.y];
	
	return blocs[c.x][c.y];
};

Labyrinthe2D.LINE_MATERIAL = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth:4 });
Labyrinthe2D.BLOCK_HALF_SIZE = 5;
Labyrinthe2D.BLOCK_SIZE = Labyrinthe2D.BLOCK_HALF_SIZE * 2;

Labyrinthe2D.newStepTracer = function(scene, blocs, remoteCommand){
	var stepTracer = new StepTracer();

	stepTracer.addBacktrackHandler(function(bloc, resolve, reject){
		if (bloc.meshes){
			for (var k = 0; k < bloc.meshes.length; k++) {
				var mesh = bloc.meshes[k];
				scene.remove(mesh);
			}
		}
		resolve();
	});
	
	stepTracer.addNextHandler(function(bloc, resolve, reject){
		remoteCommand.promise().then(function(){
			window.setTimeout(function() {
				var ouvertures = [];
				var pos = Labyrinthe2D.getXYFromArray(bloc, blocs);
				
				for (var i = 0; i < bloc.getSorties().length; i++) {
					var sortie = bloc.getSorties()[i];
	
					var sortiePos = Labyrinthe2D.getXYFromArray(sortie, blocs);
					if (sortiePos.x < pos.x) {
						ouvertures.push(Constants.LEFT);
					} else if (sortiePos.x > pos.x) {
						ouvertures.push(Constants.RIGHT);
					} else if (sortiePos.y < pos.y) {
						ouvertures.push(Constants.TOP);
					} else if (sortiePos.y > pos.y) {
						ouvertures.push(Constants.BOTTOM);
					}
				}
				
				bloc.meshes = [];
				
				var createLine = function(lineGeometry){
					var line = new THREE.Line( lineGeometry, Labyrinthe2D.LINE_MATERIAL );
					line.position.x = (pos.x - blocs.length / 2) * Labyrinthe2D.BLOCK_SIZE;
					line.position.y =  (pos.y - blocs[0].length / 2) * Labyrinthe2D.BLOCK_SIZE;
					return line;
				};
				
				if (ouvertures.indexOf(Constants.LEFT) >= 0) {
					var lineGeometry = new THREE.Geometry(); 
					lineGeometry.vertices.push( 
							new THREE.Vector3( -Labyrinthe2D.BLOCK_HALF_SIZE, 0, 0 ), 
							new THREE.Vector3( 0, 0, 0 ) );
					var line = createLine(lineGeometry);
					scene.add( line );
					bloc.meshes.push(line);
				}
				if (ouvertures.indexOf(Constants.RIGHT) >= 0) {
					var lineGeometry = new THREE.Geometry(); 
					lineGeometry.vertices.push( 
							new THREE.Vector3( 0, 0, 0 ), 
							new THREE.Vector3( Labyrinthe2D.BLOCK_HALF_SIZE, 0, 0 ) );
					var line = createLine(lineGeometry);
					scene.add( line );
					bloc.meshes.push(line);
				}
				if (ouvertures.indexOf(Constants.BOTTOM) >= 0) {
					var lineGeometry = new THREE.Geometry(); 
					lineGeometry.vertices.push( 
							new THREE.Vector3( 0, Labyrinthe2D.BLOCK_HALF_SIZE, 0 ), 
							new THREE.Vector3( 0, 0, 0 ) );
					var line = createLine(lineGeometry);
					scene.add( line );
					bloc.meshes.push(line);
				}
				if (ouvertures.indexOf(Constants.TOP) >= 0) {
					var lineGeometry = new THREE.Geometry(); 
					lineGeometry.vertices.push( 
							new THREE.Vector3( 0, 0, 0 ), 
							new THREE.Vector3( 0, -Labyrinthe2D.BLOCK_HALF_SIZE, 0 ) );
					var line = createLine(lineGeometry);
					scene.add( line );
					bloc.meshes.push(line);
				}
				
				resolve();
			}, 1);
		});
	});

	stepTracer.addDualChoiceHandler(function(bloc, resolve, reject){
		resolve();
	});
	
	return stepTracer;
};

Labyrinthe2D.getXYFromArray = function(bloc, blocs){
	var x = -1,y = -1;
	for (var i = 0; i < blocs.length; i++) {
		var blocLine = blocs[i];
		var index = blocLine.indexOf(bloc);
		if (index >= 0) {
			x = i;
			y = index;
			break;
		}
	}
	
	if (x == -1)
		throw new Error('pas possible quon ne trouve pas le block');
	
	return { x : x, y : y};
};

Labyrinthe2D.bindToThreeJs = function(scene) {
	var blocs;
	var entree;
	var stepTracer;
	var entreeMesh, sortieMesh;
	
	var clear = function(){
		if (entreeMesh){
			scene.remove(entreeMesh);
			scene.remove(sortieMesh);
		}
		
		if (!blocs)
			return;
		
		for (var i=0;i<blocs.length;i++){
			for (var j=0;j<blocs[0].length;j++){
				blocs[i][j].removeSorties();
				
				if (!blocs[i][j].meshes)
					continue;
				
				for (var k = 0; k < blocs[i][j].meshes.length; k++) {
					var mesh = blocs[i][j].meshes[k];
					scene.remove(mesh);
				}
			}
		}
	};
	
	var remoteCommand = new RemoteCommand();
	
	document.querySelector('.command').addEventListener('click', function(event) {
		event.preventDefault();
		
		var i = this.querySelector('i');
		
		if (remoteCommand.isStopped()){
			i.innerHTML = "pause";
			remoteCommand.play();
			start();
		} else if (remoteCommand.isPlaying()){
			remoteCommand.pause();
			i.innerHTML = "play_arrow";
		} else {
			remoteCommand.play();
			i.innerHTML = "pause";
		}
		
		return false;
	});
	
    var showDialogButton = document.querySelector('.settings');
    showDialogButton.addEventListener('click', function() {
    	dimensionsChangeDialog.show();
    });
    
 
    
    var start = function(){
    	clear();
    	
    	var hauteur = dimensionsChangeDialog.getWidth(); 
    	var largeur = dimensionsChangeDialog.getHeight();

    	blocs = Labyrinthe2D.genere(hauteur, largeur);
    	stepTracer = Labyrinthe2D.newStepTracer(scene, blocs, remoteCommand);
    	entree = Labyrinthe2D.genereEntreeSortie(blocs);
    	remoteCommand.play();
    	
    	var pos = Labyrinthe2D.getXYFromArray(entree, blocs);
		
		var geometry = new THREE.BoxGeometry( Labyrinthe2D.BLOCK_HALF_SIZE, Labyrinthe2D.BLOCK_HALF_SIZE, Labyrinthe2D.BLOCK_HALF_SIZE );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		entreeMesh = new THREE.Mesh( geometry, material );
		entreeMesh.position.x = (pos.x - blocs.length / 2) * Labyrinthe2D.BLOCK_SIZE;
		entreeMesh.position.y = (pos.y - blocs[0].length / 2) * Labyrinthe2D.BLOCK_SIZE;
		Tools3D.scene.add( entreeMesh );
		
		var posSortie = Labyrinthe2D.getXYFromArray(entree.sortieLaby, blocs);
		
		var geometry = new THREE.BoxGeometry( Labyrinthe2D.BLOCK_HALF_SIZE, Labyrinthe2D.BLOCK_HALF_SIZE, Labyrinthe2D.BLOCK_HALF_SIZE );
		var material = new THREE.MeshBasicMaterial( {color: 0xFF0000} );
		sortieMesh = new THREE.Mesh( geometry, material );
		sortieMesh.position.x = (posSortie.x - blocs.length / 2) * Labyrinthe2D.BLOCK_SIZE;
		sortieMesh.position.y = (posSortie.y - blocs[0].length / 2) * Labyrinthe2D.BLOCK_SIZE;
		Tools3D.scene.add( sortieMesh );
		
		entree.trouveSortie(stepTracer).then(function(path){
			return Labyrinthe.fill(path, blocs.length * blocs[0].length, stepTracer);
		}).then(function(){
			remoteCommand.stop();
			var i = document.querySelector('.command i');
			i.innerHTML = "play_arrow";
		}).catch(function(error){
			console.error(error);
		});
    };
    
    var dimensionsChangeDialog = new Dim2DChangeDialog(32, 48, remoteCommand, start);
    
    start();
};

Labyrinthe2D.bindToThreeJs(Tools3D.scene);