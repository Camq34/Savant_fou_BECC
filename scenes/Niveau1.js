<<<<<<< HEAD
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000', // Fond gris foncé pour éviter le blanc
    scene: {
        preload: preload,
        create: create
=======
class Niveau1 extends Phaser.Scene {
    constructor() {
        super('Niveau1');
>>>>>>> 41bbb98f1d72e3d6e9cfee76d787bc7b6ab65335
    }

    preload() {
        console.log('📦 Chargement Niveau 1...');
    }

<<<<<<< HEAD
function preload() {
    // 1. On charge les images depuis le dossier 'asset'
    // Assure-toi que les noms de fichiers .png sont exactement ceux-là
    this.load.image('img_lasers', 'assets/lasers.png');
    this.load.image('img_items', 'assets/items.png');

    // 2. On charge la map JSON depuis le dossier 'asset'
    this.load.tilemapTiledJSON('ma_map', 'assets/Map/map_niveau1.tmj');
}

function create() {
    // Création de la map à partir du JSON chargé
    const map = this.make.tilemap({ key: 'ma_map' });

    // 3. Liaison entre le nom dans Tiled et l'image chargée
    // 'laser' et 'brique' doivent être les noms des onglets dans Tiled
    const tilesetLasers = map.addTilesetImage('lasers', 'img_lasers');
    const tilesetItems = map.addTilesetImage('tiles_tiny_sample_2', 'img_items');

    // 4. Création du calque (Vérifie bien le nom exact à droite dans Tiled)
    // On met les tilesets dans un tableau [ ] au cas où tu utilises les deux
    const layer = map.createLayer('Calque de Tuiles 1', [tilesetLasers, tilesetItems], 0, 0);

    console.log(layer)

    // Centrer la caméra
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // Zoom arrière pour voir si la map est cachée quelque part

    // Force la caméra à aller au centre de la map
    this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);

    this.cameras.main.setZoom(0.415); // On dézoome un peu
=======
    create() {
        console.log('✅ Niveau 1 créé (À implémenter)');
        this.add.text(400, 300, 'Niveau 1 - À implémenter', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
    }
>>>>>>> 41bbb98f1d72e3d6e9cfee76d787bc7b6ab65335
}