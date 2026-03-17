class Niveau1 extends Phaser.Scene {
    constructor() {
        super('Niveau1');
    }

    preload() {
        console.log('📦 Chargement Niveau 1...');
    }

    create() {
        console.log('✅ Niveau 1 créé (À implémenter)');
        this.add.text(400, 300, 'Niveau 1 - À implémenter', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
    }
}