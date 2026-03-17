import Phaser from 'phaser';

export default class Niveau6 extends Phaser.Scene {
    constructor() {
        super('Niveau6');
    }

    preload() {
        // ⚠️ IMPORTANT : exporte ta map en JSON depuis Tiled !
        this.load.tilemapTiledJSON('map6', 'assets/maps/map_niveau6.json');

        // Tes tilesets (noms EXACTS de Tiled)
        this.load.image('screenshot_6', 'assets/tilesets/screenshot_6.png');
        this.load.image('tuilesJeu', 'assets/tilesets/tuilesJeu.png');

        // Player (à adapter si besoin)
        this.load.image('player', 'assets/player/player.png');
    }

    create() {
        // Création de la map
        const map = this.make.tilemap({ key: 'map6' });

        // Associer les tilesets (nom dans Tiled + clé preload)
        const tileset1 = map.addTilesetImage('screenshot_6', 'screenshot_6');
        const tileset2 = map.addTilesetImage('tuilesJeu', 'tuilesJeu');

        // Créer les layers (mets EXACTEMENT les noms de Tiled)
        const sol = map.createLayer('Sol', [tileset1, tileset2]);
        const decor = map.createLayer('Decor', [tileset1, tileset2]);

        // Collision
        sol.setCollisionByExclusion([-1]);

        // Player
        this.player = this.physics.add.sprite(100, 100, 'player');

        // Collision player ↔ map
        this.physics.add.collider(this.player, sol);

        // Caméra
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        const speed = 160;

        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
    }
}