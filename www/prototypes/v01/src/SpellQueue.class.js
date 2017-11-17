class SpellQueue {
    constructor(rootDiv, divId) {
        this.resolveWaiting = undefined;
        this.spellContainers = [];
        this.queueDiv = rootDiv.querySelector('#' + divId);
    }


    getTotalQueueTime() {
        if (this.spellContainers.length > 0) {
            var popedElement = this.spellContainers.pop();
            var queueTime = popedElement.time;
            this.spellContainers.push(popedElement);
            return queueTime;
        } else {
            return 0;
        }
    }

    getNextActionTime(){
        if (this.spellContainers.length == 0){
            return -1;
        }

        return this.spellContainers[0].time;
    }

    waitForSpell() {
        if (this.resolveWaiting)
            throw new Error('Should not be possible.');

        HtmlTools.showMessage('Waiting for player ('+this.queueDiv.id+')');

        return new Promise((resolve, reject) => {
            this.resolveWaiting = resolve
        });
    }

    add(spell) {
        var queueTime = 0;

        if (this.spellContainers.length > 0) {
            var popedElement = this.spellContainers.pop();
            queueTime += popedElement.time;
            this.spellContainers.push(popedElement);
        }

        var c = new SpellContainer(spell, this, queueTime);
        this.spellContainers.push(c);
        HtmlTools.initPosition(c.div, c.time);

        if (this.resolveWaiting) {
            this.resolveWaiting();
            this.resolveWaiting = undefined;
        }
    }

    play(nextActionTime) {
        if (this.getTotalQueueTime() < queue.lockedTime) {
            return this.waitForSpell();
        }

        return Promise.all(this.spellContainers.map((container) => {
            return container.move(nextActionTime).then((container) => {

                if (container) {
                    var index = this.spellContainers.indexOf(container);
                    this.spellContainers.splice(index, 1);
                }

                return new Promise((resolve, reject) => { resolve(); });
            });
        }));
    }
}

class SpellContainer {
    constructor(spell, queue, offsetTime) {
        this.spell = spell;
        this.time = spell.castTime + offsetTime;
        this.queue = queue;

        this.div = spell.div();
        this.div.style.top = 0;

        this.queue.queueDiv.appendChild(this.div);
    }

    move(time) {
        return new Promise((resolve, reject) => {
            if (this.time > 0) {
                this.time -= time;
                /* this.div.style.top = (HtmlTools.convertTimeToScreenCoord(this.time) - this.div.offsetHeight) + 'px';

                resolve(); */

                return HtmlTools.move(this.div, time).then(() => {
                    resolve();
                });
            } else {
                var that = this;
                return this.fire().then(() => {
                    resolve(that);
                });
            }
        });

    }

    fire() {
        console.log('Firing ' + this.div.innerHTML);
        this.queue.queueDiv.removeChild(this.div);
        return this.spell.fire();
    }
}