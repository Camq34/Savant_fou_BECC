export default class niveau2 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau2" });
	}

	preload() {
		this.load.tilemapTiledJSON("map_niveau2", "assets/Map/mapniveau2_5.tmj");
		this.load.image("img_terrain", "assets/terrain_d2_70.jpg");
		this.load.image("img_donjonasset", "assets/donjonasset.png");
		this.load.image("img_brique", "assets/brique.png");
		this.load.image("img_coffre_bleu", "assets/coffre_bleu.png");
		this.load.image("img_coffre_rouge", "assets/coffre_rouge.png");
		this.load.image("img_coffre_vert", "assets/coffre_vert.png");
		this.load.image("img_coffre_jaune", "assets/coffre_jaune.png");
		this.load.image("img_portesortie", "assets/portesortiewallah.png");
		this.load.spritesheet("savant2", "assets/savant2.png", {
			frameWidth: 40,
			frameHeight: 50,
			spacing: 1
		});
		this.load.spritesheet("icons_prev", "assets/icons_prev_comp-removebg-preview.png", {
			frameWidth: 32,
			frameHeight: 32
		});
	}

	create() {
		const map = this.make.tilemap({ key: "map_niveau2" });
		this.map = map;

		const tilesetTerrain = map.addTilesetImage("terrain_d2_70", "img_terrain");
		const tilesetDonjon = map.addTilesetImage("donjonasset", "img_donjonasset");
		const tilesetBrique = map.addTilesetImage("brique", "img_brique");
		const tilesetCoffreBleu = map.addTilesetImage("coffre_bleu", "img_coffre_bleu");
		const tilesetCoffreRouge = map.addTilesetImage("coffre_rouge", "img_coffre_rouge");
		const tilesetCoffreVert = map.addTilesetImage("coffre_vert", "img_coffre_vert");
		const tilesetCoffreJaune = map.addTilesetImage("coffre_jaune", "img_coffre_jaune");
		const tilesetPorteSortie = map.addTilesetImage("portesortiewallah", "img_portesortie");

		const allTilesets = [
			tilesetTerrain,
			tilesetDonjon,
			tilesetBrique,
			tilesetCoffreBleu,
			tilesetCoffreRouge,
			tilesetCoffreVert,
			tilesetCoffreJaune,
			tilesetPorteSortie
		].filter(Boolean);

		map.createLayer("Tile Layer 1", allTilesets, 0, 0);
		this.layerDecor = map.createLayer("décor", allTilesets, 0, 0);
		if (this.layerDecor) {
			this.layerDecor.setCollisionByProperty({ collision: true });
		}

		this.anims.create({
			key: "savant2_idle",
			frames: [{ key: "savant2", frame: 5 }],
			frameRate: 1,
			repeat: -1
		});

		this.anims.create({
			key: "savant2_walk",
			frames: this.anims.generateFrameNumbers("savant2", { start: 0, end: 4 }),
			frameRate: 10,
			repeat: -1
		});

		this.anims.create({
			key: "savant2_jump",
			frames: this.anims.generateFrameNumbers("savant2", { start: 6, end: 10 }),
			frameRate: 10,
			repeat: -1
		});

		this.player = this.physics.add.sprite(160, map.heightInPixels - 180, "savant2", 5);
		this.player.setScale(2);
		this.player.setCollideWorldBounds(true);
		this.player.setBounce(0);
		this.player.body.setSize(20, 44);
		this.player.body.setOffset(10, 6);
		this.player.play("savant2_idle");

		this.physics.add.collider(this.player, this.layerDecor);
		this.cursors = this.input.keyboard.createCursorKeys();
		this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		this.playerSpeed = 180;
		this.jumpSpeed = -360;
		this.doorOpened = false;
		this.isDoorAnimating = false;

		// Créer la clé à côté du joueur
		this.cle = this.physics.add.staticSprite(250, map.heightInPixels - 130, "icons_prev", 9);
		this.cle.setScale(1.5);
		this.hasKey = false;

		// Permet de collecter la clé en collision avec le joueur
		this.physics.add.overlap(this.player, this.cle, this.collectKey, null, this);

		// Texte d'information temporaire
		this.messageText = this.add.text(960, 1030, "", {
			fontFamily: "Arial",
			fontSize: "32px",
			color: "#FFFF00",
			stroke: "#000000",
			strokeThickness: 4
		}).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1002);

		this.doorTilePositions = [
			{ x: 56, y: 33 },
			{ x: 57, y: 33 },
			{ x: 58, y: 33 },
			{ x: 56, y: 34 },
			{ x: 57, y: 34 },
			{ x: 58, y: 34 },
			{ x: 56, y: 35 },
			{ x: 57, y: 35 },
			{ x: 58, y: 35 },
			{ x: 56, y: 36 },
			{ x: 57, y: 36 },
			{ x: 58, y: 36 }
		];
		this.doorFrames = [
			[6207, 6208, 6209, 6224, 6225, 6226, 6241, 6242, 6243, 6258, 6259, 6260],
			[6210, 6211, 6212, 6227, 6228, 6229, 6244, 6245, 6246, 6261, 6262, 6263],
			[6213, 6214, 6215, 6230, 6231, 6232, 6247, 6248, 6249, 6264, 6265, 6266],
			[6216, 6217, 6218, 6233, 6234, 6235, 6250, 6251, 6252, 6267, 6268, 6269],
			[6219, 6220, 6221, 6236, 6237, 6238, 6253, 6254, 6255, 6270, 6271, 6272]
		];

		this.add.text(960, 95, "NIVEAU 2", {
			fontFamily: "Courier New, monospace",
			fontSize: "72px",
			fontStyle: "bold",
			color: "#5cff72",
			stroke: "#0b2a12",
			strokeThickness: 8,
			shadow: {
				offsetX: 0,
				offsetY: 0,
				color: "#7dff8d",
				blur: 12,
				stroke: true,
				fill: true
			}
		}).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

		// Texte gros au milieu
		this.add.text(960, 440, "Pour créer une potion d'invisibilité,\nje dois mélanger un acide et une base.\nComment appelle-t-on cette réaction\nchimique qui dégage souvent de la chaleur ?", {
			fontFamily: "Arial",
			fontSize: "64px",
			fontStyle: "bold",
			color: "#FFFFFF",
			stroke: "#000000",
			strokeThickness: 4
		}).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1001);

		// Configuration des 4 carrés colorés alignés en dessous
		const squares = [
			{ x: 300, y: 680, color: 0x0000FF, text: "Une lévitation", textColor: "#FFFFFF" },
			{ x: 720, y: 680, color: 0xFF0000, text: "Une neutralisation", textColor: "#000000" },
			{ x: 1140, y: 680, color: 0x00FF00, text: "Une combustion", textColor: "#FFFFFF" },
			{ x: 1560, y: 680, color: 0xFFFF00, text: "Une précipitation", textColor: "#000000" }
		];

		squares.forEach(square => {
			// Créer un rectangle arrondi avec graphics et l'afficher directement
			const graphics = this.add.graphics();
			graphics.fillStyle(square.color, 1);
			graphics.fillRoundedRect(square.x - 130, square.y - 85, 260, 170, 20);
			graphics.setScrollFactor(0);
			graphics.setDepth(1001);

			// Ajouter le texte sur le carré
			this.add.text(square.x, square.y, square.text, {
				fontFamily: "Arial",
				fontSize: "22px",
				fontStyle: "bold",
				color: square.textColor,
				wordWrap: { width: 200 },
				align: "center"
			}).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1002);
		});

		this.cameras.main.setBackgroundColor("#000000");
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
	}

	update() {
		const isOnGround = this.player.body.blocked.down || this.player.body.touching.down;

		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-this.playerSpeed);
			this.player.setFlipX(true);
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(this.playerSpeed);
			this.player.setFlipX(false);
		} else {
			this.player.setVelocityX(0);
		}

		if (this.cursors.up.isDown && isOnGround) {
			this.player.setVelocityY(this.jumpSpeed);
		}

		if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
			if (this.doorOpened) {
				this.showMessage("La porte est déjà ouverte !", 1000);
				return;
			}

			const chestTile = this.getOpenableChestTile();
			if (chestTile) {
				const tilesetName = chestTile.tileset?.name || "";
				if (tilesetName.includes("coffre_rouge")) {
					if (this.hasKey) {
						this.openDoor();
					} else {
						this.showMessage("Il me faut une clé pour ouvrir ce coffre !");
					}
				} else if (/coffre_(bleu|vert|jaune)/.test(tilesetName)) {
					this.dieAndRestart();
				}
			}
		}

		if (!isOnGround) {
			this.player.play("savant2_jump", true);
		} else if (this.player.body.velocity.x !== 0) {
			this.player.play("savant2_walk", true);
		} else {
			this.player.play("savant2_idle", true);
		}
	}

	openDoor() {
		this.isDoorAnimating = true;

		this.doorFrames.forEach((frameSet, index) => {
			this.time.delayedCall(140 * index, () => {
				frameSet.forEach((tileIndex, tileOffset) => {
					const tilePosition = this.doorTilePositions[tileOffset];
					this.layerDecor.putTileAt(tileIndex, tilePosition.x, tilePosition.y);
				});

				if (index === this.doorFrames.length - 1) {
					this.doorOpened = true;
					this.isDoorAnimating = false;
				}
			});
		});
	}

	getOpenableChestTile() {
		const center = this.player.getCenter();
		const offsets = [
			{ x: 0, y: 0 },
			{ x: -16, y: 0 },
			{ x: 16, y: 0 },
			{ x: 0, y: 16 },
			{ x: 0, y: -16 },
			{ x: -16, y: -16 },
			{ x: 16, y: -16 },
			{ x: -16, y: 16 },
			{ x: 16, y: 16 }
		];

		for (const offset of offsets) {
			const tile = this.layerDecor.getTileAtWorldXY(center.x + offset.x, center.y + offset.y, false, this.cameras.main);
			if (tile && tile.properties && tile.properties.ouvrircoffre) {
				return tile;
			}
		}

		return null;
	}

	dieAndRestart() {
		this.showMessage("Je suis mort… retour au début !", 1500);
		this.time.delayedCall(1500, () => {
			this.scene.restart();
		});
	}

	showMessage(text, duration = 2000) {
		if (!this.messageText) return;
		this.messageText.setText(text);
		if (this.messageTimer) {
			this.messageTimer.remove(false);
		}
		this.messageTimer = this.time.delayedCall(duration, () => {
			this.messageText.setText("");
		});
	}

	collectKey(player, key) {
		this.hasKey = true;
		key.destroy();
		this.showMessage("Clé récupérée !");
	}
}
