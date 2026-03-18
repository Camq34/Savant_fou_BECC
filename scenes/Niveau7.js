export default class niveau7 extends Phaser.Scene {
	constructor() {
		super({ key: "niveau7" });
	}

	preload() {
		this.load.tilemapTiledJSON("map_niveau7", `assets/Map/map_niveau7.tmj?v=${Date.now()}`);
		this.load.image("img_decor", "assets/items.png");
		this.load.image("img_donjonasset", "assets/donjonasset.png");
		this.load.image("img_capture", "assets/coffre_fermé.png");
		this.load.image("img_icons_prev_comp-removebg-preview", "assets/items.png");
		this.load.image("img_porte_orange", "assets/porteORANGE999.png");
		this.load.image("img_portesortie", "assets/portesortiewallah.png");
		this.load.spritesheet("savant2", "assets/savant2.png", {
			frameWidth: 40,
			frameHeight: 50,
			spacing: 1
		});
	}

	create() {
		const map = this.make.tilemap({ key: "map_niveau7" });

		const tilesetDecor = map.addTilesetImage("décor ", "img_decor");
		const tilesetDonjon = map.addTilesetImage("donjonasset", "img_donjonasset");
		const tilesetCapture = map.addTilesetImage("Capture_d_écran_2026-03-17_à_11.17.09-removebg-preview", "img_capture");
		const tilesetIcons = map.addTilesetImage("icons_prev_comp-removebg-preview", "img_icons");
		const tilesetPorteOrange = map.addTilesetImage("porteORANGE999", "img_porte_orange");
		const tilesetPorteSortie = map.addTilesetImage("portesortiewallah", "img_portesortie");

		const allTilesets = [
			tilesetDecor,
			tilesetDonjon,
			tilesetCapture,
			tilesetIcons,
			tilesetPorteOrange,
			tilesetPorteSortie
		].filter(Boolean);

		this.layer = map.createLayer("Tile Layer 1", allTilesets, 0, 0);
		this.layer.setCollisionByProperty({ collision: true });

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

		if (!isOnGround) {
			this.player.play("savant2_jump", true);
		} else if (this.player.body.velocity.x !== 0) {
			this.player.play("savant2_walk", true);
		} else {
			this.player.play("savant2_idle", true);
		}
	}
}


