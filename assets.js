// ========== GESTION DES ASSETS ==========
// Référence centrale pour tous les sprites

class AssetManager {
    constructor() {
        this.images = {};
        this.sprites = {}; // Pour les animations
        this.isReady = false;
    }

    // Charger une image
    loadImage(name, path) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                console.log(`✓ Chargé: ${name}`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`⚠ Impossible de charger: ${name} (${path})`);
                resolve(null);
            };
            img.src = path;
        });
    }

    // Ajouter une animation (spritesheet)
    addAnimation(name, imageName, frameWidth, frameHeight, frames, speed = 100) {
        if (!this.images[imageName]) {
            console.warn(`Image ${imageName} non trouvée pour l'animation ${name}`);
            return;
        }
        
        this.sprites[name] = {
            image: this.images[imageName],
            frameWidth,
            frameHeight,
            frames,
            speed,
            currentFrame: 0,
            elapsed: 0
        };
    }

    // Charger tous les assets (à adapter avec vos chemins)
    async loadAllAssets() {
        console.log('📦 Chargement des assets...');

        // CHARGER VOS IMAGES ICI
        // await this.loadImage('tiles', 'asset/tileset.png');
        // await this.loadImage('player', 'asset/player.png');
        // await this.loadImage('enemies', 'asset/enemies.png');
        // await this.loadImage('ui', 'asset/ui.png');

        // AJOUTER VOS ANIMATIONS ICI
        // this.addAnimation('player_idle', 'player', 32, 32, 4, 150);
        // this.addAnimation('player_walk', 'player', 32, 32, 8, 100);
        // this.addAnimation('enemy_walk', 'enemies', 32, 32, 4, 150);

        console.log('✓ Assets initialisés');
        this.isReady = true;
    }

    // Obtenir une image
    getImage(name) {
        return this.images[name] || null;
    }

    // Obtenir un sprite/animation
    getSprite(name) {
        return this.sprites[name] || null;
    }

    // Dessiner un tile
    drawTile(ctx, tileType, x, y, tileSize) {
        // Code fallback si pas d'asset - elle dessine des carrés colorés
        const colors = {
            0: '#000000',      // EMPTY
            1: '#4a4a4a',      // WALL
            2: '#8b7355',      // FLOOR
            3: '#ff6600',      // DOOR
            4: '#ff0000',      // LAVA
            5: '#0066ff',      // WATER
            6: '#ffaa00',      // SPIKE
            7: '#ffdd00'       // CHEST
        };

        ctx.fillStyle = colors[tileType] || '#000';
        ctx.fillRect(x, y, tileSize, tileSize);
        
        // Bordure
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileSize, tileSize);
    }

    // Dessiner une animation
    updateAnimation(name, delta) {
        const sprite = this.sprites[name];
        if (!sprite) return;

        sprite.elapsed += delta;
        if (sprite.elapsed >= sprite.speed) {
            sprite.currentFrame = (sprite.currentFrame + 1) % sprite.frames;
            sprite.elapsed = 0;
        }
    }

    // Obtenir le frame actuel d'une animation
    getAnimationFrame(name) {
        const sprite = this.sprites[name];
        return sprite ? sprite.currentFrame : 0;
    }

    // Dessiner un sprite animé
    drawAnimatedSprite(ctx, name, x, y) {
        const sprite = this.sprites[name];
        if (!sprite || !sprite.image) return;

        const frame = sprite.currentFrame;
        ctx.drawImage(
            sprite.image,
            frame * sprite.frameWidth, 0,
            sprite.frameWidth, sprite.frameHeight,
            x, y,
            sprite.frameWidth, sprite.frameHeight
        );
    }

    // Dessiner un sprite simple (pas d'animation)
    drawSprite(ctx, imageName, x, y, width = 32, height = 32) {
        const img = this.images[imageName];
        if (!img) return;
        
        ctx.drawImage(img, x, y, width, height);
    }
}

// Instance globale
const assetManager = new AssetManager();
