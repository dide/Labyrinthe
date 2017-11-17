

var player = {
    knownSpells: [{ name: "windblade", time: 1000, damage: 5 }, {
        name: "splash", time: 2000, damage: 15
    }, { name: "fireball", time: 3000, damage: 25 }, { name: "quake", time: 4000, damage: 35 }]
    , hp: 100
};

var enemy = { knownSpells: [{ name: "bite", time: 4000, damage: 10 }, { name: "claw", time: 2000, damage: 5 }], hp: 100 };

var queue = {
    time : 20000,
    lockedTime : 5000
};