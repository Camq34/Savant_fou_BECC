# 🎮 Guide d'intégration des ASSETS et MAPS

## 📁 Structure des fichiers

Vous devez créer des assets dans le dossier `asset/`:

```
asset/
├── tileset.png          # Spritesheet avec tous les tiles
├── player.png           # Spritesheet du joueur (animations)
├── enemies.png          # Spritesheet des ennemis (animations)
└── ui.png               # Elements UI (facultatif)
```

---

## 🎨 1. CHARGER VOS ASSETS

Ouvrez **`assets.js`** et décommentez/modifiez les lignes de chargement :

```javascript
async loadAllAssets() {
    // CHARGER VOS IMAGES ICI
    await this.loadImage('tiles', 'asset/tileset.png');
    await this.loadImage('player', 'asset/player.png');
    await this.loadImage('enemies', 'asset/enemies.png');

    // AJOUTER VOS ANIMATIONS ICI (nom, image source, largeur, hauteur, nb frames, vitesse)
    this.addAnimation('player_idle', 'player', 32, 32, 4, 150);
    this.addAnimation('player_walk_up', 'player', 32, 32, 8, 100);
    this.addAnimation('player_walk_down', 'player', 32, 32, 8, 100);
    this.addAnimation('player_walk_left', 'player', 32, 32, 8, 100);
    this.addAnimation('player_walk_right', 'player', 32, 32, 8, 100);
    
    this.addAnimation('enemy_walk', 'enemies', 32, 32, 4, 150);

    this.isReady = true;
}
```

**Important**: Les tailles doivent correspondre à vos sprites!

---

## 🗺️ 2. CRÉER VOS MAPS

Ouvrez **`maps.js`** et remplissez les données de chaque niveau.

### Types de tiles (indices):
- `0` = EMPTY (transparent)
- `1` = WALL (mur - bloquant)
- `2` = FLOOR (sol normal)
- `3` = DOOR (porte)
- `4` = LAVA (lave - bloquant)
- `5` = WATER (eau - bloquant)
- `6` = SPIKE (épines - bloquant)
- `7` = CHEST (coffre)

### Exemple pour le Niveau 1:

```javascript
1: {
    name: "Caverne des Ombres",
    width: 20,      // 20 tiles de large
    height: 15,     // 15 tiles de haut
    tileSize: 32,   // Chaque tile fait 32x32 pixels
    data: [
        // Remplir ligne par ligne (20 tiles par ligne)
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,  // Ligne 1 (murs)
        1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,  // Ligne 2 (murs + sol)
        1,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,  // Ligne 3
        // ... continuer pour tous les tiles
    ],
    spawn: { x: 5, y: 5 },      // Position de spawn du joueur (en tiles)
    ennemis: [],                 // À remplir avec positions des ennemis
    objets: []                   // À remplir avec les objets collectibles
}
```

### Alternative: Données générées (simple)

Si vous préférez, générez facilement une map:

```javascript
data: Array(20 * 15).fill(2).map((_, i) => {
    const row = Math.floor(i / 20);
    const col = i % 20;
    // Bordures en murs
    if (row === 0 || row === 14 || col === 0 || col === 19) return 1;
    // Sol partout ailleurs
    return 2;
})
```

---

## 🎭 3. PERSONNALISER LE TILESET

### Comment organiser votre spritesheet `tileset.png`:

Le code suppose que les tiles sont numérotés dans le spritesheet:
- Frame 0 = EMPTY
- Frame 1 = WALL
- Frame 2 = FLOOR
- Frame 3 = DOOR
- Frame 4 = LAVA
- Frame 5 = WATER
- Frame 6 = SPIKE
- Frame 7 = CHEST

Pour que cela fonctionne, arrangez vos tiles en rangée horizontale!

---

## 👤 4. ANIMATIONS DU JOUEUR

Les animations doivent être en **rangées horizontales** dans votre spritesheet.

Exemple: `player.png` avec animations du joueur
- Ligne 1: Idle (4 frames)
- Ligne 2: Walk Up (8 frames)
- Ligne 3: Walk Down (8 frames)
- Ligne 4: Walk Left (8 frames)
- Ligne 5: Walk Right (8 frames)

Puis charger comme:
```javascript
this.addAnimation('player_idle', 'player', 32, 32, 4, 150);
this.addAnimation('player_walk_up', 'player', 32, 32, 8, 100);
// etc...
```

---

## 🔧 5. RÉSOUDRE LES PROBLÈMES

### Les assets ne se chargent pas?
- Vérifiez les chemins: `'asset/tileset.png'`
- Vérifiez la console navigateur (F12) pour les erreurs

### Les tiles ne s'affichent pas?
- Le code a un **fallback**: affiche des carrés colorés si pas d'image
- Vous verrez aussi "⚠ Impossible de charger" dans la console

### Les animations ne bougent pas?
- Vérifiez le nombre de frames
- Vérifiez la taille (largeur/hauteur) de chaque frame

---

## 🚀 ÉTAPES RAPIDES

1. ✅ **Créer** `asset/tileset.png`, `asset/player.png`, `asset/enemies.png`
2. ✅ **Décommenter** et adapter les chemins dans `assets.js`
3. ✅ **Remplir** les maps dans `maps.js`
4. ✅ **Tester** en ouvrant `index.html` ou directement `niveau_1.html`
5. ✅ **Déboguer** avec F12 si besoin

---

## 📞 TIPS BONUS

- La résolution canvas est **fixe** 800x600 - parfait pour une vue fixe!
- La caméra suit le joueur et se limite aux frontières de la map
- Les collisions tiles se font automatiquement
- Le code supporte 7 niveaux avec thèmes différents

Bon courage! 🎮✨
