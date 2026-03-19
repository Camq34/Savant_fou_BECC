export default class Intro extends Phaser.Scene {
  constructor() {
    super({ key: "Intro" });
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    this.add
      .text(960, 640, 'Bienvenue dans le jeu du savant :\n"aidez ce savant a terminer sa potion magique"', {
        fontFamily: "Courier New, monospace",
        fontSize: "52px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 1500 }
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.time.delayedCall(3000, () => {
      this.scene.start("Accueil");
    });
  }
}