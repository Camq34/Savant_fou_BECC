
// Sprite physique principal du joueur. C'est lui qui est affiche a l'ecran et deplace dans la map.
var player;
// Objet clavier Phaser pour lire les fleches du clavier.
var clavier;
// Reference vers la map Tiled du niveau 7 une fois chargee.
var mapNiveau7;
// Calque principal de tuiles. Il affiche le decor et porte aussi les collisions.
var layer1;
// Donnees logiques de la porte 1. Sert pour l'ouverture et la collision.
var porte1;
// Donnees logiques de la porte 2. Pour l'instant la variable existe surtout pour les futures interactions.
var porte2;
// Donnees logiques de la porte 3. Meme idee que pour porte2.
var porte3;
// Liste des 12 cases Tiled qui composent visuellement la porte 1 en 3 colonnes x 4 lignes.
var porte1Positions = [];
// Coordonnee X en tuiles de la cle dans la map. Le joueur doit recouvrir cette case pour la ramasser.
var keyTileX = 0;
// Coordonnee Y en tuiles de la cle dans la map.
var keyTileY = 20;
// Etat logique de la cle: false tant qu'elle est visible, true des qu'elle est recuperee.
var keyCollected = false;
// Verrou pour eviter de relancer plusieurs fois l'animation d'ouverture de la porte pendant qu'elle joue.
var isDoorAnimating = false;
// Etat final de la porte 1. Passe a true quand l'ouverture est terminee.
var Porte1Ouverte = false;
// Premier gid du tileset porteORANGE999 dans la map Tiled. Sert a reconstruire les frames directement dans le calque.
var orangeDoorFirstGid = 186;
// Debut de l'intervalle des tuiles du tileset donjonasset, utilise pour detecter les pieges/danger.
var donjonFirstGid = 0;
// Fin de l'intervalle des tuiles du tileset donjonasset.
var donjonLastGid = 0;
// Colonnes de depart de chaque etape d'animation de la porte dans le spritesheet/tuileset orange.
var doorFrameColumns = [0, 3, 6, 9, 12, 14];
// Tableau calcule des offsets de tuiles a appliquer pour chaque frame de l'ouverture de porte.
var doorFrameOffsets = [];
// Offsets de la pose finale de la porte ouverte, pour la laisser affichée ouverte a la fin de l'animation.
var finalOpenDoorOffsets = [];
// Vitesse horizontale du joueur quand on appuie a gauche ou a droite.
var playerSpeed = 180;
// Impulsion verticale du saut. Valeur negative = le joueur monte.
var jumpSpeed = -360;
// Position de reapparition X du joueur apres contact avec le donjonasset.
var spawnX = 64;
// Position de reapparition Y du joueur.
var spawnY = 0;
// Horodatage de la derniere reapparition pour eviter plusieurs respawns trop rapproches.
var lastRespawnAt = 0;
// Etat temporaire quand le joueur vient de toucher un danger et attend son reapparition.
var playerHitByDonjon = false;

// Scene Phaser du niveau 7. Elle charge la map, affiche le joueur, gere la cle, la porte 1 et les dangers.
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
        // Image des objets/decor utilises dans la map.
        this.load.image("img_decor", "assets/items.png");
        // Image du tileset donjonasset, utilisee ici comme zone de danger.
        this.load.image("img_donjonasset", "assets/donjonasset.png");
        // Image d'un autre tileset present dans la map.
        this.load.image("img_capture", "assets/coffre_fermé.png");
        // Image du tileset qui contient notamment l'icone de cle visible dans la map.
        this.load.image("img_icons", "assets/icons_prev_comp-removebg-preview.png");
        // Spritesheet/tileset de la porte orange. Ici il est utilise comme tileset Tiled pour reconstituer l'ouverture.
        this.load.spritesheet("img_porte_orange", "assets/porteORANGE999.png");
        // Tileset de briques eventuel pour la map.
        this.load.image("img_brique", "assets/brique.png");
        // Tileset des portes de sortie.
        this.load.image("img_portesortie", "assets/portesortiewallah.png");
        // Spritesheet du personnage joueur avec les frames d'idle, marche et saut.
        this.load.spritesheet("savant2", "assets/savant2.png", {
            frameWidth: 40,
            frameHeight: 50,
            spacing: 1
        });
    }

    // Create construit tout ce qu'on voit quand le niveau commence: map, joueur, camera, texte, variables de gameplay.
    create() {
        // Instancie la map Tiled en memoire a partir de la ressource chargee dans preload.
        mapNiveau7 = this.make.tilemap({ key: "map_niveau7" });
        if (!mapNiveau7) {
            // En cas de map introuvable, on affiche un fond noir et un message d'erreur au centre de l'ecran.
            this.cameras.main.setBackgroundColor("#000000");
            this.add.text(960, 640, "ERREUR: map_niveau7 introuvable", {
                fontFamily: "Courier New, monospace",
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
        const tilesetPorteOrange = mapNiveau7.addTilesetImage("porteORANGE999", "img_porte_orange");
        const tilesetBrique = mapNiveau7.addTilesetImage("brique", "img_brique");
        const tilesetPorteSortie = mapNiveau7.addTilesetImage("portesortiewallah", "img_portesortie");
        const allTilesets = [
            tilesetDecor,
            tilesetDonjon,
            tilesetCapture,
            tilesetIcons,
            tilesetPorteOrange,
            tilesetBrique,
            tilesetPorteSortie
        ].filter(Boolean);

        // Cree le calque principal visible du niveau. C'est lui qui affiche le sol, les murs, la cle et les portes.
        layer1 = mapNiveau7.createLayer("Tile Layer 1", allTilesets, 0, 0);
        if (!layer1) {
            // Si le calque manque dans la map, on l'affiche clairement a l'ecran pour faciliter le debug.
            this.add.text(960, 640, "ERREUR: Tile Layer 1 introuvable", {
                fontFamily: "Courier New, monospace",
                fontSize: "32px",
                fontStyle: "bold",
                color: "#ff6666"
            }).setOrigin(0.5).setDepth(2000);
            return;
        }

        // Active les collisions uniquement sur les tuiles qui ont la propriete Tiled "collision = true".
        layer1.setCollisionByProperty({ collision: true });

        // Recupere les infos des tilesets depuis la map pour connaitre les vrais gid utilises par Tiled.
        const orangeDoorTileset = mapNiveau7.tilesets.find((tileset) => tileset.name === "porteORANGE999");
        const donjonTileset = mapNiveau7.tilesets.find((tileset) => tileset.name === "donjonasset");

        // Gid de depart du tileset de porte orange. Sert a "dessiner" manuellement les differentes images de la porte.
        orangeDoorFirstGid = orangeDoorTileset ? orangeDoorTileset.firstgid : 186;
        // Intervalle complet du tileset donjonasset pour reconnaitre rapidement les tuiles dangereuses.
        donjonFirstGid = donjonTileset ? donjonTileset.firstgid : 0;
        donjonLastGid = donjonTileset ? donjonTileset.firstgid + donjonTileset.total - 1 : 0;

        // Reinitialise tous les etats de gameplay a chaque entree dans la scene.
        keyCollected = false;
        isDoorAnimating = false;
        Porte1Ouverte = false;
        lastRespawnAt = 0;
        playerHitByDonjon = false;

        // Liste exacte des 12 cases de la porte 1 dans la map.
        // Ces positions sont modifiees pendant l'animation pour afficher visuellement l'ouverture porte par porte.
        porte1Positions = [
            { x: 11, y: 35 }, { x: 12, y: 35 }, { x: 13, y: 35 },
            { x: 11, y: 36 }, { x: 12, y: 36 }, { x: 13, y: 36 },
            { x: 11, y: 37 }, { x: 12, y: 37 }, { x: 13, y: 37 },
            { x: 11, y: 38 }, { x: 12, y: 38 }, { x: 13, y: 38 }
        ];

        // Zone logique de la porte 1. Elle resume la surface occupee par la porte dans la map.
        porte1 = { xMin: 11, xMax: 13, yMin: 35, yMax: 38 };
        // Zone logique de la porte 2 + position cible potentielle pour une teleportation future.
        porte2 = {
            xMin: 0,
            xMax: 3,
            yMin: 13,
            yMax: 16,
            targetX: mapNiveau7.tileToWorldX(1) + mapNiveau7.tileWidth / 2,
            targetY: mapNiveau7.tileToWorldY(16) + mapNiveau7.tileHeight / 2 - 75
        };
        // Zone logique de la porte 3. Utile plus tard si une interaction doit etre ajoutee.
        porte3 = { xMin: 0, xMax: 3, yMin: 7, yMax: 10 };

        // Pour chaque etape de l'ouverture, on calcule les 12 tuiles exactes a afficher dans la porte.
        // Le spritesheet de porte est organise en colonnes, donc on derive chaque "frame" a partir d'une colonne de depart.
        doorFrameOffsets = doorFrameColumns.map((startCol) => [
            startCol, startCol + 1, startCol + 2,
            startCol + 17, startCol + 18, startCol + 19,
            startCol + 34, startCol + 35, startCol + 36,
            startCol + 51, startCol + 52, startCol + 53
        ]);

        // Pose finale de la porte completement ouverte. On la reapplique a la fin pour garantir le bon visuel final.
        finalOpenDoorOffsets = [
            12, 13, 14,
            29, 30, 31,
            46, 47, 48,
            63, 64, 65
        ];

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

        // Animation de saut: affiche les frames aeriennes tant que le joueur n'est pas au sol.
        this.anims.create({
            key: "savant2_jump",
            frames: this.anims.generateFrameNumbers("savant2", { start: 6, end: 10 }),
            frameRate: 10,
            repeat: -1
        });

        // Position initiale du joueur au lancement du niveau et point de reapparition apres degat.
        spawnX = 160;
        spawnY = mapNiveau7.heightInPixels - 220;

        // Cree le personnage physique visible a l'ecran.
        // C'est ce sprite qui entre en collision avec le decor, touche la cle et peut mourir sur les tuiles dangereuses.
        player = this.physics.add.sprite(spawnX, spawnY, "savant2", 5);
        player.setScale(1.5);
        player.setCollideWorldBounds(true);
        player.setBounce(0);
        player.body.setSize(20, 44);
        player.body.setOffset(10, 6);
        player.play("savant2_idle");

        // Active la collision entre le joueur et le calque de tuiles du niveau.
        this.physics.add.collider(player, layer1);

        // Recupere les fleches du clavier pour piloter le joueur.
        clavier = this.input.keyboard.createCursorKeys();

        // Titre fixe affiche en haut de l'ecran. Comme il a scrollFactor 0, il reste accroche a la camera.
        this.add.text(960, 95, "NIVEAU 7", {
            fontFamily: "Courier New, monospace",
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

        // Reglages camera: fond noir, limites de deplacement sur toute la map, puis suivi doux du joueur.
        this.cameras.main.setBackgroundColor("#000000");
        this.cameras.main.setBounds(0, 0, mapNiveau7.widthInPixels, mapNiveau7.heightInPixels);
        this.cameras.main.startFollow(player, true, 0.1, 0.1);
    }

    // Update s'execute a chaque frame. C'est ici que sont geres le mouvement, le saut,
    // la detection de la cle, les dangers et le changement d'animation du joueur.
    update() {
        // Si le joueur ou le clavier n'existent pas encore, on ne fait rien pour eviter une erreur JS.
        if (!player || !clavier) {
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

        // Quand le joueur vient de toucher un danger, on le fige pendant l'effet avant reapparition.
        if (playerHitByDonjon) {
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

        // Detection de la cle.
        // On convertit la hitbox du joueur en coordonnees de tuiles, puis on verifie si la case de la cle
        // se trouve a l'interieur de la zone actuellement occupee par le joueur.
        if (!keyCollected && !isDoorAnimating) {
            try {
                const body = player.body;
                const leftTile = mapNiveau7.worldToTileX(body.left);
                const rightTile = mapNiveau7.worldToTileX(body.right);
                const topTile = mapNiveau7.worldToTileY(body.top);
                const bottomTile = mapNiveau7.worldToTileY(body.bottom);
                if (
                    keyTileX >= leftTile &&
                    keyTileX <= rightTile &&
                    keyTileY >= topTile &&
                    keyTileY <= bottomTile
                ) {
                    // La cle est consideree comme ramassee.
                    keyCollected = true;
                    if (layer1) {
                        // On efface la tuile de la cle dans le calque, donc visuellement la cle disparait de la map.
                        layer1.removeTileAt(keyTileX, keyTileY, true, false);
                    }
                    // Des que la cle disparait, on lance l'ouverture de la porte 1.
                    this.openPorte1();
                }
            } catch (error) {
                // En cas de probleme pendant la detection, on stoppe la boucle de ramassage pour eviter un plantage visuel.
                keyCollected = true;
                isDoorAnimating = false;
            }
        }

        // Test des tuiles dangereuses du donjon. Peut declencher la coloration rouge puis le respawn.
        this.respawnOnDonjonTouch();

        // Choix de l'animation affichee a l'ecran selon l'etat physique du joueur.
        if (!isOnGround) {
            player.play("savant2_jump", true);
        } else if (player.body.velocity.x !== 0) {
            player.play("savant2_walk", true);
        } else {
            player.play("savant2_idle", true);
        }
    }

    // Verifie si le joueur touche une tuile du tileset donjonasset.
    // Si oui, le joueur devient rouge, s'arrete puis reapparait a son point de spawn apres un court delai.
    respawnOnDonjonTouch() {
        if (!player || !player.body || !layer1 || donjonFirstGid === 0) {
            return;
        }
        if (playerHitByDonjon) {
            return;
        }
        if (this.time.now - lastRespawnAt < 250) {
            return;
        }
        const body = player.body;
        const leftTile = mapNiveau7.worldToTileX(body.left);
        const rightTile = mapNiveau7.worldToTileX(body.right);
        const topTile = mapNiveau7.worldToTileY(body.top);
        const bottomTile = mapNiveau7.worldToTileY(body.bottom);

        // Balaye toutes les cases actuellement recouvertes par le joueur pour savoir s'il touche un danger.
        for (let tileY = topTile; tileY <= bottomTile; tileY += 1) {
            for (let tileX = leftTile; tileX <= rightTile; tileX += 1) {
                const tile = layer1.getTileAt(tileX, tileY);
                if (!tile) {
                    continue;
                }
                if (tile.index >= donjonFirstGid && tile.index <= donjonLastGid) {
                    // Effet de degat: joueur bloque, teint en rouge, puis repositionne au point de spawn.
                    playerHitByDonjon = true;
                    player.setTint(0xff0000);
                    player.setVelocity(0, 0);
                    this.time.delayedCall(1000, () => {
                        player.setPosition(spawnX, spawnY);
                        player.setVelocity(0, 0);
                        player.clearTint();
                        playerHitByDonjon = false;
                        lastRespawnAt = this.time.now;
                    });
                    return;
                }
            }
        }
    }

    // Anime l'ouverture de la porte 1 directement en remplaçant les tuiles de la porte dans la map.
    // Visuellement, la porte orange change d'image et finit ouverte, puis ses collisions sont coupees.
    openPorte1() {
        if (!layer1 || !porte1Positions || !doorFrameOffsets) {
            return;
        }
        if (isDoorAnimating) {
            return;
        }
        isDoorAnimating = true;
        Porte1Ouverte = false;

        // Chaque delayedCall correspond a une etape de l'animation d'ouverture.
        doorFrameOffsets.forEach((offsets, frameIndex) => {
            this.time.delayedCall(120 * frameIndex, () => {
                try {
                    // Remplace les 12 tuiles de la porte par celles correspondant a la frame courante.
                    offsets.forEach((offset, tileIndex) => {
                        const tilePos = porte1Positions[tileIndex];
                        if (!tilePos) {
                            return;
                        }
                        layer1.putTileAt(orangeDoorFirstGid + offset, tilePos.x, tilePos.y);
                    });
                    if (frameIndex === doorFrameOffsets.length - 1) {
                        // Quand l'animation est terminee, on impose la version finale ouverte de la porte.
                        finalOpenDoorOffsets.forEach((offset, tileIndex) => {
                            const tilePos = porte1Positions[tileIndex];
                            if (tilePos) {
                                layer1.putTileAt(orangeDoorFirstGid + offset, tilePos.x, tilePos.y);
                            }
                        });

                        // On desactive la collision sur toutes les cases de la porte pour pouvoir passer a travers.
                        porte1Positions.forEach((tilePos) => {
                            if (tilePos) {
                                layer1.setCollisionAt(tilePos.x, tilePos.y, false, false);
                            }
                        });

                        // Fin logique de l'animation: la porte est desormais consideree comme ouverte.
                        isDoorAnimating = false;
                        Porte1Ouverte = true;
                    }
                } catch (error) {
                    // Si une erreur survient pendant l'ouverture, on debloque l'etat pour eviter une porte figée a jamais.
                    isDoorAnimating = false;
                    Porte1Ouverte = false;
                }
            });
        });
    }
}
