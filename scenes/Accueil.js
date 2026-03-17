class Accueil extends Phaser.Scene {
    constructor() {
        super('Accueil');
    }

    preload() {
        console.log('📦 Chargement des assets Accueil...');
        
        // Charger la tilemap Tiled
        this.load.tilemapTiledJSON('mapAccueil', 'assets/Map/map_accueil.tmj');
        
        // Charger le tileset
        this.load.image('terrain_d2_70', 'assets/terrain_d2_70.jpg');
        
        // Charger le spritesheet du joueur
        this.load.spritesheet('savant1', 'assets/savant1.png', { 
            frameWidth: 66, 
            frameHeight: 64 
        });
    }

    create() {
        console.log('✅ Création de la scène Accueil...');

        // Créer la tilemap depuis le fichier JSON
        const map = this.make.tilemap({ key: 'mapAccueil' });
        console.log(`🗺️ Map chargée: ${map.width}x${map.height} tuiles`);

        // Ajouter le tileset
        const tileset = map.addTilesetImage('terrain_d2_70', 'terrain_d2_70');
        
        // Créer le layer
        const layer = map.createLayer('Calque de Tuiles 1', tileset);

        // Ajouter collisions sur les tiles marquées
        layer.setCollisionByProperty({ collision: true });
        console.log('🔒 Collisions activées');

        // Créer le joueur
        this.player = this.physics.add.sprite(100, 100, 'savant1');
        this.player.setScale(2);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setFrame(5); // 6ème image
        console.log('👤 Joueur créé');

        // Collisions joueur vs map
        this.playerOnGround = false;
        const groundCollider = this.physics.add.collider(this.player, layer, () => {
            this.playerOnGround = true;
        });
        
        // Détecter quand le joueur n'est plus au sol
        this.physics.world.on('worldbounds', () => {
            if (this.player.body.touching.down) {
                this.playerOnGround = true;
            } else {
                this.playerOnGround = false;
            }
        });

        // Caméra qui suit le joueur
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        console.log('📷 Caméra configurée');

        // Sauvegarder le layer pour la physique
        this.layer = layer;
        this.map = map;
        this.jumpsRemaining = 2; // Double saut
        this.maxJumps = 2;

        // Configurer les contrôles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };
        console.log('⌨️ Contrôles configurés');

        // Afficher l'UI
        this.uiText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#0f0',
            backgroundColor: '#000000cc',
            padding: { x: 8, y: 6 }
        }).setScrollFactor(0).setDepth(100);

        // Afficher le titre
        this.titleText = this.add.text(400, 30, '🎮 SAVANT FOU - Accueil', {
            fontSize: '20px',
            fill: '#0f0',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        console.log('✨ Accueil prêt! Utilisez WASD ou Flèches pour explorer');
    }

    update() {
        const speed = 150;
        const jumpPower = 300;
        let vx = 0;

        // Vérifier si le joueur touche le sol
        this.playerOnGround = this.player.body.blocked.down;

        // Réinitialiser les sauts disponibles au sol
        if (this.playerOnGround) {
            this.jumpsRemaining = this.maxJumps;
        }

        // Mouvement horizontal
        if (this.cursors.left.isDown || this.keys.a.isDown) {
            vx = -speed;
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            vx = speed;
        }

        this.player.setVelocityX(vx);

        // Afficher la 6ème frame (index 5) quand au repos
        if (vx === 0 && this.playerOnGround) {
            this.player.setFrame(5);
        }

        // Double Saut
        const jumpKey = this.cursors.up.isDown || this.keys.space.isDown || this.keys.w.isDown;
        
        // Détecter la transition (quand on passe de non-appuyé à appuyé)
        if (jumpKey && !this.lastJumpKey && this.jumpsRemaining > 0) {
            this.player.setVelocityY(-jumpPower);
            this.jumpsRemaining--;
        }
        
        this.lastJumpKey = jumpKey;

        // Mettre à jour l'UI
        this.uiText.setText(
            `Position: ${Math.round(this.player.x)} x ${Math.round(this.player.y)}\n` +
            `Vélocité: ${Math.round(this.player.body.velocity.x)} x ${Math.round(this.player.body.velocity.y)}\n` +
            `Au sol: ${this.playerOnGround ? '✓' : '✗'} | Sauts: ${this.jumpsRemaining}/${this.maxJumps}\n` +
            `WASD/Flèches: Déplacer | ESPACE/W/↑: Double Saut`
        );
    }
}