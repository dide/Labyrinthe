


var root = document.querySelector('#threedcontainer');
var queueLockedDiv = document.querySelector('#lockedSpells');
queueLockedDiv.style.top = HtmlTools.convertTimeToScreenCoord(queue.lockedTime + 1100) + 'px';

var playerObject = new Combattant(root, 'playerhealthbar', 'playerqueue', 'playerspells', player.knownSpells);
var enemyObject = new Combattant(root, 'enemyhealthbar', 'enemyqueue', 'enemyspells', enemy.knownSpells);

playerObject.setEnemy(enemyObject);
enemyObject.setEnemy(playerObject);

for (var i = 0; i < 1; i++) {
    enemyObject.castRandomSpell();
}

var loop = function () {
    console.log('Starting loop');

    var playerNextActionTime = playerObject.getNextActionTime();
    if (playerNextActionTime == -1) {
        return playerObject.waitForSpell().then(() => { loop(); });
    }

    var enemyNextActionTime = enemyObject.getNextActionTime();
    if (enemyNextActionTime == -1) {
        return enemyObject.waitForSpell().then(() => { loop(); });
    }

    var nextActionTime = Math.min(playerNextActionTime, enemyNextActionTime);

    return Promise.all([playerObject.play(nextActionTime), enemyObject.play(nextActionTime)]).then(() => {
        return new Promise((resolve, reject) => {
            HtmlTools.hideMessage();
            console.log('Ending loop');
            resolve();
        });
    }).then(() => {
        loop();
    }).catch((rejected) => {
        console.log(rejected);
    });
};

loop();
