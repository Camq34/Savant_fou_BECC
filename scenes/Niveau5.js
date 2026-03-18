export default class niveau5 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau5" });
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
		];

		map.createLayer("Tile Layer 1", allTilesets, 0, 0);
		this.layerDecor = map.createLayer("décor", allTilesets, 0, 0);
		this.layerDecor.setCollisionByProperty({ collision: true });

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
			frames: this.anims.generateFrameNumbers("savant2", { start: 6, end: 8 }),
			frameRate: 10,
			repeat: -1
		});

		this.player = this.physics.add.sprite(160, map.heightInPixels - 180, "savant2", 5);
		this.player.setScale(1.5);
		this.player.setCollideWorldBounds(true);
		this.player.setBounce(0);
		this.player.body.setSize(20, 44);
		this.player.body.setOffset(10, 6);
		this.player.play("savant2_idle");

		this.physics.add.collider(this.player, this.layerDecor);
		this.cursors = this.input.keyboard.createCursorKeys();
		this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
		this.playerSpeed = 180;
		this.jumpSpeed = -360;
		this.doorOpened = false;
		this.isDoorAnimating = false;
		this.redChestBounds = new Phaser.Geom.Rectangle(24 * 32, 34 * 32, 5 * 32, 3 * 32);
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

		this.cameras.main.setBackgroundColor("#000000");
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
	}

	update() {
		const isOnGround = this.player.body.blocked.down || this.player.body.touching.down;
		const nearRedChest = Phaser.Geom.Rectangle.ContainsPoint(this.redChestBounds, this.player.getCenter());

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

		if (nearRedChest && !this.doorOpened && !this.isDoorAnimating && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
			this.openDoor();
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
}
