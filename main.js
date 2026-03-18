// chargement des librairies
import Accueil from "/scenes/Accueil.js";
import niveau1 from "/scenes/Niveau1.js";
import niveau2 from "/scenes/Niveau2.js";
import niveau3 from "/scenes/Niveau3.js";
import niveau4 from "/scenes/Niveau4.js";
import niveau5 from "/scenes/Niveau5.js";
import niveau6 from "/scenes/Niveau6.js";
import niveau7 from "/scenes/Niveau7.js";

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
