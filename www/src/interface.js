var mouseOver = false;

document.querySelector('.fixed-action-btn').addEventListener('mouseover', function() {
	mouseOver = true;
	displayButtons();
});

var displayButtons = function() {
	buttons = document.querySelectorAll('.fixed-action-btn .laby-sub-item');

	var AddShowClass = function(button) {
		this.fire = function() {
			if (mouseOver && button.className.indexOf('show') == -1)
				button.className += " show";
		};
	};

	for (var i = buttons.length - 1; i >= 0; i--) {
		window.setTimeout(new AddShowClass(buttons[i]).fire, (buttons.length - 1 - i) * 30 + 1);
	}
};

var removeClass = function(node, className) {
	var re = new RegExp(' ?' + className, "g");
	node.className = node.className.replace(re, '');
};

document.querySelector('.fixed-action-btn').addEventListener('mouseleave', function() {
	mouseOver = false;
	hideButtons();
});

var hideButtons = function() {
	buttons = document.querySelectorAll('.fixed-action-btn .laby-sub-item');

	var RemoveShowClass = function(button) {
		this.fire = function() {
			if (!mouseOver)
				removeClass(button, 'show');
		};
	};

	for (var i = 0; i < buttons.length; i++) {
		window.setTimeout(new RemoveShowClass(buttons[i]).fire, i * 30 + 1);
	}
};


