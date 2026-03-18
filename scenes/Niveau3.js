
var player;
var clavier;
var gameOver = false;
var layer1;
var layer2;
var porte1;
var porte2;
var compteurTeleportPorte2 = 0;
var calque1Actif = false;
var coffres = [];



export default class niveau3 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau3" });
	}
    preload() {
    this.load.image('img_lasers', 'assets/lasers.png');
    this.load.image('img_decor2_1', 'assets/d\u00e9cor2.1.png');
    this.load.image('img_items', 'assets/items.png');
    this.load.image('img_coffre_ferme', 'assets/coffre_ferm\u00e9.png');
    this.load.image('img_coffre_ouvert', 'assets/coffre_ouvert.png');
    this.load.tilemapTiledJSON('ma_map', 'assets/Map/map_niveau3.tmj');

    this.load.spritesheet("img_perso", "assets/savant2.png", {
        frameWidth: 40,
        frameHeight: 50,
        spacing: 1
    });

    this.load.spritesheet("img_porte", "assets/porteORANGE999.png", {
        frameWidth: 96,
        frameHeight: 120
    }); 

}
    create() {
    const map = this.make.tilemap({ key: 'ma_map' });
    const tilesetLasers = map.addTilesetImage('lasers', 'img_lasers');
    const tilesetDecor = map.addTilesetImage('d\u00e9cor2.1', 'img_decor2_1');
    const tilesetItems = map.addTilesetImage('tiles_tiny_sample_2', 'img_items');
    const tilesetCoffreFerme = map.addTilesetImage('coffre_ferm\u00e9', 'img_coffre_ferme');
    const tilesets = [tilesetLasers, tilesetDecor, tilesetItems, tilesetCoffreFerme].filter(Boolean);

    layer1 = map.createLayer('Calque de Tuiles 1', tilesets, 0, 0);
    layer2 = map.createLayer('Calque de Tuiles 2', tilesets, 0, 0);

    coffres = [];
    this.initialiserCoffres();

    layer1.setCollisionByProperty({ collision: true });
    layer2.setCollisionByProperty({ collision: true });

    // Au debut seul le calque 2 est visible.
    layer1.setVisible(false);
    calque1Actif = false;

    player = this.physics.add.sprite(160, map.heightInPixels - 180, "img_perso", 5);
    player.setScale(1.5);
    player.setCollideWorldBounds(true);
    player.setBounce(0);
    player.body.setSize(20, 44);
    player.body.setOffset(10, 6);

    this.physics.add.collider(player, layer2);
    this.physics.add.collider(player, layer1, undefined, () => calque1Actif, this);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    const mapZoom = Math.min(gameWidth / map.widthInPixels, gameHeight / map.heightInPixels, 1);
    this.cameras.main.setZoom(mapZoom);

    this.anims.create({
        key: "savant2_idle",
        frames: [{ key: "img_perso", frame: 5 }],
        frameRate: 1,
        repeat: -1
    });

    this.anims.create({
        key: "savant2_walk",
        frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "savant2_jump",
        frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "anim_ouvreporte",
        frames: this.anims.generateFrameNumbers("img_porte", { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: "anim_fermeporte",
        frames: this.anims.generateFrameNumbers("img_porte", { start: 5, end: 0 }),
        frameRate: 10,
        repeat: 0
    });

    player.play("savant2_idle");

    clavier = this.input.keyboard.createCursorKeys();
    this.toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    porte1 = this.physics.add.staticSprite(96, 1093, "img_porte");
    porte2 = this.physics.add.staticSprite(1800, 1093, "img_porte");

    porte1.ouverte = false;
    porte2.ouverte = false;
    compteurTeleportPorte2 = 0;
    calque1Actif = false;
}

activerCalque1() {
    if (calque1Actif) return;

    layer1.setVisible(true);
    calque1Actif = true;
}

teleporterPorte2VersPorte1() {
    player.setPosition(porte1.x, porte1.y - 75);
    player.setVelocity(0, 0);
    compteurTeleportPorte2 += 1;

    if (compteurTeleportPorte2 >= 3) {
        this.activerCalque1();
    }
}

initialiserCoffres() {
    const tuilesInteractives = new Map();
    const visites = new Set();

    layer2.forEachTile((tile) => {
        if (tile && tile.properties && tile.properties.interagircoffre) {
            tuilesInteractives.set(`${tile.x}_${tile.y}`, tile);
        }
    });

    tuilesInteractives.forEach((tile, key) => {
        if (visites.has(key)) {
            return;
        }

        const groupe = [];
        const pile = [tile];
        visites.add(key);

        while (pile.length > 0) {
            const current = pile.pop();
            groupe.push({ x: current.x, y: current.y });

            const voisins = [
                `${current.x + 1}_${current.y}`,
                `${current.x - 1}_${current.y}`,
                `${current.x}_${current.y + 1}`,
                `${current.x}_${current.y - 1}`
            ];

            voisins.forEach((voisinKey) => {
                if (tuilesInteractives.has(voisinKey) && !visites.has(voisinKey)) {
                    visites.add(voisinKey);
                    pile.push(tuilesInteractives.get(voisinKey));
                }
            });
        }

        const minX = Math.min(...groupe.map((t) => t.x));
        const maxX = Math.max(...groupe.map((t) => t.x));
        const minY = Math.min(...groupe.map((t) => t.y));
        const maxY = Math.max(...groupe.map((t) => t.y));
        const tileW = layer2.tilemap.tileWidth;
        const tileH = layer2.tilemap.tileHeight;
        const largeurPx = (maxX - minX + 1) * tileW;
        const hauteurPx = (maxY - minY + 1) * tileH;
        const centreX = (minX + maxX + 1) * tileW * 0.5;
        const centreY = (minY + maxY + 1) * tileH * 0.5;

        coffres.push({
            tuiles: groupe,
            centreX,
            centreY,
            largeurPx,
            hauteurPx,
            ouvert: false
        });
    });
}

interagirAvecCoffre() {
    const distanceInteraction = 110;

    for (let i = 0; i < coffres.length; i += 1) {
        const coffre = coffres[i];

        if (coffre.ouvert) {
            continue;
        }

        const distance = Phaser.Math.Distance.Between(player.x, player.y, coffre.centreX, coffre.centreY);

        if (distance <= distanceInteraction) {
            coffre.tuiles.forEach((tuile) => {
                layer2.removeTileAt(tuile.x, tuile.y, false, false);
            });

            this.add
                .image(coffre.centreX, coffre.centreY, 'img_coffre_ouvert')
                .setDisplaySize(coffre.largeurPx, coffre.hauteurPx)
                .setDepth(2);

            coffre.ouvert = true;
            break;
        }
    }
}

update() {
    if (gameOver) return;

    const isOnGround = player.body.blocked.down || player.body.touching.down;

    if (clavier.left.isDown) {
        player.setVelocityX(-160);
        player.setFlipX(true);
    } 
    else if (clavier.right.isDown) {
        player.setVelocityX(160);
        player.setFlipX(false);
    } 
    else {
        player.setVelocityX(0);
    }

    if ((clavier.up.isDown || clavier.space.isDown) && isOnGround) {
        player.setVelocityY(-400);
    }

    if (!isOnGround) {
        player.anims.play("savant2_jump", true);
    } 
    else if (player.body.velocity.x !== 0) {
        player.anims.play("savant2_walk", true);
    } 
    else {
        player.anims.play("savant2_idle", true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.toucheE)) {
        this.interagirAvecCoffre();

        if (this.physics.overlap(player, porte1)) {
            if (!porte1.ouverte) {
                porte1.anims.play("anim_ouvreporte");
                porte1.ouverte = true;
            } else {
                porte1.anims.play("anim_fermeporte");
                porte1.ouverte = false;
            }
        }

        if (this.physics.overlap(player, porte2)) {
            porte2.anims.play("anim_ouvreporte");
            this.teleporterPorte2VersPorte1();
        }
    }
}
}