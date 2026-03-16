// ========== CONFIGURATION DES MAPS ==========
// Structure: chaque tile est un numéro d'index dans le spritesheet
// 0 = vide/transparent
// Vous pouvez ajouter vos maps ici

const MAPS = {
    1: {
        name: "Caverne des Ombres",
        width: 60,
        height: 40,
        tileSize: 32,
        data: [],
        spawn: { x: 30, y: 20 },
        ennemis: [],
        objets: [],
        items: []
    },

    2: {
        name: "Forêt Maudite",
        width: 60,
        height: 40,
        tileSize: 32,
        data: [],
        spawn: { x: 30, y: 20 },
        ennemis: [],
        objets: [],
        items: []
    },

    3: {
        name: "Temple Oublié",
        width: 60,
        height: 40,
        tileSize: 32,
        data: [],
        spawn: { x: 30, y: 20 },
        ennemis: [],
        objets: [],
        items: []
    },

    4: {
        name: "Crypt Ancienne",
        width: 60,
        height: 40,
        tileSize: 32,
        data: [],
        spawn: { x: 30, y: 20 },
        ennemis: [],
        objets: [],
        items: []
    },

    5: {
        name: "Château Noir",
        width: 60,
        height: 40,
        tileSize: 32,
        data: [],
        spawn: { x: 30, y: 20 },
        ennemis: [],
        objets: [],
        items: []
    },

    6: {
        name: "Ciel Étoilé",
        width: 60,
        height: 40,
        tileSize: 32,
        data: [],
        spawn: { x: 30, y: 20 },
        ennemis: [],
        objets: [],
        items: []
    },

    7: {
        name: "Abysse - Le Dernier Défi",
        width: 60,
        height: 40,
        tileSize: 32,
        data: [],
        spawn: { x: 30, y: 20 },
        ennemis: [],
        objets: [],
        items: []
    },

    8: {
        name: "Laboratoire du Chaudron",
        width: 60,
        height: 40,
        tileSize: 32,
        data: [],
        spawn: { x: 30, y: 20 },
        ennemis: [],
        objets: [],
        items: [],
        chauldron: { x: 30, y: 20 }
    }
};

// Types de tiles
const TILE_TYPES = {
    EMPTY: 0,
    WALL: 1,
    FLOOR: 2,
    DOOR: 3,
    LAVA: 4,
    WATER: 5,
    SPIKE: 6,
    CHEST: 7
};

// Tiles qui bloquent le joueur
const SOLID_TILES = [TILE_TYPES.WALL, TILE_TYPES.SPIKE, TILE_TYPES.LAVA, TILE_TYPES.WATER];

function getMapConfig(levelNumber) {
    return MAPS[levelNumber] || MAPS[1];
}

function isChauldronLevel(levelNumber) {
    return levelNumber === 8;
}

function isSolidTile(tileType) {
    return SOLID_TILES.includes(tileType);
}
