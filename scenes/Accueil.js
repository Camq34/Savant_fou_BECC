export default class Accueil extends Phaser.Scene {
    constructor() {
        super('Accueil');
    }

    create() {
        this.add.text(300, 200, 'Mon Jeu', { fontSize: '32px', fill: '#fff' });

        const bouton = this.add.text(300, 300, 'Jouer', { fill: '#0f0' })
            .setInteractive();

        bouton.on('pointerdown', () => {
            this.scene.start('Niveau1');
        });
    }
}