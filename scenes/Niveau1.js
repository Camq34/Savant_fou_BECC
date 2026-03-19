var player;
var clavier;
var gameOver = false;
var porte;
var porte2;
var porteSortie;
var layer;
var layer2;
var layer3;
var inventaire = [];
var objetCalque3Recupere = false;
const OBJET_CALQUE3_TILE_X = 25;
const OBJET_CALQUE3_TILE_Y = 15;
const NOM_OBJET_CALQUE3_NIVEAU1 = "objet_calque3_25_15";

export default class Niveau1 extends Phaser.Scene {
    constructor() {
        super("niveau1");
    }

    preload() {
        this.load.image('img_lasers', 'assets/lasers.png');
        this.load.image('img_items', 'assets/items.png');
        this.load.tilemapTiledJSON('ma_map', 'assets/Map/map_niveau1.tmj');

        this.load.spritesheet("img_perso", "assets/savant2.png", {
            frameWidth: 40,
            frameHeight: 50,
            spacing: 1
        });

        this.load.spritesheet("img_porte", "assets/porteORANGE999.png", {
            frameWidth: 96,
            frameHeight: 120
        });
        this.load.spritesheet("img_clef", "assets/icons_prev_comp-removebg-preview.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("img_interrupteurs", "assets/interrupTeurs.png", {
            frameWidth: 257,
            frameHeight: 156
        });
        this.load.spritesheet("img_porte_sortie_n1", "assets/portesortiewallah.png", {
            frameWidth: 96,
            frameHeight: 120
        });
        this.load.image("img_coffre", "assets/coffre_fermé.png");
        this.load.image("img_coffre_ouvert", "assets/coffre_ouvert.png");
    }
    

    create() {
        gameOver = false;
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

        layer3 = this.map.createLayer('Calque de Tuiles 3', [tilesetLasers, tilesetItems, tilesetPreview], 0, 0);
        if (layer3) {
            layer3.setCollisionByProperty({ collision: true });
            layer3.setVisible(false);
        }

        const playerStartX = 120;
        const playerStartY = this.map.heightInPixels - 220;
        this.playerStartX = playerStartX;
        this.playerStartY = playerStartY;
        player = this.physics.add.sprite(playerStartX, playerStartY, 'img_perso');
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        player.setDepth(10); // dessiné au-dessus des portes
        player.setScale(1.6);
        player.setVisible(true);
        player.body.setSize(20, 44);
        player.body.setOffset(10, 6);

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
        this.physics.add.collider(player, layer3, (p, tile) => {
            if (tile.properties && tile.properties.tue) mourir();
        }, () => this.calque3Actif, this);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(player);
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;
        const mapZoom = Math.min(gameWidth / this.map.widthInPixels, gameHeight / this.map.heightInPixels, 1);
        this.cameras.main.setZoom(mapZoom);

        if (!this.anims.exists("savant2_idle")) {
            this.anims.create({
                key: "savant2_idle",
                frames: [{ key: "img_perso", frame: 5 }],
                frameRate: 1,
                repeat: -1
            });
        }
        if (!this.anims.exists("savant2_walk")) {
            this.anims.create({
                key: "savant2_walk",
                frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 4 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists("savant2_jump")) {
            this.anims.create({
                key: "savant2_jump",
                frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 10 }),
                frameRate: 10,
                repeat: -1
            });
        }

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
        this.coffreOuvert = false;

        this.clef = this.physics.add.staticSprite(400, 370, "img_clef",9);
        this.clef.setScale(1.2);
        this.clef.setDepth(6);
        this.clefCollected = false;

        this.interrupteur = this.physics.add.staticSprite(
            this.map.tileToWorldX(57) + this.map.tileWidth * 0.5,
            this.map.tileToWorldY(23) + this.map.tileHeight * 0.5,
            "img_interrupteurs",
            1
        );
        this.interrupteur.setScale(0.28);
        this.interrupteur.setDepth(6);
        this.interrupteurActive = false;
        this.tuilesTueDesactivees = false;
        this.calque3Actif = false;
        this.porteSortieVisible = false;
        this.finNiveau1Declenchee = false;
        inventaire = [];
        objetCalque3Recupere = false;

        porteSortie = this.physics.add.staticSprite(porte.x, porte2.y, "img_porte_sortie_n1");
        porteSortie.setDepth(2);
        porteSortie.setOrigin(0.5, 0.5);
        const basPorteOrangeDroite = porte2.y + porte2.displayHeight * 0.5;
        porteSortie.y = basPorteOrangeDroite - porteSortie.displayHeight * 0.5;
        porteSortie.refreshBody();
        porteSortie.setVisible(false);
        porteSortie.body.enable = false;

        this.physics.add.overlap(player, this.clef, () => {
            if (!this.clefCollected) {
                this.clefCollected = true;
                this.clef.destroy();
                this.afficherMessageCle();
            }
        });

        player.play("savant2_idle");

        if (!this.anims.exists("anim_ouvreporte")) {
            this.anims.create({
                key: "anim_ouvreporte",
                frames: this.anims.generateFrameNumbers("img_porte", { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }
        if (!this.anims.exists("anim_fermeporte")) {
            this.anims.create({
                key: "anim_fermeporte",
                frames: this.anims.generateFrameNumbers("img_porte", { start: 5, end: 0 }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this.anims.exists("anim_ouvreporte_sortie_n1")) {
            this.anims.create({
                key: "anim_ouvreporte_sortie_n1",
                frames: this.anims.generateFrameNumbers("img_porte_sortie_n1", { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }
        if (!this.anims.exists("anim_fermeporte_sortie_n1")) {
            this.anims.create({
                key: "anim_fermeporte_sortie_n1",
                frames: this.anims.generateFrameNumbers("img_porte_sortie_n1", { start: 5, end: 0 }),
                frameRate: 10,
                repeat: 0
            });
        }
        porte.ouverte = false;
        porte2.ouverte = false;
    }

    update() {
        if (gameOver) return;

        const isOnGround = player.body.blocked.down || player.body.touching.down;

        if (clavier.left.isDown) {
            player.setVelocityX(-160);
            player.setFlipX(true);
        } else if (clavier.right.isDown) {
            player.setVelocityX(160);
            player.setFlipX(false);
        } else {
            player.setVelocityX(0);
        }

        if ((clavier.up.isDown || clavier.space.isDown) && isOnGround) {
            player.setVelocityY(-400);
        }

        if (!isOnGround) {
            player.anims.play("savant2_jump", true);
        } else if (player.body.velocity.x !== 0) {
            player.anims.play("savant2_walk", true);
        } else {
            player.anims.play("savant2_idle", true);
        }

        this.recupererObjetCalque3();

        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.ouvrirCoffreAvecCle();

            const procheInterrupteur = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                this.interrupteur.x,
                this.interrupteur.y
            ) <= 110;

            if (procheInterrupteur) {
                try {
                    if (!this.interrupteurActive) {
                        this.interrupteur.setFrame(0);
                        this.desactiverTuilesTueInterrupteur();
                    } else {
                        this.interrupteur.setFrame(1);
                        this.reactiverTuilesTueInterrupteur();
                    }

                    this.interrupteur.setScale(0.28);
                    this.interrupteurActive = !this.interrupteurActive;
                } catch (error) {
                    console.error("Erreur toggle interrupteur Niveau1:", error);
                }
                return;
            }

            if (this.physics.overlap(player, porte)) {
                this.animerPorteOrange(porte);
                player.setPosition(porte.linkedDoor.x, porte.linkedDoor.y - 50);
                return;
            } else if (this.physics.overlap(player, porte2)) {
                this.animerPorteOrange(porte2);
                player.setPosition(porte2.linkedDoor.x, porte2.linkedDoor.y - 50);
                return;
            } else if (this.porteSortieVisible && porteSortie && this.physics.overlap(player, porteSortie)) {
                this.terminerNiveau1();
                return;
            }
        }

    }

    recupererObjetCalque3() {
        if (!this.calque3Actif || objetCalque3Recupere || !layer3) {
            return;
        }

        const ciblesObjet = [
            { x: OBJET_CALQUE3_TILE_X, y: OBJET_CALQUE3_TILE_Y },
            { x: 20, y: 15 }
        ];

        const pointsTest = [
            { x: player.x, y: player.y + player.body.height * 0.2 },
            { x: player.x - player.body.width * 0.2, y: player.y + player.body.height * 0.2 },
            { x: player.x + player.body.width * 0.2, y: player.y + player.body.height * 0.2 }
        ];

        const tuilesJoueur = pointsTest.map((p) => ({
            x: this.map.worldToTileX(p.x),
            y: this.map.worldToTileY(p.y)
        }));

        const cibleTrouvee = ciblesObjet.find(({ x, y }) => {
            const tuileObjet = layer3.getTileAt(x, y);
            if (!tuileObjet) {
                return false;
            }

            return tuilesJoueur.some((t) => t.x === x && t.y === y);
        });

        if (!cibleTrouvee) {
            return;
        }

        layer3.removeTileAt(cibleTrouvee.x, cibleTrouvee.y, false, false);
        inventaire.push(NOM_OBJET_CALQUE3_NIVEAU1);
        this.registry.set("inventaireNiveau1", [...inventaire]);
        objetCalque3Recupere = true;
        this.afficherMessagePotionJaune();
        this.faireApparaitrePorteSortie();
    }

    faireApparaitrePorteSortie() {
        if (!porteSortie || this.porteSortieVisible) {
            return;
        }

        porteSortie.setVisible(true);
        porteSortie.body.enable = true;
        porteSortie.refreshBody();
        this.porteSortieVisible = true;
    }

    terminerNiveau1() {
        if (this.finNiveau1Declenchee) {
            return;
        }

        this.finNiveau1Declenchee = true;
        gameOver = true;
        player.setVelocity(0, 0);

        if (porteSortie && porteSortie.scene && this.anims.exists("anim_ouvreporte_sortie_n1")) {
            porteSortie.anims.play("anim_ouvreporte_sortie_n1");
        }

        const messageFin = this.add
            .text(this.cameras.main.width * 0.5, this.cameras.main.height * 0.25, "Bravo vous avez fini le niveau 1 !", {
                fontFamily: "Arial",
                fontSize: "42px",
                color: "#ffd64d",
                stroke: "#000000",
                strokeThickness: 8
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1000);

        this.tweens.add({
            targets: messageFin,
            alpha: 0,
            duration: 600,
            delay: 1200
        });

        this.time.delayedCall(1700, () => {
            this.scene.start("Accueil", { messageFinNiveau: "Bravo vous avez fini le niveau 1 !" });
        });
    }

    afficherMessageCle() {
        const message = this.add
            .text(this.cameras.main.width * 0.5, 80, "Clef recuperee !", {
                fontFamily: "Arial",
                fontSize: "32px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 6
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1000);

        this.tweens.add({
            targets: message,
            alpha: 0,
            duration: 1300,
            delay: 500,
            onComplete: () => message.destroy()
        });
    }

    afficherMessagePotionJaune() {
        const message = this.add
            .text(this.cameras.main.width * 0.5, 80, "Bravo vous avez recupere la potion jaune !", {
                fontFamily: "Arial",
                fontSize: "36px",
                color: "#ffd84d",
                stroke: "#000000",
                strokeThickness: 6
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1000);

        this.tweens.add({
            targets: message,
            alpha: 0,
            duration: 1800,
            delay: 700,
            onComplete: () => message.destroy()
        });
    }

    animerPorteOrange(porteCible) {
        if (!porteCible) {
            return;
        }

        if (!this.anims.exists("anim_ouvreporte") || !this.anims.exists("anim_fermeporte")) {
            return;
        }

        porteCible.anims.play("anim_ouvreporte");
        porteCible.ouverte = true;

        this.time.delayedCall(450, () => {
            if (!porteCible.scene) {
                return;
            }
            porteCible.anims.play("anim_fermeporte");
            porteCible.ouverte = false;
        });
    }

    desactiverTuilesTueInterrupteur() {
        if (this.tuilesTueDesactivees) {
            return;
        }

        const tuilesACouper = [
            { x: 33, y: 35 },
            { x: 34, y: 35 },
            { x: 35, y: 35 },
            { x: 36, y: 35 },
            { x: 37, y: 35 },
            { x: 38, y: 35 }
        ];

        tuilesACouper.forEach(({ x, y }) => {
            if (layer) {
                const tileLayer1 = layer.getTileAt(x, y);
                if (tileLayer1) {
                    tileLayer1.setCollision(false, false, false, false);
                    tileLayer1.properties = { ...tileLayer1.properties, tue: false, collision: false };
                    tileLayer1.visible = false;
                }
            }
            if (layer2) {
                const tileLayer2 = layer2.getTileAt(x, y);
                if (tileLayer2) {
                    tileLayer2.setCollision(false, false, false, false);
                    tileLayer2.properties = { ...tileLayer2.properties, tue: false, collision: false };
                    tileLayer2.visible = false;
                }
            }
        });

        this.tuilesTueDesactivees = true;
    }

    reactiverTuilesTueInterrupteur() {
        if (!this.tuilesTueDesactivees) {
            return;
        }

        const tuilesAReactiver = [
            { x: 33, y: 35 },
            { x: 34, y: 35 },
            { x: 35, y: 35 },
            { x: 36, y: 35 },
            { x: 37, y: 35 },
            { x: 38, y: 35 }
        ];

        tuilesAReactiver.forEach(({ x, y }) => {
            if (layer) {
                const tileLayer1 = layer.getTileAt(x, y);
                if (tileLayer1) {
                    tileLayer1.visible = true;
                    tileLayer1.setCollision(true, true, true, true);
                    tileLayer1.properties = { ...tileLayer1.properties, tue: true, collision: true };
                }
            }

            if (layer2) {
                const tileLayer2 = layer2.getTileAt(x, y);
                if (tileLayer2) {
                    tileLayer2.visible = true;
                    tileLayer2.setCollision(true, true, true, true);
                    tileLayer2.properties = { ...tileLayer2.properties, tue: true, collision: true };
                }
            }
        });

        this.tuilesTueDesactivees = false;
    }

    ouvrirCoffreAvecCle() {
        if (!this.clefCollected || this.coffreOuvert || !this.coffre) {
            return;
        }

        const distance = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            this.coffre.x,
            this.coffre.y
        );

        if (distance > 110) {
            return;
        }

        this.coffre.setTexture("img_coffre_ouvert");
        this.coffre.setScale(0.8);
        this.coffreOuvert = true;

        if (layer3) {
            layer3.setVisible(true);
            this.calque3Actif = true;
        }
    }
}


