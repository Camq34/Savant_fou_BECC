const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d', // Fond gris foncé pour éviter le blanc
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

function preload() {
    // 1. On charge les images depuis le dossier 'asset'
    // Assure-toi que les noms de fichiers .png sont exactement ceux-là
    this.load.image('img_laser', 'assets/laser.png');
    this.load.image('img_brique', 'assets/brique.png');
    this.load.image('img_items', 'assets/items.png');

    // 2. On charge la map JSON depuis le dossier 'asset'
    this.load.tilemapTiledJSON('ma_map', 'assets/Map/map_niveau1.tmj');
}

function create() {
    // Création de la map à partir du JSON chargé
    const map = this.make.tilemap({ key: 'ma_map' });

    // 3. Liaison entre le nom dans Tiled et l'image chargée
    // 'laser' et 'brique' doivent être les noms des onglets dans Tiled
    const tilesetLaser = map.addTilesetImage('laser', 'img_laser');
    const tilesetBrique = map.addTilesetImage('brique', 'img_brique');
    const tilesetItems = map.addTilesetImage('tiles_tiny_sample_2', 'img_items');

    // 4. Création du calque (Vérifie bien le nom exact à droite dans Tiled)
    // On met les tilesets dans un tableau [ ] au cas où tu utilises les deux
    const layer = map.createLayer('Calque de Tuiles 1', [tilesetLaser, tilesetBrique], 0, 0);

    console.log(layer)

    // Centrer la caméra
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}