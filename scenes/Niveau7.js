
// Sprite physique principal du joueur. C'est lui qui est affiche a l'ecran et deplace dans la map.
var player;
// Objet clavier Phaser pour lire les fleches du clavier.
var clavier;
// Touche d'interaction pour utiliser la porte de sortie.
var toucheE;
// Touche pour revenir a l'accueil a tout moment.
var toucheEsc;
// Reference vers la map Tiled du niveau 7 une fois chargee.
var mapNiveau7;
// Calque principal de tuiles. Il affiche le decor et porte aussi les collisions.
var layer1;
// Groupe de tous les dangers visuels issus du tileset donjonasset.
var groupeDangersDonjon;
// Groupe des boules lancees depuis les lanceurs situes a droite de la map.
var groupeBoulesLancees;
// Coordonnees de reapparition du joueur.
var spawnX = 160;
var spawnY = 0;
// Petit verrou pour eviter plusieurs respawns sur quelques millisecondes.
var prochainRespawnAutorise = 0;
// Etat temporaire pendant lequel le joueur est touche, rouge et bloque avant le respawn.
var joueurTouche = false;
// Etat de la cle placee en haut de la map pour eviter de la supprimer plusieurs fois.
var cleCoffreRecuperee = false;
// Etat du coffre ferme en haut a gauche pour eviter de l'ouvrir plusieurs fois.
var coffreOuvert = false;
// Gid de la potion placee en (0,0), retiree au debut puis remise quand le coffre s'ouvre.
var potionCacheeGid = 380;
// Etat de la potion pour ne la recuperer qu'une seule fois.
var potionRecuperee = false;
// Etat de la porte bleue de sortie apres l'ouverture.
var porteBleueOuverte = false;
// Texte temporaire affiche quand la cle est recuperee.
var texteCleRecuperee;
// Texte temporaire affiche quand la potion est recuperee.
var textePotionRecuperee;
// Texte affiche pendant la transition de fin du niveau.
var texteFinNiveau;
// Verrou pour ne declencher la fin du niveau qu'une seule fois.
var finNiveau7Declenchee = false;
const SON_PORTE_NIVEAU7 = "son_porte_niveau7";
const SON_COFFRE_NIVEAU7 = "son_coffre_niveau7";
// Vitesse horizontale du joueur quand on appuie a gauche ou a droite.
var playerSpeed = 180;
// Impulsion verticale du saut. Valeur negative = le joueur monte.
var jumpSpeed = -320;

// Scene Phaser du niveau 7. Elle charge la map et affiche le joueur.
export default class niveau7 extends Phaser.Scene {
    constructor() {
        // Cle de scene utilisee par Phaser pour identifier et lancer ce niveau.
        super({ key: "niveau7" });
    }

    // Preload charge tous les fichiers avant l'affichage du niveau.
    // Rien n'apparait encore a l'ecran ici, on ne fait que preparer les ressources.
    preload() {
        // Fichier Tiled du niveau 7: structure de la map, calques, tilesets, gid, etc.
        this.load.tilemapTiledJSON("map_niveau7", "assets/Map/map_niveau7.tmj");
        // Son joue a l'entree du niveau 7.
        this.load.audio("son_entree_niveau7", "assets/audio/rire_niveau7.mp3");
        // Son joue quand le joueur touche un element du donjon.
        this.load.audio("son_collision_donjon_n7", "assets/audio/rire_boule_niveau7.mp3");
        // Son joue quand le joueur utilise une porte.
        this.load.audio(SON_PORTE_NIVEAU7, "assets/audio/porte_niveau6.mp3");
        // Son joue quand le joueur ouvre un coffre.
        this.load.audio(SON_COFFRE_NIVEAU7, "assets/audio/coffre_ouverture.mp3");
        // Image des objets/decor utilises dans la map.
        this.load.image("img_decor", "assets/items.png");
        // Image du tileset donjonasset, conservee pour l'affichage normal de la map.
        this.load.image("img_donjonasset", "assets/donjonasset.png");
        // Version spritesheet du meme tileset pour pouvoir animer individuellement les deux boules.
        this.load.spritesheet("sprite_donjonasset", "assets/donjonasset.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        // Image d'un autre tileset present dans la map.
        this.load.image("img_capture", "assets/coffre_fermé.png");
        // Image du coffre ouvert affichee quand le joueur apporte la cle au coffre.
        this.load.image("img_coffre_ouvert", "assets/coffre_ouvert.png");
        // Image d'un tileset d'icones utilise par la map.
        this.load.image("img_icons", "assets/icons_prev_comp-removebg-preview.png");
        // Tileset de briques eventuel pour la map.
        this.load.image("img_brique", "assets/brique.png");
        // Tileset des portes de sortie.
        this.load.image("img_portesortie", "assets/portesortiewallah.png");
        // Spritesheet de la porte bleue pour l'animer quand la potion est recuperee.
        this.load.spritesheet("img_portesortie_anim", "assets/portesortiewallah.png", {
            frameWidth: 96,
            frameHeight: 120
        });
        // Spritesheet du personnage joueur avec les frames d'idle, marche et saut.
        this.load.spritesheet("savant2", "assets/savant2.png", {
            frameWidth: 40,
            frameHeight: 50,
            spacing: 1
        });
    }

    // Create construit tout ce qu'on voit quand le niveau commence: map, joueur, camera et titre.
    create() {
        const jouerRireNiveau7 = () => {
            this.sound.play("son_entree_niveau7", {
                loop: false,
                volume: 0.7
            });
        };

        jouerRireNiveau7();
        this.time.addEvent({
            delay: 30000,
            loop: true,
            callback: jouerRireNiveau7
        });

        // Instancie la map Tiled en memoire a partir de la ressource chargee dans preload.
        mapNiveau7 = this.make.tilemap({ key: "map_niveau7" });
        if (!mapNiveau7) {
            // En cas de map introuvable, on affiche un fond noir et un message d'erreur au centre de l'ecran.
            this.cameras.main.setBackgroundColor("#000000");
            this.add.text(960, 640, "ERREUR: map_niveau7 introuvable", {
                fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
                fontSize: "34px",
                fontStyle: "bold",
                color: "#ff6666"
            }).setOrigin(0.5);
            return;
        }

        // Lie chaque nom de tileset declare dans Tiled a l'image chargee dans Phaser.
        // Sans cette association, le calque ne pourrait pas afficher correctement les tuiles de la map.
        const tilesetDecor = mapNiveau7.addTilesetImage("items", "img_decor");
        const tilesetDonjon = mapNiveau7.addTilesetImage("donjonasset", "img_donjonasset");
        const tilesetCapture = mapNiveau7.addTilesetImage("coffre_fermé", "img_capture");
        const tilesetIcons = mapNiveau7.addTilesetImage("icons_prev_comp-removebg-preview", "img_icons");
        const tilesetBrique = mapNiveau7.addTilesetImage("brique", "img_brique");
        const tilesetPorteSortie = mapNiveau7.addTilesetImage("portesortiewallah", "img_portesortie");
        const allTilesets = [
            tilesetDecor,
            tilesetDonjon,
            tilesetCapture,
            tilesetIcons,
            tilesetBrique,
            tilesetPorteSortie
        ].filter(Boolean);

        // Cree le calque principal visible du niveau. C'est lui qui affiche le sol, les murs et le decor.
        layer1 = mapNiveau7.createLayer("Tile Layer 1", allTilesets, 0, 0);
        if (!layer1) {
            // Si le calque manque dans la map, on l'affiche clairement a l'ecran pour faciliter le debug.
            this.add.text(960, 640, "ERREUR: Tile Layer 1 introuvable", {
                fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
                fontSize: "32px",
                fontStyle: "bold",
                color: "#ff6666"
            }).setOrigin(0.5).setDepth(2000);
            return;
        }

        // Active les collisions uniquement sur les tuiles qui ont la propriete Tiled "collision = true".
        layer1.setCollisionByProperty({ collision: true });

        // Cache la potion en (0,0) tant que le coffre en haut a gauche n'a pas ete ouvert.
        potionCacheeGid = layer1.getTileAt(0, 0) ? layer1.getTileAt(0, 0).index : 380;
        layer1.removeTileAt(0, 0, true, false);

        // Recupere les infos du tileset donjonasset pour convertir toutes ses tuiles en sprites animes.
        const infosTilesetDonjon = mapNiveau7.tilesets.find((tileset) => tileset.name === "donjonasset");

        // Groupe physique qui contient tous les elements dangereux provenant de donjonasset.
        groupeDangersDonjon = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        // Groupe physique pour les boules tirees par les lanceurs horizontaux.
        groupeBoulesLancees = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Convertit tous les elements fixes de donjonasset en sprites avec la meme mini-rotation.
        this.convertirTuilesDonjonEnSprites(infosTilesetDonjon);

        // Animation idle: le personnage reste immobile a l'ecran.
        this.anims.create({
            key: "savant2_idle",
            frames: [{ key: "savant2", frame: 5 }],
            frameRate: 1,
            repeat: -1
        });

        // Animation de marche: affiche le cycle de deplacement gauche/droite du personnage.
        this.anims.create({
            key: "savant2_walk",
            frames: this.anims.generateFrameNumbers("savant2", { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        // Animation de s
        // aut: affiche les frames aeriennes tant que le joueur n'est pas au sol.
        this.anims.create({
            key: "savant2_jump",
            frames: this.anims.generateFrameNumbers("savant2", { start: 6, end: 10 }),
            frameRate: 10,
            repeat: -1
        });

        if (!this.anims.exists("anim_ouvreporte_sortie_n7")) {
            this.anims.create({
                key: "anim_ouvreporte_sortie_n7",
                frames: this.anims.generateFrameNumbers("img_portesortie_anim", { start: 0, end: 5 }),
                frameRate: 10,
                repeat: 0
            });
        }

        // Position initiale du joueur au lancement du niveau.
        spawnX = 160;
        spawnY = mapNiveau7.heightInPixels - 220;
        prochainRespawnAutorise = 0;
        joueurTouche = false;
        cleCoffreRecuperee = false;
        coffreOuvert = false;
        potionRecuperee = false;
        porteBleueOuverte = false;
        finNiveau7Declenchee = false;

        // Cree le personnage physique visible a l'ecran.
        // C'est ce sprite qui entre en collision avec le decor.
        player = this.physics.add.sprite(spawnX, spawnY, "savant2", 5);
        player.setScale(1.5);
        player.setDepth(10);
        player.setCollideWorldBounds(true);
        player.setBounce(0);
        player.body.setSize(20, 44);
        player.body.setOffset(10, 6);
        player.play("savant2_idle");

        // Remplace les deux boules fixes de la map par deux sprites qui flottent verticalement en boucle.
        [
            { tileX: 13, tileY: 0 },
            { tileX: 42, tileY: 27 },
            { tileX: 43, tileY: 27 }
        ].forEach(({ tileX, tileY }) => {
            this.creerBouleAnimee(tileX, tileY, "vertical");
        });

        // Remplace les boules fixes de la ligne 34 par des sprites qui bougent horizontalement en boucle.
        [6, 16, 17, 18, 29, 30, 31, 32].forEach((tileX) => {
            this.creerBouleAnimee(tileX, 34, "horizontal");
        });

        // Cree les trois lanceurs a droite, puis declenche un seul tir par seconde choisi au hasard parmi eux.
        [12, 14, 16].forEach((tileY) => {
            this.creerLanceurHorizontal(59, tileY);
        });
        this.programmerTirHorizontalAleatoire();

        // Active la collision entre le joueur et le calque de tuiles du niveau.
        this.physics.add.collider(player, layer1);
        this.physics.add.overlap(player, groupeDangersDonjon, this.renvoyerAuSpawn, null, this);
        this.physics.add.overlap(player, groupeBoulesLancees, this.renvoyerAuSpawn, null, this);

        // Recupere les fleches du clavier pour piloter le joueur.
        clavier = this.input.keyboard.createCursorKeys();
        toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        toucheEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Titre fixe affiche en haut de l'ecran. Comme il a scrollFactor 0, il reste accroche a la camera.
        this.add.text(960, 95, "NIVEAU 7", {
            fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
            fontSize: "72px",
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
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

        texteCleRecuperee = this.add.text(960, 180, "vous avez récupéré la clé", {
            fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
            fontSize: "36px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000).setVisible(false);

        textePotionRecuperee = this.add.text(960, 180, "vous avez récupéré une potion", {
            fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
            fontSize: "36px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000).setVisible(false);

        texteFinNiveau = this.add.text(960, 180, "vous avez fini le dernier niveau", {
            fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
            fontSize: "36px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000).setVisible(false);

        // Reglages camera: fond noir, limites de deplacement sur toute la map, puis suivi doux du joueur.
        this.cameras.main.setBackgroundColor("#000000");
        this.cameras.main.setBounds(0, 0, mapNiveau7.widthInPixels, mapNiveau7.heightInPixels);
        this.cameras.main.startFollow(player, true, 0.1, 0.1);
    }

    // Update s'execute a chaque frame. C'est ici que sont geres le mouvement, le saut et le changement d'animation du joueur.
    update() {
        // Si le joueur ou le clavier n'existent pas encore, on ne fait rien pour eviter une erreur JS.
        if (!player || !clavier) {
            return;
        }

        if (toucheEsc && Phaser.Input.Keyboard.JustDown(toucheEsc)) {
            this.scene.start("Accueil");
            return;
        }

        // Protection: si pour une raison quelconque le body du joueur a ete desactive, on le reactive.
        if (player.body && !player.body.enable) {
            player.body.enable = true;
        }

        // Protection equivalente pour le clavier Phaser.
        if (this.input && this.input.keyboard && !this.input.keyboard.enabled) {
            this.input.keyboard.enabled = true;
        }

        if (finNiveau7Declenchee) {
            player.setVelocity(0, 0);
            player.play("savant2_idle", true);
            return;
        }

        // Quand le joueur a touche un element donjonasset, il reste rouge et immobile jusqu'au respawn.
        if (joueurTouche) {
            player.setVelocity(0, 0);
            player.play("savant2_idle", true);
            return;
        }

        // Detection du contact avec le sol. Sert a autoriser le saut et a choisir l'animation correcte.
        const isOnGround = player.body.blocked.down || player.body.touching.down;

        // Deplacement horizontal du joueur.
        // A gauche: vitesse negative et retournement du sprite. A droite: vitesse positive et sprite normal.
        if (clavier.left.isDown) {
            player.setVelocityX(-playerSpeed);
            player.setFlipX(true);
        } else if (clavier.right.isDown) {
            player.setVelocityX(playerSpeed);
            player.setFlipX(false);
        } else {
            player.setVelocityX(0);
        }

        // Saut simple: seulement si la fleche du haut est appuyee et que le joueur touche le sol.
        if (clavier.up.isDown && isOnGround) {
            player.setVelocityY(jumpSpeed);
        }

        // Si le joueur touche la cle placee en (58,1), la tuile disparait de la map.
        this.recupererCleCoffre();
        // Si le joueur possede deja la cle et atteint le coffre en haut a gauche, le coffre s'ouvre.
        this.ouvrirCoffreAvecCle();
        // Si la potion reapparue en (0,0) est recuperee, elle ouvre la porte bleue.
        this.recupererPotionEtOuvrirPorte();

        if (toucheE && Phaser.Input.Keyboard.JustDown(toucheE)) {
            this.retournerAccueilParPorte();
        }

        // Choix de l'animation affichee a l'ecran selon l'etat physique du joueur.
        if (!isOnGround) {
            player.play("savant2_jump", true);
        } else if (player.body.velocity.x !== 0) {
            player.play("savant2_walk", true);
        } else {
            player.play("savant2_idle", true);
        }
    }

    // Cree une boule issue du tileset donjonasset, retire la tuile fixe de la map puis lui applique un mouvement infini.
    creerBouleAnimee(tileX, tileY, direction) {
        if (!layer1 || !mapNiveau7) {
            return;
        }

        layer1.removeTileAt(tileX, tileY, true, false);

        const boule = this.physics.add.sprite(
            mapNiveau7.tileToWorldX(tileX) + mapNiveau7.tileWidth / 2,
            mapNiveau7.tileToWorldY(tileY) + mapNiveau7.tileHeight / 2,
            "sprite_donjonasset",
            115
        );

        boule.setDepth(20);
        boule.body.setAllowGravity(false);
        boule.body.setImmovable(true);
        boule.body.setSize(24, 24);
        boule.body.setOffset(4, 4);
        groupeDangersDonjon.add(boule);
        this.ajouterMiniRotation(boule);

        if (direction === "horizontal") {
            this.tweens.add({
                targets: boule,
                x: boule.x + 50,
                duration: 700,
                yoyo: true,
                repeat: -1,
                ease: "Sine.InOut"
            });
            return;
        }

        const dureeVerticale = tileX === 13 && tileY === 0 ? 1600 : 700;

        this.tweens.add({
            targets: boule,
            y: boule.y + 200,
            duration: dureeVerticale,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut"
        });
    }

    // Cree un lanceur fixe sur la droite.
    creerLanceurHorizontal(tileX, tileY) {
        if (!layer1 || !mapNiveau7) {
            return;
        }

        layer1.removeTileAt(tileX, tileY, true, false);

        const lanceur = this.physics.add.sprite(
            mapNiveau7.tileToWorldX(tileX) + mapNiveau7.tileWidth / 2,
            mapNiveau7.tileToWorldY(tileY) + mapNiveau7.tileHeight / 2,
            "sprite_donjonasset",
            115
        );

        lanceur.setDepth(20);
        lanceur.body.setAllowGravity(false);
        lanceur.body.setImmovable(true);
        lanceur.body.setSize(24, 24);
        lanceur.body.setOffset(4, 4);
        groupeDangersDonjon.add(lanceur);
        this.ajouterMiniRotation(lanceur);
    }

    // Chaque seconde, choisit un seul des trois lanceurs et lui fait tirer une boule vers la gauche.
    programmerTirHorizontalAleatoire() {
        const delai = 1200;

        this.time.delayedCall(delai, () => {
            const lignesLanceurs = [12, 14, 16];
            const tileY = Phaser.Utils.Array.GetRandom(lignesLanceurs);
            this.lancerBouleVersLaGauche(59, tileY);
            this.programmerTirHorizontalAleatoire();
        });
    }

    // Lance une boule projectile vers la gauche pour qu'elle traverse la ligne comme un lanceur de boules.
    lancerBouleVersLaGauche(tileX, tileY) {
        if (!mapNiveau7 || !groupeBoulesLancees) {
            return;
        }

        const boule = groupeBoulesLancees.create(
            mapNiveau7.tileToWorldX(tileX) + mapNiveau7.tileWidth / 2,
            mapNiveau7.tileToWorldY(tileY) + mapNiveau7.tileHeight / 2,
            "sprite_donjonasset",
            115
        );

        boule.setDepth(19);
        boule.body.setAllowGravity(false);
        boule.body.setImmovable(true);
        boule.body.setSize(24, 24);
        boule.body.setOffset(4, 4);
        boule.setVelocityX(-220);
        this.ajouterMiniRotation(boule);

        this.time.delayedCall(10000, () => {
            if (boule && boule.active) {
                boule.destroy();
            }
        });
    }

    // Convertit toutes les tuiles donjonasset de la map en sprites dangereux avec mini-rotation.
    convertirTuilesDonjonEnSprites(infosTilesetDonjon) {
        if (!layer1 || !mapNiveau7 || !infosTilesetDonjon) {
            return;
        }

        const firstgid = infosTilesetDonjon.firstgid;
        const lastgid = infosTilesetDonjon.firstgid + infosTilesetDonjon.total - 1;
        const toutesLesTuiles = layer1.getTilesWithin(0, 0, mapNiveau7.width, mapNiveau7.height);

        toutesLesTuiles.forEach((tile) => {
            if (!tile || tile.index < firstgid || tile.index > lastgid) {
                return;
            }

            if (this.estPositionDonjonAnimee(tile.x, tile.y)) {
                return;
            }

            layer1.removeTileAt(tile.x, tile.y, true, false);

            const sprite = this.physics.add.sprite(
                mapNiveau7.tileToWorldX(tile.x) + mapNiveau7.tileWidth / 2,
                mapNiveau7.tileToWorldY(tile.y) + mapNiveau7.tileHeight / 2,
                "sprite_donjonasset",
                tile.index - firstgid
            );

            sprite.setDepth(20);
            sprite.body.setAllowGravity(false);
            sprite.body.setImmovable(true);
            sprite.body.setSize(24, 24);
            sprite.body.setOffset(4, 4);
            groupeDangersDonjon.add(sprite);
            this.ajouterMiniRotation(sprite);
        });
    }

    // Ignore les positions deja remplacees par un comportement special pour eviter les doublons.
    estPositionDonjonAnimee(tileX, tileY) {
        const boulesVerticales = (tileX === 13 && tileY === 0) || ((tileX === 42 || tileX === 43) && tileY === 27);
        const boulesHorizontales = [6, 16, 17, 18, 29, 30, 31, 32].includes(tileX) && tileY === 34;
        const lanceursDroite = tileX === 59 && [12, 14, 16].includes(tileY);

        return boulesVerticales || boulesHorizontales || lanceursDroite;
    }

    // Ajoute une petite rotation infinie pour donner l'impression que la boule de feu tourne sur elle-meme.
    ajouterMiniRotation(sprite) {
        if (!sprite) {
            return;
        }

        this.tweens.add({
            targets: sprite,
            angle: sprite.angle + 18,
            duration: 250,
            ease: "Sine.InOut",
            yoyo: true,
            repeat: -1
        });
    }

    // Supprime la cle du coffre quand le joueur recouvre sa case dans la map.
    recupererCleCoffre() {
        if (!player || !player.body || !layer1 || !mapNiveau7 || cleCoffreRecuperee) {
            return;
        }

        const body = player.body;
        const leftTile = mapNiveau7.worldToTileX(body.left);
        const rightTile = mapNiveau7.worldToTileX(body.right);
        const topTile = mapNiveau7.worldToTileY(body.top);
        const bottomTile = mapNiveau7.worldToTileY(body.bottom);

        if (58 >= leftTile && 58 <= rightTile && 1 >= topTile && 1 <= bottomTile) {
            layer1.removeTileAt(58, 1, true, false);
            cleCoffreRecuperee = true;

            if (texteCleRecuperee) {
                texteCleRecuperee.setVisible(true);

                this.time.delayedCall(3000, () => {
                    if (texteCleRecuperee) {
                        texteCleRecuperee.setVisible(false);
                    }
                });
            }
        }
    }

    // Ouvre le coffre ferme du haut-gauche si le joueur a deja la cle et s'approche du coffre.
    ouvrirCoffreAvecCle() {
        if (!player || !mapNiveau7 || !layer1 || !cleCoffreRecuperee || coffreOuvert) {
            return;
        }

        const coffreCentreX = mapNiveau7.tileToWorldX(0) + (mapNiveau7.tileWidth * 3) / 2;
        const coffreCentreY = mapNiveau7.tileToWorldY(2) + (mapNiveau7.tileHeight * 2) / 2;
        const distance = Phaser.Math.Distance.Between(player.x, player.y, coffreCentreX, coffreCentreY);

        if (distance > 110) {
            return;
        }

        [
            { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }
        ].forEach((tuile) => {
            layer1.removeTileAt(tuile.x, tuile.y, false, false);
        });

        if (this.cache.audio.exists(SON_COFFRE_NIVEAU7)) {
            try {
                this.sound.play(SON_COFFRE_NIVEAU7, {
                    loop: false,
                    volume: 0.7
                });
            } catch (error) {
                console.warn("Niveau7: lecture du son de coffre impossible", error);
            }
        }

        this.add
            .image(coffreCentreX, coffreCentreY, "img_coffre_ouvert")
            .setDisplaySize(mapNiveau7.tileWidth * 3, mapNiveau7.tileHeight * 2)
            .setDepth(2);

        layer1.putTileAt(potionCacheeGid, 0, 0, false);

        coffreOuvert = true;
    }

    // Recupere la potion visible en (0,0), puis declenche l'ouverture de la porte bleue du niveau.
    recupererPotionEtOuvrirPorte() {
        if (!player || !player.body || !layer1 || !mapNiveau7 || !coffreOuvert || potionRecuperee) {
            return;
        }

        const body = player.body;
        const leftTile = mapNiveau7.worldToTileX(body.left);
        const rightTile = mapNiveau7.worldToTileX(body.right);
        const topTile = mapNiveau7.worldToTileY(body.top);
        const bottomTile = mapNiveau7.worldToTileY(body.bottom);

        if (!(0 >= leftTile && 0 <= rightTile && 0 >= topTile && 0 <= bottomTile)) {
            return;
        }

        layer1.removeTileAt(0, 0, true, false);
        potionRecuperee = true;
        this.registry.set("inventaireNiveau7", ["objet_niveau7_potion"]);

        if (textePotionRecuperee) {
            textePotionRecuperee.setVisible(true);

            this.time.delayedCall(3000, () => {
                if (textePotionRecuperee) {
                    textePotionRecuperee.setVisible(false);
                }
            });
        }

        this.ouvrirPorteBleue();
    }

    // Remplace la porte bleue fermee de la map par son animation d'ouverture issue du spritesheet portesortiewallah.
    ouvrirPorteBleue() {
        if (!mapNiveau7 || !layer1 || porteBleueOuverte) {
            return;
        }

        [
            { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 },
            { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 },
            { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 },
            { x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }
        ].forEach((tuile) => {
            layer1.removeTileAt(tuile.x, tuile.y, false, false);
        });

        const porteCentreX = mapNiveau7.tileToWorldX(0) + (mapNiveau7.tileWidth * 3) / 2;
        const porteBasY = mapNiveau7.tileToWorldY(11);

        this.add
            .sprite(porteCentreX, porteBasY, "img_portesortie_anim")
            .setOrigin(0.5, 1)
            .setDepth(6)
            .play("anim_ouvreporte_sortie_n7");

        porteBleueOuverte = true;
    }

    // Renvoie le joueur a l'accueil s'il appuie sur E devant la porte de sortie, apres recuperation de la potion.
    retournerAccueilParPorte() {
        if (!player || !player.body || !mapNiveau7 || !potionRecuperee || !porteBleueOuverte || finNiveau7Declenchee) {
            return;
        }

        const body = player.body;
        const leftTile = mapNiveau7.worldToTileX(body.left);
        const rightTile = mapNiveau7.worldToTileX(body.right);
        const topTile = mapNiveau7.worldToTileY(body.top);
        const bottomTile = mapNiveau7.worldToTileY(body.bottom);
        const surPorteSortie = rightTile >= 0 && leftTile <= 2 && bottomTile >= 7 && topTile <= 11;

        if (!surPorteSortie) {
            return;
        }

        finNiveau7Declenchee = true;
        player.setVelocity(0, 0);
        if (this.cache.audio.exists(SON_PORTE_NIVEAU7)) {
            try {
                this.sound.play(SON_PORTE_NIVEAU7, {
                    loop: false,
                    volume: 0.7
                });
            } catch (error) {
                console.warn("Niveau7: lecture du son de porte impossible", error);
            }
        }

        if (texteFinNiveau) {
            texteFinNiveau.setVisible(true);
        }

        this.time.delayedCall(2000, () => {
            this.scene.start("Accueil", { messageFinNiveau: "Bravo vous avez fini le niveau 7 !" });
        });
    }

    // Replace instantanement le joueur sur le point de spawn quand il touche un element donjonasset.
    renvoyerAuSpawn() {
        if (!player || joueurTouche || this.time.now < prochainRespawnAutorise) {
            return;
        }

        this.sound.play("son_collision_donjon_n7", {
            loop: false,
            volume: 1
        });

        player.setVelocity(0, 0);
        player.setTint(0xff0000);
        joueurTouche = true;
        prochainRespawnAutorise = this.time.now + 1200;

        this.time.delayedCall(1000, () => {
            if (!player) {
                return;
            }

            player.setPosition(spawnX, spawnY);
            player.setVelocity(0, 0);
            player.clearTint();
            joueurTouche = false;
        });
    }

}
