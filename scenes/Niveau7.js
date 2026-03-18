export default class niveau7 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau7" });
	}

	preload() {
		this.load.tilemapTiledJSON("map_niveau7", "assets/Map/map_niveau7.tmj");
		this.load.image("img_decor", "assets/items.png");
		this.load.image("img_donjonasset", "assets/donjonasset.png");
		this.load.image("img_capture", "assets/coffre_fermé.png");
		this.load.image("img_icons", "assets/icons_prev_comp-removebg-preview.png");
		this.load.image("img_porte_orange", "assets/porteORANGE999.png");
		this.load.image("img_brique", "assets/brique.png");
		this.load.image("img_portesortie", "assets/portesortiewallah.png");
		this.load.spritesheet("savant2", "assets/savant2.png", {
			frameWidth: 40,
			frameHeight: 50,
			spacing: 1
		});
	}

	create() {
		const map = this.make.tilemap({ key: "map_niveau7" });
		if (!map) {
			this.cameras.main.setBackgroundColor("#000000");
			this.add.text(960, 640, "ERREUR: map_niveau7 introuvable", {
				fontFamily: "Courier New, monospace",
				fontSize: "34px",
				fontStyle: "bold",
				color: "#ff6666"
			}).setOrigin(0.5);
			return;
		}
		this.map = map;

		const tilesetDecor = map.addTilesetImage("items", "img_decor");
		const tilesetDonjon = map.addTilesetImage("donjonasset", "img_donjonasset");
		const tilesetCapture = map.addTilesetImage("coffre_fermé", "img_capture");
		const tilesetIcons = map.addTilesetImage("icons_prev_comp-removebg-preview", "img_icons");
		const tilesetPorteOrange = map.addTilesetImage("porteORANGE999", "img_porte_orange");
		const tilesetBrique = map.addTilesetImage("brique", "img_brique");
		const tilesetPorteSortie = map.addTilesetImage("portesortiewallah", "img_portesortie");

		const allTilesets = [
			tilesetDecor,
			tilesetDonjon,
			tilesetCapture,
			tilesetIcons,
			tilesetPorteOrange,
			tilesetBrique,
			tilesetPorteSortie
		].filter(Boolean);

		this.layer = map.createLayer("Tile Layer 1", allTilesets, 0, 0);
		if (!this.layer) {
			this.add.text(960, 640, "ERREUR: Tile Layer 1 introuvable", {
				fontFamily: "Courier New, monospace",
				fontSize: "32px",
				fontStyle: "bold",
				color: "#ff6666"
			}).setOrigin(0.5).setDepth(2000);
			return;
		}
		this.layer.setCollisionByProperty({ collision: true });

		const orangeDoorTileset = map.tilesets.find((tileset) => tileset.name === "porteORANGE999");
		this.orangeDoorFirstGid = orangeDoorTileset ? orangeDoorTileset.firstgid : 186;
		this.keyTileX = 0;
		this.keyTileY = 20;
		this.keyCollected = false;
		this.isDoorAnimating = false;
		this.porte1Opened = false;
		this.porte1Positions = [
			{ x: 11, y: 35 }, { x: 12, y: 35 }, { x: 13, y: 35 },
			{ x: 11, y: 36 }, { x: 12, y: 36 }, { x: 13, y: 36 },
			{ x: 11, y: 37 }, { x: 12, y: 37 }, { x: 13, y: 37 },
			{ x: 11, y: 38 }, { x: 12, y: 38 }, { x: 13, y: 38 }
		];
		const porte1Xs = this.porte1Positions.map((position) => position.x);
		const porte1Ys = this.porte1Positions.map((position) => position.y);
		this.porte1MinX = Math.min(...porte1Xs);
		this.porte1MaxX = Math.max(...porte1Xs);
		this.porte1MinY = Math.min(...porte1Ys);
		this.porte1MaxY = Math.max(...porte1Ys);
		this.porte2 = { xMin: 0, xMax: 3, yMin: 13, yMax: 16 };
		this.porte3 = { xMin: 0, xMax: 3, yMin: 7, yMax: 10 };
		this.lastTeleportAt = 0;
		this.doorFrameColumns = [0, 3, 6, 9, 12, 15];
		this.doorFrameOffsets = this.doorFrameColumns.map((startCol) => [
			startCol, startCol + 1, startCol + 2,
			startCol + 17, startCol + 18, startCol + 19,
			startCol + 34, startCol + 35, startCol + 36,
			startCol + 51, startCol + 52, startCol + 53
		]);
		this.finalOpenDoorOffsets = [
			12, 13, 14,
			29, 30, 31,
			46, 47, 48,
			63, 64, 65
		];

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

		this.player = this.physics.add.sprite(160, map.heightInPixels - 220, "savant2", 5);
		this.player.setScale(1.5);
		this.player.setCollideWorldBounds(true);
		this.player.setBounce(0);
		this.player.body.setSize(20, 44);
		this.player.body.setOffset(10, 6);
		this.player.play("savant2_idle");

		this.physics.add.collider(this.player, this.layer);
		this.cursors = this.input.keyboard.createCursorKeys();
		this.interactE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		this.playerSpeed = 180;
		this.jumpSpeed = -360;

		this.add.text(960, 95, "NIVEAU 7", {
			fontFamily: "Courier New, monospace",
			fontSize: "72px",
			fontStyle: "bold",
			color: "#ff2a2a",
        stroke: "#4d0000",
			strokeThickness: 8,
			shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#ff3b00",
          blur: 14,
          stroke: true,
          fill: true
        }
		}).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

		this.cameras.main.setBackgroundColor("#000000");
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
	}

	update() {
		if (!this.player || !this.cursors) {
			return;
		}
		if (this.player.body && !this.player.body.enable) {
			this.player.body.enable = true;
		}
		if (this.input && this.input.keyboard && !this.input.keyboard.enabled) {
			this.input.keyboard.enabled = true;
		}

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

		if (!this.keyCollected && !this.isDoorAnimating) {
			try {
				const body = this.player.body;
				const leftTile = this.map.worldToTileX(body.left);
				const rightTile = this.map.worldToTileX(body.right);
				const topTile = this.map.worldToTileY(body.top);
				const bottomTile = this.map.worldToTileY(body.bottom);

				if (
					this.keyTileX >= leftTile &&
					this.keyTileX <= rightTile &&
					this.keyTileY >= topTile &&
					this.keyTileY <= bottomTile
				) {
					this.keyCollected = true;
					if (this.layer) {
						this.layer.removeTileAt(this.keyTileX, this.keyTileY, true, false);
					}
					this.openPorte1();
				}
			} catch (error) {
				this.keyCollected = true;
				this.isDoorAnimating = false;
			}
		}

		this.tryTeleportToPorte2();

		if (!isOnGround) {
			this.player.play("savant2_jump", true);
		} else if (this.player.body.velocity.x !== 0) {
			this.player.play("savant2_walk", true);
		} else {
			this.player.play("savant2_idle", true);
		}
	}

	tryTeleportToPorte2() {
		if (!this.map || !this.player || !this.player.body || !this.interactE) {
			return;
		}
		if (!this.porte1Opened || this.isDoorAnimating || !this.interactE.isDown) {
			return;
		}

		if (this.time.now - this.lastTeleportAt < 250) {
			return;
		}

		const body = this.player.body;
		const playerLeftTile = this.map.worldToTileX(body.left);
		const playerRightTile = this.map.worldToTileX(body.right);
		const playerTopTile = this.map.worldToTileY(body.top);
		const playerBottomTile = this.map.worldToTileY(body.bottom);

		const overlapsPorte1Horizontally =
			playerRightTile >= this.porte1MinX - 1 &&
			playerLeftTile <= this.porte1MaxX + 1;
		const overlapsPorte1Vertically =
			playerBottomTile >= this.porte1MinY - 2 &&
			playerTopTile <= this.porte1MaxY + 1;

		if (!overlapsPorte1Horizontally || !overlapsPorte1Vertically) {
			return;
		}

		const targetTileX = this.porte2.xMin + 1;
		const targetTileY = this.porte2.yMax;
		const targetX = this.map.tileToWorldX(targetTileX) + this.map.tileWidth / 2;
		const targetY = this.map.tileToWorldY(targetTileY) + this.map.tileHeight / 2;

		this.player.setVelocity(0, 0);
		this.player.setPosition(targetX, targetY);
		this.lastTeleportAt = this.time.now;
	}

	openPorte1() {
		if (!this.layer || !this.porte1Positions || !this.doorFrameOffsets) {
			return;
		}
		if (this.isDoorAnimating) {
			return;
		}

		this.isDoorAnimating = true;
		this.porte1Opened = false;

		this.doorFrameOffsets.forEach((offsets, frameIndex) => {
			this.time.delayedCall(120 * frameIndex, () => {
				try {
					offsets.forEach((offset, tileIndex) => {
						const tilePos = this.porte1Positions[tileIndex];
						if (!tilePos) {
							return;
						}
						this.layer.putTileAt(this.orangeDoorFirstGid + offset, tilePos.x, tilePos.y);
					});

					if (frameIndex === this.doorFrameOffsets.length - 1) {
						this.finalOpenDoorOffsets.forEach((offset, tileIndex) => {
							const tilePos = this.porte1Positions[tileIndex];
							if (tilePos) {
								this.layer.putTileAt(this.orangeDoorFirstGid + offset, tilePos.x, tilePos.y);
							}
						});
						this.porte1Positions.forEach((tilePos) => {
							if (tilePos) {
								this.layer.setCollisionAt(tilePos.x, tilePos.y, false, false);
							}
						});
						this.isDoorAnimating = false;
						this.porte1Opened = true;
					}
				} catch (error) {
					this.isDoorAnimating = false;
					this.porte1Opened = false;
				}
			});
		});
	}
}


