"use strict";

var ParamsDialog = function(params, restart) {
	var that = this;

	var paramsValueBackup = [];
	
	for (var i=0;i<params.length;i++){
		paramsValueBackup.push(params[i].value);
	}
	
	var paramsValue = [];
	var libelles = [];
	var sliders = [];
	
	for (var i=0;i<params.length;i++){
		paramsValue.push(params[i].value);
	}
	
	var main = document.querySelector('main');

	var dialog = document.createElement('dialog');
	main.appendChild(dialog);
	dialog.className = 'mdl-dialog';
	if (!dialog.showModal) {
		dialogPolyfill.registerDialog(dialog);
	}

	var title = document.createElement('h4');
	dialog.appendChild(title);
	title.className = 'mdl-dialog__title';
	title.innerHTML = 'Parameters';

	var content = document.createElement('div');
	dialog.appendChild(content);
	content.className = 'mdl-dialog__content';

	for (var i=0;i<params.length;i++){
		var param = params[i];
		var p = document.createElement('p');
		content.appendChild(p);
		libelles.push(p);
		p.innerHTML = param.libelle.replace('?', param.value);

		var pSlider = document.createElement('p');
		content.appendChild(pSlider);
		var slider = document.createElement('input');
		pSlider.appendChild(slider);
		slider.className = 'mdl-slider mdl-js-slider';
		slider.type = 'range';
		slider.min = param.min;
		slider.max = param.max;
		slider.value = param.value;
		slider.tabindex = 0;
		
		sliders.push(slider);
	}

	var actions = document.createElement('div');
	dialog.appendChild(actions);
	actions.className = 'mdl-dialog__actions';

	var OKButton = document.createElement('button');
	actions.appendChild(OKButton);
	OKButton.className = 'mdl-button';
	OKButton.innerHTML = 'OK';
	OKButton.disabled = true;

	var cancelButton = document.createElement('button');
	actions.appendChild(cancelButton);
	cancelButton.className = 'mdl-button';
	cancelButton.innerHTML = 'Cancel';

	this.show = function() {
		dialog.showModal();
	};

	this.hide = function() {
		dialog.close();
	};

	this.getParams = function(i) {
		var result = {};
		
		for (var i=0;i<params.length;i++){
			result[params[i].name] = paramsValue[i];
		}
		return result;
	};

	cancelButton.addEventListener('click', function() {
		paramsValue = paramsValueBackup.slice(0);

		for (var i = 0; i < params.length; i++) {
			sliders[i].value = paramsValue[i];
			libelles[i].innerHTML = params[i].libelle.replace('?', paramsValue[i]);
		}
		that.hide();
	});

	var dimensionChangeHandler = function() {
		OKButton.disabled = true;
		
		for (var i=0;i<params.length;i++){
			if (sliders[i].value != paramsValueBackup[i]){
				OKButton.disabled = false;
				break;
			}
		}
		
		for (var i=0;i<params.length;i++){
			paramsValue[i] = sliders[i].value;
			libelles[i].innerHTML = params[i].libelle.replace('?', paramsValue[i]);
		}
	};

	for (var i=0;i<params.length;i++){
		sliders[i].addEventListener('change', dimensionChangeHandler);
		sliders[i].addEventListener('input', dimensionChangeHandler);
	}

	OKButton.addEventListener('click', function() {
		paramsValueBackup = paramsValue.slice(0);
		
		restart();

		that.hide();
	});
};