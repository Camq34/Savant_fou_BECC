const config = {
    type: Phaser.AUTO,
    width: 1200, // Augmenté pour être sûr de voir la map
    height: 800,
    backgroundColor: '#222222', // Fond gris foncé pour ne pas voir du blanc pur
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

function preload() {
    // On ajoute 'asset/' pour dire au code d'entrer dans le dossier
    this.load.image('img_laser', 'asset/laser.png');
    this.load.image('img_brique', 'asset/brique.png');
    
    // Pareil pour la map
    this.load.tilemapTiledJSON('ma_map', 'asset/map_niveau1.tmj');
}

function create() {
    const map = this.make.tilemap({ key: 'ma_map' });

    // LIAISON AVEC LES TILESETS (Le 1er nom doit être le nom de l'onglet dans Tiled)
    const tilesetLaser = map.addTilesetImage('laser', 'img_laser');
    const tilesetBrique = map.addTilesetImage('brique', 'img_brique');
    const tilesetSample = map.addTilesetImage('tiles_tiny_sample_2', 'img_sample');

    // CRÉATION DU CALQUE (Le nom exact à droite dans Tiled)
    // On met tous les tilesets dans un tableau [ ] pour qu'il trouve tout
    const calque = map.createLayer('Calque de Tuiles 1', [tilesetLaser, tilesetBrique, tilesetSample], 0, 0);

    if (!calque) {
        console.error("Le calque n'a pas été trouvé. Vérifiez le nom 'Calque de Tuiles 1'");
    }

    // Zoomer un peu pour bien voir
    this.cameras.main.setZoom(1.5);
}