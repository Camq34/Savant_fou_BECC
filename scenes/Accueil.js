/***********************************************************************/
/** VARIABLES GLOBALES */
/***********************************************************************/

var clavier;
const SON_PORTE_ACCUEIL = "son_porte_accueil";

// définition de la classe "Accueil"
export default class Accueil extends Phaser.Scene {
  constructor() {
    super({ key: "Accueil" });
  }

  /***********************************************************************/
  /** FONCTION PRELOAD */
  /***********************************************************************/
  preload() {
    this.load.image("img_foret", "assets/foret.png");
    this.load.image("img_materiaux", "assets/terrain_d2_70.jpg");
    this.load.image("img_items", "assets/items.png");
    this.load.tilemapTiledJSON("map_accueil", "assets/Map/map_accueil.tmj");
    this.load.image("chaudron", "assets/chaudron.png");
    this.load.audio(SON_PORTE_ACCUEIL, "assets/audio/porte_niveau6.mp3");
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

    this.add
      .image(map.widthInPixels * 0.5, map.heightInPixels * 0.5, "img_foret")
      .setDisplaySize(map.widthInPixels, map.heightInPixels)
      .setDepth(-10);

    const tilesetMateriaux = map.addTilesetImage("terrain_d2_70", "img_materiaux");
    const tilesetItems = map.addTilesetImage("items", "img_items");

    this.layer = map.createLayer("Calque de Tuiles 1", [tilesetMateriaux, tilesetItems], 0, 0);
    this.layer.setCollisionByProperty({ collision: true });

    this.add
      .text(960, 70, "Bienvenue à l'Accueil ", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "58px",
        fontStyle: "bold",
        color: "#39ff14",
        stroke: "#103000",
        strokeThickness: 6
      })
      .setOrigin(0.5, 0);

    

    /*************************************/
    /* CREATION DES PORTES */
    /*************************************/

    this.porte1 = this.physics.add.staticSprite(140, 930, "img_porte_orange");
    this.porte2 = this.physics.add.staticSprite(512, 613, "img_porte_orange");
    this.porte3 = this.physics.add.staticSprite(140, 265, "img_porte_orange");
    this.porte4 = this.physics.add.staticSprite(1277, 870, "img_porte_orange");
    this.porte5 = this.physics.add.staticSprite(1664, 487, "img_porte_orange");
    this.porte6 = this.physics.add.staticSprite(895, 740, "img_porte_orange");
    this.porte7 = this.physics.add.staticSprite(1277, 355, "img_porte_orange");
    this.chaudron= this.physics.add.staticSprite(895, 487, "chaudron");

    this.nbPotionsTotal = 7;
    this.compteurPotionsText = this.add
      .text(this.chaudron.x, this.chaudron.y - 100, "", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "44px",
        fontStyle: "bold",
        color: "#ffd64d",
        stroke: "#3b2100",
        strokeThickness: 7
      })
      .setOrigin(0.5);
    this.mettreAJourCompteurPotions();

    this.add
      .text(this.porte1.x, this.porte1.y - 90, "1", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte2.x, this.porte2.y - 90, "2", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte3.x, this.porte3.y - 90, "3", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte4.x, this.porte4.y - 90, "4", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte5.x, this.porte5.y - 90, "5", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte6.x, this.porte6.y - 90, "6", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "56px",
        fontStyle: "bold",
        color: "#5cff72",
        stroke: "#0b2a12",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(this.porte7.x, this.porte7.y - 90, "7", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ff2a2a",
        stroke: "#4d0000",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

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
    this.transitionPorteEnCours = false;
  }

  jouerSonPorte() {
    if (!this.cache.audio.exists(SON_PORTE_ACCUEIL)) {
      return;
    }

    try {
      this.sound.play(SON_PORTE_ACCUEIL, {
        loop: false,
        volume: 0.7
      });
    } catch (error) {
      console.warn("Accueil: lecture du son de porte impossible", error);
    }
  }

  ouvrirPorteEtChangerScene(porte, sceneKey) {
    if (this.transitionPorteEnCours || !porte) {
      return;
    }

    this.transitionPorteEnCours = true;
    this.player.setVelocity(0, 0);
    this.jouerSonPorte();
    porte.anims.play("porte_ouvre");

    this.time.delayedCall(180, () => {
      this.scene.start(sceneKey);
    });
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
    if (this.transitionPorteEnCours) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.toucheE)) {
      if (this.physics.overlap(this.player, this.porte1)) {
        this.ouvrirPorteEtChangerScene(this.porte1, "niveau1");
        return;
      }
      if (this.physics.overlap(this.player, this.porte2)) {
        this.ouvrirPorteEtChangerScene(this.porte2, "niveau2");
        return;
      }
      if (this.physics.overlap(this.player, this.porte3)) {
        this.ouvrirPorteEtChangerScene(this.porte3, "niveau3");
        return;
      }
      if (this.physics.overlap(this.player, this.porte4)) {
        this.ouvrirPorteEtChangerScene(this.porte4, "niveau4");
        return;
      }
      if (this.physics.overlap(this.player, this.porte5)) {
        this.ouvrirPorteEtChangerScene(this.porte5, "niveau5");
        return;
      }
      if (this.physics.overlap(this.player, this.porte6)) {
        this.ouvrirPorteEtChangerScene(this.porte6, "niveau6");
        return;
      }
      if (this.physics.overlap(this.player, this.porte7)) {
        this.ouvrirPorteEtChangerScene(this.porte7, "niveau7");
        return;
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

  compterPotionsRecuperees() {
    let total = 0;

    for (let niveau = 1; niveau <= this.nbPotionsTotal; niveau += 1) {
      const inventaireNiveau = this.registry.get(`inventaireNiveau${niveau}`);
      const potionFlagNiveau = this.registry.get(`potionNiveau${niveau}`);
      if ((Array.isArray(inventaireNiveau) && inventaireNiveau.length > 0) || potionFlagNiveau === true) {
        total += 1;
      }
    }

    return total;
  }

  mettreAJourCompteurPotions() {
    const potionsRecuperees = this.compterPotionsRecuperees();
    this.compteurPotionsText.setText(`${potionsRecuperees}/${this.nbPotionsTotal}`);
  }
}