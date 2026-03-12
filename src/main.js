// Importações
import { Player } from './entities/player.js';
import { ObstacleManager } from './entities/obstacles.js';
import { ParticleManager } from './engine/particles.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.coins = 0;
        this.highScore = localStorage.getItem('noah2_highScore') || 0;
        this.isGameOver = false;
        this.isPlaying = false;

        // Elementos da UI
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.scoreElement = document.getElementById('score-value');
        this.coinsElement = document.getElementById('coins-value');
        this.finalScoreElement = document.getElementById('final-score');
        this.highScoreElement = document.getElementById('high-score');

        // Instanciar Entidades
        this.player = new Player(this);
        this.obstacles = new ObstacleManager(this);
        this.particles = new ParticleManager(this);

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Botões com feedback de som ou log
        const startBtn = document.getElementById('start-button');
        const restartBtn = document.getElementById('restart-button');

        startBtn.onclick = (e) => {
            e.preventDefault();
            this.start();
        };

        restartBtn.onclick = (e) => {
            e.preventDefault();
            this.start();
        };

        // Suporte para iniciar com Espaço/Enter no menu
        window.addEventListener('keydown', (e) => {
            if (!this.isPlaying && (e.key === 'Enter' || e.key === ' ')) {
                this.start();
            }
        });

        // Loop principal
        this.lastTime = 0;
        requestAnimationFrame((t) => this.loop(t));
        
        console.log("🎮 Jogo do Noah 2 Inicializado!");
    }

    resize() {
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        if (this.player) this.player.resize();
    }

    start() {
        this.score = 0;
        this.coins = 0;
        this.isGameOver = false;
        this.isPlaying = true;
        
        this.startScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
        
        // Reset de entidades
        this.player.reset();
        this.obstacles.reset();
        
        console.log("🚀 Corrida Iniciada!");
    }

    gameOver() {
        this.isGameOver = true;
        this.isPlaying = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('noah2_highScore', this.highScore);
        }

        this.finalScoreElement.innerText = Math.floor(this.score);
        this.highScoreElement.innerText = Math.floor(this.highScore);
        this.gameOverScreen.classList.add('active');
    }

    update(deltaTime) {
        if (!this.isPlaying || this.isGameOver) return;

        // Aumentar pontuação gradualmente
        this.score += deltaTime * 0.01;
        this.scoreElement.innerText = Math.floor(this.score);

        // Atualizar Entidades
        this.player.update(deltaTime);
        this.obstacles.update(deltaTime);
        this.particles.update(deltaTime);

        // Efeito de rastro no jogador (Verde Esmeralda)
        if (this.isPlaying && !this.player.isJumping) {
            this.particles.create(this.player.x, this.player.baseY + 5, '#2ecc71', 1, 0.5);
        }
    }

    draw() {
        // Limpar
        this.ctx.fillStyle = '#1a2a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar Fundo (Floresta)
        const horizonY = this.canvas.height * 0.4;
        
        // Céu (Crepúsculo na Floresta)
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#0a1a0a');
        skyGrad.addColorStop(1, '#2d4a2d');
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, horizonY);

        // Chão (Grama/Terra)
        const floorGrad = this.ctx.createLinearGradient(0, horizonY, 0, this.canvas.height);
        floorGrad.addColorStop(0, '#1b301b');
        floorGrad.addColorStop(1, '#0d1a0d');
        this.ctx.fillStyle = floorGrad;
        this.ctx.fillRect(0, horizonY, this.canvas.width, this.canvas.height - horizonY);

        // Silhuetas de Árvores no Horizonte
        this.ctx.fillStyle = 'rgba(0, 20, 0, 0.5)';
        for (let i = 0; i < 10; i++) {
            const tx = (i * (this.canvas.width / 8)) + Math.sin(this.lastTime * 0.001 + i) * 10;
            this.ctx.beginPath();
            this.ctx.moveTo(tx, horizonY);
            this.ctx.lineTo(tx + 20, horizonY - 60);
            this.ctx.lineTo(tx + 40, horizonY);
            this.ctx.fill();
        }

        // Brilho do Horizonte (Névoa da Floresta)
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.strokeStyle = 'rgba(46, 204, 113, 0.2)';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, horizonY);
        this.ctx.lineTo(this.canvas.width, horizonY);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Desenhar Entidades (Sempre, para mostrar o menu inicial bonito)
        this.obstacles.draw();
        this.particles.draw();
        this.player.draw();
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Iniciar o jogo
new Game();
