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
    this.load.image("img_porte_orange", "assets/porteORANGE999.png");
    this.load.spritesheet("img_perso", "src/assets/savant2.png", {
      frameWidth: 100,
      frameHeight: 450
    });
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

    /****************************
     *  Ajout des portes   *
     ****************************/
    this.porte1 = this.physics.add.staticSprite(600, 414, "img_porte_orange");
    this.porte2 = this.physics.add.staticSprite(50, 264, "img_porte_orange");
    this.porte3 = this.physics.add.staticSprite(700, 234, "img_porte_orange");
    this.porte4 = this.physics.add.staticSprite(650, 234, "img_porte_orange");
    this.porte5 = this.physics.add.staticSprite(750, 234, "img_porte_orange");
    this.porte6 = this.physics.add.staticSprite(750, 234, "img_porte_orange");
    this.porte7 = this.physics.add.staticSprite(750, 234, "img_porte_orange");

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
    //this.physics.add.collider(player, groupe_plateformes);
  }

  /***********************************************************************/
  /** FONCTION UPDATE 
/***********************************************************************/

  update() {
    
  

    if (clavier.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
    }

    if (Phaser.Input.Keyboard.JustDown(clavier.space) == true) {
      if (this.physics.overlap(player, this.porte1))
        this.scene.switch("Niveau1");
      if (this.physics.overlap(player, this.porte2))
        this.scene.switch("Niveau2");
      if (this.physics.overlap(player, this.porte3))
        this.scene.switch("Niveau3");
      if (this.physics.overlap(player, this.porte4))
        this.scene.switch("Niveau4");   
      if (this.physics.overlap(player, this.porte5))
        this.scene.switch("Niveau5");   
      if (this.physics.overlap(player, this.porte6))
        this.scene.switch("Niveau6"); 
      if (this.physics.overlap(player, this.porte7))
        this.scene.switch("Niveau7");
    }
  }
}

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/
    update(); {
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