export default class Niveau1 extends Phaser.Scene {
    constructor(){
        super("Niveau1");
    }
}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
      debug: false 
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var player;
var clavier;
var gameOver = false;
var porte;
var layer;

new Phaser.Game(config);

function preload() {
    this.load.image('img_lasers', 'assets/lasers.png');
    this.load.image('img_items', 'assets/items.png');
    this.load.tilemapTiledJSON('ma_map', 'assets/Map/map_niveau1.tmj');

    this.load.spritesheet("img_perso", "assets/savant2.png", {
        frameWidth: 100,
        frameHeight: 450,
    });

    this.load.spritesheet("img_porte", "assets/porteORANGE999.png", {
        frameWidth: 96,
        frameHeight: 120
    }); 
}

function create() {  
    const map = this.make.tilemap({ key: 'ma_map' });
    const tilesetLasers = map.addTilesetImage('lasers', 'img_lasers');
    const tilesetItems = map.addTilesetImage('tiles_tiny_sample_2', 'img_items');
    
    layer = map.createLayer('Calque de Tuiles 1', [tilesetLasers, tilesetItems], 0, 0);
    layer.setCollisionByExclusion([-1]); 

    player = this.physics.add.sprite(500, 1000, 'img_perso');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true); 

    this.physics.add.collider(player, layer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);
    this.cameras.main.setZoom(0.8); 

    this.anims.create({
        key: "anim_tourne_gauche",
        frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }),
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
        frames: [{ key: "img_perso", frame: 4 }],
        frameRate: 20
    });

    clavier = this.input.keyboard.createCursorKeys();

    porte = this.physics.add.staticSprite(96,452, "img_porte");
    porte = this.physics.add.staticSprite(1800,1093, "img_porte"); 
    
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
    porte.ouverte = false;
    this.cameras.main.setZoom(0.4); 
}

function update() {
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

    if (Phaser.Input.Keyboard.JustDown(clavier.space) && this.physics.overlap(player, porte)) {
        if (!porte.ouverte) {
            porte.anims.play("anim_ouvreporte");
            porte.ouverte = true;
        } else {
            porte.anims.play("anim_fermeporte");
            porte.ouverte = false;
        }
    }
}