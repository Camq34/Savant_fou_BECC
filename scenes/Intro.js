export default class Intro extends Phaser.Scene {
  constructor() {
    super({ key: "Intro" });
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");
    const largeur = this.cameras.main.width;
    const hauteur = this.cameras.main.height;

    this.add
      .text(largeur * 0.5, hauteur * 0.5, "Bienvenue dans le jeu du savant. Il y a une potion à récupérer dans chaque niveau. Aidez ce savant à remplir son chaudron pour terminer sa potion !", {
        fontFamily: "Courier New, monospace",
        fontSize: "52px",
        fontStyle: "bold",
        color: "#39ff14",
        align: "center",
        wordWrap: { width: 1500 }
      })
      .setOrigin(0.5)
      .setDepth(10);

    const boutonJouer = this.add
      .text(largeur - 120, hauteur - 90, "JOUER", {
        fontFamily: "Courier New, monospace",
        fontSize: "40px",
        fontStyle: "bold",
        color: "#39ff14",
        backgroundColor: "#103000",
        padding: { left: 22, right: 22, top: 12, bottom: 12 }
      })
      .setOrigin(1, 1)
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