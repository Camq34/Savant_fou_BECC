export default class niveau5 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau5" });
	}

	preload() {
		this.load.tilemapTiledJSON("map_niveau5", "assets/Map/mapniveau2_5.tmj");
		this.load.image("img_terrain", "assets/terrain_d2_70.jpg");
		this.load.image("img_donjonasset", "assets/donjonasset.png");
		this.load.image("img_brique", "assets/brique.png");
		this.load.image("img_coffre_bleu", "assets/coffre_bleu.png");
		this.load.image("img_coffre_rouge", "assets/coffre_rouge.png");
		this.load.image("img_coffre_vert", "assets/coffre_vert.png");
		this.load.image("img_coffre_jaune", "assets/coffre_jaune.png");
		this.load.image("img_portesortie", "assets/portesortiewallah.png");
		this.load.spritesheet("img_items_sheet", "assets/items.png", {
			frameWidth: 32,
			frameHeight: 32
		});
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
		const map = this.make.tilemap({ key: "map_niveau5" });
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
		this.player.setDepth(10);
		this.player.body.setSize(20, 44);
		this.player.body.setOffset(10, 6);
		this.player.play("savant2_idle");

		this.cle = this.physics.add.staticSprite(220, map.heightInPixels - 130, "icons_prev", 9);
		this.cle.setScale(1.5);
		this.potion = this.physics.add.staticSprite(1700, map.heightInPixels-120, "img_items_sheet", 72);
		this.potion.setScale(1.4);
		this.potion.setDepth(6);
		this.potion.setVisible(false);
		this.potion.body.enable = false;

		this.physics.add.collider(this.player, this.layerDecor);
		this.cursors = this.input.keyboard.createCursorKeys();
		this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		this.playerSpeed = 180;
		this.jumpSpeed = -360;
		this.doorOpened = false;
		this.isDoorAnimating = false;
		this.hasKey = false;
		this.hasPotion = false;

		this.physics.add.overlap(this.player, this.cle, this.collectKey, null, this);
		this.physics.add.overlap(this.player, this.potion, this.collectPotion, null, this);

		this.messageText = this.add.text(960, 900, "", {
			fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
			fontSize: "52px",
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

		this.add.text(960, 95, "NIVEAU 5", {
			fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
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

		this.add.text(960, 350, "Comment appelle-t-on le passsage d'un corp de l'etait liquide a l'etat gaz ?", {
			fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
			fontSize: "60px",
			fontStyle: "bold",
			color: "#7dff8d",
			stroke: "#000000",
			strokeThickness: 4,
			align: "center",
			wordWrap: { width: 1200 }
		}).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1001);

		const squares = [
			{ x: 300, y: 650, color: "#0000FF", text: "FUSION" },
			{ x: 720, y: 650, color: "#FF0000", text: "CONDENSATION" },
			{ x: 1140, y: 650, color: "#00FF00", text: "SOLIDIFICATION" },
			{ x: 1560, y: 650, color: "#FFFF00", text: "EVAPORATION" }
		];

		squares.forEach(square => {
			this.add.text(square.x, square.y, square.text, {
				fontFamily: '"Chiller", "Creepster", "Papyrus", fantasy',
				fontSize: "45px",
				fontStyle: "bold",
				color: square.color,
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
				if (this.isPlayerAtExit()) {
					this.goToAccueil();
				} else {
					this.showMessage("Va jusqu'a la porte pour sortir !", 1000);
				}
				return;
			}

			const chestTile = this.getOpenableChestTile();
			if (chestTile) {
				if (!this.hasKey) {
					this.showMessage("Il me faut une clé pour ouvrir ce coffre !");
					return;
				}

				const tilesetName = chestTile.tileset?.name || "";
				if (tilesetName.includes("coffre_jaune")) {
					this.openDoor();
				} else if (/coffre_(bleu|vert|rouge)/.test(tilesetName)) {
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
		this.showMessage("BONNE REPONSE !", 1500);
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
					this.potion.setVisible(true);
					this.potion.body.enable = true;
					this.potion.refreshBody();

					this.doorExit = this.physics.add.staticSprite(58 * 32, 35 * 32, null);
					this.doorExit.setSize(32, 64);
					this.doorExit.setVisible(false);
				}
			});
		});
	}

	isPlayerAtExit() {
		return Boolean(this.doorExit && this.physics.overlap(this.player, this.doorExit));
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
		this.showMessage("MAUVAISE REPONSE", 1500);
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

	goToAccueil() {
		this.scene.start("Accueil");
	}

	collectKey(player, key) {
		this.hasKey = true;
		key.destroy();
		this.showMessage("Clé récupérée !");
	}

	collectPotion(player, potion) {
		if (this.hasPotion) {
			return;
		}

		this.hasPotion = true;
		this.registry.set("inventaireNiveau5", ["objet_niveau5_potion"]);
		this.registry.set("potionNiveau5", true);
		potion.destroy();
		this.showMessage("Potion récupérée !");
	}
}

