/***********************************************************************/
/** VARIABLES GLOBALES */
/***********************************************************************/

var clavier;

// définition de la classe "Accueil"
export default class Accueil extends Phaser.Scene {
  constructor() {
    super({ key: "Accueil" });
  }

  /***********************************************************************/
  /** FONCTION PRELOAD */
  /***********************************************************************/
  preload() {
    this.load.image("img_materiaux", "assets/terrain_d2_70.jpg");
    this.load.image("img_items", "assets/items.png");
    this.load.tilemapTiledJSON("map_accueil", "assets/Map/map_accueil.tmj");
    this.load.spritesheet("img_porte_orange", "assets/porteORANGE999.png", {
      frameWidth: 96,
      frameHeight: 120
    });

    this.load.spritesheet("img_perso", "assets/savant2.png", {
      frameWidth: 40,
      frameHeight: 50,
      spacing: 1
    });
  }

  /***********************************************************************/
  /** FONCTION CREATE */
  /***********************************************************************/
  create() {
    /*************************************/
    /* CREATION DE LA MAP */
    /*************************************/
    const map = this.make.tilemap({ key: "map_accueil" });
    const tilesetMateriaux = map.addTilesetImage("terrain_d2_70", "img_materiaux");
    const tilesetItems = map.addTilesetImage("items", "img_items");

    this.layer = map.createLayer("Calque de Tuiles 1", [tilesetMateriaux, tilesetItems], 0, 0);
    this.layer.setCollisionByProperty({ collision: true });

    /*************************************/
    /* CREATION DU JOUEUR */
    /*************************************/
    this.player = this.physics.add.sprite(100, 450, "img_perso", 5);
    this.player.setScale(1.5);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 44);
    this.player.body.setOffset(10, 6);

    this.physics.add.collider(this.player, this.layer);

    /*************************************/
    /* CREATION DES PORTES */
    /*************************************/
    this.porte1 = this.physics.add.staticSprite(140, 930, "img_porte_orange");
    this.porte2 = this.physics.add.staticSprite(50, 264, "img_porte_orange");
    this.porte3 = this.physics.add.staticSprite(700, 234, "img_porte_orange");
    this.porte4 = this.physics.add.staticSprite(1277, 1091, "img_porte_orange");
    this.porte5 = this.physics.add.staticSprite(1664, 487, "img_porte_orange");
    this.porte6 = this.physics.add.staticSprite(900, 234, "img_porte_orange");
    this.porte7 = this.physics.add.staticSprite(1277, 355, "img_porte_orange");

    this.add
      .text(this.porte1.x, this.porte1.y - 90, "1", {
        fontFamily: "Courier New, monospace",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte2.x, this.porte2.y - 90, "2", {
        fontFamily: "Courier New, monospace",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte3.x, this.porte3.y - 90, "3", {
        fontFamily: "Courier New, monospace",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte4.x, this.porte4.y - 90, "4", {
        fontFamily: "Courier New, monospace",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte5.x, this.porte5.y - 90, "5", {
        fontFamily: "Courier New, monospace",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte6.x, this.porte6.y - 90, "6", {
        fontFamily: "Courier New, monospace",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte7.x, this.porte7.y - 90, "7", {
        fontFamily: "Courier New, monospace",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ff2a2a",
        stroke: "#4d0000",
        strokeThickness: 8,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#ff3b00",
          blur: 14,
          stroke: true,
          fill: true
        }
      })
      .setOrigin(0.5);

    /*************************************/
    /* ANIMATIONS DU PERSONNAGE */
    /*************************************/
    this.anims.create({
      key: "savant2_idle",
      frames: [{ key: "img_perso", frame: 5 }],
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: "savant2_walk",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 0,
        end: 4
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "savant2_jump",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 6,
        end: 10
      }),
      frameRate: 10,
      repeat: -1
    });

    /*************************************/
    /* ANIMATIONS DES PORTES */
    /*************************************/
    this.anims.create({
      key: "porte_ouvre",
      frames: this.anims.generateFrameNumbers("img_porte_orange", {
        start: 0,
        end: 5
      }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: "porte_ferme",
      frames: this.anims.generateFrameNumbers("img_porte_orange", {
        start: 5,
        end: 0
      }),
      frameRate: 10,
      repeat: 0
    });

    this.player.play("savant2_idle");

    /*************************************/
    /* CLAVIER */
    /*************************************/
    clavier = this.input.keyboard.createCursorKeys();
    this.toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    /*************************************/
    /* VARIABLES POUR LE SAUT */
    /*************************************/
    this.maxJumps = 2;
    this.jumpsRemaining = 2;
    this.lastJumpKey = false;
  }

  /***********************************************************************/
  /** UPDATE */
  /***********************************************************************/
  update() {
    const speed = 150;
    const jumpPower = 300;
    let vx = 0;

    const playerOnGround = this.player.body.blocked.down || this.player.body.touching.down;

    /*************************************/
    /* OUVERTURE DES PORTES + CHANGEMENT DE SCENE */
    /*************************************/
    if (Phaser.Input.Keyboard.JustDown(this.toucheE)) {
      if (this.physics.overlap(this.player, this.porte1)) {
        this.porte1.anims.play("porte_ouvre");
        this.scene.start("Niveau1");
      }
      if (this.physics.overlap(this.player, this.porte2)) {
        this.porte2.anims.play("porte_ouvre");
        this.scene.start("Niveau2");
      }
      if (this.physics.overlap(this.player, this.porte3)) {
        this.porte3.anims.play("porte_ouvre");
        this.scene.start("Niveau3");
      }
      if (this.physics.overlap(this.player, this.porte4)) {
        this.porte4.anims.play("porte_ouvre");
        this.scene.start("Niveau4");
      }
      if (this.physics.overlap(this.player, this.porte5)) {
        this.porte5.anims.play("porte_ouvre");
        this.scene.start("Niveau5");
      }
      if (this.physics.overlap(this.player, this.porte6)) {
        this.porte6.anims.play("porte_ouvre");
        this.scene.start("Niveau6");
      }
      if (this.physics.overlap(this.player, this.porte7)) {
        this.porte7.anims.play("porte_ouvre");
        this.scene.start("Niveau7");
      }
    }

    /*************************************/
    /* DEPLACEMENT HORIZONTAL */
    /*************************************/
    if (clavier.left.isDown) {
      vx = -speed;
      this.player.setFlipX(true);
    } else if (clavier.right.isDown) {
      vx = speed;
      this.player.setFlipX(false);
    }

    this.player.setVelocityX(vx);

    /*************************************/
    /* DOUBLE SAUT */
    /*************************************/
    const jumpKey = clavier.up.isDown;

    if (playerOnGround) {
      this.jumpsRemaining = this.maxJumps;
    }

    if (jumpKey && !this.lastJumpKey && this.jumpsRemaining > 0) {
      this.player.setVelocityY(-jumpPower);
      this.jumpsRemaining--;
    }

    this.lastJumpKey = jumpKey;

    /*************************************/
    /* ANIMATIONS DU PERSONNAGE */
    /*************************************/
    if (!playerOnGround) {
      this.player.play("savant2_jump", true);
    } else if (vx !== 0) {
      this.player.play("savant2_walk", true);
    } else {
      this.player.play("savant2_idle", true);
    }
  }
}