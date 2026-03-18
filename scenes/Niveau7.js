
// Sprite physique principal du joueur. C'est lui qui est affiche a l'ecran et deplace dans la map.
var player;
// Objet clavier Phaser pour lire les fleches du clavier.
var clavier;
// Reference vers la map Tiled du niveau 7 une fois chargee.
var mapNiveau7;
// Calque principal de tuiles. Il affiche le decor et porte aussi les collisions.
var layer1;
// Groupe des boules lancees depuis les lanceurs situes a droite de la map.
var groupeBoulesLancees;
// Vitesse horizontale du joueur quand on appuie a gauche ou a droite.
var playerSpeed = 180;
// Impulsion verticale du saut. Valeur negative = le joueur monte.
var jumpSpeed = -360;

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
        // Image d'un tileset d'icones utilise par la map.
        this.load.image("img_icons", "assets/icons_prev_comp-removebg-preview.png");
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

    // Create construit tout ce qu'on voit quand le niveau commence: map, joueur, camera et titre.
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
                fontFamily: "Courier New, monospace",
                fontSize: "32px",
                fontStyle: "bold",
                color: "#ff6666"
            }).setOrigin(0.5).setDepth(2000);
            return;
        }

        // Active les collisions uniquement sur les tuiles qui ont la propriete Tiled "collision = true".
        layer1.setCollisionByProperty({ collision: true });

        // Groupe physique pour les boules tirees par les lanceurs horizontaux.
        groupeBoulesLancees = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

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

        // Position initiale du joueur au lancement du niveau.
        const spawnX = 160;
        const spawnY = mapNiveau7.heightInPixels - 220;

        // Cree le personnage physique visible a l'ecran.
        // C'est ce sprite qui entre en collision avec le decor.
        player = this.physics.add.sprite(spawnX, spawnY, "savant2", 5);
        player.setScale(1.5);
        player.setCollideWorldBounds(true);
        player.setBounce(0);
        player.body.setSize(20, 44);
        player.body.setOffset(10, 6);
        player.play("savant2_idle");

        // Remplace les deux boules fixes de la map par deux sprites qui flottent verticalement en boucle.
        [
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
        this.physics.add.collider(player, groupeBoulesLancees);

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

    // Update s'execute a chaque frame. C'est ici que sont geres le mouvement, le saut et le changement d'animation du joueur.
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

        this.physics.add.collider(player, boule);

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

        this.tweens.add({
            targets: boule,
            y: boule.y + 7,
            duration: 700,
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
    }

    // Chaque seconde, choisit un seul des trois lanceurs et lui fait tirer une boule vers la gauche.
    programmerTirHorizontalAleatoire() {
        const delai = 1000;

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

        this.time.delayedCall(10000, () => {
            if (boule && boule.active) {
                boule.destroy();
            }
        });
    }

}
