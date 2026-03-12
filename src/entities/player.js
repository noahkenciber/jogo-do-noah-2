/**
 * Player Entity (Pseudo-3D / Front-View)
 */
export class Player {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        
        // Configuração de Faixas
        this.lanes = 3;
        this.currentLane = 1; // 0, 1, 2
        
        // Posição na tela (Base fixa no fundo)
        this.x = 0; // Calculado no update baseado na lane
        this.y = 0;
        this.baseY = 0; 
        
        this.width = 60;
        this.height = 90;
        
        // Física de Pulo
        this.isJumping = false;
        this.jumpHeight = 0;
        this.jumpVelocity = 0;
        this.gravity = 0.6;
        
        // Estado
        this.isSliding = false;
        this.slideTimer = 0;
        
        // Interpolação de movimento lateral
        this.visualX = 0;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('keydown', (e) => this.handleInput(e));
    }

    resize() {
        this.baseY = this.game.canvas.height - 120;
        this.updatePosition(true);
    }

    reset() {
        this.currentLane = 1;
        this.jumpHeight = 0;
        this.jumpVelocity = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.updatePosition(true);
    }

    handleInput(e) {
        if (!this.game.isPlaying) return;

        if (e.key === 'ArrowLeft' && this.currentLane > 0) {
            this.currentLane--;
        } else if (e.key === 'ArrowRight' && this.currentLane < 2) {
            this.currentLane++;
        } else if ((e.key === 'ArrowUp' || e.key === ' ') && !this.isJumping) {
            this.jump();
        } else if (e.key === 'ArrowDown') {
            this.slide();
        }
    }

    jump() {
        this.isJumping = true;
        this.jumpVelocity = -12;
    }

    slide() {
        if (this.isJumping) {
            this.jumpVelocity = 15; // Cai rápido
        }
        this.isSliding = true;
        this.slideTimer = 40; // frames aprox.
    }

    updatePosition(instant = false) {
        const laneWidth = this.game.canvas.width / 3;
        const targetX = (this.currentLane * laneWidth) + (laneWidth / 2);
        
        if (instant) {
            this.visualX = targetX;
        } else {
            this.visualX += (targetX - this.visualX) * 0.15;
        }
        
        this.x = this.visualX;
    }

    update(deltaTime) {
        this.updatePosition();

        // Lógica de Pulo
        if (this.isJumping) {
            this.jumpHeight += this.jumpVelocity;
            this.jumpVelocity += this.gravity;

            if (this.jumpHeight >= 0) {
                this.jumpHeight = 0;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }

        // Lógica de Slide
        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) this.isSliding = false;
        }

        this.y = this.baseY + this.jumpHeight;
    }

    draw() {
        this.ctx.save();
        
        const drawHeight = this.isSliding ? this.height / 2 : this.height;
        const drawY = this.isSliding ? this.y + this.height / 2 : this.y;

        // Sombra
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(this.x, this.baseY + 10, 30, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Personagem (Estilo Guardião da Floresta)
        const gradient = this.ctx.createLinearGradient(this.x - 20, drawY, this.x + 20, drawY + drawHeight);
        gradient.addColorStop(0, '#f1c40f'); // Amarelo sol
        gradient.addColorStop(1, '#27ae60'); // Verde floresta

        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.fillStyle = gradient;
        
        // Corpo arredondado
        this.roundRect(this.x - 20, drawY, 40, drawHeight, 10);
        
        // Detalhes (Visor)
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(this.x - 15, drawY + 15, 30, 10);
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(this.x - 10, drawY + 18, 5, 2);

        this.ctx.restore();
    }

    roundRect(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
