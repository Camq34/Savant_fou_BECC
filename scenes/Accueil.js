/***********************************************************************/
/** VARIABLES GLOBALES */
/***********************************************************************/

var clavier;
const SON_PORTE_ACCUEIL = "son_porte_accueil";
const SON_SIX_POTIONS_ACCUEIL = "son_six_potions_accueil";
const DEBUG_FORCE_CHAUDRON_7_7 = false;

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
    this.load.audio(SON_SIX_POTIONS_ACCUEIL, "assets/audio/accueil_6_potions.mp3");
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
    this.sonSixPotionsJoue = false;
    this.appliquerModeTestChaudron();
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
    this.jouerSonSixPotionsSiPret();

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
    this.finJeuAnimationEnCours = false;
    this.finJeuEcranAffiche = false;

    this.messageNiveauText = this.add
      .text(960, 145, "", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "44px",
        fontStyle: "bold",
        color: "#ffd64d",
        stroke: "#000000",
        strokeThickness: 6
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1200)
      .setVisible(false);

    if (this.compterPotionsRecuperees() >= this.nbPotionsTotal) {
      if (this.registry.get("finJeuAccueilDeclenchee") === true) {
        this.afficherEcranFinJeu(true);
      } else {
        this.lancerSequenceFinJeu();
      }
    }
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

  jouerSonSixPotionsSiPret() {
    if (this.sonSixPotionsJoue) {
      return;
    }

    if (this.compterPotionsRecuperees() !== 6) {
      return;
    }

    if (!this.cache.audio.exists(SON_SIX_POTIONS_ACCUEIL)) {
      return;
    }

    this.sonSixPotionsJoue = true;

    try {
      this.sound.play(SON_SIX_POTIONS_ACCUEIL, {
        loop: false,
        volume: 0.8
      });
    } catch (error) {
      console.warn("Accueil: lecture du son des 6 potions impossible", error);
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

  niveauTermine(numeroNiveau) {
    const inventaireNiveau = this.registry.get(`inventaireNiveau${numeroNiveau}`);
    const potionFlagNiveau = this.registry.get(`potionNiveau${numeroNiveau}`);

    return (Array.isArray(inventaireNiveau) && inventaireNiveau.length > 0) || potionFlagNiveau === true;
  }

  afficherMessageNiveauTermine(numeroNiveau) {
    if (!this.messageNiveauText) {
      return;
    }

    this.messageNiveauText.setText(`Niveau ${numeroNiveau} deja termine !`).setVisible(true);

    if (this.messageNiveauTimer) {
      this.messageNiveauTimer.remove(false);
    }

    this.messageNiveauTimer = this.time.delayedCall(1500, () => {
      if (this.messageNiveauText) {
        this.messageNiveauText.setVisible(false);
      }
    });
  }

  essayerEntrerNiveau(porte, numeroNiveau, sceneKey) {
    if (!this.physics.overlap(this.player, porte)) {
      return false;
    }

    if (this.niveauTermine(numeroNiveau)) {
      this.afficherMessageNiveauTermine(numeroNiveau);
      return true;
    }

    this.ouvrirPorteEtChangerScene(porte, sceneKey);
    return true;
  }

  lancerSequenceFinJeu() {
    if (this.finJeuAnimationEnCours || this.finJeuEcranAffiche) {
      return;
    }

    this.finJeuAnimationEnCours = true;
    this.transitionPorteEnCours = true;
    this.player.setVelocity(0, 0);
    this.player.play("savant2_idle", true);

    this.tweens.add({
      targets: this.chaudron,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: 170,
      yoyo: true,
      repeat: 4,
      ease: "Sine.InOut"
    });

    this.cameras.main.shake(500, 0.0025);

    this.time.delayedCall(900, () => {
      if (!this.chaudron || !this.chaudron.scene) {
        return;
      }

      this.cameras.main.shake(260, 0.006);

      const flash = this.add
        .circle(this.chaudron.x, this.chaudron.y, 36, 0x39ff14, 0.95)
        .setDepth(2100);

      this.tweens.add({
        targets: flash,
        scaleX: 16,
        scaleY: 16,
        alpha: 0,
        duration: 350,
        ease: "Quad.easeOut",
        onComplete: () => flash.destroy()
      });

      const eclats = [];
      for (let i = 0; i < 24; i += 1) {
        const eclat = this.add
          .rectangle(this.chaudron.x, this.chaudron.y, Phaser.Math.Between(8, 18), Phaser.Math.Between(6, 14), i % 2 === 0 ? 0x39ff14 : 0x9cff84, 1)
          .setDepth(2101)
          .setAngle(Phaser.Math.Between(0, 360));

        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = Phaser.Math.Between(170, 420);
        const destX = this.chaudron.x + Math.cos(angle) * distance;
        const destY = this.chaudron.y + Math.sin(angle) * distance;

        this.tweens.add({
          targets: eclat,
          x: destX,
          y: destY,
          angle: eclat.angle + Phaser.Math.Between(160, 520),
          alpha: 0,
          scaleX: 0.15,
          scaleY: 0.15,
          duration: Phaser.Math.Between(420, 760),
          ease: "Cubic.easeOut",
          onComplete: () => eclat.destroy()
        });

        eclats.push(eclat);
      }

      this.tweens.add({
        targets: this.chaudron,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        angle: 20,
        duration: 220,
        ease: "Back.easeIn",
        onComplete: () => {
          this.chaudron.setVisible(false);
          this.chaudron.body.enable = false;
        }
      });

      this.time.delayedCall(420, () => {
        this.registry.set("finJeuAccueilDeclenchee", true);
        this.afficherEcranFinJeu(false);
      });
    });
  }

  afficherEcranFinJeu(instantane = false) {
    if (this.finJeuEcranAffiche) {
      return;
    }

    this.finJeuEcranAffiche = true;
    this.finJeuAnimationEnCours = false;
    this.transitionPorteEnCours = true;

    this.children.list.forEach((objet) => {
      if (!objet || typeof objet.setVisible !== "function") {
        return;
      }

      if (typeof objet.depth === "number" && objet.depth < 2199) {
        objet.setVisible(false);
      }
    });

    if (this.layer) this.layer.setVisible(false);
    if (this.player) this.player.setVisible(false);
    if (this.porte1) this.porte1.setVisible(false);
    if (this.porte2) this.porte2.setVisible(false);
    if (this.porte3) this.porte3.setVisible(false);
    if (this.porte4) this.porte4.setVisible(false);
    if (this.porte5) this.porte5.setVisible(false);
    if (this.porte6) this.porte6.setVisible(false);
    if (this.porte7) this.porte7.setVisible(false);
    if (this.chaudron) this.chaudron.setVisible(false);
    if (this.compteurPotionsText) this.compteurPotionsText.setVisible(false);
    if (this.messageNiveauText) this.messageNiveauText.setVisible(false);

    const largeurEcran = this.scale.width;
    const hauteurEcran = this.scale.height;
    const centreX = largeurEcran * 0.5;
    const centreY = hauteurEcran * 0.5;

    const fondNoirPleinEcran = this.add
      .rectangle(centreX, centreY, largeurEcran, hauteurEcran, 0x000000, instantane ? 1 : 0)
      .setScrollFactor(0)
      .setDepth(2199);

    const overlay = this.add
      .rectangle(centreX, centreY, largeurEcran, hauteurEcran, 0x39ff14, instantane ? 1 : 0)
      .setScrollFactor(0)
      .setDepth(2200);

    const fondTexte = this.add
      .rectangle(centreX, centreY + 20, Math.min(largeurEcran * 0.82, 1500), Math.min(hauteurEcran * 0.52, 360), 0x000000, instantane ? 1 : 0)
      .setScrollFactor(0)
      .setDepth(2201);

    const texteVictoire = this.add
      .text(centreX, centreY - 85, "Bravo vous avez aidé le savant à finir le jeu!", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "68px",
        fontStyle: "bold",
        color: "#003b00",
        stroke: "#d8ffd1",
        strokeThickness: 6,
        align: "center",
        wordWrap: { width: 1400 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2202)
      .setAlpha(instantane ? 1 : 0);

    const texteCredits = this.add
      .text(centreX, centreY + 115, "Basile, Conrado, Eloise, Camille", {
        fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
        fontSize: "54px",
        fontStyle: "bold",
        color: "#003b00",
        stroke: "#d8ffd1",
        strokeThickness: 5,
        align: "center"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2202)
      .setAlpha(instantane ? 1 : 0);

    if (!instantane) {
      this.tweens.add({
        targets: [fondNoirPleinEcran, overlay, fondTexte, texteVictoire, texteCredits],
        alpha: 1,
        duration: 420,
        ease: "Sine.easeOut"
      });
    }
  }

  appliquerModeTestChaudron() {
    if (!DEBUG_FORCE_CHAUDRON_7_7) {
      return;
    }

    for (let niveau = 1; niveau <= this.nbPotionsTotal; niveau += 1) {
      this.registry.set(`inventaireNiveau${niveau}`, [`debug_potion_niveau_${niveau}`]);
      this.registry.set(`potionNiveau${niveau}`, true);
    }
  }

  /***********************************************************************/
  /** UPDATE */
  /***********************************************************************/
  update() {
    if (this.finJeuAnimationEnCours || this.finJeuEcranAffiche) {
      this.player.setVelocity(0, 0);
      this.player.play("savant2_idle", true);
      return;
    }

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
      if (this.essayerEntrerNiveau(this.porte1, 1, "niveau1")) {
        return;
      }
      if (this.essayerEntrerNiveau(this.porte2, 2, "niveau2")) {
        return;
      }
      if (this.essayerEntrerNiveau(this.porte3, 3, "niveau3")) {
        return;
      }
      if (this.essayerEntrerNiveau(this.porte4, 4, "niveau4")) {
        return;
      }
      if (this.essayerEntrerNiveau(this.porte5, 5, "niveau5")) {
        return;
      }
      if (this.essayerEntrerNiveau(this.porte6, 6, "niveau6")) {
        return;
      }
      if (this.essayerEntrerNiveau(this.porte7, 7, "niveau7")) {
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