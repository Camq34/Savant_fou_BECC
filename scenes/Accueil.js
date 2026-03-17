/***********************************************************************/
/** VARIABLES GLOBALES 
/***********************************************************************/

var player; // désigne le sprite du joueur
var clavier; // pour la gestion du clavier

// définition de la classe "selection"
export default class accueil extends Phaser.Scene {
  constructor() {
    super({ key: "accueil" }); // mettre le meme nom que le nom de la classe
  }

  /***********************************************************************/
  /** FONCTION PRELOAD 
/***********************************************************************/

  /** La fonction preload est appelée une et une seule fois,
   * lors du chargement de la scene dans le jeu.
   * On y trouve surtout le chargement des assets (images, son ..)
   */
  preload() {
    // tous les assets du jeu sont placés dans le sous-répertoire src/assets/
    this.load.image('img_materiaux', 'assets/terrain_d2_70.jpg');
    this.load.tilemapTiledJSON('map_accueil', 'assets/Map/map_Accueil.tmj');
  }

  /***********************************************************************/
  /** FONCTION CREATE 
/***********************************************************************/

  /* La fonction create est appelée lors du lancement de la scene
   * si on relance la scene, elle sera appelée a nouveau
   * on y trouve toutes les instructions permettant de créer la scene
   * placement des peronnages, des sprites, des platesformes, création des animations
   * ainsi que toutes les instructions permettant de planifier des evenements
   */
  create() {

    /*************************************
     *  CREATION DU MONDE + PLATEFORMES  *
     *************************************/


    // la création d'un groupes permet de gérer simultanément les éléments d'une meme famille
    //  Le groupe groupe_plateformes contiendra le sol et deux platesformes sur lesquelles sauter
    // notez le mot clé "staticGroup" : le static indique que ces élements sont fixes : pas de gravite,
    // ni de possibilité de les pousser.
    groupe_plateformes = this.physics.add.staticGroup();
    // une fois le groupe créé, on va créer les platesformes , le sol, et les ajouter au groupe groupe_plateformes

    // l'image img_plateforme fait 400x32. On en met 2 à coté pour faire le sol
    // la méthode create permet de créer et d'ajouter automatiquement des objets à un groupe
    // on précise 2 parametres : chaque coordonnées et la texture de l'objet, et "voila!"
    groupe_plateformes.create(200, 584, "img_plateforme");
    groupe_plateformes.create(600, 584, "img_plateforme");

    //  on ajoute 3 platesformes flottantes
    groupe_plateformes.create(600, 450, "img_plateforme");
    groupe_plateformes.create(50, 300, "img_plateforme");
    groupe_plateformes.create(750, 270, "img_plateforme");

    /****************************
     *  Ajout des portes   *
     ****************************/
    this.porte1 = this.physics.add.staticSprite(600, 414, "img_porte1");
    this.porte2 = this.physics.add.staticSprite(50, 264, "img_porte2");
    this.porte3 = this.physics.add.staticSprite(750, 234, "img_porte3");

    /****************************
     *  CREATION DU PERSONNAGE  *
     ****************************/

    // On créée un nouveeau personnage : player
    player = this.physics.add.sprite(100, 450, "img_perso");

    //  propriétées physiqyes de l'objet player :
    player.setBounce(0.2); // on donne un petit coefficient de rebond
    player.setCollideWorldBounds(true); // le player se cognera contre les bords du monde

    /***************************
     *  CREATION DES ANIMATIONS *
     ****************************/
    // dans cette partie, on crée les animations, à partir des spritesheet
    // chaque animation est une succession de frame à vitesse de défilement défini
    // une animation doit avoir un nom. Quand on voudra la jouer sur un sprite, on utilisera la méthode play()
    // creation de l'animation "anim_tourne_gauche" qui sera jouée sur le player lorsque ce dernier tourne à gauche
    this.anims.create({
      key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique poru la scene.
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 0,
        end: 3
      }), // on prend toutes les frames de img perso numerotées de 0 à 3
      frameRate: 10, // vitesse de défilement des frames
      repeat: -1 // nombre de répétitions de l'animation. -1 = infini
    });

    // creation de l'animation "anim_tourne_face" qui sera jouée sur le player lorsque ce dernier n'avance pas.
    this.anims.create({
      key: "anim_face",
      frames: [{ key: "img_perso", frame: 4 }],
      frameRate: 20
    });

    // creation de l'animation "anim_tourne_droite" qui sera jouée sur le player lorsque ce dernier tourne à droite
    this.anims.create({
      key: "anim_tourne_droite",
      frames: this.anims.generateFrameNumbers("img_perso", {
        start: 5,
        end: 8
      }),
      frameRate: 10,
      repeat: -1
    });

    /***********************
     *  CREATION DU CLAVIER *
     ************************/
    // ceci permet de creer un clavier et de mapper des touches, connaitre l'état des touches
    clavier = this.input.keyboard.createCursorKeys();

    /*****************************************************
     *  GESTION DES INTERATIONS ENTRE  GROUPES ET ELEMENTS *
     ******************************************************/

    //  Collide the player and the groupe_etoiles with the groupe_plateformes
    this.physics.add.collider(player, groupe_plateformes);
  }

  /***********************************************************************/
  /** FONCTION UPDATE 
/***********************************************************************/

  update() {
    
    if (clavier.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("anim_tourne_gauche", true);
    } else if (clavier.right.isDown) {
      player.setVelocityX(160);
      player.anims.play("anim_tourne_droite", true);
    } else {
      player.setVelocityX(0);
      player.anims.play("anim_face");
    }

<<<<<<< HEAD
    if (clavier.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
    }

    if (Phaser.Input.Keyboard.JustDown(clavier.space) == true) {
      if (this.physics.overlap(player, this.porte1))
        this.scene.switch("niveau1");
      if (this.physics.overlap(player, this.porte2))
        this.scene.switch("niveau2");
      if (this.physics.overlap(player, this.porte3))
        this.scene.switch("niveau3");
=======
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
>>>>>>> 522078c0184043210b991d23380349fac44b6570
    }
  }
}

<<<<<<< HEAD
/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/
=======
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
>>>>>>> 522078c0184043210b991d23380349fac44b6570
