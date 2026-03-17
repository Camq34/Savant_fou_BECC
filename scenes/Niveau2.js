export default class niveau2 extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "niveau2" //  ici on précise le nom de la classe en tant qu'identifiant
    });
  }
  preload() {
    this.preload.tilemapTiledJSON('map_niveau2', 'assets/Map/map_niveau2:5.tmj');
    this.preload.image('img_materiaux', 'assets/donjonasset.png');
    this.preload.image('img_materiaux', 'assets/terrain_d2_70.jpg');
    this.preload.image('img_coffrebleu', 'assets/coffreBLEU.png');
    this.preload.image('img_coffrerouge', 'assets/coffreROUGE.png');
    this.preload.image('img_coffrevert', 'assets/coffreVERT.png');
    this.preload.image('img_coffrejaune', 'assets/coffreJAUNE.png');
    this.preload.image('img_portesortie', 'assets/portesortiewallah.png');
    this.load.spritesheet("img_perso", "src/assets/savant2.png", {
      frameWidth: 100,
      frameHeight: 450
    });
  }

  create() {
    
    // ajout d'un texte distintcif  du niveau
    this.add.text(400, 100, "Vous êtes dans le niveau 2", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "22pt"
    });

    this.porte_retour = this.physics.add.staticSprite(100, 550, "img_portesortiewallah");

    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.refreshBody();
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.clavier = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(this.player, this.groupe_plateformes);
  }

  update() {
    if (this.clavier.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("anim_tourne_gauche", true);
    } else if (this.clavier.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("anim_tourne_droite", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("anim_face");
    }
    if (this.clavier.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    if (Phaser.Input.Keyboard.JustDown(this.clavier.space) == true) {
      if (this.physics.overlap(this.player, this.porte_retour)) {
        console.log("niveau 3 : retour vers selection");
        this.scene.switch("selection");
      }
    }
  }
}
