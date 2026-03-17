// ========== CONFIGURATION PHASER ==========
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'gameContainer',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'parent'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [Accueil, Niveau1, Niveau3],
    render: {
        pixelArt: true,
        antialias: false
    }
};

console.log('🎮 Démarrage du jeu Savant Fou...');
const game = new Phaser.Game(config);
console.log('✅ Phaser Game initialisé!');