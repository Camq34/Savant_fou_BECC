# 🎮 SAVANT FOU - Architecture Tile-Based

## 📋 Fichiers du Projet

### Core Game Files
- **`game.js`** - Moteur de jeu principal (Camera, Collisions, Entités)
- **`assets.js`** - Gestionnaire d'assets et sprites
- **`maps.js`** - Configuration des Maps (Tiledata)
- **`levels.js`** - Configuration des Niveaux (Difficulté, Paramètres)

### HTML Pages
- **`index.html`** - Menu principal
- **`niveau_1.html` à `niveau_7.html`** - Pages des niveaux

### Documentation
- **`GUIDE_ASSETS.md`** - Comment ajouter vos assets
- **`README.md`** - Ce fichier

---

## 🎯 Étapes pour Préparer le Jeu

### 1️⃣ **Préparer vos Assets**
Créez dans le dossier `asset/`:
- `tileset.png` - Tous les tiles (murs, sol, portes, etc.)
- `player.png` - Animations du joueur
- `enemies.png` - Animations des ennemis

### 2️⃣ **Charger les Assets**
Ouvrez `assets.js` et décommentez:
```javascript
await this.loadImage('tiles', 'asset/tileset.png');
await this.loadImage('player', 'asset/player.png');
await this.loadImage('enemies', 'asset/enemies.png');
```

### 3️⃣ **Créer les Maps**
Ouvrez `maps.js` et remplissez `data:` pour chaque niveau:
```javascript
data: [1,1,1,...,1,2,2,...]  // Array de nombres (indices des tiles)
```

### 4️⃣ **Tester**
Ouvrez `index.html` et lancez un niveau!

---

## 🎨 Système de Tiles

### Types de Tiles (Constants)
```javascript
0 = EMPTY      (transparent)
1 = WALL       (bloquant)
2 = FLOOR      (normal)
3 = DOOR       (porte)
4 = LAVA       (bloquant)
5 = WATER      (bloquant)
6 = SPIKE      (bloquant)
7 = CHEST      (coffre)
```

### Collision
Les tiles **bloquants** (1, 4, 5, 6) empêchent le joueur et les ennemis de passer.

---

## 📐 Système de Caméra

La caméra:
- ✅ Suit le joueur au centre de l'écran
- ✅ Se limite aux frontières de la map
- ✅ Résolution fixe: **800x600**

---

## 🎭 Format des Animations

Chaque animation = rangée horizontale de sprites identiques

Exemple (`player.png`):
```
[Idle]      : 4 frames de 32x32
[Walk Up]   : 8 frames de 32x32
[Walk Down] : 8 frames de 32x32
[Walk Left] : 8 frames de 32x32
[Walk Right]: 8 frames de 32x32
```

Puis charger:
```javascript
this.addAnimation('player_idle', 'player', 32, 32, 4, 150);
this.addAnimation('player_walk_up', 'player', 32, 32, 8, 100);
```

---

## 🎮 Contrôles

- **Flèches/WASD** - Déplacement
- **Clic Souris** - Tirer vers la souris
- **ESPACE** - Tirer aléatoire
- **N** - Niveau suivant (après victoire)
- **M** - Menu principal
- **R** - Recommencer le niveau

---

## 🔧 Personnaliser les Niveaux

### Spawn Point
Dans `maps.js`:
```javascript
spawn: { x: 5, y: 5 }  // Position en tiles
```

### Spawn Ennemis
RemodelTo be customized in the Jeu class (genererEnnemis)

### Taille de la Map
```javascript
width: 20,      // tiles de largeur
height: 15,     // tiles de hauteur
tileSize: 32    // pixels par tile
```

---

## 📊 Paramètres de Difficulté

Chaque niveau dans `levels.js`:
```javascript
ennemisInitiaux: 5,        // Nombre d'ennemis au départ
ennemisVitesse: 2,         // Vitesse des ennemis
ennemisHp: 30,             // HP des ennemis
ennemisColor: '#ff0000',   // Couleur
difficulte: 1              // Multiplicateur visuel
```

---

## 🐛 Dépannage

**Q: Les sprites ne s'affichent pas?**
A: Le code affiche des fallback (carrés colorés). Vérifiez les chemins dans `assets.js`

**Q: Erreur 404 pour les assets?**
A: Créez le dossier `asset/` et mettez vos images dedans

**Q: La collision ne fonctionne pas?**
A: Vérifiez que vous remplissez `data` avec les bons indices (1 pour murs)

**Q: Comment ajouter des objets collectibles?**
A: À implémenter - voir `maps.js` champs `objets: []`

---

## 🚀 Prochaines Étapes

1. ✅ Créer vos TileSets (Aseprite, Piskel, etc.)
2. ✅ Importer les Spritesheet
3. ✅ Créer vos Maps (outils: Tiled, LDtk)
4. ✅ Exporter les maps en array
5. ✅ Tester chaque niveau

---

## 💡 Tips

- Utilisez des tools comme **Tiled** ou **LDtk** pour faire les maps, puis exportez en array
- Canvas **pixelated** activé pour un bon rendu pixel-art
- Chaque niveau a sa propre page HTML pour plus de flexibilité
- Le fallback graphique vous permet de tester sans assets immédiatement

Bon développement! 🎮✨
