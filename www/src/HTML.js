"use strict";

class HTML { constructor() {

}};

HTML.createDom = function(blocs) {
	var table = document.createElement('table');

	for (var i = 0; i < blocs.length; i++) {
		var tr = document.createElement('tr');
		table.appendChild(tr);

		for (var j = 0; j < blocs[i].length; j++) {
			var bloc = blocs[i][j];
			var td = document.createElement('td');
			tr.appendChild(td);
			td.innerHTML = ''; // bloc.getId();

			if (bloc instanceof Sortie) {
				td.className = 'sortie';
			} else if (bloc instanceof Entree) {
				td.className = 'entree';
			}

			bloc.dom = td;
		}
	}

	return table;
};

HTML.removeDrawBloc = function(bloc) {
	bloc.dom.className = bloc.dom.className.replace('path', '');
	bloc.dom.style.borderTop = null;
	bloc.dom.style.borderRight = null;
	bloc.dom.style.borderBottom = null;
	bloc.dom.style.borderLeft = null;
};

HTML.drawBloc = function(bloc) {
	if (bloc.dom.className.length == 0) {
		bloc.dom.className = 'path';
	}

	var ouvertures = [];
	var pos = HTML.getXYFromDom(bloc.dom);

	for (var i = 0; i < bloc.getSorties().length; i++) {
		var sortie = bloc.getSorties()[i];

		var sortiePos = HTML.getXYFromDom(sortie.dom);
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

	var borderStyle = '3px solid black';

	if (ouvertures.indexOf(Constants.LEFT) == -1) {
		bloc.dom.style.borderLeft = borderStyle;
	}
	if (ouvertures.indexOf(Constants.RIGHT) == -1) {
		bloc.dom.style.borderRight = borderStyle;
	}
	if (ouvertures.indexOf(Constants.TOP) == -1) {
		bloc.dom.style.borderTop = borderStyle;
	}
	if (ouvertures.indexOf(Constants.BOTTOM) == -1) {
		bloc.dom.style.borderBottom = borderStyle;
	}
};

HTML.getXYFromDom = function(tdDom) {
	var trs = Array.prototype.slice.call(document.querySelector('.labyrinthe').querySelectorAll('tr'));
	var tds = Array.prototype.slice.call(document.querySelector('.labyrinthe').querySelectorAll('td'));

	var nbCols = tds.length / trs.length;

	var index = tds.indexOf(tdDom);

	return {
		x : parseInt(index % nbCols),
		y : parseInt(index / nbCols)
	};
};

HTML.bind = function(){
	var blocs;
	var entree;
	var table;
	
	var changeDimensionHandler = function(event) {
		var hauteur = document.querySelector('input[name="hauteur"]').value || 4;
		var largeur = document.querySelector('input[name="largeur"]').value || 8;
		
		blocs = Labyrinthe.genere(hauteur, largeur);
		entree = Labyrinthe.genereEntreeSortie(blocs);
		table = HTML.createDom(blocs);

		document.querySelector('.labyrinthe').innerHTML = '';
		document.querySelector('.labyrinthe').appendChild(table);
	};
	
	document.querySelector('input[name="largeur"]').addEventListener('change', changeDimensionHandler);
	document.querySelector('input[name="hauteur"]').addEventListener('change', changeDimensionHandler);
	
	var stepTracer = new StepTracer();

	stepTracer.addBacktrackHandler(function(bloc, resolve, reject){
		HTML.removeDrawBloc(bloc);
		resolve();
	});

	stepTracer.addNextHandler(function(bloc, resolve, reject){
		window.setTimeout(function() {
			HTML.drawBloc(bloc);
			resolve();
		}, 1);
	});

	stepTracer.addDualChoiceHandler(function(bloc, resolve, reject){
		resolve();
	});

	document.querySelector('.generer').addEventListener('click', function(event) {
		event.preventDefault();
		
		for (var i=0;i<blocs.length;i++){
			for (var j=0;j<blocs[0].length;j++){
				blocs[i][j].removeSorties();
			}
		}
		
		var tds = table.querySelectorAll('td');
		for (var i = 0; i < tds.length; i++) {
			var td = tds[i];
			td.style.borderTop = null;
			td.style.borderRight = null;
			td.style.borderBottom = null;
			td.style.borderLeft = null;
			if (td.className.indexOf('path') >= 0)
				td.className = '';
		}

		entree.trouveSortie(stepTracer).then(function(path){
			return Labyrinthe.fill(path, blocs.length * blocs[0].length, stepTracer);
		}).catch(function(error){
			console.error(error);
		});
		return false;
	});
	
	changeDimensionHandler();
};

export { HTML };