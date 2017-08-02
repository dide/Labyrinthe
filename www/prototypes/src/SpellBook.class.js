class SpellBook {

    constructor(rootDiv, divId, spells) {
        this.spells = spells;
        this.bookDiv = rootDiv.querySelector('#' + divId);

        for (let spell of this.spells){
            var spellDiv = spell.div();
            spellDiv.className = 'SpellBookContainer';
            this.bookDiv.appendChild(spellDiv);
            spellDiv.style.bottom = '5%';
            spellDiv.addEventListener('click', () => {spell.addToQueue();});
        }
    }

    plugEnemy(enemy) {
        for (var s of this.spells) {
            s.hit((damage) => {
                enemy.hit(damage);
            });
        }
    }

    castRandomSpell(){
        var spellIndex = parseInt(Math.random() * this.spells.length);
        return this.spells[spellIndex];
    }
}