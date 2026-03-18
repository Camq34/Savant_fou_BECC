export default class Niveau1 extends Phaser.Scene {
    constructor() {
        super("niveau1");
    }

    preload() {
        this.load.image('img_lasers', 'assets/lasers.png');
        this.load.image('img_items', 'assets/items.png');
        this.load.tilemapTiledJSON('ma_map', 'assets/Map/map_niveau1.tmj');

        this.load.spritesheet("img_perso", "assets/savant2.png", {
            frameWidth: 41,
            frameHeight: 50
        });

        this.load.spritesheet("img_porte", "assets/porteORANGE999.png", {
            frameWidth: 93,
            frameHeight: 128
        });
        this.load.image("img_clef", "assets/icons_prev_comp-removebg-preview.png");
    }

    create() {
        this.map = this.make.tilemap({ key: 'ma_map' });
        const tilesetLasers = this.map.addTilesetImage('lasers', 'img_lasers');
        const tilesetItems = this.map.addTilesetImage('tiles_tiny_sample_2', 'img_items');

        layer = this.map.createLayer('Calque de Tuiles 1', [tilesetLasers, tilesetItems], 0, 0);
        layer.setCollisionByProperty({ collision: true });
        layer2 = this.map.createLayer('Calque de Tuiles 2', [tilesetLasers, tilesetItems], 0, 0);
        layer2.setCollisionByProperty({ collision: true });

        const playerStartX = 100;
        const playerStartY = this.map.heightInPixels - 220;
        this.playerStartX = playerStartX;
        this.playerStartY = playerStartY;
        player = this.physics.add.sprite(playerStartX, playerStartY, 'img_perso');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        player.setDepth(10); // dessiné au-dessus des portes

        this.physics.add.collider(player, layer);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(player);
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;
        const mapZoom = Math.min(gameWidth / this.map.widthInPixels, gameHeight / this.map.heightInPixels, 1);
        this.cameras.main.setZoom(mapZoom);

        this.anims.create({
            key: "anim_tourne_gauche",
            frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "anim_tourne_droite",
            frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "anim_face",
            frames: [{ key: "img_perso", frame: 5 }],
            frameRate: 20
        });

        clavier = this.input.keyboard.createCursorKeys();
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        porte = this.physics.add.staticSprite(96, 452, "img_porte");
        porte2 = this.physics.add.staticSprite(1800, 1093, "img_porte");
        porte.setDepth(5);
        porte2.setDepth(5);

        this.clef = this.physics.add.staticSprite(400, 350, "img_clef");
        this.clef.setScale(0.5);
        this.clef.setDepth(6);
        this.clefCollected = false;

        this.physics.add.overlap(player, this.clef, () => {
            if (!this.clefCollected) {
                this.clefCollected = true;
                this.clef.destroy();
                console.log("Clef recue !");
            }
        });

        this.anims.create({
            key: "anim_ouvreporte",
            frames: this.anims.generateFrameNumbers("img_porte", { start: 0, end: 4 }),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: "anim_fermeporte",
            frames: this.anims.generateFrameNumbers("img_porte", { start: 4, end: 0 }),
            frameRate: 10,
            repeat: 0
        });
        porte.ouverte = false;
        this.cameras.main.setZoom(1);
    }

    update() {
        if (gameOver) return;

        if (clavier.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('anim_tourne_gauche', true);
        } else if (clavier.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('anim_tourne_droite', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('anim_face');
        }

        if ((clavier.up.isDown || clavier.space.isDown) && player.body.blocked.down) {
            player.setVelocityY(-400);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            if (this.physics.overlap(player, porte)) {
                if (!porte.ouverte) {
                    porte.anims.play("anim_ouvreporte");
                    porte.ouverte = true;
                    player.setPosition(porte2.x, porte2.y - 50);
                } else {
                    porte.anims.play("anim_fermeporte");
                    porte.ouverte = false;
                }
            } else if (this.physics.overlap(player, porte2)) {
                if (!porte2.ouverte) {
                    porte2.anims.play("anim_ouvreporte");
                    porte2.ouverte = true;
                    player.setPosition(porte.x, porte.y - 50);
                } else {
                    porte2.anims.play("anim_fermeporte");
                    porte2.ouverte = false;
                }
            }
        }

        const tile = this.map.getTileAtWorldXY(player.x, player.y, false, this.cameras.main, layer);
        if (tile && tile.properties && tile.properties.tue) {
            player.setPosition(this.playerStartX, this.playerStartY);
            player.setVelocity(0, 0);
        }
    }
}


var player;
var clavier;
var gameOver = false;
var porte;
var porte2;
var layer;


