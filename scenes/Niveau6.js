var player;
var clavier;
var gameOver = false;
var layer1;
var layer2;
var layer3;
var porte1;
var porte2;
var porteSortieFinale;
var coffres = [];
var inventaire = [];
var objet57_9Recupere = false;
var objet41_35Recupere = false;
var calque3Actif = false;
var porteSortieVisible = false;
var finNiveau6Declenchee = false;
const OBJET_TILE_X = 57;
const OBJET_TILE_Y = 9;
const NOM_OBJET_NIVEAU6 = "objet_niveau6_57_9";
const OBJET2_TILE_X = 41;
const OBJET2_TILE_Y = 35;
const NOM_OBJET2_NIVEAU6 = "objet_niveau6_41_35";
const PORTE_SORTIE_X = 1800;
const PORTE_SORTIE_Y = 1153;

export default class niveau6 extends Phaser.Scene {
    constructor() {
        super({ key: "niveau6" });
    }

    preload() {
        this.load.image('img_laser', 'assets/lasers.png');
        this.load.image('img_coffre_ferme', 'assets/coffre_ferm\u00e9.png');
        this.load.image('img_coffre_ouvert', 'assets/coffre_ouvert.png');
        this.load.image('img_porte_orange_tileset', 'assets/porteORANGE999.png');
        this.load.image('img_porte_sortie', 'assets/portesortiewallah.png');
        this.load.image('img_screenshot_6', 'assets/screenshot_6.jpg');
        this.load.image('img_items', 'assets/items.png');
        this.load.image('tuilesJeu', 'assets/tuilesJeu.png');
        this.load.image('img_icons_prev_comp', 'assets/icons_prev_comp-removebg-preview.png');

        this.load.tilemapTiledJSON('ma_map_6', 'assets/Map/map_niveau6.tmj');
        this.load.spritesheet("img_perso", "assets/savant2.png", {
            frameWidth: 40,
            frameHeight: 50,
            spacing: 1
        });

        this.load.spritesheet("img_porte_orange_anim", "assets/porteORANGE999.png", {
            frameWidth: 96,
            frameHeight: 120
        });

        this.load.spritesheet("img_porte_sortie_anim", "assets/portesortiewallah.png", {
            frameWidth: 96,
            frameHeight: 120
        });
    }

    create() {
        gameOver = false;
        const map = this.make.tilemap({ key: 'ma_map_6' });
        this.levelMap = map;

        const tilesetLaser = map.addTilesetImage('laser', 'img_laser');
        const tilesetCoffre = map.addTilesetImage('coffre_ferm\u00e9', 'img_coffre_ferme');
        const tilesetPorteOrange = map.addTilesetImage('porteORANGE999', 'img_porte_orange_tileset');
        const tilesetPorteSortie = map.addTilesetImage('portesortiewallah', 'img_porte_sortie');
        const tilesetScreenshot = map.addTilesetImage('screenshot_6', 'img_screenshot_6');
        const tilesetItems = map.addTilesetImage('items', 'img_items');
        const tilesetTuilesJeu = map.addTilesetImage('tuilesJeu', 'tuilesJeu');
        const tilesetIcons = map.addTilesetImage('icons_prev_comp-removebg-preview', 'img_icons_prev_comp');
        const tilesetsTous = [tilesetTuilesJeu, tilesetScreenshot, tilesetItems, tilesetIcons, tilesetPorteOrange, tilesetLaser, tilesetCoffre, tilesetPorteSortie].filter(Boolean);

        layer1 = map.createLayer('Calque de Tuiles 1', [tilesetTuilesJeu, tilesetScreenshot, tilesetItems, tilesetIcons], 0, 0);
        layer1.setCollisionByProperty({ collision: true });

        const porteLayerName = map.getLayer('calque_porte') ? 'calque_porte' : (map.getLayer('Calque_porte') ? 'Calque_porte' : null);
        if (porteLayerName) {
            layer2 = map.createLayer(porteLayerName, [tilesetPorteOrange, tilesetLaser, tilesetCoffre, tilesetPorteSortie, tilesetItems, tilesetIcons], 0, 0);
            layer2.setVisible(true);
            layer2.setDepth(0);
        } else {
            console.warn('Niveau6: calque porte non trouv� dans la map');
        }

        const calque3Name = map.getLayer('Calque de tuiles 3')
            ? 'Calque de tuiles 3'
            : (map.getLayer('Calque de Tuiles 3') ? 'Calque de Tuiles 3' : null);

        if (calque3Name) {
            layer3 = map.createLayer(calque3Name, tilesetsTous, 0, 0);
            layer3.setCollisionByProperty({ collision: true });
            layer3.setVisible(false);
            calque3Actif = false;
        } else {
            layer3 = null;
            console.warn('Niveau6: Calque de tuiles 3 non trouv� dans la map');
        }

        coffres = [];
        this.initialiserCoffres(tilesetCoffre);

        player = this.physics.add.sprite(160, map.heightInPixels - 180, "img_perso", 5);
        player.setScale(1.5);
        player.setCollideWorldBounds(true);
        player.setBounce(0);
        player.body.setSize(20, 44);
        player.body.setOffset(10, 6);
        player.setDepth(10);

        this.portevrai = this.physics.add.staticSprite(1700, 550, "img_porte_orange_anim");
        this.porteClef = this.physics.add.staticSprite(1700, 260, "img_porte_orange_anim");
        this.portevrai.ouverte = false;
        this.porteClef.ouverte = false;
        porteSortieFinale = this.physics.add.staticSprite(PORTE_SORTIE_X, PORTE_SORTIE_Y, "img_porte_sortie_anim");
        porteSortieFinale.setOrigin(0.5, 1);
        porteSortieFinale.refreshBody();
        porteSortieFinale.setVisible(false);
        porteSortieFinale.body.enable = false;
        porteSortieFinale.ouverte = false;
        this.teleportToTopLeftDoor = { x: 140, y: 130 };
        this.teleportToCoffreDoor = { x: map.tileToWorldX(57) + 16, y: map.tileToWorldY(8) + 16 };
        inventaire = [];
        objet57_9Recupere = false;
        objet41_35Recupere = false;
        calque3Actif = false;
        porteSortieVisible = false;
        finNiveau6Declenchee = false;

        this.physics.add.collider(player, layer1);
        this.physics.add.collider(player, layer3, undefined, () => calque3Actif, this);

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

        if (!this.anims.exists("anim_ouvreporte_n6")) {
            this.anims.create({
                key: "anim_ouvreporte_n6",
                frames: this.anims.generateFrameNumbers("img_porte_orange_anim", { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this.anims.exists("anim_fermeporte_n6")) {
            this.anims.create({
                key: "anim_fermeporte_n6",
                frames: this.anims.generateFrameNumbers("img_porte_orange_anim", { start: 5, end: 0 }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this.anims.exists("anim_ouvreporte_sortie_n6")) {
            this.anims.create({
                key: "anim_ouvreporte_sortie_n6",
                frames: this.anims.generateFrameNumbers("img_porte_sortie_anim", { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }

        if (!this.anims.exists("anim_fermeporte_sortie_n6")) {
            this.anims.create({
                key: "anim_fermeporte_sortie_n6",
                frames: this.anims.generateFrameNumbers("img_porte_sortie_anim", { start: 5, end: 0 }),
                frameRate: 10,
                repeat: 0
            });
        }

        player.play("savant2_idle");

        clavier = this.input.keyboard.createCursorKeys();
        this.toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    initialiserCoffres(tilesetCoffre) {
        if (!layer2 || !tilesetCoffre) {
            return;
        }

        const tuilesCoffre = new Map();
        const visites = new Set();
        const firstGid = tilesetCoffre.firstgid;
        const lastGid = firstGid + tilesetCoffre.total - 1;

        layer2.forEachTile((tile) => {
            if (tile && tile.index >= firstGid && tile.index <= lastGid) {
                tuilesCoffre.set(`${tile.x}_${tile.y}`, tile);
            }
        });

        tuilesCoffre.forEach((tile, key) => {
            if (visites.has(key)) {
                return;
            }

            const groupe = [];
            const pile = [tile];
            visites.add(key);

            while (pile.length > 0) {
                const current = pile.pop();
                groupe.push({ x: current.x, y: current.y });

                const voisins = [
                    `${current.x + 1}_${current.y}`,
                    `${current.x - 1}_${current.y}`,
                    `${current.x}_${current.y + 1}`,
                    `${current.x}_${current.y - 1}`
                ];

                voisins.forEach((voisinKey) => {
                    if (tuilesCoffre.has(voisinKey) && !visites.has(voisinKey)) {
                        visites.add(voisinKey);
                        pile.push(tuilesCoffre.get(voisinKey));
                    }
                });
            }

            const minX = Math.min(...groupe.map((t) => t.x));
            const maxX = Math.max(...groupe.map((t) => t.x));
            const minY = Math.min(...groupe.map((t) => t.y));
            const maxY = Math.max(...groupe.map((t) => t.y));
            const tileW = this.levelMap.tileWidth;
            const tileH = this.levelMap.tileHeight;

            coffres.push({
                tuiles: groupe,
                centreX: (minX + maxX + 1) * tileW * 0.5,
                centreY: (minY + maxY + 1) * tileH * 0.5,
                largeurPx: (maxX - minX + 1) * tileW,
                hauteurPx: (maxY - minY + 1) * tileH,
                ouvert: false
            });
        });
    }

    interagirAvecCoffre() {
        if (!objet57_9Recupere) {
            return;
        }

        const distanceInteraction = 110;

        for (let i = 0; i < coffres.length; i += 1) {
            const coffre = coffres[i];
            if (coffre.ouvert) {
                continue;
            }

            const distance = Phaser.Math.Distance.Between(player.x, player.y, coffre.centreX, coffre.centreY);
            if (distance > distanceInteraction) {
                continue;
            }

            coffre.tuiles.forEach((tuile) => {
                layer2.removeTileAt(tuile.x, tuile.y, false, false);
            });

            this.add
                .image(coffre.centreX, coffre.centreY, 'img_coffre_ouvert')
                .setDisplaySize(coffre.largeurPx, coffre.hauteurPx)
                .setDepth(2);

            coffre.ouvert = true;
            this.activerCalque3();
            break;
        }
    }

    activerCalque3() {
        if (!layer3 || calque3Actif) {
            return;
        }

        layer3.setVisible(true);
        calque3Actif = true;
    }

    teleporterPorteVraiVersPorteClef() {
        player.setPosition(this.porteClef.x, this.porteClef.y - 75);
        player.setVelocity(0, 0);
    }

    teleporterPorteClefVersPorteVrai() {
        player.setPosition(this.portevrai.x, this.portevrai.y - 75);
        player.setVelocity(0, 0);
    }

    animerPorteOrange(porte) {
        if (!porte) {
            return;
        }

        porte.anims.play("anim_ouvreporte_n6");
        porte.ouverte = true;

        this.time.delayedCall(450, () => {
            if (!porte.scene) {
                return;
            }
            porte.anims.play("anim_fermeporte_n6");
            porte.ouverte = false;
        });
    }

    mourirEtRespawn() {
        if (gameOver) return;

        gameOver = true;
        player.setVelocity(0, 0);

        // Petite animation de mort avant le respawn.
        player.setTint(0xff4d4d);
        this.cameras.main.shake(180, 0.004);
        this.tweens.add({
            targets: player,
            alpha: 0,
            scaleX: player.scaleX * 0.75,
            scaleY: player.scaleY * 0.75,
            angle: 12,
            duration: 220,
            ease: "Quad.easeIn",
            onComplete: () => {
                player.clearTint();
                player.setAlpha(1);
                player.setAngle(0);
                player.setScale(1.5);
            }
        });

        this.time.delayedCall(260, () => {
            this.scene.restart();
            gameOver = false;
        });
    }

    joueurToucheTuileTue(layer) {
        if (!layer) return false;

        const centreTile = this.levelMap.getTileAtWorldXY(player.x, player.y, false, this.cameras.main, layer);
        const piedTile = this.levelMap.getTileAtWorldXY(player.x, player.y + player.body.height * 0.45, false, this.cameras.main, layer);

        const centreTue = centreTile && centreTile.properties && centreTile.properties.tue;
        const piedTue = piedTile && piedTile.properties && piedTile.properties.tue;

        return Boolean(centreTue || piedTue);
    }

    recupererObjet57_9() {
        if (objet57_9Recupere) {
            return;
        }

        const tileXJoueur = this.levelMap.worldToTileX(player.x);
        const tileYJoueur = this.levelMap.worldToTileY(player.y + player.body.height * 0.25);

        if (tileXJoueur !== OBJET_TILE_X || tileYJoueur !== OBJET_TILE_Y) {
            return;
        }

        const tileLayer1 = layer1 ? layer1.getTileAt(OBJET_TILE_X, OBJET_TILE_Y) : null;
        const tileLayer2 = layer2 ? layer2.getTileAt(OBJET_TILE_X, OBJET_TILE_Y) : null;
        const tileLayer3 = layer3 ? layer3.getTileAt(OBJET_TILE_X, OBJET_TILE_Y) : null;

        if (tileLayer1) {
            layer1.removeTileAt(OBJET_TILE_X, OBJET_TILE_Y);
        } else if (tileLayer2) {
            layer2.removeTileAt(OBJET_TILE_X, OBJET_TILE_Y);
        } else if (tileLayer3) {
            layer3.removeTileAt(OBJET_TILE_X, OBJET_TILE_Y);
        }

        inventaire.push(NOM_OBJET_NIVEAU6);
        this.registry.set("inventaireNiveau6", [...inventaire]);
        objet57_9Recupere = true;
    }

    recupererObjet41_35() {
        if (objet41_35Recupere || !calque3Actif) {
            return;
        }

        const coffreOuvert = coffres.some((coffre) => coffre.ouvert);
        if (!coffreOuvert) {
            return;
        }

        const tileXJoueur = this.levelMap.worldToTileX(player.x);
        const tileYJoueur = this.levelMap.worldToTileY(player.y + player.body.height * 0.25);

        if (tileXJoueur !== OBJET2_TILE_X || tileYJoueur !== OBJET2_TILE_Y) {
            return;
        }

        const tileLayer3 = layer3 ? layer3.getTileAt(OBJET2_TILE_X, OBJET2_TILE_Y) : null;
        const tileLayer2 = layer2 ? layer2.getTileAt(OBJET2_TILE_X, OBJET2_TILE_Y) : null;
        const tileLayer1 = layer1 ? layer1.getTileAt(OBJET2_TILE_X, OBJET2_TILE_Y) : null;

        if (tileLayer3) {
            layer3.removeTileAt(OBJET2_TILE_X, OBJET2_TILE_Y);
        } else if (tileLayer2) {
            layer2.removeTileAt(OBJET2_TILE_X, OBJET2_TILE_Y);
        } else if (tileLayer1) {
            layer1.removeTileAt(OBJET2_TILE_X, OBJET2_TILE_Y);
        }

        inventaire.push(NOM_OBJET2_NIVEAU6);
        this.registry.set("inventaireNiveau6", [...inventaire]);
        objet41_35Recupere = true;
        this.afficherMessagePotionRouge();
        this.faireApparaitrePorteSortie();
    }

    afficherMessagePotionRouge() {
        const message = this.add
            .text(this.cameras.main.width * 0.5, 80, "Vous avez récupéré la potion rouge !", {
                fontFamily: "Arial",
                fontSize: "36px",
                color: "#ff6b6b",
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

    faireApparaitrePorteSortie() {
        if (!porteSortieFinale || porteSortieVisible) {
            return;
        }

        porteSortieFinale.setVisible(true);
        porteSortieFinale.body.enable = true;
        porteSortieFinale.refreshBody();
        porteSortieVisible = true;
    }

    terminerNiveau6() {
        if (finNiveau6Declenchee) {
            return;
        }

        finNiveau6Declenchee = true;
        gameOver = true;
        player.setVelocity(0, 0);
        porteSortieFinale.anims.play("anim_ouvreporte_sortie_n6");

        const messageFin = this.add
            .text(this.cameras.main.width * 0.5, this.cameras.main.height * 0.25, "Bravo vous avez fini le niveau 6 !", {
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
            this.scene.start("Accueil", { messageFinNiveau: "Bravo vous avez fini le niveau 6 !" });
        });
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

        this.recupererObjet57_9();
        this.recupererObjet41_35();

        if (this.joueurToucheTuileTue(layer1) || this.joueurToucheTuileTue(layer2) || this.joueurToucheTuileTue(layer3)) {
            this.mourirEtRespawn();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.toucheE)) {
            this.interagirAvecCoffre();

            if (this.physics.overlap(player, this.porteClef)) {
                this.animerPorteOrange(this.porteClef);
                this.teleporterPorteClefVersPorteVrai();
                return;
            }

            if (this.physics.overlap(player, this.portevrai)) {
                this.animerPorteOrange(this.portevrai);
                this.teleporterPorteVraiVersPorteClef();
                return;
            }

            if (porteSortieVisible && this.physics.overlap(player, porteSortieFinale)) {
                this.terminerNiveau6();
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
            }
        }
    }
}
