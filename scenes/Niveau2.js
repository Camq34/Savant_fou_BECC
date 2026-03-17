class niveau2 extends Phaser.Scene {
  constructor() {
    super({
      key: "niveau2"
    });
  }

  preload() {
    this.load.tilemapTiledJSON('map_niveau2', 'assets/Map/mapniveau2_5.tmj');
    this.load.image('img_terrain', 'assets/terrain_d2_70.jpg');
    this.load.image('img_donjonasset', 'assets/donjonasset.png');
    this.load.image('img_brique', 'assets/brique.png');
    this.load.image('img_coffre_jaune', 'assets/coffre_jaune.png');
    this.load.image('img_coffre_rouge', 'assets/coffre_rouge.png');
    this.load.image('img_coffre_bleu', 'assets/coffre_bleu.png');
    this.load.image('img_coffre_vert', 'assets/coffre_vert.png');
    this.load.image('img_portesortie', 'assets/portesortiewallah.png');
    this.load.spritesheet("savant2", "assets/savant2.png", {
      frameWidth: 50,
      frameHeight: 50
    });
  }

  create() {
    const map = this.make.tilemap({ key: "map_niveau2" });

    const tilesetTerrain = map.addTilesetImage("terrain_d2_70", "img_terrain");
    const tilesetDonjon = map.addTilesetImage("donjonasset", "img_donjonasset");
    const tilesetBrique = map.addTilesetImage("brique", "img_brique");
    const tilesetCoffreJaune = map.addTilesetImage("coffre_jaune", "img_coffre_jaune");
    const tilesetCoffreRouge = map.addTilesetImage("coffre_rouge", "img_coffre_rouge");
    const tilesetCoffreBleu = map.addTilesetImage("coffre_bleu", "img_coffre_bleu");
    const tilesetCoffreVert = map.addTilesetImage("coffre_vert", "img_coffre_vert");
    const tilesetPorte = map.addTilesetImage("portesortiewallah", "img_portesortie");

    const allTilesets = [tilesetTerrain, tilesetDonjon, tilesetBrique, tilesetCoffreJaune, tilesetCoffreRouge, tilesetCoffreBleu, tilesetCoffreVert, tilesetPorte];

    map.createLayer("Tile Layer 1", allTilesets);
    const layerDecor = map.createLayer("décor", allTilesets);

    // Activer les collisions sur les tiles avec la propriété "collision"
    layerDecor.setCollisionByProperty({ collision: true });

    // Personnage en bas à gauche, sur le sol
    this.player = this.physics.add.sprite(100, 1100, "savant2", 5);
    this.player.setScale(2);
    this.player.body.setSize(50, 50);
    this.player.body.setOffset(0, 0);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // Collision entre le joueur et le layer décor
    this.physics.add.collider(this.player, layerDecor);

    // Animations
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("savant2", { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "idle",
      frames: [{ key: "savant2", frame: 5 }],
      frameRate: 10
    });

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("savant2", { start: 6, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    // Clavier
    this.clavier = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.clavier.right.isDown) {
      this.player.setVelocityX(160);
      this.player.setFlipX(false);
      this.player.anims.play("right", true);
    } else if (this.clavier.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.setFlipX(true);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("idle");
    }

    if (this.clavier.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-330);
      this.player.anims.play("jump", true);
    }
  }
}

// Configuration du jeu
var config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1280,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 300
      },
      debug: true
    }
  },
  scene: [niveau2]
};

// Lancement du jeu
var game = new Phaser.Game(config);
game.scene.start("niveau2");
