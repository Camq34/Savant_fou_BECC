// ========== CONFIG PHASER ==========

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 800,
    backgroundColor: '#000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'parent'
    },
    render: {
        pixelArt: true,
        antialias: false
    }
};

const game = new Phaser.Game(config);
