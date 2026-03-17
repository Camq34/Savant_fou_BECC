class Niveau3 extends Phaser.Scene {
    constructor() {
        super('Niveau3');
    }

    preload() {
        console.log('📦 Chargement Niveau 3...');
    }

    create() {
        console.log('✅ Niveau 3 créé (À implémenter)');
        this.add.text(400, 300, 'Niveau 3 - À implémenter', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
    }
}
