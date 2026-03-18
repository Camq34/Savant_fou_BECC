
var player;
var clavier;
var gameOver = false;
var layer;
var porte1;
var porte2;
var blocsBlancs = [];
var compteurTeleportPorte2 = 0;
var blocsBlancsActifs = false;



export default class niveau3 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau3" });
	}
    preload() {
    this.load.image('img_lasers', 'assets/lasers.png');
    this.load.image('img_items', 'assets/items.png');
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
    const tilesetItems = map.addTilesetImage('tiles_tiny_sample_2', 'img_items');

    layer = map.createLayer('Calque de Tuiles 1', [tilesetLasers, tilesetItems], 0, 0);
    layer.setCollisionByProperty({ collision: true });

    // Les blocs blancs restent caches jusqu'a 3 teleportations par la porte 2.
    blocsBlancs = [];
    layer.forEachTile((tile) => {
        if (tile && (tile.index === 290 || tile.index === 292)) {
            blocsBlancs.push(tile);
            tile.setVisible(false);
            tile.setCollision(false, false, false, false);
        }
    });

    player = this.physics.add.sprite(160, map.heightInPixels - 180, "img_perso", 5);
    player.setScale(1.5);
    player.setCollideWorldBounds(true);
    player.setBounce(0);
    player.body.setSize(20, 44);
    player.body.setOffset(10, 6);

    this.physics.add.collider(player, layer);

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
    blocsBlancsActifs = false;
}

activerBlocsBlancs() {
    if (blocsBlancsActifs) return;

    blocsBlancs.forEach((tile) => {
        tile.setVisible(true);
        tile.setCollision(true, true, true, true);
    });

    blocsBlancsActifs = true;
}

teleporterPorte2VersPorte1() {
    player.setPosition(porte1.x, porte1.y - 75);
    player.setVelocity(0, 0);
    compteurTeleportPorte2 += 1;

    if (compteurTeleportPorte2 >= 3) {
        this.activerBlocsBlancs();
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