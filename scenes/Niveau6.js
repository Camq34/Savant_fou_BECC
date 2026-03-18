
var player;
var clavier;
var gameOver = false;
var layer1;
var layer2;
var porte1;
var porte2;



export default class niveau6 extends Phaser.Scene {
    constructor() {
        super({ key: "niveau6" });
    }
    preload() {
        this.load.image('img_laser', 'assets/lasers.png');
        this.load.image('img_coffre_ferme', 'assets/coffre_fermé.png');
        this.load.image('img_porte_orange', 'assets/porteORANGE999.png');
        this.load.image('img_porte_sortie', 'assets/portesortiewallah.png');
        this.load.image('img_screenshot_6', 'assets/screenshot_6.jpg');
        this.load.image('tuilesJeu', 'assets/tuilesJeu.png');

        this.load.tilemapTiledJSON('ma_map_6', 'assets/Map/map_niveau6.tmj');
        this.load.spritesheet("img_perso", "assets/savant2.png", {
            frameWidth: 40,
            frameHeight: 50,
            spacing: 1
        });

        this.load.spritesheet("img_porte_orange", "assets/porteORANGE999.png", {
            frameWidth: 96,
            frameHeight: 120
        });

    }
    create() {
        const map = this.make.tilemap({ key: 'ma_map_6' });
        this.levelMap = map;
        const tilesetLaser = map.addTilesetImage('laser', 'img_laser');
        const tilesetCoffre = map.addTilesetImage('coffre_fermé', 'img_coffre_ferme');
        const tilesetPorteOrange = map.addTilesetImage('porteORANGE999', 'img_porte_orange');
        const tilesetPorteSortie = map.addTilesetImage('portesortiewallah', 'img_porte_sortie');
        const tilesetScreenshot = map.addTilesetImage('screenshot_6', 'img_screenshot_6');
        const tilesetTuilesJeu = map.addTilesetImage('tuilesJeu', 'tuilesJeu');


        

        layer1 = map.createLayer('Calque de Tuiles 1', [tilesetTuilesJeu, tilesetScreenshot], 0, 0);
        layer1.setCollisionByProperty({ collision: true });

        const porteLayerName = map.getLayer('calque_porte') ? 'calque_porte' : (map.getLayer('Calque_porte') ? 'Calque_porte' : null);
        if (porteLayerName) {
            layer2 = map.createLayer(porteLayerName, [tilesetPorteOrange, tilesetLaser, tilesetCoffre, tilesetPorteSortie], 0, 0);
            layer2.setVisible(true);
            layer2.setDepth(0);
        } else {
            console.warn('Niveau6: calque porte non trouvé dans la map');
        }

        player = this.physics.add.sprite(160, map.heightInPixels - 180, "img_perso", 5);
        player.setScale(1.5);
        player.setCollideWorldBounds(true);
        player.setBounce(0);
        player.body.setSize(20, 44);
        player.body.setOffset(10, 6);
        player.setDepth(10);

        this.portevrai = this.physics.add.staticSprite(1700, 550, "img_porte_orange");
        
        this.porteClef = this.physics.add.staticSprite(1700, 260, "img_porte_orange");
        this.teleportToTopLeftDoor = { x: 140, y: 130 };
        this.teleportToCoffreDoor = { x: map.tileToWorldX(57) + 16, y: map.tileToWorldY(8) + 16 };

        this.physics.add.collider(player, layer1);

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
            frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 10 }),
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
    }
    teleporterPorteVraiVersPorteClef() {
        player.setPosition(this.porteClef.x, this.porteClef.y - 75);
        player.setVelocity(0, 0);
    }
    teleporterPorteClefVersPorteVrai() {
        player.setPosition(this.portevrai.x, this.portevrai.y - 75);
        player.setVelocity(0, 0);
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
            if (this.physics.overlap(player, this.porteClef)) {
                this.teleporterPorteClefVersPorteVrai();
                return;
            }

            if (this.physics.overlap(player, this.portevrai)) {
                this.teleporterPorteVraiVersPorteClef();
                return;
            }

            const tileDoor = this.levelMap.getTileAtWorldXY(player.x, player.y, false, this.cameras.main, layer2);
            if (tileDoor && tileDoor.index > 0) {
                const tileX = this.levelMap.worldToTileX(player.x);
                const tileY = this.levelMap.worldToTileY(player.y);

                const rightFirstFloorDoor = tileX >= 52 && tileX <= 54 && tileY === 6;
                if (rightFirstFloorDoor) {
                    player.setPosition(this.teleportToCoffreDoor.x, this.teleportToCoffreDoor.y - 32);
                } else {
                    player.setPosition(this.teleportToTopLeftDoor.x, this.teleportToTopLeftDoor.y - 32);
                }
            } else {
                // si on appuie sur E sans porte, on ne fait rien
            }
        }
    }
}
