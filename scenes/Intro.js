export default class Intro extends Phaser.Scene {
  constructor() {
    super({ key: "Intro" });
  }

  preload() {
    this.load.image("img_grotte_intro", "assets/grotte.png");
    this.load.image("img_monsieur_intro", "assets/monsieur.png");
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");
    const largeur = this.cameras.main.width;
    const hauteur = this.cameras.main.height;
    const messageIntro = "Bienvenue dans le jeu du savant. Il y a une potion à récupérer dans chaque niveau. Aidez ce savant à remplir son chaudron pour terminer sa potion !";

    this.add
      .image(largeur * 0.5, hauteur * 0.5, "img_grotte_intro")
      .setDisplaySize(largeur, hauteur)
      .setDepth(0);

    this.add
      .rectangle(largeur * 0.5, hauteur * 0.24, 1600, 240, 0x000000, 0.6)
      .setDepth(4);

    const texteIntro = this.add
      .text(largeur * 0.5, hauteur * 0.24, messageIntro.charAt(0), {
        fontFamily: '"Arial Black", "Verdana", sans-serif',
        fontSize: "52px",
        fontStyle: "bold",
        color: "#39ff14",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
        wordWrap: { width: 1500 },
        lineSpacing: 30,
        shadow: {
          offsetX: 0,
          offsetY: 6,
          color: "#0a2400",
          blur: 10,
          stroke: true,
          fill: true
        }
      })
      .setOrigin(0.5)
      .setDepth(10);

    let indexTexteIntro = 1;
    this.time.addEvent({
      delay: 45,
      repeat: messageIntro.length - 2,
      callback: () => {
        indexTexteIntro += 1;
        texteIntro.setText(messageIntro.slice(0, indexTexteIntro));
      }
    });

    this.add
      .image(largeur - 180, hauteur - 210, "img_monsieur_intro")
      .setScale(0.6)
      .setOrigin(1, 1)
      .setDepth(5);

    const boutonJouer = this.add
      .text(largeur * 0.5, hauteur - 90, "JOUER", {
        fontFamily: "Courier New, monospace",
        fontSize: "40px",
        fontStyle: "bold",
        color: "#39ff14",
        backgroundColor: "#103000",
        padding: { left: 22, right: 22, top: 12, bottom: 12 }
      })
      .setOrigin(0.5, 1)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    boutonJouer.on("pointerover", () => {
      boutonJouer.setStyle({ color: "#000000", backgroundColor: "#39ff14" });
    });

    boutonJouer.on("pointerout", () => {
      boutonJouer.setStyle({ color: "#39ff14", backgroundColor: "#103000" });
    });

    boutonJouer.on("pointerdown", () => {
      this.scene.start("Accueil");
    });
  }
}