"use strict";

import { Bloc } from "./Bloc";
import { Path } from "./Path";

class Entree extends Bloc { constructor(bc) {
	super(bc);

	this.trouveSortie = function(stepTracer) {
		return Bloc.prototype.trouveSortie.call(this, undefined, new Path(), stepTracer);
	};
	
	this.fillEmptyPath = function(pathToExit, stepTracer){
		var paths = [];
		var concatenedPaths = [].concat(pathToExit);
		
		for (var i = 0;i<blocs.length;i++){
			for (var j = 0;j<blocs.length;j++){
				var bloc = blocs[i][j];
				var neighboors = bloc.getBlocsConjoints();
				
				for (var k=0;k<neighboors.length;k++){
					var neighboor = neighboors[k];
					
					if (concatenedPaths.indexOf(neighboor.getId()) >= 0){
						continue;
					}
					
					var newPath = [bloc.getId()];
					neighboor.randomPath(pathToExit, newPath, stepTracer);
					paths.push(newPath);
					concatenedPaths = concatenedPaths.concat(newPath);
				}
			}
		}
		
		console.log(paths.length);
	};
}};

// Entree.prototype = Object.create(Bloc.prototype);

export { Entree };