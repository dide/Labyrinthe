class HtmlTools {

}

HtmlTools.timeOfScreenHeight = 20000;

HtmlTools.convertTimeToScreenCoord = function (time) {
    var screenHeight = document.querySelector('#playerqueue').offsetHeight;

    return (HtmlTools.timeOfScreenHeight - time) * screenHeight / HtmlTools.timeOfScreenHeight;
}

HtmlTools.convertTimeToDifference = function (time) {
    var screenHeight = document.querySelector('#playerqueue').offsetHeight;

    return time * screenHeight / HtmlTools.timeOfScreenHeight;
}

HtmlTools.showMessage = function (msg) {
    var div = document.querySelector('#messages');
    div.style.display = 'block';
    div.innerHTML += msg + '<br>';
}

HtmlTools.hideMessage = function () {
    var div = document.querySelector('#messages');
    div.style.display = 'none';
    div.innerHTML = '';
}

HtmlTools.initPosition = function (div, time) {
    var position = HtmlTools.convertTimeToScreenCoord(time);
    div.style.top = (position - div.offsetHeight) + 'px';
};

HtmlTools.speed = 100;

HtmlTools.move = function (div, moveTime) {
    var anim = new HtmlTools.Animation(div, moveTime);
    return anim.promise;
};

HtmlTools.Animation = function (div, moveTime) {
    // test
    this.promise = new Promise((resolve, reject) => {
        var move = function (div, time) {
            if (time <= 0) {
                resolve();
                return;
            }

            var diff = HtmlTools.convertTimeToDifference(HtmlTools.speed);

            div.style.top = (diff + div.offsetTop) + 'px';

            window.setTimeout(() => {
                move(div, time - HtmlTools.speed);
            }, 10);
        };

        move(div, moveTime);
    });
}