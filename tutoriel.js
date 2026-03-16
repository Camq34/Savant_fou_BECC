// ========== TUTORIEL ET INTERFACE CUSTOMISÉE ==========
// Ce fichier vous permet d'ajouter votre propre UI/tutoriel
// Incluez-le APRÈS game.js dans votre HTML

/**
 * Exemple d'utilisation:
 * 
 * 1. Créer une classe Tutoriel
 * 2. Afficher des messages/contrôles
 * 3. Intégrer avec le jeu existant
 */

class TutorielUI {
    constructor(jeu) {
        this.jeu = jeu;
        this.etapeActuelle = 0;
        this.etapes = [
            { texte: "Bienvenue! Utilise les FLÈCHES ou WASD pour te déplacer.", couleur: '#00ff00' },
            { texte: "Des ENNEMIS rouges vont apparaître. Clique pour les éliminer!", couleur: '#ffff00' },
            { texte: "Collecte les INGRÉDIENTS colorés pour progresser.", couleur: '#ff00ff' },
            { texte: "Remporte 10 vagues pour avancer au niveau suivant!", couleur: '#00ccff' }
        ];
        this.tempsAffichage = 0;
        this.dureeMessage = 5000; // 5 secondes par message
        this.messagePersonnalise = null;
        this.tempsMessagePersonnalise = 0;
    }

    // Afficher un message personnalisé immédiatement
    show(texte, couleur = '#00ff00', duree = 3000) {
        this.messagePersonnalise = { texte, couleur };
        this.tempsMessagePersonnalise = 0;
        this.dureeMessage = duree;
    }

    update(delta) {
        if (this.messagePersonnalise) {
            this.tempsMessagePersonnalise += delta;
            if (this.tempsMessagePersonnalise > this.dureeMessage) {
                this.messagePersonnalise = null;
            }
        } else {
            this.tempsAffichage += delta;
            if (this.tempsAffichage > this.dureeMessage && this.etapeActuelle < this.etapes.length - 1) {
                this.etapeActuelle++;
                this.tempsAffichage = 0;
            }
        }
    }

    draw(ctx, canvas) {
        const message = this.messagePersonnalise || (this.etapeActuelle < this.etapes.length ? this.etapes[this.etapeActuelle] : null);
        if (!message) return;

        const temps = this.messagePersonnalise ? this.tempsMessagePersonnalise : this.tempsAffichage;
        const alpha = Math.max(0, 1 - (temps / this.dureeMessage));

        // Fond semi-transparent
        ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Texte
        ctx.globalAlpha = alpha;
        ctx.fillStyle = message.couleur;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';

        // Wrapper de texte
        const maxWidth = canvas.width - 40;
        const words = message.texte.split(' ');
        let lines = [];
        let line = '';

        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        const lineHeight = 35;
        const startY = canvas.height / 2 - (lines.length * lineHeight) / 2;

        lines.forEach((textLine, i) => {
            ctx.fillText(textLine, canvas.width / 2, startY + i * lineHeight);
        });

        ctx.globalAlpha = 1;
    }
}

/**
 * Classe pour afficher l'inventaire en temps réel
 */
class InventaireAffichage {
    constructor(jeu) {
        this.jeu = jeu;
        this.position = 'top-left'; // ou 'top-right', 'bottom-left', etc.
    }

    draw(ctx, canvas) {
        const items = this.jeu.joueur.obtenirItems();
        if (items.length === 0) return;

        let x = 10;
        let y = 10;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 5, y - 5, 200, items.length * 25 + 15);

        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('📦 INVENTAIRE', x, y + 20);

        ctx.font = '12px Arial';
        ctx.fillStyle = '#00ff00';
        items.forEach((item, i) => {
            ctx.fillText(`${item.type}: x${item.count}`, x + 10, y + 40 + i * 20);
        });
    }
}

/**
 * Classe pour afficher les stats du jeu
 */
class StatsAffichage {
    constructor(jeu) {
        this.jeu = jeu;
    }

    draw(ctx, canvas) {
        const joueur = this.jeu.joueur;
        const x = 10;
        const y = canvas.height - 70;

        // Fond
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 5, y - 5, 250, 65);

        // Stats
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`❤️ PV: ${Math.round(joueur.hp)}/${joueur.hp_max}`, x, y);
        ctx.fillText(`⚔️ EXP: ${joueur.exp} | 💰 Score: ${joueur.score}`, x, y + 20);
        ctx.fillText(`🌊 Vague: ${this.jeu.vagues}`, x, y + 40);

        // Barre de vie
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + 60, y - 15, 100, 8);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x + 60, y - 15, (joueur.hp / joueur.hp_max) * 100, 8);
    }
}

/**
 * Intégration avec le jeu principal
 * À utiliser dans votre HTML:
 * 
 * <script src="game.js"></script>
 * <script src="tutoriel.js"></script>
 * <script>
 *     // Après que jeu soit créé:
 *     const tutoriel = new TutorielUI(jeu);
 *     const inventaire = new InventaireAffichage(jeu);
 *     const stats = new StatsAffichage(jeu);
 *
 *     // Modifier la boucle de jeu pour appeler draw()
 * </script>
 */

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TutorielUI, InventaireAffichage, StatsAffichage };
}
