var player;
var clavier;
var mapNiveau7;
var layer1;
var porte1;
var porte2;
var porte3;
var porte1Positions = [];
var keyTileX = 0;
var keyTileY = 20;
var keyCollected = false;
var isDoorAnimating = false;
var Porte1Ouverte = false;
var orangeDoorFirstGid = 186;
var doorFrameColumns = [0, 3, 6, 9, 12, 14];
var doorFrameOffsets = [];
var finalOpenDoorOffsets = [];
var playerSpeed = 180;
var jumpSpeed = -360;

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
		mapNiveau7 = this.make.tilemap({ key: "map_niveau7" });
		if (!mapNiveau7) {
			this.cameras.main.setBackgroundColor("#000000");
			this.add.text(960, 640, "ERREUR: map_niveau7 introuvable", {
				fontFamily: "Courier New, monospace",
				fontSize: "34px",
				fontStyle: "bold",
				color: "#ff6666"
			}).setOrigin(0.5);
			return;
		}

		const tilesetDecor = mapNiveau7.addTilesetImage("items", "img_decor");
		const tilesetDonjon = mapNiveau7.addTilesetImage("donjonasset", "img_donjonasset");
		const tilesetCapture = mapNiveau7.addTilesetImage("coffre_fermé", "img_capture");
		const tilesetIcons = mapNiveau7.addTilesetImage("icons_prev_comp-removebg-preview", "img_icons");
		const tilesetPorteOrange = mapNiveau7.addTilesetImage("porteORANGE999", "img_porte_orange");
		const tilesetBrique = mapNiveau7.addTilesetImage("brique", "img_brique");
		const tilesetPorteSortie = mapNiveau7.addTilesetImage("portesortiewallah", "img_portesortie");

		const allTilesets = [
			tilesetDecor,
			tilesetDonjon,
			tilesetCapture,
			tilesetIcons,
			tilesetPorteOrange,
			tilesetBrique,
			tilesetPorteSortie
		].filter(Boolean);

		layer1 = mapNiveau7.createLayer("Tile Layer 1", allTilesets, 0, 0);
		if (!layer1) {
			this.add.text(960, 640, "ERREUR: Tile Layer 1 introuvable", {
				fontFamily: "Courier New, monospace",
				fontSize: "32px",
				fontStyle: "bold",
				color: "#ff6666"
			}).setOrigin(0.5).setDepth(2000);
			return;
		}
		layer1.setCollisionByProperty({ collision: true });

		const orangeDoorTileset = mapNiveau7.tilesets.find((tileset) => tileset.name === "porteORANGE999");
		orangeDoorFirstGid = orangeDoorTileset ? orangeDoorTileset.firstgid : 186;
		keyCollected = false;
		isDoorAnimating = false;
		Porte1Ouverte = false;
		porte1Positions = [
			{ x: 11, y: 35 }, { x: 12, y: 35 }, { x: 13, y: 35 },
			{ x: 11, y: 36 }, { x: 12, y: 36 }, { x: 13, y: 36 },
			{ x: 11, y: 37 }, { x: 12, y: 37 }, { x: 13, y: 37 },
			{ x: 11, y: 38 }, { x: 12, y: 38 }, { x: 13, y: 38 }
		];
		porte1 = { xMin: 11, xMax: 13, yMin: 35, yMax: 38 };
		porte2 = {
			xMin: 0,
			xMax: 3,
			yMin: 13,
			yMax: 16,
			targetX: mapNiveau7.tileToWorldX(1) + mapNiveau7.tileWidth / 2,
			targetY: mapNiveau7.tileToWorldY(16) + mapNiveau7.tileHeight / 2 - 75
		};
		porte3 = { xMin: 0, xMax: 3, yMin: 7, yMax: 10 };
		doorFrameOffsets = doorFrameColumns.map((startCol) => [
			startCol, startCol + 1, startCol + 2,
			startCol + 17, startCol + 18, startCol + 19,
			startCol + 34, startCol + 35, startCol + 36,
			startCol + 51, startCol + 52, startCol + 53
		]);
		finalOpenDoorOffsets = [
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

		player = this.physics.add.sprite(160, mapNiveau7.heightInPixels - 220, "savant2", 5);
		player.setScale(1.5);
		player.setCollideWorldBounds(true);
		player.setBounce(0);
		player.body.setSize(20, 44);
		player.body.setOffset(10, 6);
		player.play("savant2_idle");

		this.physics.add.collider(player, layer1);

		clavier = this.input.keyboard.createCursorKeys();

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
		this.cameras.main.setBounds(0, 0, mapNiveau7.widthInPixels, mapNiveau7.heightInPixels);
		this.cameras.main.startFollow(player, true, 0.1, 0.1);
	}

	update() {
		if (!player || !clavier) {
			return;
		}
		if (player.body && !player.body.enable) {
			player.body.enable = true;
		}
		if (this.input && this.input.keyboard && !this.input.keyboard.enabled) {
			this.input.keyboard.enabled = true;
		}

		const isOnGround = player.body.blocked.down || player.body.touching.down;

		if (clavier.left.isDown) {
			player.setVelocityX(-playerSpeed);
			player.setFlipX(true);
		} else if (clavier.right.isDown) {
			player.setVelocityX(playerSpeed);
			player.setFlipX(false);
		} else {
			player.setVelocityX(0);
		}

		if (clavier.up.isDown && isOnGround) {
			player.setVelocityY(jumpSpeed);
		}

		if (!keyCollected && !isDoorAnimating) {
			try {
				const body = player.body;
				const leftTile = mapNiveau7.worldToTileX(body.left);
				const rightTile = mapNiveau7.worldToTileX(body.right);
				const topTile = mapNiveau7.worldToTileY(body.top);
				const bottomTile = mapNiveau7.worldToTileY(body.bottom);

				if (
					keyTileX >= leftTile &&
					keyTileX <= rightTile &&
					keyTileY >= topTile &&
					keyTileY <= bottomTile
				) {
					keyCollected = true;
					if (layer1) {
						layer1.removeTileAt(keyTileX, keyTileY, true, false);
					}
					this.openPorte1();
				}
			} catch (error) {
				keyCollected = true;
				isDoorAnimating = false;
			}
		}

		if (!isOnGround) {
			player.play("savant2_jump", true);
		} else if (player.body.velocity.x !== 0) {
			player.play("savant2_walk", true);
		} else {
			player.play("savant2_idle", true);
		}
	}

	openPorte1() {
		if (!layer1 || !porte1Positions || !doorFrameOffsets) {
			return;
		}
		if (isDoorAnimating) {
			return;
		}

		isDoorAnimating = true;
		Porte1Ouverte = false;

		doorFrameOffsets.forEach((offsets, frameIndex) => {
			this.time.delayedCall(120 * frameIndex, () => {
				try {
					offsets.forEach((offset, tileIndex) => {
						const tilePos = porte1Positions[tileIndex];
						if (!tilePos) {
							return;
						}
						layer1.putTileAt(orangeDoorFirstGid + offset, tilePos.x, tilePos.y);
					});

					if (frameIndex === doorFrameOffsets.length - 1) {
						finalOpenDoorOffsets.forEach((offset, tileIndex) => {
							const tilePos = porte1Positions[tileIndex];
							if (tilePos) {
								layer1.putTileAt(orangeDoorFirstGid + offset, tilePos.x, tilePos.y);
							}
						});
						porte1Positions.forEach((tilePos) => {
							if (tilePos) {
								layer1.setCollisionAt(tilePos.x, tilePos.y, false, false);
							}
						});
						isDoorAnimating = false;
						Porte1Ouverte = true;
					}
				} catch (error) {
					isDoorAnimating = false;
					Porte1Ouverte = false;
				}
			});
		});
	}
}


