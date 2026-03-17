import Accueil from './scenes/Accueil.js';
import Niveau1 from './scenes/Niveau1.js';
import Niveau2 from './scenes/Niveau2.js';
import Niveau3 from './scenes/Niveau3.js';
import Niveau4 from './scenes/Niveau4.js';
import Niveau5 from './scenes/Niveau5.js';
import Niveau6 from './scenes/Niveau6.js';
import Niveau7 from './scenes/Niveau7.js';


export default {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }
        }
    },
    scene: [
        Accueil,
        Niveau1,
        Niveau2,
        Niveau3,
        Niveau4,
        Niveau5,
        Niveau6,
        Niveau7
    ]
};