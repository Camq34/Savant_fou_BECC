
var player;
var clavier;
var gameOver = false;
var layer;
var porte1;
var porte2;



export default class niveau7 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau7" });
	}
    preload() {
    this.load.image('img_laser', 'assets/laser.png');
    this.load.image('img_coffre_ferme', 'assets/coffre_fermé.png');
    this.load.image('img_porte_orange', 'assets/porteORANGE999.png');
    this.load.image('img_porte_sortie', 'assets/porte_sortie.png');
    this.load.image('img_screenshot_6', 'assets/screenshot_6.png');
    this.load.image('tuilesJeu', 'assets/tuilesjeu.png');

    this.load.tilemapTiledJSON('ma_map', 'assets/Map/map_niveau7.tmj');
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
    const tilesetLaser = map.addTilesetImage('laser', 'img_laser');
    const tilesetCoffre = map.addTilesetImage('brique', 'img_coffre_ferme');
    const tilesetPorteOrange = map.addTilesetImage('tiles_tiny_sample_2', 'img_porte_orange');
    const tilesetPorteSortie = map.addTilesetImage('porte_sortie', 'img_porte_sortie');
    const tilesetScreenshot = map.addTilesetImage('screenshot_6', 'img_screenshot_6');
    const tilesetTuilesJeu = map.addTilesetImage('tuilesJeu', 'tuilesJeu');

    // 🔹 Création des calques
    // Calque des portes et objets interactifs
    const calquePorte = map.createLayer('calque_porte', [
        tilesetLaser,
        tilesetCoffre,
        tilesetPorteOrange,
        tilesetPorteSortie,
        tilesetTuilesJeu
    ], 0, 0);

    // Calque de décor / sol
    const calqueTuiles = map.createLayer('Calque de Tuiles 1', [
        tilesetTuilesJeu,
        tilesetScreenshot
    ], 0, 0);

    console.log('Calques créés :', calquePorte, calqueTuiles);

    layer = map.createLayer('Calque de Tuiles 1', [tilesetLasers, tilesetItems], 0, 0);
    layer.setCollisionByProperty({ collision: true });

    player = this.physics.add.sprite(160, map.heightInPixels - 180, "img_perso", 5);
    player.setScale(1.5);
    player.setCollideWorldBounds(true);
    player.setBounce(0);
    player.body.setSize(20, 44);
    player.body.setOffset(10, 6);

    this.physics.add.collider(player, layer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);
    this.cameras.main.setZoom(0.4);

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
            if (!porte2.ouverte) {
                porte2.anims.play("anim_ouvreporte");
                porte2.ouverte = true;
            } else {
                porte2.anims.play("anim_fermeporte");
                porte2.ouverte = false;
            }
        }
    }
}
}
