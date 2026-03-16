// ========== CLASSES D'ENTITÉS ==========

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.hp = config.ennemisHp || 30;
        this.hp_max = this.hp;
        this.speed = config.ennemisVitesse || 2;
        this.color = config.ennemisColor || '#ff0000';
        this.tint = parseInt(this.color.slice(1), 16);
        this.setTint(this.tint);

        this.direction = Phaser.Math.Between(0, 360);
        this.changeDirectionCounter = 0;
    }

    update() {
        this.changeDirectionCounter++;

        if (this.changeDirectionCounter > 60) {
            this.direction = Phaser.Math.Between(0, 360);
            this.changeDirectionCounter = 0;
        }

        const vx = this.speed * 100 * Phaser.Math.Cos(Phaser.Math.DegToRad(this.direction));
        const vy = this.speed * 100 * Phaser.Math.Sin(Phaser.Math.DegToRad(this.direction));

        this.body.setVelocity(vx, vy);
    }

    takeDamage(amount) {
        this.hp -= amount;
        // Flash rouge
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.setTint(this.tint);
        });
    }

    drawHealthBar(graphics) {
        const barWidth = 28;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - 20;

        // Fond
        graphics.fillStyle(0x000000);
        graphics.fillRect(x, y, barWidth, barHeight);

        // Santé
        const healthPercent = this.hp / this.hp_max;
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
}

class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY) {
        super(scene, x, y, 'projectile');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);

        // Direction vers la cible
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Phaser.Math.Distance.Between(x, y, targetX, targetY);

        if (dist > 0) {
            this.body.setVelocity((dx / dist) * 300, (dy / dist) * 300);
        }

        this.body.setCollideWorldBounds(true);

        // Détruire après 6 secondes
        scene.time.delayedCall(6000, () => {
            if (this.active) this.destroy();
        });
    }
}

class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, name) {
        super(scene, x, y, 'item');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.name = name;
        this.collected = false;

        const colors = {
            'potion': 0xff00ff,
            'ecaille': 0x00ffff,
            'cristal': 0xffff00,
            'herbe': 0x00ff00,
            'sang': 0xff0000,
            'cendre': 0x808080,
            'plume': 0xffffff
        };

        this.setTint(colors[type] || 0xcccccc);
    }

    collect() {
        this.collected = true;
        this.destroy();
    }
}
