const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 1200,
    backgroundColor: '#2d2d2d',
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('img_laser', 'assets/laser.png');
    this.load.image('img_coffre_ferme', 'assets/coffre_fermé.png');
    this.load.image('img_porte_orange', 'assets/porteORANGE999.png');
    this.load.image('img_porte_sortie', 'assets/porte_sortie.png');
    this.load.image('img_screenshot_6', 'assets/screenshot_6.png');
    this.load.image('tuilesJeu', 'assets/tuilesjeu.png');

    this.load.tilemapTiledJSON('ma_map', 'assets/Map/map_niveau6.tmj');
}

function create() {
    const map = this.make.tilemap({ key: 'ma_map' });

    // 🔹 Déclaration des tilesets
    const tilesetLaser = map.addTilesetImage('laser', 'img_laser');
    const tilesetCoffre = map.addTilesetImage('brique', 'img_coffre_ferme');
    const tilesetPorteOrange = map.addTilesetImage('tiles_tiny_sample_2', 'img_porte_orange');
    const tilesetPorteSortie = map.addTilesetImage('porte_sortie', 'img_porte_sortie');
    const tilesetScreenshot = map.addTilesetImage('screenshot_6', 'img_screenshot_6');
    const tilesetTuilesJeu = map.addTilesetImage('tuilesJeu', 'tuilesJeu');

    // 🔹 Création des calques
    // Calque des portes et objets interactifs
    const calquePorte = map.createLayer('calque_porte', [
        tilesetLaser,
        tilesetCoffre,
        tilesetPorteOrange,
        tilesetPorteSortie,
        tilesetTuilesJeu
    ], 0, 0);

    // Calque de décor / sol
    const calqueTuiles = map.createLayer('Calque de Tuiles 1', [
        tilesetTuilesJeu,
        tilesetScreenshot
    ], 0, 0);

    console.log('Calques créés :', calquePorte, calqueTuiles);

    // 🔹 Centrage de la caméra
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}