// chargement des librairies
import selection from "/scenes/selection.js";
import niveau1 from "/scenes/niveau1.js";
import niveau2 from "/scenes/niveau2.js";
import niveau3 from "/scenes/niveau3.js";
import niveau4 from "/scenes/niveau4.js";
import niveau5 from "/scenes/niveau5.js";
import niveau6 from "/scenes/niveau6.js";
import niveau7 from "/scenes/niveau7.js";

// configuration générale du jeu
var config = {
  type: Phaser.AUTO,
  width: 1920, // largeur en pixels
  height: 1280, // hauteur en pixels
   
  physics: {
    // définition des parametres physiques
    default: "arcade", // mode arcade : le plus simple : des rectangles pour gérer les collisions. Pas de pentes
    arcade: {
      // parametres du mode arcade
      gravity: {
        y: 300 // gravité verticale : acceleration ddes corps en pixels par seconde
      },
      debug: true // permet de voir les hitbox et les vecteurs d'acceleration quand mis à true
    }
  },
  scene: [selection, niveau1, niveau2, niveau3, niveau4, niveau5, niveau6, niveau7] // liste des scènes du jeu
};

// création et lancement du jeu
var game = new Phaser.Game(config);
game.scene.start("Accueil"); // lancement de la scène d'accueil");
