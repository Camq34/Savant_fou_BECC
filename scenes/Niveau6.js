import Phaser from 'phaser';

export default class Niveau6 extends Phaser.Scene {
    constructor() {
        super('Niveau6');
    }

    preload() {
        this.load.tilemapTiledJSON('map6', 'assets/maps/map_niveau6.json');
        this.load.image('screenshot_6', 'assets/tilesets/screenshot_6.png');
        this.load.image('tuilesJeu', 'assets/tilesets/tuilesJeu.png');
        this.load.image('player', 'assets/player/player.png');
        this.load.spritesheet('porte_anim', 'assets/tilesets/porte_blanche.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const map = this.make.tilemap({ key: 'map6' });
        const tileset1 = map.addTilesetImage('screenshot_6', 'screenshot_6');
        const tileset2 = map.addTilesetImage('tuilesJeu', 'tuilesJeu');

        const sol = map.createLayer('Sol', [tileset1, tileset2]);
        const decor = map.createLayer('Decor', [tileset1, tileset2]);
        sol.setCollisionByExclusion([-1]);

        this.anims.create({
            key: 'animation_porte',
            frames: this.anims.generateFrameNumbers('porte_anim', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        // --- POSITION DE DÉPART (En bas à gauche) ---
        // Tu peux aussi définir ce point dans Tiled
        this.player = this.physics.add.sprite(50, 1150, 'player'); 
        this.physics.add.collider(this.player, sol);

        // --- GESTION DES PORTES ---
        const objetsPortes = map.getObjectLayer('calque_portes').objects;
        this.portes = this.physics.add.staticGroup();

        objetsPortes.forEach(obj => {
            let porte = this.portes.create(obj.x, obj.y, 'porte_anim').setOrigin(0);
            porte.play('animation_porte');
            porte.destination = obj.name; // Le nom qu'on a mis dans Tiled
            porte.body.setSize(obj.width, obj.height);
            porte.refreshBody();
        });

        // --- LOGIQUE DE TÉLÉPORTATION ---
        this.physics.add.overlap(this.player, this.portes, (player, porte) => {
            if (porte.destination === 'CasierHautGauche') {
                // Téléportation interne au casier (coordonnées à ajuster selon ta map)
                // Idéalement, on cherche l'objet 'CasierHautGauche' dans le calque de points
                this.teleporterJoueur(100, 100); 
            } else if (porte.destination) {
                // Changement de niveau classique
                this.scene.start(porte.destination);
            }
        });

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    teleporterJoueur(x, y) {
        // Petite astuce pour éviter que la physique ne s'affole pendant le TP
        this.player.setPosition(x, y);
        this.player.body.setVelocity(0, 0);
    }

    update() {
        const speed = 200;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        this.player.body.velocity.normalize().scale(speed);
    }
}