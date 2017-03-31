"use strict";

var Labyrinthe3D = function(bc) {
	
};

Labyrinthe3D.MODELS = [Cube3D, Disc3D, Walls3D];

Labyrinthe3D.newStepTracer = function(drawer, remoteCommand){
	var stepTracer = new StepTracer();

	stepTracer.addBacktrackHandler(function(bloc, resolve, reject){
		drawer.eraseBloc(bloc);
		resolve();
	});
	
	stepTracer.addNextHandler(function(bloc, resolve, reject){
		return remoteCommand.promise().then(function(){
			window.setTimeout(function() {
				drawer.drawBloc(bloc);
				resolve();
			}, 1);
		}).catch(function(error){
			console.warn(error);
		});
	});

	stepTracer.addDualChoiceHandler(function(bloc, resolve, reject){
		resolve();
	});
	
	return stepTracer;
};

Labyrinthe3D.bindToThreeJs = function(scene) {
	var stepTracer;
    var dimensionsChangeDialog, ModeleSelection;
    
	var navigationBar = document.querySelector('nav.mdl-navigation');
	
	var ModelLoader = function(model){
		var that = this;
		var dom = document.createElement('a');
		
		navigationBar.appendChild(dom);
		dom.className = 'mdl-navigation__link selected';
		dom.innerHTML = model.NAME;
		dom.href = '#';
		
		dom.addEventListener('click', function(event){
			event.preventDefault();
			that.load();
			return false;
		});
		
		this.load = function(){
			ModeleSelection = model;
			dimensionsChangeDialog = new ParamsDialog(ModeleSelection.PARAMETERS
				    , function(){
				    	remoteCommand.stop(function(){
				    		remoteCommand.play();
				    		start();
				    	});
				    });
			remoteCommand.stop(function(){
				remoteCommand.play();
				start();
	    	});
		};
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
	
	var nextButton = document.querySelector('.next');
	nextButton.addEventListener('click', function() {
		
		// skip_next
		event.preventDefault();
		
		var i = this.querySelector('i');
		
		if (remoteCommand.isStopped()){
			i.innerHTML = "skip_next";
			remoteCommand.next();
			start();
		} else {
			remoteCommand.next();
		}
		
		return false;
		remoteCommand.next();
    });
	
	var downloadButton = document.querySelector('.download');
	downloadButton.addEventListener('click', function() {
		Tools3D.exportScene();
    });
	
    var showDialogButton = document.querySelector('.settings');
    showDialogButton.addEventListener('click', function() {
    	dimensionsChangeDialog.show();
    });
    
    var modele3D;
    var start = function(){
    	if (modele3D)
    		modele3D.getDrawer().clearScene();
    	
    	modele3D = new ModeleSelection(dimensionsChangeDialog.getParams(), scene);
    	
    	var drawer = modele3D.getDrawer();
    	
    	// remoteCommand.play();
    	stepTracer = Labyrinthe3D.newStepTracer(drawer, remoteCommand);
    	
    	
    	drawer.drawEntree();
    	drawer.drawSortie();
		
    	modele3D.trouveSortie(stepTracer).then(function(path){
			return Labyrinthe.fill(path, modele3D.size(), stepTracer);
		}).then(function(){
			remoteCommand.stop();
			var i = document.querySelector('.command i');
			i.innerHTML = "play_arrow";
			
			i = document.querySelector('.next i');
			i.innerHTML = "navigate_next";
		}).catch(function(error){
			console.error(error);
		});
    };
    
	for (var i=0;i<Labyrinthe3D.MODELS.length;i++){
		var loader = new ModelLoader(Labyrinthe3D.MODELS[i]);
		
		if (!ModeleSelection) {
			ModeleSelection = Labyrinthe3D.MODELS[i];
			loader.load();
		}
	}
    
};

Labyrinthe3D.bindToThreeJs(Tools3D.scene);