// ========== GAME SCENE - Scène principale du jeu ==========

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelNumber = data.levelNumber || 1;
        this.levelConfig = getLevelConfig(this.levelNumber);
        this.mapConfig = getMapConfig(this.levelNumber);
        
        this.vagues = 1;
        this.score = 0;
        this.exp = 0;
        this.hp = 100;
        this.hp_max = 100;
        this.victory = false;
    }

    create() {
        // === FONDAMENTAL ===
        this.cameras.main.setBounds(0, 0, this.mapConfig.width * 32, this.mapConfig.height * 32);
        this.physics.world.setBounds(0, 0, this.mapConfig.width * 32, this.mapConfig.height * 32);

        // === TILEMAP ===
        // Créer une tilemap vide (à remplir avec votre editeur ou code)
        this.createTilemap();

        // === JOUEUR ===
        const spawnX = this.mapConfig.spawn.x * 32 + 16;
        const spawnY = this.mapConfig.spawn.y * 32 + 16;
        this.player = this.add.sprite(spawnX, spawnY, 'player').setScale(2);
        this.physics.add.existing(this.player, false);
        this.player.body.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);

        // === GROUPES ===
        this.enemies = this.add.group();
        this.projectiles = this.add.group();
        this.items = this.add.group();

        // === INPUTS ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            n: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N),
            m: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M),
            r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        };

        // Clique pour tirer
        this.input.on('pointerdown', (pointer) => {
            this.shootTowardsMouse(pointer);
        });

        // SPACE pour tirer aléatoire
        this.input.keyboard.on('keydown-SPACE', () => {
            this.shootRandom();
        });

        // === INVENTAIRE ===
        this.inventory = {};
        this.loadInventory();

        // === SPAWN ENNEMIS ===
        this.spawnEnemies(this.levelConfig.ennemisInitiaux);

        // === UI ===
        this.createUI();

        // === TUTORIEL ===
        this.showTutorialMessage('🎮 Bienvenue au Niveau ' + this.levelNumber + '!', '#00ff00', 3000);
    }

    createTilemap() {
        // Créer une tilemap de base vide
        // À remplir pour chaque niveau avec votre map
        const TILE_SIZE = 32;
        const width = this.mapConfig.width;
        const height = this.mapConfig.height;

        // Créer les tiles vides (couleur noire comme sol)
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const rect = this.add.rectangle(x * TILE_SIZE + 16, y * TILE_SIZE + 16, TILE_SIZE, TILE_SIZE, 0x1a1a1a);
                rect.setStrokeStyle(1, 0x333333);
            }
        }
    }

    spawnEnemies(nombre) {
        for (let i = 0; i < nombre; i++) {
            let x, y, valide = false;
            const mapPixelWidth = this.mapConfig.width * 32;
            const mapPixelHeight = this.mapConfig.height * 32;

            while (!valide) {
                x = Phaser.Math.Between(100, mapPixelWidth - 100);
                y = Phaser.Math.Between(100, mapPixelHeight - 100);

                // Éloigné du joueur
                const dist = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
                if (dist > 200) {
                    valide = true;
                }
            }

            const enemy = new Enemy(this, x, y, this.levelConfig);
            this.enemies.add(enemy);
        }
    }

    shootTowardsMouse(pointer) {
        const projectile = new Projectile(
            this,
            this.player.x,
            this.player.y,
            pointer.worldX,
            pointer.worldY
        );
        this.projectiles.add(projectile);
    }

    shootRandom() {
        const angle = Phaser.Math.Between(0, 360);
        const vx = Phaser.Math.Cos(Phaser.Math.DegToRad(angle));
        const vy = Phaser.Math.Sin(Phaser.Math.DegToRad(angle));

        const projectile = this.add.sprite(this.player.x, this.player.y, 'projectile');
        this.physics.add.existing(projectile, false);
        projectile.body.setVelocity(vx * 300, vy * 300);
        projectile.body.setCollideWorldBounds(true);
        projectile.body.setBounce(0);

        this.projectiles.add(projectile);
        this.time.delayedCall(6000, () => projectile.destroy());
    }

    update() {
        if (this.victory) return;

        // === CONTRÔLES JOUEUR ===
        let vx = 0, vy = 0;
        const speed = 150;

        if (this.cursors.up.isDown || this.keys.w.isDown) vy = -speed;
        if (this.cursors.down.isDown || this.keys.s.isDown) vy = speed;
        if (this.cursors.left.isDown || this.keys.a.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.keys.d.isDown) vx = speed;

        this.player.body.setVelocity(vx, vy);

        // === COLLISIONS PROJECTILES VS ENNEMIS ===
        this.projectiles.children.entries.forEach(proj => {
            this.enemies.children.entries.forEach(enemy => {
                if (Phaser.Geom.Rectangle.Overlaps(
                    Phaser.Geom.Rectangle.FromXY(proj.x - 4, proj.y - 4, 8, 8),
                    Phaser.Geom.Rectangle.FromXY(enemy.x - 14, enemy.y - 16, 28, 32)
                )) {
                    enemy.takeDamage(10);
                    proj.destroy();

                    if (enemy.hp <= 0) {
                        enemy.destroy();
                        this.score += 100;
                        this.exp += 25;
                    }
                }
            });
        });

        // === COLLISIONS JOUEUR VS ENNEMIS ===
        this.enemies.children.entries.forEach(enemy => {
            if (Phaser.Geom.Rectangle.Overlaps(
                Phaser.Geom.Rectangle.FromXY(this.player.x - 14, this.player.y - 16, 28, 32),
                Phaser.Geom.Rectangle.FromXY(enemy.x - 14, enemy.y - 16, 28, 32)
            )) {
                this.hp -= 0.5;
            }
        });

        // === VÉRIFIER VICTOIRE ===
        if (this.enemies.children.entries.length === 0) {
            this.spawnEnemies(this.levelConfig.ennemisInitiaux + Math.floor(this.vagues * 1.5));
            this.vagues++;
        }

        if (this.vagues >= 10 && !this.victory) {
            this.victory = true;
            this.showVictoryScreen();
        }

        if (this.hp <= 0) {
            this.showGameOverScreen();
        }

        // === MISE À JOUR UI ===
        this.updateUI();
    }

    createUI() {
        // Panel stats en haut-gauche
        this.uiText = this.add.text(10, 10, '', {
            font: '14px Arial',
            fill: '#00ff00',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0).setDepth(100);

        // Titre niveau
        this.titleText = this.add.text(10, 60, '🎮 Niveau ' + this.levelNumber + ': ' + this.mapConfig.name, {
            font: '12px Arial',
            fill: '#00ccff'
        }).setScrollFactor(0).setDepth(100);

        // Message tutoriel
        this.tutorialText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, '', {
            font: 'bold 32px Arial',
            fill: '#00ff00',
            align: 'center',
            wordWrap: { width: 600 }
        }).setScrollFactor(0).setDepth(100).setOrigin(0.5);
    }

    updateUI() {
        this.uiText.setText(
            `❤️ PV: ${Math.round(this.hp)}/${this.hp_max}\n` +
            `⚔️ EXP: ${this.exp}\n` +
            `💰 Score: ${this.score}\n` +
            `🌊 Vague: ${this.vagues}`
        );
    }

    showTutorialMessage(text, color, duration) {
        this.tutorialText.setText(text).setFill(color).setAlpha(1);
        this.tweens.add({
            targets: this.tutorialText,
            alpha: 0,
            duration: duration,
            delay: 0
        });
    }

    showVictoryScreen() {
        const victoryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 
            '🎉 VICTOIRE! 🎉\n\n' +
            'Niveau ' + this.levelNumber + ': ' + this.mapConfig.name + '\n\n' +
            'Score: ' + this.score + '\n' +
            'EXP: ' + this.exp + '\n\n' +
            'N = Prochain niveau | M = Menu | R = Rejouer',
            {
                font: 'bold 28px Arial',
                fill: '#00ff00',
                align: 'center',
                wordWrap: { width: 800 }
            }
        ).setScrollFactor(0).setDepth(100).setOrigin(0.5);

        // Attendre pour les touches
        this.time.delayedCall(2000, () => {
            this.input.keyboard.once('keydown-N', () => {
                window.location.href = 'niveau_' + (this.levelNumber + 1) + '.html';
            });
            this.input.keyboard.once('keydown-M', () => {
                window.location.href = 'menu.html';
            });
            this.input.keyboard.once('keydown-R', () => {
                this.scene.restart();
            });
        });
    }

    showGameOverScreen() {
        const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
            '💀 GAME OVER 💀\n\n' +
            'Niveau ' + this.levelNumber + ': ' + this.mapConfig.name + '\n\n' +
            'Score: ' + this.score + '\n' +
            'EXP: ' + this.exp + '\n\n' +
            'M = Menu | R = Recommencer',
            {
                font: 'bold 28px Arial',
                fill: '#ff0000',
                align: 'center',
                wordWrap: { width: 800 }
            }
        ).setScrollFactor(0).setDepth(100).setOrigin(0.5);

        this.input.keyboard.once('keydown-M', () => {
            window.location.href = 'menu.html';
        });
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
    }

    loadInventory() {
        const saved = localStorage.getItem('playerInventaire');
        if (saved) {
            this.inventory = JSON.parse(saved);
        }
    }

    saveInventory() {
        localStorage.setItem('playerInventaire', JSON.stringify(this.inventory));
    }
}
