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
        this.load.spritesheet("img_clef", "assets/icons_prev_comp-removebg-preview.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image("img_coffre", "assets/coffre_fermé.png");
    }
    

    create() {
        this.map = this.make.tilemap({ key: 'ma_map' });
        const tilesetLasers = this.map.addTilesetImage('lasers', 'img_lasers');
        const tilesetItems = this.map.addTilesetImage('tiles_tiny_sample_2', 'img_items');
        const tilesetPreview = this.map.addTilesetImage('preview_122', 'img_lasers');

        layer = this.map.createLayer('Calque de Tuiles 1', [tilesetLasers, tilesetItems], 0, 0);
        layer.setCollisionByProperty({ collision: true });
        layer.setCollisionByProperty({ tue: true });
        layer2 = this.map.createLayer('Calque de Tuiles 2', [tilesetPreview], 0, 0);
        layer2.setCollisionByProperty({ collision: true });
        layer2.setCollisionByProperty({ tue: true });

        const playerStartX = 120;
        const playerStartY = this.map.heightInPixels - 220;
        this.playerStartX = playerStartX;
        this.playerStartY = playerStartY;
        player = this.physics.add.sprite(playerStartX, playerStartY, 'img_perso');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        player.setDepth(10); // dessiné au-dessus des portes
        player.setScale(1.6);
        player.setVisible(true);

        this.isDying = false;
        const mourir = () => {
            if (this.isDying) return;
            this.isDying = true;
            player.setTint(0xff0000);
            player.setVelocity(0, 0);
            this.time.delayedCall(500, () => {
                player.clearTint();
                player.setPosition(this.playerStartX, this.playerStartY);
                player.setVelocity(0, 0);
                this.isDying = false;
            });
        };
        this.physics.add.collider(player, layer, (p, tile) => {
            if (tile.properties && tile.properties.tue) mourir();
        }, null, this);
        this.physics.add.collider(player, layer2, (p, tile) => {
            if (tile.properties && tile.properties.tue) mourir();
        }, null, this);

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
        porte.setDepth(2);
        porte2.setDepth(2);
        porte.setScale(1);
        porte2.setScale(1);
        porte.setVisible(true);
        porte2.setVisible(true);
        porte.linkedDoor = porte2;
        porte2.linkedDoor = porte;
        this.coffre = this.physics.add.staticSprite(750, 488, "img_coffre");
        this.coffre.setDepth(5);
        this.coffre.setScale(0.8);

        this.clef = this.physics.add.staticSprite(400, 370, "img_clef",9);
        this.clef.setScale(1.2);
        this.clef.setDepth(6);
        this.clefCollected = false;
        this.clefText = this.add.text(16, 16, '', { fontSize: '20px', fill: '#ffffff', backgroundColor: '#000000' });
        this.clefText.setScrollFactor(0);

        this.physics.add.overlap(player, this.clef, () => {
            if (!this.clefCollected) {
                this.clefCollected = true;
                this.clef.destroy();
                this.clefText.setText('Clé récupérée !');
            }
        });

        this.anims.create({
            key: "anim_ouvreporte",
            frames: this.anims.generateFrameNumbers("img_porte", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: "anim_fermeporte",
            frames: this.anims.generateFrameNumbers("img_porte", { start: 2, end: 0 }),
            frameRate: 10,
            repeat: 0
        });
        porte.ouverte = false;
        porte2.ouverte = false;
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
                    player.setPosition(porte.linkedDoor.x, porte.linkedDoor.y - 50);
                } else {
                    porte.anims.play("anim_fermeporte");
                    porte.ouverte = false;
                }
            } else if (this.physics.overlap(player, porte2)) {
                if (!porte2.ouverte) {
                    porte2.anims.play("anim_ouvreporte");
                    porte2.ouverte = true;
                    player.setPosition(porte2.linkedDoor.x, porte2.linkedDoor.y - 50);
                } else {
                    porte2.anims.play("anim_fermeporte");
                    porte2.ouverte = false;
                }
            }
        }

        }
}


var player;
var clavier;
var gameOver = false;
var porte;
var porte2;
var layer;
var layer2;


