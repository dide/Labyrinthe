
class Combattant {
    constructor(rootDiv, healthBarId, queueId, spellBookId, spellsParams) {
        this.healthDiv = rootDiv.querySelector('#' + healthBarId);

        this.initialWidth = this.healthDiv.offsetWidth;
        this.health = 100;

        this.spellQueue = new SpellQueue(root, queueId);

        var spells = [];
        for (var spellParam of spellsParams) {
            spells.push(new Spell(spellParam, this.spellQueue));
        }

        this.spellBook = new SpellBook(root, spellBookId, spells);
    }

    setEnemy(enemy) {
        this.spellBook.plugEnemy(enemy);
    }

    hit(damage) {
        this.health -= damage;
        this.healthDiv.style.width = (this.health * this.initialWidth / 100) + "px";
    }

    castRandomSpell() {
        var spell = this.spellBook.castRandomSpell();
        this.spellQueue.add(spell);
    }

    play(nextActionTime) {
        console.log(this.healthDiv.id + ' is playing');
        return this.spellQueue.play(nextActionTime);
    }

    getNextActionTime(){
        return this.spellQueue.getNextActionTime();
    }

    waitForSpell(){
        return this.spellQueue.waitForSpell();
    }
}