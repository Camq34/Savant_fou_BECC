
var player;
var clavier;
var gameOver = false;
var layer;
var porte1;
var porte2;



export default class niveau4 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau4" });
	}
    preload() {
    this.load.image('img_brique', 'assets/preview_122.png');
    this.load.image('img_lasers', 'assets/preview_1366.png');
    this.load.tilemapTiledJSON('ma_map_4', 'assets/Map/map_niveau4.tmj');

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
    const map = this.make.tilemap({ key: 'ma_map_4' });
    const tilesetBrique = map.addTilesetImage('brique', 'img_brique');
    const tilesetLasers = map.addTilesetImage('lasers', 'img_lasers');

    layer = map.createLayer('Calque de Tuiles 1', [tilesetBrique, tilesetLasers], 0, 0);
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