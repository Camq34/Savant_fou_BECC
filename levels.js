// Configuration de tous les niveaux

const LEVELS = {
    1: {
        name: "Caverne des Ombres",
        description: "Un simple donjon pour débuter",
        mapWidth: 800,
        mapHeight: 600,
        backgroundColor: "#001a00",
        gridColor: "#003300",
        ennemisInitiaux: 5,
        ennemisVitesse: 2,
        ennemisHp: 30,
        ennemisColor: "#ff0000",
        difficulte: 1,
        nextLevel: 2
    },

    2: {
        name: "Forêt Maudite",
        description: "Les ennemis sont plus nombreux",
        mapWidth: 900,
        mapHeight: 700,
        backgroundColor: "#1a2600",
        gridColor: "#334400",
        ennemisInitiaux: 8,
        ennemisVitesse: 2.2,
        ennemisHp: 35,
        ennemisColor: "#ff3300",
        difficulte: 1.5,
        nextLevel: 3
    },

    3: {
        name: "Temple Oublié",
        description: "Attention, certains ennemis sont rapides",
        mapWidth: 1000,
        mapHeight: 700,
        backgroundColor: "#331a00",
        gridColor: "#664400",
        ennemisInitiaux: 7,
        ennemisVitesse: 2.5,
        ennemisHp: 40,
        ennemisColor: "#cc6600",
        difficulte: 2,
        nextLevel: 4
    },

    4: {
        name: "Crypt Ancienne",
        description: "Les donjons deviennent maléfiques",
        mapWidth: 1000,
        mapHeight: 800,
        backgroundColor: "#1a001a",
        gridColor: "#440044",
        ennemisInitiaux: 10,
        ennemisVitesse: 2.3,
        ennemisHp: 45,
        ennemisColor: "#cc00ff",
        difficulte: 2.5,
        nextLevel: 5
    },

    5: {
        name: "Château Noir",
        description: "Nombreux ennemis et mouvements complexes",
        mapWidth: 1100,
        mapHeight: 800,
        backgroundColor: "#0a0a1a",
        gridColor: "#222244",
        ennemisInitiaux: 12,
        ennemisVitesse: 2.4,
        ennemisHp: 50,
        ennemisColor: "#0088ff",
        difficulte: 3,
        nextLevel: 6
    },

    6: {
        name: "Ciel Étoilé",
        description: "Au-delà du monde connu",
        mapWidth: 1200,
        mapHeight: 800,
        backgroundColor: "#000033",
        gridColor: "#003366",
        ennemisInitiaux: 14,
        ennemisVitesse: 2.6,
        ennemisHp: 55,
        ennemisColor: "#ffff00",
        difficulte: 3.5,
        nextLevel: 7
    },

    7: {
        name: "Abysse - Le Dernier Défi",
        description: "Le boss final vous attend...",
        mapWidth: 1200,
        mapHeight: 900,
        backgroundColor: "#330033",
        gridColor: "#660066",
        ennemisInitiaux: 16,
        ennemisVitesse: 2.8,
        ennemisHp: 60,
        ennemisColor: "#ff0099",
        difficulte: 4,
        isFinalLevel: false,
        nextLevel: 8
    },

    8: {
        name: "Laboratoire du Chaudron",
        description: "Combinez vos ingrédients pour obtenir la Potion de l'Immortalité!",
        mapWidth: 512,
        mapHeight: 384,
        backgroundColor: "#2a0845",
        gridColor: "#550088",
        ennemisInitiaux: 0,
        ennemisVitesse: 0,
        ennemisHp: 0,
        ennemisColor: "#000000",
        difficulte: 0,
        isCraftingLevel: true,
        isFinalLevel: true,
        nextLevel: null
    }
};

// Fonction pour obtenir la config d'un niveau
function getLevelConfig(levelNumber) {
    return LEVELS[levelNumber] || LEVELS[1];
}

// Fonction pour valider le niveau
function isValidLevel(levelNumber) {
    return LEVELS[levelNumber] !== undefined;
}
