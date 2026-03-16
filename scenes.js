// ========== BOOT SCENE - Charge les assets et config ==========

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init() {
        // Récupérer le numéro de niveau depuis l'URL
        const url = window.location.pathname;
        const match = url.match(/niveau_(\d+)/);
        this.levelNumber = match ? parseInt(match[1]) : 1;
    }

    preload() {
        // Charger les configs
        this.load.script('levels', 'levels.js');
        this.load.script('maps', 'maps.js');
        
        // Loader les assets (sera connecté à assets.js après)
        this.loadAssets();
    }

    loadAssets() {
        // Charger les sprites
        // Pour maintenant, on va utiliser des graphics/placeholders
        // À remplacer une fois que vous avez les assets
        this.textures.generate('player', { data: [0xff000000, 0xff00ff00, 0xff00ff00, 0xff000000], width: 2, height: 2 });
        this.textures.generate('enemy', { data: [0xffff0000, 0xffff0000, 0xffff0000, 0xffff0000], width: 2, height: 2 });
        this.textures.generate('projectile', { data: [0xffffff00, 0xffffff00, 0xffffff00, 0xffffff00], width: 1, height: 1 });
    }

    create() {
        // Passer au jeu principal
        this.scene.start('GameScene', { levelNumber: this.levelNumber });
    }
}
