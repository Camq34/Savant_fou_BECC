// ========== CONFIG ==========
function getLevelNumberFromURL() {
    const url = window.location.pathname;
    const match = url.match(/niveau_(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

const LEVEL_NUMBER = getLevelNumberFromURL();
const LEVEL_CONFIG = getLevelConfig(LEVEL_NUMBER);
const MAP_CONFIG = getMapConfig(LEVEL_NUMBER);

const CANVAS = document.getElementById('gameCanvas');
// Variables globales pour les dimensions du canvas (recalculées dynamiquement)
let CANVAS_WIDTH = CANVAS.width || 1280;
let CANVAS_HEIGHT = CANVAS.height || 800;

// Fonction pour recalculer les dimensions du canvas
function updateCanvasDimensions() {
    CANVAS_WIDTH = CANVAS.width;
    CANVAS_HEIGHT = CANVAS.height;
}

const CTX = CANVAS.getContext('2d');

const TILE_SIZE = MAP_CONFIG.tileSize;
const MAP_WIDTH = MAP_CONFIG.width;
const MAP_HEIGHT = MAP_CONFIG.height;


// ========== CLASSES =========

class Camera {
    constructor(canvasWidth, canvasHeight, mapWidth, mapHeight, tileSize) {
        this.x = 0;
        this.y = 0;
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.mapWidth = mapWidth * tileSize;
        this.mapHeight = mapHeight * tileSize;
        this.tileSize = tileSize;
    }

    update(targetX, targetY) {
        this.x = targetX - this.width / 2;
        this.y = targetY - this.height / 2;
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.width > this.mapWidth) this.x = this.mapWidth - this.width;
        if (this.y + this.height > this.mapHeight) this.y = this.mapHeight - this.height;
    }

    worldToScreen(worldX, worldY) {
        return { x: worldX - this.x, y: worldY - this.y };
    }

    screenToWorld(screenX, screenY) {
        return { x: screenX + this.x, y: screenY + this.y };
    }
}

class CollisionManager {
    constructor(mapData, mapWidth, mapHeight, tileSize) {
        this.mapData = mapData;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileSize = tileSize;
    }

    getTile(tileX, tileY) {
        if (tileX < 0 || tileY < 0 || tileX >= this.mapWidth || tileY >= this.mapHeight) {
            return TILE_TYPES.WALL;
        }
        const index = tileY * this.mapWidth + tileX;
        return this.mapData[index] || TILE_TYPES.EMPTY;
    }

    isWalkable(worldX, worldY, width, height) {
        const corners = [
            { x: worldX, y: worldY },
            { x: worldX + width, y: worldY },
            { x: worldX, y: worldY + height },
            { x: worldX + width, y: worldY + height }
        ];
        for (let corner of corners) {
            const tileX = Math.floor(corner.x / this.tileSize);
            const tileY = Math.floor(corner.y / this.tileSize);
            const tile = this.getTile(tileX, tileY);
            if (isSolidTile(tile)) return false;
        }
        return true;
    }

    checkCollision(entity, newX, newY) {
        return this.isWalkable(newX, newY, entity.width, entity.height);
    }
}

// Classe de l'entité générique
class Entite {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.animation = '';
    }

    update(delta) {
        if (assetManager.sprites[this.animation]) {
            assetManager.updateAnimation(this.animation, delta);
        }
    }

    draw(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        if (this.animation && assetManager.sprites[this.animation]) {
            assetManager.drawAnimatedSprite(ctx, this.animation, screenPos.x, screenPos.y);
        } else {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        }
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    collisionAvec(autre) {
        const a = this.getBounds();
        const b = autre.getBounds();
        return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    }
}

// Classe pour les items collectibles
class Item {
    constructor(x, y, type, name = 'Ingredient') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.name = name;
        this.collected = false;
    }

    draw(ctx, camera) {
        if (this.collected) return;
        const screenPos = camera.worldToScreen(this.x, this.y);
        const colors = {
            'potion': '#ff00ff',
            'ecaille': '#00ffff',
            'cristal': '#ffff00',
            'herbe': '#00ff00',
            'sang': '#ff0000',
            'cendre': '#808080',
            'plume': '#ffffff'
        };
        ctx.fillStyle = colors[this.type] || '#cccccc';
        ctx.fillRect(screenPos.x - 6, screenPos.y - 6, 12, 12);
        ctx.strokeStyle = colors[this.type] || '#cccccc';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

class Joueur extends Entite {
    constructor(x, y) {
        super(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 28, 32);
        this.hp = 100;
        this.hp_max = 100;
        this.exp = 0;
        this.score = 0;
        this.speed = 3;
        this.animation = 'player_idle';
        this.inventaire = {};
    }

    ajouterItem(type, name) {
        if (!this.inventaire[type]) {
            this.inventaire[type] = 0;
        }
        this.inventaire[type]++;
        console.log(`✓ Item collecté: ${name} (Total: ${this.inventaire[type]})`);
    }

    obtenirItems() {
        return Object.entries(this.inventaire).map(([type, count]) => ({ type, count }));
    }

    sauvegarderInventaire() {
        localStorage.setItem('playerInventaire', JSON.stringify(this.inventaire));
    }

    update(keys, collision, delta) {
        super.update(delta);
        let newX = this.x;
        let newY = this.y;
        let isMoving = false;

        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            newY -= this.speed;
            isMoving = true;
            this.animation = 'player_walk_up';
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            newY += this.speed;
            isMoving = true;
            this.animation = 'player_walk_down';
        }
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            newX -= this.speed;
            isMoving = true;
            this.animation = 'player_walk_left';
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            newX += this.speed;
            isMoving = true;
            this.animation = 'player_walk_right';
        }

        if (!isMoving) {
            this.animation = 'player_idle';
        }

        if (collision.checkCollision(this, newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    draw(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        if (assetManager.sprites[this.animation]) {
            assetManager.drawAnimatedSprite(ctx, this.animation, screenPos.x, screenPos.y);
        } else {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenPos.x, screenPos.y - 8, this.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(screenPos.x, screenPos.y - 8, (this.hp / this.hp_max) * this.width, 4);
        }
    }
}

class Projectile extends Entite {
    constructor(x, y, vx, vy) {
        super(x, y, 16, 16);
        this.vx = vx;
        this.vy = vy;
        this.speed = 6;
    }

    update(delta, collision) {
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;
    }

    estHorsMap() {
        return this.x < 0 || this.x > MAP_WIDTH * TILE_SIZE ||
            this.y < 0 || this.y > MAP_HEIGHT * TILE_SIZE;
    }

    draw(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
    }
}

class Ennemi extends Entite {
    constructor(x, y, config = {}) {
        super(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 28, 32);
        this.hp = config.hp || 30;
        this.hp_max = this.hp;
        this.speed = config.vitesse || 2;
        this.updateCounter = 0;
        this.direction = Math.random() * Math.PI * 2;
        this.color = config.color || '#ff0000';
        this.animation = 'enemy_walk';
    }

    update(joueur, delta, collision) {
        super.update(delta);
        this.updateCounter++;
        if (this.updateCounter > 60) {
            this.direction = Math.random() * Math.PI * 2;
            this.updateCounter = 0;
        }

        const newX = this.x + Math.cos(this.direction) * this.speed;
        const newY = this.y + Math.sin(this.direction) * this.speed;

        if (collision.checkCollision(this, newX, newY)) {
            this.x = newX;
            this.y = newY;
        } else {
            this.direction = Math.random() * Math.PI * 2;
        }
    }

    draw(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        if (assetManager.sprites[this.animation]) {
            assetManager.drawAnimatedSprite(ctx, this.animation, screenPos.x, screenPos.y);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenPos.x, screenPos.y - 8, this.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(screenPos.x, screenPos.y - 8, (this.hp / this.hp_max) * this.width, 4);
        }
    }
}

// ========== SYSTEME DE JEU ==========

class Jeu {
    constructor() {
        this.camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE);
        this.collision = new CollisionManager(MAP_CONFIG.data, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE);
        const spawn = MAP_CONFIG.spawn;
        this.joueur = new Joueur(spawn.x, spawn.y);
        // Charger inventaire depuis niveau précédent
        const savedInv = localStorage.getItem('playerInventaire');
        if (savedInv) {
            this.joueur.inventaire = JSON.parse(savedInv);
        }
        this.ennemis = [];
        this.projectiles = [];
        this.items = [];
        this.keys = {};
        this.vagues = 1;
        this.victory = false;
        this.victoryTimer = 0;
        this.lastTime = Date.now();

        // Système d'extensions pour tutoriel/UI customisée
        this.uiElements = []; // Ajouter des éléments avec addUIElement()

        this.chargerItems();
        this.genererEnnemis(LEVEL_CONFIG.ennemisInitiaux);
        this.setupControles();
    }

    // Ajouter un élément UI customisé (tutoriel, stats, etc.)
    addUIElement(element) {
        if (element && typeof element.draw === 'function') {
            this.uiElements.push(element);
            console.log(`✓ Élément UI ajouté: ${element.constructor.name}`);
        }
    }

    // Retirer un élément UI
    removeUIElement(element) {
        const index = this.uiElements.indexOf(element);
        if (index > -1) {
            this.uiElements.splice(index, 1);
        }
    }

    chargerItems() {
        if (!MAP_CONFIG.items || MAP_CONFIG.items.length === 0) return;
        for (let itemData of MAP_CONFIG.items) {
            const item = new Item(
                itemData.x * TILE_SIZE,
                itemData.y * TILE_SIZE,
                itemData.type,
                itemData.name || itemData.type
            );
            this.items.push(item);
        }
    }

    genererEnnemis(nombre) {
        for (let i = 0; i < nombre; i++) {
            let x, y, valide = false;
            while (!valide) {
                x = Math.floor(Math.random() * MAP_WIDTH);
                y = Math.floor(Math.random() * MAP_HEIGHT);
                const tile = this.collision.getTile(x, y);
                const dist = Math.hypot((x * TILE_SIZE) - this.joueur.x, (y * TILE_SIZE) - this.joueur.y);
                if (!isSolidTile(tile) && dist > TILE_SIZE * 5) {
                    valide = true;
                }
            }
            const config = {
                color: LEVEL_CONFIG.ennemisColor,
                vitesse: LEVEL_CONFIG.ennemisVitesse,
                hp: LEVEL_CONFIG.ennemisHp
            };
            this.ennemis.push(new Ennemi(x, y, config));
        }
    }

    setupControles() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') this.tirer();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        document.addEventListener('click', (e) => {
            const rect = CANVAS.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            const worldPos = this.camera.screenToWorld(screenX, screenY);
            const vx = worldPos.x - this.joueur.x;
            const vy = worldPos.y - this.joueur.y;
            const dist = Math.hypot(vx, vy);
            if (dist > 0) {
                this.projectiles.push(new Projectile(this.joueur.x, this.joueur.y, vx / dist, vy / dist));
            }
        });
    }

    tirer() {
        const angle = Math.random() * Math.PI * 2;
        this.projectiles.push(new Projectile(this.joueur.x, this.joueur.y, Math.cos(angle), Math.sin(angle)));
    }

    update(delta) {
        this.joueur.update(this.keys, this.collision, delta);
        this.camera.update(this.joueur.x, this.joueur.y);

        // Mettre à jour les éléments UI
        for (let element of this.uiElements) {
            if (typeof element.update === 'function') {
                element.update(delta);
            }
        }

        for (let item of this.items) {
            if (!item.collected) {
                const dist = Math.hypot(this.joueur.x - item.x, this.joueur.y - item.y);
                if (dist < 30) {
                    item.collected = true;
                    this.joueur.ajouterItem(item.type, item.name);
                }
            }
        }

        for (let ennemi of this.ennemis) {
            ennemi.update(this.joueur, delta, this.collision);
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(delta, this.collision);
            if (this.projectiles[i].estHorsMap()) {
                this.projectiles.splice(i, 1);
            }
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            for (let j = this.ennemis.length - 1; j >= 0; j--) {
                if (this.projectiles[i] && this.projectiles[i].collisionAvec(this.ennemis[j])) {
                    this.ennemis[j].hp -= 10;
                    this.projectiles.splice(i, 1);
                    if (this.ennemis[j].hp <= 0) {
                        this.joueur.score += 100;
                        this.joueur.exp += 25;
                        this.ennemis.splice(j, 1);
                    }
                    break;
                }
            }
        }

        for (let ennemi of this.ennemis) {
            if (this.joueur.collisionAvec(ennemi)) {
                this.joueur.hp -= 0.5;
            }
        }

        if (this.ennemis.length === 0) {
            const nombreSuivant = LEVEL_CONFIG.ennemisInitiaux + Math.floor(this.vagues * 1.5);
            this.genererEnnemis(nombreSuivant);
            this.vagues++;
        }

        if (this.vagues >= 10 && !this.victory) {
            this.victory = true;
        }

        if (this.victory) {
            this.victoryTimer += delta;
        }

        if (this.joueur.hp <= 0) {
            this.gameOver();
        }
    }

    drawMap() {
        const startX = Math.floor(this.camera.x / TILE_SIZE);
        const startY = Math.floor(this.camera.y / TILE_SIZE);
        const endX = Math.ceil((this.camera.x + CANVAS_WIDTH) / TILE_SIZE);
        const endY = Math.ceil((this.camera.y + CANVAS_HEIGHT) / TILE_SIZE);

        for (let y = startY; y < endY && y < MAP_HEIGHT; y++) {
            for (let x = startX; x < endX && x < MAP_WIDTH; x++) {
                const index = y * MAP_WIDTH + x;
                const tile = MAP_CONFIG.data[index] || TILE_TYPES.EMPTY;
                const screenPos = this.camera.worldToScreen(x * TILE_SIZE, y * TILE_SIZE);
                if (assetManager.images['tiles']) {
                    assetManager.drawSprite(CTX, 'tiles', screenPos.x, screenPos.y, TILE_SIZE, TILE_SIZE);
                } else {
                    assetManager.drawTile(CTX, tile, screenPos.x, screenPos.y, TILE_SIZE);
                }
            }
        }
    }

    draw() {
        CTX.fillStyle = '#000';
        CTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.drawMap();

        for (let item of this.items) {
            item.draw(CTX, this.camera);
        }

        for (let projectile of this.projectiles) {
            projectile.draw(CTX, this.camera);
        }

        for (let ennemi of this.ennemis) {
            ennemi.draw(CTX, this.camera);
        }

        this.joueur.draw(CTX, this.camera);

        // Dessiner les éléments UI customisés
        for (let element of this.uiElements) {
            if (typeof element.draw === 'function') {
                element.draw(CTX, CANVAS);
            }
        }

        if (this.victory) {
            this.victory_screen();
        }
    }

    drawUI() {
        CTX.fillStyle = 'rgba(0, 0, 0, 0.7)';
        CTX.fillRect(0, 0, CANVAS_WIDTH, 70);
        CTX.fillStyle = '#00ff00';
        CTX.font = 'bold 14px Arial';

        CTX.fillText(`❤️ PV: ${Math.round(this.joueur.hp)}/${this.joueur.hp_max}`, 10, 20);
        CTX.fillText(`⚔️ EXP: ${this.joueur.exp}`, 150, 20);
        CTX.fillText(`💰 Score: ${this.joueur.score}`, 280, 20);
        CTX.fillText(`🌊 Vague: ${this.vagues}`, 430, 20);
        CTX.fillText(`Niveau: ${LEVEL_NUMBER}`, 550, 20);

        CTX.fillStyle = '#ffff00';
        CTX.font = 'bold 12px Arial';
        const items = this.joueur.obtenirItems();
        let inventorieText = 'Inventaire: ';
        if (items.length === 0) {
            inventorieText += '(vide)';
        } else {
            inventorieText += items.map(i => `${i.type}(x${i.count})`).join(' | ');
        }
        CTX.fillText(inventorieText, 10, 45);
    }

    gameOver() {
        CTX.fillStyle = 'rgba(0, 0, 0, 0.9)';
        CTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        CTX.fillStyle = '#ff0000';
        CTX.font = 'bold 48px Arial';
        CTX.textAlign = 'center';
        CTX.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
        CTX.font = '20px Arial';
        CTX.fillStyle = '#ffff00';
        CTX.fillText('Niveau ' + LEVEL_NUMBER + ': ' + MAP_CONFIG.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        CTX.fillText('Score: ' + this.joueur.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        CTX.fillText('EXP: ' + this.joueur.exp, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
        CTX.font = '16px Arial';
        CTX.fillStyle = '#00ff00';
        CTX.fillText('M = Menu | R = Recommencer', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);

        if (this.keys['m'] || this.keys['M']) {
            window.location.href = 'index.html';
        }
        if (this.keys['r'] || this.keys['R']) {
            window.location.reload();
        }
    }

    victory_screen() {
        CTX.fillStyle = 'rgba(0, 0, 0, 0.9)';
        CTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        CTX.fillStyle = '#00ff00';
        CTX.font = 'bold 48px Arial';
        CTX.textAlign = 'center';
        CTX.fillText('VICTOIRE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
        CTX.font = '20px Arial';
        CTX.fillStyle = '#ffff00';
        CTX.fillText('Niveau ' + LEVEL_NUMBER + ': ' + MAP_CONFIG.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        CTX.fillText('Score: ' + this.joueur.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        CTX.fillText('EXP gagnée: ' + this.joueur.exp, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

        const nextLevel = LEVEL_CONFIG.nextLevel;
        if (nextLevel && this.victoryTimer > 2000) {
            this.joueur.sauvegarderInventaire();
            CTX.font = '16px Arial';
            CTX.fillStyle = '#00ccff';
            CTX.fillText('Appuyez sur N pour le prochain niveau', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);
            if (this.keys['n'] || this.keys['N']) {
                window.location.href = 'niveau_' + nextLevel + '.html';
            }
        } else if (!nextLevel) {
            CTX.font = '18px Arial';
            CTX.fillStyle = '#ff00ff';
            CTX.fillText('🎉 FIN DU JEU! ACCÈS CHAUDRON 🎉', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);
            CTX.fillText('(Préparez-vous pour le crafting!)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
        }

        CTX.font = '14px Arial';
        CTX.fillStyle = '#888';
        CTX.fillText('M = Menu | R = Rejouer', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 180);

        if (this.keys['m'] || this.keys['M']) {
            window.location.href = 'index.html';
        }
        if (this.keys['r'] || this.keys['R']) {
            window.location.reload();
        }
    }

    lancer() {
        const boucleJeu = (now) => {
            const delta = now - this.lastTime;
            this.lastTime = now;
            this.update(delta);
            this.draw();
            requestAnimationFrame((t) => boucleJeu(t));
        };
        requestAnimationFrame((t) => boucleJeu(t));
    }
}

// ========== LANCEMENT ==========
// Charger le jeu depuis le HTML de départ
let jeu;
if (typeof window !== 'undefined' && !window.jeu) {
    jeu = new Jeu();
    jeu.lancer();
}
