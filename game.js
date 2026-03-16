// ========== CONFIG ==========
// Récupérer le numéro du niveau depuis l'URL
function getLevelNumberFromURL() {
    const url = window.location.pathname;
    const match = url.match(/niveau_(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

const LEVEL_NUMBER = getLevelNumberFromURL();
const LEVEL_CONFIG = getLevelConfig(LEVEL_NUMBER);

const CANVAS = document.getElementById('gameCanvas');
CANVAS.width = LEVEL_CONFIG.mapWidth;
CANVAS.height = LEVEL_CONFIG.mapHeight;
const CTX = CANVAS.getContext('2d');

const TILE_SIZE = 40;
const MAP_WIDTH = CANVAS.width / TILE_SIZE;
const MAP_HEIGHT = CANVAS.height / TILE_SIZE;

// ========== CLASSES ==========

class Entite {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.vitesse = 2;
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordure
        CTX.strokeStyle = '#fff';
        CTX.lineWidth = 2;
        CTX.strokeRect(this.x, this.y, this.width, this.height);
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

class Joueur extends Entite {
    constructor(x, y) {
        super(x, y, 30, 30, '#00ff00');
        this.hp = 100;
        this.hp_max = 100;
        this.exp = 0;
        this.score = 0;
    }

    update(keys) {
        let newX = this.x;
        let newY = this.y;

        if (keys['ArrowUp'] || keys['w']) newY -= this.vitesse;
        if (keys['ArrowDown'] || keys['s']) newY += this.vitesse;
        if (keys['ArrowLeft'] || keys['a']) newX -= this.vitesse;
        if (keys['ArrowRight'] || keys['d']) newX += this.vitesse;

        // Limites du terrain
        if (newX >= 0 && newX + this.width <= CANVAS.width) this.x = newX;
        if (newY >= 0 && newY + this.height <= CANVAS.height) this.y = newY;
    }

    draw() {
        super.draw();
        // Yeux du joueur
        CTX.fillStyle = '#000';
        CTX.fillRect(this.x + 8, this.y + 8, 4, 4);
        CTX.fillRect(this.x + 18, this.y + 8, 4, 4);
    }
}

class Projectile extends Entite {
    constructor(x, y, vx, vy) {
        super(x, y, 8, 8, '#ffff00');
        this.vx = vx;
        this.vy = vy;
        this.vitesse = 5;
    }

    update() {
        this.x += this.vx * this.vitesse;
        this.y += this.vy * this.vitesse;
    }

    estHorsCanvas() {
        return this.x < 0 || this.x > CANVAS.width || this.y < 0 || this.y > CANVAS.height;
    }
}

class Ennemi extends Entite {
    constructor(x, y, config = {}) {
        super(x, y, 25, 25, config.color || '#ff0000');
        this.hp = config.hp || 30;
        this.hp_max = this.hp;
        this.vitesse = config.vitesse || 2;
        this.updateCounter = 0;
        this.direction = Math.random() * Math.PI * 2;
    }

    update(joueur) {
        // IA simple - marche aléatoirement
        this.updateCounter++;
        if (this.updateCounter > 60) {
            this.direction = Math.random() * Math.PI * 2;
            this.updateCounter = 0;
        }

        const newX = this.x + Math.cos(this.direction) * this.vitesse;
        const newY = this.y + Math.sin(this.direction) * this.vitesse;

        // Limites du terrain
        if (newX >= 0 && newX + this.width <= CANVAS.width) this.x = newX;
        if (newY >= 0 && newY + this.height <= CANVAS.height) this.y = newY;
    }

    draw() {
        super.draw();
        // Yeux
        CTX.fillStyle = '#fff';
        CTX.fillRect(this.x + 6, this.y + 6, 3, 3);
        CTX.fillRect(this.x + 16, this.y + 6, 3, 3);
    }
}

// ========== SYSTEME DE JEU ==========

class Jeu {
    constructor() {
        this.joueur = new Joueur(CANVAS.width / 2, CANVAS.height / 2);
        this.ennemis = [];
        this.projectiles = [];
        this.keys = {};
        this.vagues = 0;
        this.victory = false;
        this.victoryTimer = 0;
        
        this.genererEnnemis(LEVEL_CONFIG.ennemisInitiaux);
        this.setupControles();
    }

    genererEnnemis(nombre) {
        for (let i = 0; i < nombre; i++) {
            let x, y;
            let valide = false;
            
            while (!valide) {
                x = Math.random() * (CANVAS.width - 50);
                y = Math.random() * (CANVAS.height - 50);
                
                // Assure que l'ennemi ne spawn pas trop près du joueur
                const dist = Math.hypot(x - this.joueur.x, y - this.joueur.y);
                if (dist > 150) valide = true;
            }
            
            const config = {
                color: LEVEL_CONFIG.ennemisColor,
                vitesse: LEVEL_CONFIG.ennemisVitesse,
                hp: LEVEL_CONFIG.ennemisHp
            };
            this.ennemis.push(new Ennemi(x, y, config));
        }
        this.vagues++;
    }

    setupControles() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // ESPACE pour tirer
            if (e.key === ' ') this.tirer();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Clic de la souris pour tirer
        document.addEventListener('click', (e) => {
            const rect = CANVAS.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const vx = mouseX - this.joueur.x;
            const vy = mouseY - this.joueur.y;
            const dist = Math.hypot(vx, vy);
            
            if (dist > 0) {
                this.projectiles.push(new Projectile(
                    this.joueur.x + this.joueur.width / 2,
                    this.joueur.y + this.joueur.height / 2,
                    vx / dist,
                    vy / dist
                ));
            }
        });
    }

    tirer() {
        // Tirer vers une direction aléatoire
        const angle = Math.random() * Math.PI * 2;
        this.projectiles.push(new Projectile(
            this.joueur.x + this.joueur.width / 2,
            this.joueur.y + this.joueur.height / 2,
            Math.cos(angle),
            Math.sin(angle)
        ));
    }

    update() {
        // Mise à jour joueur
        this.joueur.update(this.keys);

        // Mise à jour ennemis
        for (let ennemi of this.ennemis) {
            ennemi.update(this.joueur);
        }

        // Mise à jour projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update();
            
            if (this.projectiles[i].estHorsCanvas()) {
                this.projectiles.splice(i, 1);
            }
        }

        // Collisions projectiles vs ennemis
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

        // Collisions joueur vs ennemis
        for (let ennemi of this.ennemis) {
            if (this.joueur.collisionAvec(ennemi)) {
                this.joueur.hp -= 0.5; // Dégâts continus
            }
        }

        // Regenerer ennemis si tous sont morts
        if (this.ennemis.length === 0) {
            const nombreSuivant = LEVEL_CONFIG.ennemisInitiaux + Math.floor(this.vagues * 1.5);
            this.genererEnnemis(nombreSuivant);
        }

        // Victory: 10 vagues complétées
        if (this.vagues >= 10 && !this.victory) {
            this.victory = true;
        }

        if (this.victory) {
            this.victoryTimer++;
        }

        // Game Over
        if (this.joueur.hp <= 0) {
            this.gameOver();
        }
    }

    draw() {
        // Fond
        CTX.fillStyle = LEVEL_CONFIG.backgroundColor;
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

        // Grille
        CTX.strokeStyle = LEVEL_CONFIG.gridColor;
        CTX.lineWidth = 1;
        for (let i = 0; i <= CANVAS.width; i += TILE_SIZE) {
            CTX.beginPath();
            CTX.moveTo(i, 0);
            CTX.lineTo(i, CANVAS.height);
            CTX.stroke();
        }
        for (let i = 0; i <= CANVAS.height; i += TILE_SIZE) {
            CTX.beginPath();
            CTX.moveTo(0, i);
            CTX.lineTo(CANVAS.width, i);
            CTX.stroke();
        }

        // Projectiles
        for (let projectile of this.projectiles) {
            projectile.draw();
        }

        // Ennemis
        for (let ennemi of this.ennemis) {
            ennemi.draw();
            // Barre de vie
            this.drawBarreVie(ennemi);
        }

        // Joueur
        this.joueur.draw();
        this.drawBarreVie(this.joueur);

        // Afficher Victory si applicable
        if (this.victory) {
            this.victory_screen();
        }

        // UI
        this.updateUI();
    }

    drawBarreVie(entite) {
        const barreWidth = entite.width;
        const barreHeight = 4;
        
        CTX.fillStyle = '#ff0000';
        CTX.fillRect(entite.x, entite.y - 10, barreWidth, barreHeight);
        
        const pourcent = entite.hp / entite.hp_max;
        CTX.fillStyle = '#00ff00';
        CTX.fillRect(entite.x, entite.y - 10, barreWidth * pourcent, barreHeight);
    }

    updateUI() {
        document.getElementById('hp').textContent = Math.round(this.joueur.hp);
        document.getElementById('exp').textContent = this.joueur.exp;
        document.getElementById('score').textContent = this.joueur.score;
        document.getElementById('wave').textContent = this.vagues;
    }

    gameOver() {
        CTX.fillStyle = 'rgba(0, 0, 0, 0.7)';
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
        
        CTX.fillStyle = '#ff0000';
        CTX.font = 'bold 48px Arial';
        CTX.textAlign = 'center';
        CTX.fillText('GAME OVER', CANVAS.width / 2, CANVAS.height / 2 - 70);
        
        CTX.font = '20px Arial';
        CTX.fillStyle = '#ffff00';
        CTX.fillText('Niveau ' + LEVEL_NUMBER + ': ' + LEVEL_CONFIG.name, CANVAS.width / 2, CANVAS.height / 2 - 20);
        CTX.fillText('Score: ' + this.joueur.score, CANVAS.width / 2, CANVAS.height / 2 + 20);
        CTX.fillText('EXP: ' + this.joueur.exp, CANVAS.width / 2, CANVAS.height / 2 + 50);
        
        CTX.font = '16px Arial';
        CTX.fillStyle = '#00ff00';
        CTX.fillText('M = Menu Principal | R = Recommencer ce niveau', CANVAS.width / 2, CANVAS.height / 2 + 110);

        if (this.keys['m'] || this.keys['M']) {
            window.location.href = 'index.html';
        }
        if (this.keys['r'] || this.keys['R']) {
            window.location.reload();
        }
    }

    victory_screen() {
        CTX.fillStyle = 'rgba(0, 0, 0, 0.8)';
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
        
        CTX.fillStyle = '#00ff00';
        CTX.font = 'bold 48px Arial';
        CTX.textAlign = 'center';
        CTX.fillText('VICTOIRE!', CANVAS.width / 2, CANVAS.height / 2 - 70);
        
        CTX.font = '20px Arial';
        CTX.fillStyle = '#ffff00';
        CTX.fillText('Niveau ' + LEVEL_NUMBER + ': ' + LEVEL_CONFIG.name, CANVAS.width / 2, CANVAS.height / 2 - 20);
        CTX.fillText('Score: ' + this.joueur.score, CANVAS.width / 2, CANVAS.height / 2 + 20);
        CTX.fillText('EXP gagnée: ' + this.joueur.exp, CANVAS.width / 2, CANVAS.height / 2 + 50);

        const nextLevel = LEVEL_CONFIG.nextLevel;
        
        if (nextLevel && this.victoryTimer > 120) {
            CTX.font = '16px Arial';
            CTX.fillStyle = '#00ccff';
            CTX.fillText('Appuyez sur N pour le prochain niveau', CANVAS.width / 2, CANVAS.height / 2 + 110);
            
            if (this.keys['n'] || this.keys['N']) {
                window.location.href = 'niveau_' + nextLevel + '.html';
            }
        } else if (!nextLevel) {
            CTX.font = '18px Arial';
            CTX.fillStyle = '#ff00ff';
            CTX.fillText('🎉 FÉLICITATIONS! VOUS AVEZ COMPLÉTÉ LE JEU! 🎉', CANVAS.width / 2, CANVAS.height / 2 + 110);
        }

        CTX.font = '14px Arial';
        CTX.fillStyle = '#888';
        CTX.fillText('M = Menu Principal | R = Rejouer ce niveau', CANVAS.width / 2, CANVAS.height / 2 + 150);

        if (this.keys['m'] || this.keys['M']) {
            window.location.href = 'index.html';
        }
        if (this.keys['r'] || this.keys['R']) {
            window.location.reload();
        }
    }

    lancer() {
        const boucleJeu = () => {
            this.update();
            this.draw();
            requestAnimationFrame(boucleJeu);
        };
        boucleJeu();
    }
}

// ========== LANCEMENT ==========
const jeu = new Jeu();
jeu.lancer();
