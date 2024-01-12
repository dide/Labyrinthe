"use strict";

class Dim2DChangeDialog { constructor(initialWidth, initialHeight, remoteCommand, start) {
	var that = this;

	var width = initialWidth;
	var height = initialHeight;
	var widthBackup = undefined;
	var heightBackup = undefined;

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
	title.innerHTML = 'Dimensions';

	var content = document.createElement('div');
	dialog.appendChild(content);
	content.className = 'mdl-dialog__content';

	var p1 = document.createElement('p');
	content.appendChild(p1);
	p1.innerHTML = 'Width <span id="widthValue">' + initialWidth + '</span> blocks';

	var pSlider1 = document.createElement('p');
	content.appendChild(pSlider1);
	var slider1 = document.createElement('input');
	pSlider1.appendChild(slider1);
	slider1.className = 'mdl-slider mdl-js-slider';
	slider1.type = 'range';
	slider1.min = 1;
	slider1.max = 64;
	slider1.value = initialWidth;
	slider1.tabindex = 0;

	var p2 = document.createElement('p');
	content.appendChild(p2);
	p2.innerHTML = 'Height (and depth in 3D mode) <span id="heightValue">' + initialHeight + '</span> blocks';

	var pSlider2 = document.createElement('p');
	content.appendChild(pSlider2);
	var slider2 = document.createElement('input');
	pSlider2.appendChild(slider2);
	slider2.className = 'mdl-slider mdl-js-slider';
	slider2.type = 'range';
	slider2.min = 2;
	slider2.max = 48;
	slider2.value = initialHeight;
	slider2.tabindex = 0;

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
		widthBackup = width;
		heightBackup = height;
		dialog.showModal();
	};

	this.hide = function() {
		widthBackup = undefined;
		heightBackup = undefined;
		dialog.close();
	};

	this.getWidth = function() {
		return width;
	};

	this.getHeight = function() {
		return height;
	};

	cancelButton.addEventListener('click', function() {
		width = widthBackup;
		height = heightBackup;
		document.querySelector('#widthValue').innerHTML = slider1.value = width;
		document.querySelector('#heightValue').innerHTML = slider2.value = height;
		that.hide();
	});

	var dimensionChangeHandler = function() {
		var width = slider1.value;
		var height = slider2.value;

		if (widthBackup != width || heightBackup != height) {
			OKButton.disabled = false;
		} else {
			OKButton.disabled = true;
		}

		document.querySelector('#widthValue').innerHTML = width;
		document.querySelector('#heightValue').innerHTML = height;
	};

	slider1.addEventListener('change', dimensionChangeHandler);
	slider2.addEventListener('change', dimensionChangeHandler);
	slider1.addEventListener('input', dimensionChangeHandler);
	slider2.addEventListener('input', dimensionChangeHandler);

	OKButton.addEventListener('click', function() {
		width = slider1.value;
		height = slider2.value;

		remoteCommand.stop(start);

		that.hide();
	});
}};

export { Dim2DChangeDialog };