
var player;
var clavier;
var gameOver = false;
var layer1;
var layer2;
var coffre;
var potion;
var messagePotion;
var cle;
var porteSortieVisible = false;
var finNiveau4Declenchee = false;
const SON_PORTE_NIVEAU4 = "son_porte_niveau4";



export default class niveau4 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau4" });
	}
    preload() {
    this.load.image('img_brique', 'assets/brique.png');
    this.load.image('img_lasers', 'assets/lasers.png');
    this.load.tilemapTiledJSON('ma_map_4', 'assets/Map/map_niveau4.tmj');
    this.load.audio(SON_PORTE_NIVEAU4, 'assets/audio/porte_niveau6.mp3');

    this.load.spritesheet("img_perso", "assets/savant2.png", {
        frameWidth: 40,
        frameHeight: 50,
        spacing: 1
    });

    this.load.spritesheet("img_porte_sortie_anim_n4", "assets/portesortiewallah.png", {
        frameWidth: 96,
        frameHeight: 120
    });

    this.load.image("coffre_fermé", "assets/coffre_fermé.png");
    this.load.image("coffre_ouvert", "assets/coffre_ouvert.png");

    this.load.spritesheet("donjonasset", "assets/donjonasset.png", {
        frameWidth: 32,
        frameHeight: 32
    });

    this.load.spritesheet("icons_prev", "assets/icons_prev_comp-removebg-preview.png", {
    frameWidth: 32,
    frameHeight: 32
});

}
    create() {
    gameOver = false;
    const map = this.make.tilemap({ key: 'ma_map_4' });
    this.levelMap = map;
    this.tuilesTueIndexes = new Set();

    map.tilesets.forEach((tileset) => {
        const proprietes = tileset.tileProperties || {};
        Object.keys(proprietes).forEach((idTuile) => {
            const props = proprietes[idTuile];
            if (props && props.tue) {
                this.tuilesTueIndexes.add(tileset.firstgid + Number(idTuile));
            }
        });
    });

    const tilesetBrique = map.addTilesetImage('brique', 'img_brique');
    const tilesetLasers = map.addTilesetImage('preview_122', 'img_lasers');

    layer1 = map.createLayer('Calque de Tuiles 1', [tilesetBrique, tilesetLasers], 0, 0);
    layer2 = map.createLayer('Calque de Tuiles 2', [tilesetBrique, tilesetLasers], 0, 0);
    layer1.setCollisionByProperty({ collision: true });
    layer2.setCollisionByProperty({ collision: true });

    this.porte = this.physics.add.staticSprite(1850, 1150, "img_porte_sortie_anim_n4");
    this.porte.setOrigin(0.5, 1);
    this.porte.refreshBody();
    this.porte.setVisible(false);
    this.porte.body.enable = false;

    coffre = this.physics.add.staticSprite(720, 960, "coffre_fermé");
    coffre.ouverte = false;

    cle = this.physics.add.staticSprite(1602, 130, "icons_prev", 9);
    cle.setScale(1.5);

    player = this.physics.add.sprite(160, map.heightInPixels - 180, "img_perso", 5);
    player.setScale(1.5);
    player.setCollideWorldBounds(true);
    player.setBounce(0);
    player.body.setSize(20, 44);
    player.body.setOffset(10, 6);

    this.physics.add.collider(player, layer1);
    this.physics.add.collider(player, layer2);

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
        frames: this.anims.generateFrameNumbers("img_perso", { start: 6, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: "anim_ouvreporte_n4",
        frames: this.anims.generateFrameNumbers("img_porte_sortie_anim_n4", { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: "anim_fermeporte_n4",
        frames: this.anims.generateFrameNumbers("img_porte_sortie_anim_n4", { start: 5, end: 0 }),
        frameRate: 10,
        repeat: 0
    });

    porteSortieVisible = false;
    finNiveau4Declenchee = false;

    player.play("savant2_idle");

    clavier = this.input.keyboard.createCursorKeys();
    this.toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
}

joueurToucheTuileTue(layer) {
    if (!layer) return false;

    const body = player.body;
    const points = [
        { x: body.center.x, y: body.center.y },
        { x: body.center.x, y: body.bottom - 2 },
        { x: body.left + 2, y: body.bottom - 2 },
        { x: body.right - 2, y: body.bottom - 2 },
        { x: body.left + 2, y: body.center.y },
        { x: body.right - 2, y: body.center.y }
    ];

    for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        const tile = layer.getTileAtWorldXY(point.x, point.y, false, this.cameras.main);
        if (!tile) {
            continue;
        }

        const indexNormalise = tile.index & 0x1fffffff;
        const tueParPropriete = tile.properties && tile.properties.tue;
        const tueParIndex = this.tuilesTueIndexes && this.tuilesTueIndexes.has(indexNormalise);

        if (tueParPropriete || tueParIndex) {
            return true;
        }
    }

    return false;
}

mourirEtRespawn() {
    if (gameOver) return;

    gameOver = true;
    player.setVelocity(0, 0);

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

faireApparaitrePorteSortie() {
    if (!this.porte || porteSortieVisible) {
        return;
    }

    this.porte.setVisible(true);
    this.porte.body.enable = true;
    this.porte.refreshBody();
    porteSortieVisible = true;
}

terminerNiveau4() {
    if (finNiveau4Declenchee) {
        return;
    }

    finNiveau4Declenchee = true;
    gameOver = true;
    player.setVelocity(0, 0);
    if (this.cache.audio.exists(SON_PORTE_NIVEAU4)) {
        try {
            this.sound.play(SON_PORTE_NIVEAU4, {
                loop: false,
                volume: 0.7
            });
        } catch (error) {
            console.warn("Niveau4: lecture du son de porte impossible", error);
        }
    }
    this.porte.anims.play("anim_ouvreporte_n4");

    const messageFin = this.add
        .text(this.cameras.main.width * 0.5, this.cameras.main.height * 0.25, "Bravo vous avez fini le niveau 4 !", {
            fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
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
        this.scene.start("Accueil", { messageFinNiveau: "Bravo vous avez fini le niveau 4 !" });
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

    // Vérifier si le joueur prend la potion
    if (potion && this.physics.overlap(player, potion)) {
        // Afficher le message
        potion.destroy();
        potion = null;
        this.registry.set("inventaireNiveau4", ["objet_niveau4_potion"]);
        this.faireApparaitrePorteSortie();
        messagePotion = this.add.text(760, 95, "POTION RÉCUPÉRÉE!", {
            fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
            fontSize: "72px",
            fontStyle: "bold",
            color: "#00ff00",
            stroke: "#4d0000",
            strokeThickness: 8,
        }).setDepth(100);
    }

    // Vérifier si le joueur prend la clé
    if (cle && this.physics.overlap(player, cle)) {
        cle.destroy();
        cle = null;
    }

    if (this.joueurToucheTuileTue(layer1) || this.joueurToucheTuileTue(layer2)) {
        this.mourirEtRespawn();
        return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.toucheE)) {
        if (porteSortieVisible && this.physics.overlap(player, this.porte)) {
            this.terminerNiveau4();
            return;
        }

        if (this.physics.overlap(player, coffre) && !cle) {
            if (!coffre.ouverte) {
                coffre.setTexture("coffre_ouvert");
                coffre.ouverte = true;
                // Créer la potion à côté du coffre
                potion = this.physics.add.staticSprite(coffre.x + 112, coffre.y - 42, "donjonasset", 163);
            }
        }
    }
}
}