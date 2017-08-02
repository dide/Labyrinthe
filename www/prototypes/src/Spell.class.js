class Spell {
    constructor(params, queue) {
        var params = params || {};
        this.queue = queue;
        this.damageHandlers = [];

        this.castTime = params.time || 4000;
        this.name = params.name || 'Unknown spell';
        this.damage = params.damage || 0;
    }

    div() {
        var div = document.createElement('div');
        div.className = 'SpellQueueContainer';
        div.innerHTML = this.name;

        return div;
    }

    addToQueue() {
        if (queue.time - this.queue.getTotalQueueTime() - this.castTime <= 0) {
            return;
        }

        this.queue.add(this);
    }

    fire(){
        HtmlTools.showMessage('Firing spell <b>'+this.name+'...</b>');
        return new Promise((resolve, reject) => {
            window.setTimeout(() => { 
                for (var i = 0;i< this.damageHandlers.length;i++){
                    this.damageHandlers[i](this.damage)
                }

                resolve(this, 'Animation finished'); 
            }, 2000);
        });
       
    }

    hit(f) {
        this.damageHandlers.push(f);
    }
}