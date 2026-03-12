/**
 * Obstacle Manager (Pseudo-3D)
 */
export class ObstacleManager {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        
        this.obstacles = [];
        this.coins = [];
        
        this.speed = 0.005; // Velocidade de progressão (0 a 1)
        this.globalSpeed = 1;
        
        this.spawnTimer = 0;
        
        this.types = [
            { id: 'BOX', color: '#ff7700', height: 40, width: 40, type: 'jump' },
            { id: 'WALL', color: '#555555', height: 120, width: 30, type: 'dodge' },
            { id: 'HOLE', color: '#000000', height: 10, width: 80, type: 'jump', isHole: true },
            { id: 'ENEMY', color: '#ff0055', height: 50, width: 40, type: 'any' }
        ];

        this.init();
    }

    init() {
        this.reset();
    }

    reset() {
        this.obstacles = [];
        this.coins = [];
        this.globalSpeed = 1;
        this.spawnTimer = 0;
    }

    spawn() {
        const lane = Math.floor(Math.random() * 3);
        const type = this.types[Math.floor(Math.random() * this.types.length)];
        
        this.obstacles.push({
            ...type,
            lane,
            progress: 0, // 0 (horizon) to 1 (near player)
            z: 0
        });
    }

    spawnCoin() {
        const lane = Math.floor(Math.random() * 3);
        this.coins.push({
            lane,
            progress: 0,
            z: 0
        });
    }

    update(deltaTime) {
        if (!this.game.isPlaying) return;

        // Aumentar dificuldade
        this.globalSpeed += 0.0001 * deltaTime;

        // Timers
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.spawn();
            if (Math.random() > 0.5) this.spawnCoin();
            this.spawnTimer = Math.max(600, 1500 / this.globalSpeed);
        }

        // Horizonte e Ponto de Fuga
        const horizonY = this.game.canvas.height * 0.4;
        const playerY = this.game.player.baseY;

        // Atualizar Obstáculos
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            
            // Progressão não-linear para simular 3D
            obs.progress += 0.003 * this.globalSpeed;
            
            // Calcular posição na tela baseada na progressão
            const scale = obs.progress * obs.progress; // Aumentar exponencialmente
            const y = horizonY + (playerY - horizonY) * scale;
            
            const laneWidthAtY = (this.game.canvas.width * scale) / 3;
            const centerX = this.game.canvas.width / 2;
            const x = centerX + (obs.lane - 1) * (laneWidthAtY + 20 * scale);

            obs.visualX = x;
            obs.visualY = y;
            obs.visualScale = scale;

            // Checar Colisão (quando progress está perto de 1)
            if (obs.progress > 0.85 && obs.progress < 0.95) {
                if (this.checkCollision(obs)) {
                    this.game.gameOver();
                }
            }

            // Remover
            if (obs.progress > 1.2) {
                this.obstacles.splice(i, 1);
            }
        }

        // Atualizar Moedas
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.progress += 0.003 * this.globalSpeed;
            
            const scale = coin.progress * coin.progress;
            const y = horizonY + (playerY - horizonY) * scale;
            const laneWidthAtY = (this.game.canvas.width * scale) / 3;
            const x = (this.game.canvas.width / 2) + (coin.lane - 1) * (laneWidthAtY + 20 * scale);

            coin.visualX = x;
            coin.visualY = y;
            coin.visualScale = scale;

            // Coleta
            if (coin.progress > 0.85 && coin.progress < 0.95) {
                if (this.game.player.currentLane === coin.lane && !this.game.player.isJumping) {
                    this.game.coins += 10;
                    this.game.coinsElement.innerText = this.game.coins;
                    
                    // Efeito visual
                    this.game.particles.create(coin.visualX, coin.visualY, '#ffd700', 15, 3);
                    
                    this.coins.splice(i, 1);
                    continue;
                }
            }

            if (coin.progress > 1.2) {
                this.coins.splice(i, 1);
            }
        }
    }

    checkCollision(obs) {
        const player = this.game.player;
        
        // Deve estar na mesma faixa
        if (player.currentLane !== obs.lane) return false;

        // Lógica de Pulo/Abaixar baseada no tipo
        if (obs.id === 'BOX' || obs.id === 'HOLE' || obs.id === 'ENEMY') {
            if (player.isJumping) return false; // Pulo desvia desses
        }
        
        if (obs.id === 'WALL') {
            // Parede não pode ser pulada, mas talvez precise de lane switch (já checado acima)
            return true; 
        }

        return true; // Colidiu
    }

    draw() {
        const centerX = this.game.canvas.width / 2;
        const horizonY = this.game.canvas.height * 0.4;

        // Desenhar trilhos (3D)
        this.ctx.strokeStyle = 'rgba(112, 0, 255, 0.2)';
        this.ctx.lineWidth = 2;
        for (let i = 0; i <= 3; i++) {
            const xOffset = (i - 1.5) * (this.game.canvas.width / 3);
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, horizonY);
            this.ctx.lineTo(centerX + xOffset * 2, this.game.canvas.height);
            this.ctx.stroke();
        }

        // Desenhar Moedas
        this.coins.forEach(coin => {
            const size = 15 * coin.visualScale;
            this.ctx.fillStyle = '#ffd700';
            this.ctx.shadowBlur = 10 * coin.visualScale;
            this.ctx.shadowColor = '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(coin.visualX, coin.visualY - 20 * coin.visualScale, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Desenhar Obstáculos
        this.obstacles.forEach(obs => {
            const w = obs.width * obs.visualScale;
            const h = obs.height * obs.visualScale;
            
            this.ctx.save();
            this.ctx.shadowBlur = 15 * obs.visualScale;
            this.ctx.shadowColor = obs.color;
            this.ctx.fillStyle = obs.color;
            
            // Desenhar com perspectiva (base no visualY)
            this.ctx.fillRect(obs.visualX - w/2, obs.visualY - h, w, h);
            this.ctx.restore();
        });
    }
}
